import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/downloads', express.static(path.join(__dirname, 'uploads')));

// In-memory Session Store
// { sessionId: { files: [{filename, path, originalName}], links: [], expiresAt: timestamp } }
const sessions = {};

// Clean up expired sessions every 10 mins
setInterval(() => {
    const now = Date.now();
    for (const id in sessions) {
        if (sessions[id].expiresAt < now) {
            // Delete files
            sessions[id].files.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
            delete sessions[id];
        }
    }
}, 10 * 60 * 1000);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Unique name
        cb(null, uuidv4() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });

// Helper to get Local IP for QR code
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}


import { exec } from 'child_process';
function getSSID() {
    return new Promise((resolve) => {
        // Windows specific command
        exec('netsh wlan show interfaces', (err, stdout) => {
            if (err) return resolve(null);
            const match = stdout.match(/SSID\s*:\s*(.+)/);
            if (match && match[1]) {
                resolve(match[1].trim());
            } else {
                resolve(null);
            }
        });
    });
}

function getWifiPassword(ssid) {
    if (!ssid) return null;
    return new Promise((resolve) => {
        exec(`netsh wlan show profile name="${ssid}" key=clear`, (err, stdout) => {
            if (err) return resolve(null);
            const match = stdout.match(/Key Content\s*:\s*(.+)/);
            if (match && match[1]) {
                resolve(match[1].trim());
            } else {
                resolve(null);
            }
        });
    });
}



// Routes
app.get('/', (req, res) => {
    res.send('ShareFlow Server Running');
});

// 1. Create Session
app.post('/api/session', (req, res) => {
    const sessionId = uuidv4();
    sessions[sessionId] = {
        files: [],
        links: [],
        expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    };

    const localIP = getLocalIP();
    const port = process.env.PORT || 3000;
    const url = `http://${localIP}:${port}/view/${sessionId}`;

    res.json({ sessionId, url });
});

// 1.5 Get Server IP
app.get('/api/ip', async (req, res) => {
    const ssid = await getSSID();
    const password = await getWifiPassword(ssid);
    res.json({ ip: getLocalIP(), ssid, password });
});

// 2. Upload File to Session
app.post('/api/upload/:sessionId', upload.single('file'), (req, res) => {
    const { sessionId } = req.params;
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session expired or not found" });
    }

    if (req.file) {
        sessions[sessionId].files.push({
            filename: req.file.filename,
            path: req.file.path,
            originalName: req.file.originalname,
            size: req.file.size
        });

        io.to(sessionId).emit('update', sessions[sessionId]);
    }

    res.json({ success: true });
});

// 3. Add Link
app.post('/api/link/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const { link } = req.body;

    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session expired" });
    }

    sessions[sessionId].links.push(link);
    io.to(sessionId).emit('update', sessions[sessionId]);
    res.json({ success: true });
});

// 4. Get Session Data (for Receiver)
app.get('/api/view/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    if (!sessions[sessionId]) {
        return res.status(404).json({ error: "Session expired" });
    }
    res.json(sessions[sessionId]);
});

// Socket.io
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (sessionId) => {
        socket.join(sessionId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://${getLocalIP()}:${PORT}`);
});
