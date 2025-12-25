import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFileDownload, FaLink, FaInstagram } from 'react-icons/fa';
import { io } from 'socket.io-client';

export default function SessionReceiver() {
    const { sessionId } = useParams();
    const [data, setData] = useState<{ files: any[], links: string[] } | null>(null);

    useEffect(() => {
        // Initial Fetch
        // Since we are on "receiver", we assume we accessed this via IP url.
        // So window.location.hostname should be the IP.
        // We can reconstruct API URL.
        const ip = window.location.hostname;
        // Note: On mobile, localhost won't work. Needs IP.
        const apiBase = `http://${ip}:3000`; // Assuming port 3000

        axios.get(`${apiBase}/api/view/${sessionId}`)
            .then(res => setData(res.data))
            .catch(() => alert("Session not found"));

        const newSocket = io(apiBase);
        newSocket.emit('join', sessionId);

        newSocket.on('update', (updatedData: any) => {
            setData(updatedData);
        });

        return () => {
            newSocket.disconnect();
        }
    }, [sessionId]);

    const downloadFile = (filename: string) => {
        const ip = window.location.hostname;
        const apiBase = `http://${ip}:3000`;
        window.open(`${apiBase}/downloads/${filename}`, '_blank');
    };

    return (
        <div className="relative min-h-screen text-white">
            {/* Background Image */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm"
                style={{ backgroundImage: `url(/bg.jpg)` }} // Image from public folder
            />

            {/* Overlay for readability */}
            <div className="fixed inset-0 z-0 bg-black/60" />

            <div className="max-w-2xl mx-auto relative z-10 px-4 py-8">
                {!data ? (
                    <div className="text-center mt-20">Loading Session...</div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Shared Content</h2>

                        {/* Links Section */}
                        {data.links.map((link, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl mb-4 flex items-center gap-4">
                                <div className="text-pink-500 text-2xl">
                                    {link.includes('instagram') ? <FaInstagram /> : <FaLink />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <a href={link} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block">
                                        {link}
                                    </a>
                                </div>
                            </div>
                        ))}

                        {/* Files Section */}
                        {data.files.map((file, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FaFileDownload className="text-green-400 text-xl" />
                                    <div>
                                        <p className="font-semibold text-slate-200">{file.originalName}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadFile(file.filename)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                                >
                                    Download
                                </button>
                            </div>
                        ))}

                        {data.files.length === 0 && data.links.length === 0 && (
                            <div className="text-center text-slate-500 mt-10">
                                Waiting for sender to add content...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
