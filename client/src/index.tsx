import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './home'; // ✅ Import Home page for room creation/joining

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Route for home (room creation & join UI) */}
        <Route path="/" element={<Home />} />

        {/* Route for dynamic room-based collaboration */}
        <Route path="/room/:roomId" element={<App />} />

        {/* Optional fallback for unknown routes */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
