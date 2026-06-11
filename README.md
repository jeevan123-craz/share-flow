# ShareFlow 🔗⚡

> **A modern, lightning-fast local file and link sharing web application for your Wi-Fi network.**

ShareFlow removes the friction of transferring files between your phone, tablet, and PC. By leveraging WebSockets and local network routing, ShareFlow allows you to instantly share files, text, and links across devices using a simple QR code—no internet upload required. 

## ✨ Features

- **📁 Instant File Sharing:** Drag and drop files of any size to share them instantly over your local area network (LAN).
- **🔗 Link & Clipboard Sharing:** Send URLs (like Instagram Reels or YouTube videos) or text snippets directly to connected devices.
- **📱 QR Code Pairing:** Simply scan the dynamically generated QR code on your host machine to instantly connect a mobile device to the session.
- **📶 Wi-Fi Connection QR:** Includes a built-in utility to generate QR codes for quickly joining the local Wi-Fi network.
- **⚡ Real-time Sync:** Powered by `Socket.io`, all file uploads, deletions, and link shares are reflected instantly across all paired devices.
- **🎨 Glassmorphic UI:** Features a beautifully designed dark mode interface with smooth animations powered by Framer Motion.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Real-time Engine:** Socket.io
- **File Handling:** Multer (Backend file upload middleware)
- **Utilities:** UUID, Concurrently

## 🚀 Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- Both your host PC and mobile device must be connected to the **same Wi-Fi network**.

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd share-flow
   ```

2. Install dependencies for the root, client, and server:
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. Start the application (this runs both the React frontend and Node backend concurrently):
   ```bash
   npm start
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your host browser.

## 📱 How to Use

1. **Host a Session:** Open the web app on your main PC and click to create a new sharing session.
2. **Connect Device:** Scan the displayed QR code with your smartphone camera.
3. **Share:** Drag and drop files into the dropzone or paste links into the input field.
4. **Receive:** The files and links will appear instantly on the receiver's device, ready for download or copying.

## 📂 Project Structure

- `client/`: The React + Vite frontend application.
  - `src/Home.tsx`: Landing page and Wi-Fi QR generator.
  - `src/SessionSender.tsx`: The host dashboard for managing the session.
  - `src/SessionReceiver.tsx`: The mobile-optimized view for connected devices.
- `server/`: The Express Node.js backend.
  - `index.js`: Handles API routes, Multer file uploads, and Socket.io event broadcasting.
  - `uploads/`: Temporary local storage for shared files.

## 📜 License

This project is licensed under the MIT License. Feel free to use and modify it for your personal or commercial projects!

---

*Designed and developed by Jeevan Kishore.*
