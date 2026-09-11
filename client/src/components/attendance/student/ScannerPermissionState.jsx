import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export const ScannerPermissionState = ({ onRequestPermission }) => {
  return (
    <div className="card p-8 text-center max-w-sm mx-auto my-6 flex flex-col items-center">
      <Camera className="w-16 h-16 text-primary mb-4 animate-bounce" />
      <h3 className="text-xl font-bold mb-2">Camera Permission Required</h3>
      <p className="text-muted text-sm mb-6">
        ClassIQ requires camera access to scan the live rotating QR code for attendance verification.
      </p>
      <button onClick={onRequestPermission} className="btn-primary w-full">
        Grant Camera Permission
      </button>
    </div>
  );
};
