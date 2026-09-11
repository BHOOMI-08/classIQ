import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCountdown } from './QrCountdown.jsx';
import { Maximize2, Minimize2, RefreshCw, ShieldCheck } from 'lucide-react';

export const SecureQrDisplay = ({ qrToken, remainingSeconds = 15, isConnected = true, onRefresh }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const isExpired = remainingSeconds <= 0;

  return (
    <div
      className={`card p-6 flex flex-col items-center justify-center transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-surface flex flex-col items-center justify-center p-8' : 'relative'
      }`}
    >
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm">Secure Rotating QR</span>
          {isConnected ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
          ) : (
            <span className="badge badge-warning text-xs">Offline</span>
          )}
        </div>

        <button onClick={toggleFullscreen} className="btn-icon" title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* QR Code Container */}
      <div className={`p-4 bg-white rounded-2xl shadow-inner flex items-center justify-center relative ${isExpired ? 'opacity-30 blur-sm' : ''}`}>
        {qrToken ? (
          <QRCodeSVG value={qrToken} size={isFullscreen ? 360 : 220} level="H" includeMargin={true} />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-gray-400">Loading QR...</div>
        )}
      </div>

      {isExpired && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl backdrop-blur-sm">
          <RefreshCw className="w-8 h-8 text-white animate-spin mb-2" />
          <span className="text-white font-semibold text-sm">Refreshing Secure QR...</span>
        </div>
      )}

      {/* Rotation Countdown Indicator */}
      <div className="mt-4 w-full flex items-center justify-between px-2">
        <QrCountdown seconds={remainingSeconds} />
        <button onClick={onRefresh} className="btn-text text-xs flex items-center space-x-1">
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Token</span>
        </button>
      </div>
    </div>
  );
};
