import React, { useState, useEffect, useRef } from 'react';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        streamRef.current = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError("Camera access denied. Please enable camera permissions or use 'Upload from gallery'.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError("No camera found on this device. Please use 'Upload from gallery'.");
        } else {
          setError("Camera access unavailable — please use 'Upload from gallery' instead.");
        }
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        stopCameraTracks(streamRef.current);
      }
    };
  }, []);

  const stopCameraTracks = (mediaStream) => {
    if (mediaStream && mediaStream.getTracks) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhoto(URL.createObjectURL(file));
        setCapturedFile(file);
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  const handleUsePhoto = () => {
    if (capturedFile) {
      if (streamRef.current) stopCameraTracks(streamRef.current);
      onCapture(capturedFile);
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    setCapturedFile(null);
  };

  return (
    <div className="camera-overlay">
      <div className="camera-modal">
        {error ? (
          <div className="camera-error">
            <div className="emoji-icon">⚠️</div>
            <h2>Camera Error</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : photo ? (
          <div className="camera-preview-container">
            <h2>Preview Photo</h2>
            <img src={photo} alt="Captured" className="camera-preview-img" />
            <div className="camera-actions">
              <button className="btn btn-secondary" onClick={handleRetake}>Retake</button>
              <button className="btn btn-primary" onClick={handleUsePhoto}>Use this photo</button>
            </div>
          </div>
        ) : (
          <div className="camera-live-container">
            <h2>Take a Photo</h2>
            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
              />
            </div>
            <div className="camera-actions">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-capture"
                onClick={handleCapture}
                disabled={isCapturing}
              >
                {isCapturing ? 'Capturing...' : '📸 Capture'}
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default CameraCapture;
