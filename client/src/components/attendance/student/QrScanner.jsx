import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

export const QrScanner = ({ onScanSuccess, onScanError }) => {
  const qrRegionId = 'classiq-qr-reader-region';
  const html5QrcodeRef = useRef(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const onScanErrorRef = useRef(onScanError);
  const [initError, setInitError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    onScanErrorRef.current = onScanError;
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    let isMounted = true;
    let html5QrcodeInstance = null;

    const startScanner = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        const instance = new Html5Qrcode(qrRegionId);
        html5QrcodeInstance = instance;
        html5QrcodeRef.current = instance;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        let cameraConfig = { facingMode: 'environment' };
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            const backCamera = cameras.find(
              (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear')
            );
            cameraConfig = backCamera ? { deviceId: { exact: backCamera.id } } : { deviceId: cameras[0].id };
          }
        } catch (camErr) {
          console.warn('Could not enumerate cameras, falling back to facingMode constraint', camErr);
        }

        if (!isMounted) return;

        await instance.start(
          cameraConfig,
          config,
          (decodedText) => {
            if (isMounted && decodedText && onScanSuccessRef.current) {
              onScanSuccessRef.current(decodedText);
            }
          },
          (errorMessage) => {
            if (isMounted && onScanErrorRef.current) {
              onScanErrorRef.current(errorMessage);
            }
          }
        );

        if (isMounted) setIsInitializing(false);
      } catch (err) {
        console.error('Error starting html5Qrcode scanner:', err);
        if (isMounted) {
          setIsInitializing(false);
          const msg = err?.message || 'Camera permission denied or camera not available.';
          setInitError(msg);
          if (onScanErrorRef.current) {
            onScanErrorRef.current(msg);
          }
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrcodeInstance) {
        try {
          if (typeof html5QrcodeInstance.isScanning === 'function' ? html5QrcodeInstance.isScanning() : html5QrcodeInstance.isScanning) {
            html5QrcodeInstance.stop().then(() => html5QrcodeInstance.clear()).catch((e) => console.warn('Cleaned scanner:', e));
          } else {
            html5QrcodeInstance.clear();
          }
        } catch (err) {
          console.warn('Error clearing html5Qrcode:', err);
        }
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-primary min-h-[300px] flex items-center justify-center">
        <div id={qrRegionId} className="w-full min-h-[300px]" />

        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white p-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mb-2" />
            <span className="text-xs font-semibold">Accessing Camera...</span>
          </div>
        )}

        {initError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
            <AlertCircle className="w-10 h-10 text-danger mb-2" />
            <span className="text-sm font-bold text-danger mb-1">Camera Error</span>
            <span className="text-xs text-muted mb-4">{initError}</span>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary btn-sm"
            >
              Retry Camera Access
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-xs text-muted mt-3">
        <Camera className="w-4 h-4 text-primary" />
        <span>Align the teacher's projected QR code within the frame</span>
      </div>
    </div>
  );
};
