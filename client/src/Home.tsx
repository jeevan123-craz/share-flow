import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShareAlt } from 'react-icons/fa';
import axios from 'axios';

// For mobile testing, replace localhost with your IP manually or set it dynamically

export default function Home() {
    const navigate = useNavigate();

    const startSession = async () => {
        try {
            // In a real deployed app, use relative URL or configured Env var
            // Hardcoded Localhost for dev assumes client runs on same machine as server or proxy setup
            const res = await axios.post('http://localhost:3000/api/session');
            navigate(`/session/${res.data.sessionId}`);
        } catch (err) {
            console.error(err);
            alert("Failed to start session. Is server running?");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-lg mb-4 text-4xl text-blue-400 border border-white/10 shadow-xl">
                    <FaShareAlt />
                </div>
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    ShareFlow
                </h1>
                <p className="text-slate-400 text-lg">
                    Secure, high-speed file & link sharing on your local network.
                </p>
            </motion.div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startSession}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/25 transition-all"
            >
                Start Sharing
            </motion.button>
        </div>
    );
}
