# ShareFlow 🔗

A modern, local file-sharing web application that works over your Wi-Fi network. Share files and links between devices instantly using QR codes.

![ShareFlow Demo](https://img.shields.io/badge/Status-Active-brightgreen)

## ✨ Features

- **📁 File Sharing** - Drag & drop files to share instantly
- **🔗 Link Sharing** - Share URLs including Instagram Reels
- **📱 QR Code Access** - Scan to connect from any device
- **📶 Wi-Fi QR** - Generate QR codes for Wi-Fi connection
- **⚡ Real-time Updates** - Instant sync via WebSockets
- **🎨 Modern UI** - Beautiful dark theme with animations

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/share-flow.git
cd share-flow

# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Start the app (runs both server & client)
npm start
```

Then open `http://localhost:5173` in your browser.

## 📱 How to Use

1. **Start Sharing** - Click the button to create a session
2. **Scan QR Code** - Use your phone to scan the QR
3. **Share Files** - Drag files or paste links
4. **Download** - Files appear instantly on receiver's device

## 🛠️ Tech Stack

| Frontend | Backend |
|----------|---------|
| React + TypeScript | Node.js + Express |
| Vite | Socket.io |
| Tailwind CSS | Multer |
| Framer Motion | UUID |

## 📂 Project Structure

```
share-flow/
├── client/          # React frontend
│   ├── src/
│   │   ├── Home.tsx
│   │   ├── SessionSender.tsx
│   │   └── SessionReceiver.tsx
│   └── public/
├── server/          # Express backend
│   └── index.js
└── package.json     # Root scripts
```

## 📄 License

MIT License - Feel free to use for your projects!

---

Made with ❤️ by Jeevan Kishore
