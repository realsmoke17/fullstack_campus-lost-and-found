import React, { useState, useEffect, useRef } from 'react';

/**
 * CameraCapture Component
 * Handles requesting camera access, live preview, capturing a frame,
 * and cleaning up media streams to prevent the camera from staying on.
 */
const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        // Request access to the camera.
        // facingMode: 'environment' tells mobile browsers to prefer the back camera.
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        // Map technical errors to user-friendly messages
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

    // IMPORTANT: Cleanup function to stop the camera stream when the component unmounts.
    // If we don't stop the tracks, the camera light stays on and the browser keeps the stream active.
    return () => {
      if (stream) {
        stopCameraTracks(stream);
      }
    };
  }, []);

  // Helper to stop all tracks in a MediaStream
  const stopCameraTracks = (mediaStream) => {
    if (mediaStream && mediaStream.getTracks) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match the video stream's actual resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a Blob (JPEG, 0.8 quality)
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a File object from the Blob for compatibility with existing upload logic
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhoto(URL.createObjectURL(file));
        // Store the actual file in a ref or state to pass back later
        // For simplicity, we'll use a hidden state or just call onCapture(file) when confirmed
        setCapturedFile(file);
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.8);
  };

  // Temporary state to hold the actual File object for the callback
  const [capturedFile, setCapturedFile] = useState(null);

  const handleUsePhoto = () => {
    if (capturedFile) {
      // Stop the camera before exiting to be thorough
      if (stream) stopCameraTracks(stream);
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
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

        {/* Hidden canvas used for capturing the frame */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default CameraCapture;
