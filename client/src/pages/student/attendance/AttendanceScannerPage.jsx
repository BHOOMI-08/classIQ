import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrScanner } from '../../../components/attendance/student/QrScanner.jsx';
import { ScannerPermissionState } from '../../../components/attendance/student/ScannerPermissionState.jsx';
import { LocationPermissionState } from '../../../components/attendance/student/LocationPermissionState.jsx';
import { AttendanceSubmissionProgress } from '../../../components/attendance/student/AttendanceSubmissionProgress.jsx';
import { PresenceChallengeCard } from '../../../components/attendance/student/PresenceChallengeCard.jsx';
import { attendanceSubmissionService } from '../../../services/attendanceSubmissionService.js';
import { useGeolocation } from '../../../hooks/useGeolocation.js';
import { ArrowLeft, Shield, Camera, Keyboard, Send } from 'lucide-react';

export const AttendanceScannerPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('SCANNING'); // SCANNING, ACQUIRING_LOCATION, SUBMITTING, CHALLENGE, ERROR
  const [scanMode, setScanMode] = useState('CAMERA'); // CAMERA, MANUAL
  const [manualTokenInput, setManualTokenInput] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [scannedToken, setScannedToken] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [challengeData, setChallengeData] = useState(null);

  const { getCurrentLocation, loading: geoLoading } = useGeolocation();

  const handleScanSuccess = async (decodedText) => {
    if (step !== 'SCANNING' || scannedToken) return;
    setScannedToken(decodedText);
    setSubmissionError(null);
    await processSubmission(decodedText, null);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;
    const cleanedToken = manualTokenInput.trim();
    setScannedToken(cleanedToken);
    setSubmissionError(null);
    await processSubmission(cleanedToken, null);
  };

  const processSubmission = async (tokenString, locationData) => {
    try {
      setStep('SUBMITTING');
      const res = await attendanceSubmissionService.submitAttendance({
        token: tokenString,
        location: locationData,
        device: {
          deviceId: `dev_${window.navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
          platform: 'web',
        },
      });

      // Redirect to Result Page with decision data
      navigate('/student/attendance/result', { state: { result: res.data } });
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('location')) {
        setStep('ACQUIRING_LOCATION');
      } else {
        setSubmissionError(err.message || 'Attendance submission failed');
        setStep('ERROR');
      }
    }
  };

  const handleLocationSubmit = async () => {
    try {
      const loc = await getCurrentLocation();
      await processSubmission(scannedToken, loc);
    } catch (err) {
      setSubmissionError(err.message || 'Failed to acquire required GPS location');
      setStep('ERROR');
    }
  };

  const handleRetryScan = () => {
    setScannedToken(null);
    setSubmissionError(null);
    setStep('SCANNING');
  };

  return (
    <div className="container mx-auto p-4 max-w-lg min-h-screen flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black flex items-center justify-center space-x-2">
            <Shield className="w-7 h-7 text-primary" />
            <span>Attendance Verification</span>
          </h1>
          <p className="text-xs text-muted">ClassIQ Smart Attendance Scanner</p>
        </div>

        {/* Input Mode Selector */}
        {step === 'SCANNING' && (
          <div className="flex bg-surface-variant/40 p-1 rounded-xl mb-6 border border-border">
            <button
              onClick={() => setScanMode('CAMERA')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                scanMode === 'CAMERA' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera Scan</span>
            </button>
            <button
              onClick={() => setScanMode('MANUAL')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all ${
                scanMode === 'MANUAL' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              <span>Enter Code</span>
            </button>
          </div>
        )}

        {!hasCameraPermission && scanMode === 'CAMERA' ? (
          <ScannerPermissionState onRequestPermission={() => setHasCameraPermission(true)} />
        ) : step === 'SCANNING' ? (
          scanMode === 'CAMERA' ? (
            <QrScanner onScanSuccess={handleScanSuccess} />
          ) : (
            <form onSubmit={handleManualSubmit} className="card p-6 flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-bold mb-2">QR Token or Access Code</label>
                <textarea
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                  placeholder="Paste or type your attendance QR token string here..."
                  rows={4}
                  className="input input-bordered w-full text-xs font-mono p-3 rounded-xl"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!manualTokenInput.trim()}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
              >
                <Send className="w-4 h-4" />
                <span>Submit Attendance Code</span>
              </button>
            </form>
          )
        ) : step === 'ACQUIRING_LOCATION' ? (
          <LocationPermissionState onRequestLocation={handleLocationSubmit} />
        ) : step === 'SUBMITTING' ? (
          <AttendanceSubmissionProgress step={3} />
        ) : step === 'CHALLENGE' ? (
          <PresenceChallengeCard challengeData={challengeData} onSubmitAnswer={() => {}} />
        ) : (
          <div className="card p-6 text-center border-t-4 border-t-danger my-6">
            <h3 className="font-bold text-lg text-danger mb-2">Verification Failed</h3>
            <p className="text-sm text-muted mb-6">{submissionError}</p>
            <button onClick={handleRetryScan} className="btn-primary w-full">
              Try Scanning / Entering Again
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-muted py-4 border-t border-border">
        Encrypted HMAC-SHA256 Token Verification Engine
      </div>
    </div>
  );
};
