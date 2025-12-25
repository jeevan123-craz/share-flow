import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import SessionSender from './SessionSender';
import SessionReceiver from './SessionReceiver';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-8 h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session/:sessionId" element={<SessionSender />} />
            <Route path="/view/:sessionId" element={<SessionReceiver />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
