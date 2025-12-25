import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { io } from 'socket.io-client';
import axios from 'axios';
import { FaCloudUploadAlt, FaInstagram } from 'react-icons/fa';

// Use current hostname (works for localhost and network IP)
const SERVER_URL = `http://${window.location.hostname}:3000`;

export default function SessionSender() {
    const { sessionId } = useParams();
    const [files, setFiles] = useState<any[]>([]);
    const [link, setLink] = useState('');
    const [socket, setSocket] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [qrUrl, setQrUrl] = useState('');
    const [ssid, setSsid] = useState('');
    const [wifiPass, setWifiPass] = useState('');
    const [showWifiModal, setShowWifiModal] = useState(false);
    const [wifiQr, setWifiQr] = useState('');

    useEffect(() => {
        // Fetch server IP to construct the Correct QR URL
        axios.get(`${SERVER_URL}/api/ip`).then(res => {
            const ip = res.data.ip;
            const port = window.location.port; // Client port (Vite)
            setQrUrl(`http://${ip}:${port}/view/${sessionId}`);
            if (res.data.ssid) setSsid(res.data.ssid);
            if (res.data.password) setWifiPass(res.data.password);
        }).catch(err => {
            console.error("Failed to fetch IP", err);
            // Fallback
            setQrUrl(`${window.location.origin}/view/${sessionId}`);
        });

        const newSocket = io(SERVER_URL);
        setSocket(newSocket);
        newSocket.emit('join', sessionId);

        return () => {
            newSocket.disconnect();
        }
    }, [sessionId]);

    const generateWifiQr = () => {
        // Format: WIFI:S:MyNetwork;T:WPA;P:MyPassword;;
        const qrString = `WIFI:S:${ssid};T:WPA;P:${wifiPass};;`;
        setWifiQr(qrString);
        setShowWifiModal(false);
    };

    // Hack to get server IP: the QR needs to point to the server IP, not localhost if scanning from phone
    // We will trust the server to tell us or use window.location.hostname if we are hosting the client there too.
    // Since we are running separate vite dev server, we'll fetch an endpoint.
    // Actually the initial "create session" returned the URL.
    // We lost it because we navigated.
    // Let's rebuild it or fetch session status.
    // Or just fetch session details.

    // For now, let's just assume simple flow:
    // If I am on desktop, I am localhost.
    // QR Code must use Machine IP.

    // Let's create an endpoint in server that returns its IP view URL
    useEffect(() => {
        // We can fetch from session endpoint
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('file', file);
        });

        // Upload
        axios.post(`${SERVER_URL}/api/upload/${sessionId}`, formData, {
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setUploadProgress(percent);
                if (percent === 100) setTimeout(() => setUploadProgress(0), 1000);
            }
        }).then(() => {
            // Socket will update list
        });
    }, [sessionId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const sendLink = async () => {
        if (!link) return;
        await axios.post(`${SERVER_URL}/api/link/${sessionId}`, { link });
        setLink('');
    };

    // Listen for updates
    useEffect(() => {
        if (!socket) return;
        socket.on('update', (data: any) => {
            setFiles(data.files);
            // also links
        });
    }, [socket]);

    return (
        <div className="flex flex-col lg:flex-row h-full gap-8">
            {/* Left Panel: Upload */}
            <div className="flex-1 flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaCloudUploadAlt className="text-blue-400" /> Upload Files
                    </h2>

                    <div {...getRootProps()} className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                        ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-400'}
                    `}>
                        <input {...getInputProps()} />
                        <p className="text-slate-300">Drag & drop files here, or click to select</p>
                    </div>

                    {uploadProgress > 0 && (
                        <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    )}

                    {/* File List */}
                    <div className="mt-4 space-y-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm">
                                <span className="truncate">{file.originalName}</span>
                                <span className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10"
                >
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaInstagram className="text-pink-500" /> Share Link / Reel
                    </h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            placeholder="Paste Instagram Reel or any URL..."
                            className="flex-1 bg-slate-800 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 text-white outline-none"
                        />
                        <button
                            onClick={sendLink}
                            className="px-4 py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Right Panel: QR & Info */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center"
                >
                    <h3 className="text-lg font-semibold mb-4 text-slate-200">Scan to View/Download</h3>

                    {/* We need the server IP here. For now, hardcoding placeholder or logic needed */}
                    <div className="bg-white p-4 rounded-xl inline-block mx-auto mb-4 relative group">
                        {wifiQr ? (
                            <div className="relative">
                                <QRCodeSVG value={wifiQr} size={200} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Wi-Fi QR (Scan First)
                                </div>
                                <button onClick={() => setWifiQr('')} className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg">X</button>
                            </div>
                        ) : (
                            qrUrl && <QRCodeSVG value={qrUrl} size={200} />
                        )}
                    </div>

                    {/* Wi-Fi Setup Button */}
                    {!wifiQr && (
                        <button
                            onClick={() => setShowWifiModal(true)}
                            className="bg-purple-600/20 text-purple-200 hover:bg-purple-600/40 px-3 py-1 rounded-full text-xs font-semibold mb-2 block mx-auto transition-colors"
                        >
                            + Add Wi-Fi Connection QR
                        </button>
                    )}

                    {/* Wi-Fi Modal */}
                    {showWifiModal && (
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-700 shadow-2xl"
                            >
                                <h3 className="text-xl font-bold text-white mb-4">Wi-Fi Setup</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Network Name (SSID)</label>
                                        <input
                                            type="text"
                                            value={ssid}
                                            onChange={e => setSsid(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Wi-Fi Password</label>
                                        <input
                                            type="text"
                                            value={wifiPass}
                                            onChange={e => setWifiPass(e.target.value)}
                                            placeholder="Enter password..."
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={generateWifiQr}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg transition-colors"
                                    >
                                        Generate Wi-Fi QR
                                    </button>
                                    <button
                                        onClick={() => setShowWifiModal(false)}
                                        className="w-full bg-transparent text-slate-400 hover:text-white text-sm py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 break-all">
                        ID: {sessionId}
                    </p>
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                        Make sure devices are on the same Wi-Fi.
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
