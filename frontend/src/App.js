import React, { useRef, useState, useEffect, useCallback } from 'react';
import './App.css';
import EmotionCard from './components/EmotionCard';
import Analytics from './components/Analytics';

function App() {
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [allEmotions, setAllEmotions] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [faces, setFaces] = useState([]);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const [theme, setTheme] = useState('dark');

  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const intervalRef = useRef(null);


  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  // Auto-fetch analytics every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setImagePreview(null);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRealTimeMode(false);
  };



  const captureAndSend = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);
      setError('');

      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, 640, 480);
      const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);

      const res = await fetch('http://localhost:5000/webcam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setEmotion('');
        setConfidence(null);
        setFaces([]);
        setAllEmotions({});
      } else {
        setEmotion(data.primary_emotion || 'No face detected');
        setConfidence(data.primary_confidence || null);
        setFaces(data.faces || []);

        // Set all emotions from the primary face
        if (data.faces && data.faces.length > 0) {
          setAllEmotions(data.faces[0].all_emotions || {});
        }
      }

      // Fetch updated analytics
      fetchAnalytics();

    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Capture error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    stopCamera();
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);
      setImagePreview(URL.createObjectURL(file));

      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setEmotion('');
        setConfidence(null);
        setFaces([]);
        setAllEmotions({});
      } else {
        setEmotion(data.primary_emotion || 'No face detected');
        setConfidence(data.primary_confidence || null);
        setFaces(data.faces || []);

        if (data.faces && data.faces.length > 0) {
          setAllEmotions(data.faces[0].all_emotions || {});
        }
      }

      fetchAnalytics();

    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setEmotion('');
    setConfidence(null);
    setFaces([]);
    setAllEmotions({});
    setError('');
  };

  const resetSession = async () => {
    try {
      await fetch('http://localhost:5000/reset-session', { method: 'POST' });
      setAnalytics(null);
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  };

  const toggleRealTimeMode = () => {
    if (!isRealTimeMode) {
      intervalRef.current = setInterval(captureAndSend, 5000); // Changed to 5 seconds
      setIsRealTimeMode(true);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRealTimeMode(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
        : 'bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100'
    }`}>
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
      >
        <span className="text-2xl">
          {theme === 'dark' ? '☀️' : '🌙'}
        </span>
      </button>

      <div className={`${theme === 'dark' ? 'dark' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 fade-in">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎭 AI Emotion Recognition
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Advanced facial expression analysis powered by deep learning.
              Detect emotions in real-time with state-of-the-art AI technology.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-4xl mx-auto mb-6">
              <div className="error-message">
                ⚠️ {error}
              </div>
            </div>
          )}

          {/* Main Layout - Camera Section at Top, Everything Else Below */}
          <div className="max-w-4xl mx-auto">
            {/* Camera Section with All Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                🎯 AI Emotion Detection
              </h3>

              {/* Video Display */}
              <div className="relative mb-6">
                {imagePreview ? (
                  <div className="relative mx-auto" style={{maxWidth: '640px'}}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-xl border-4 border-purple-300 shadow-lg"
                    />
                    {faces && faces.length > 0 && (
                      <div className="absolute inset-0">
                        {faces.map((face, index) => (
                          <div
                            key={index}
                            className="absolute border-2 rounded"
                            style={{
                              left: `${(face.bbox.x / 640) * 100}%`,
                              top: `${(face.bbox.y / 480) * 100}%`,
                              width: `${(face.bbox.w / 640) * 100}%`,
                              height: `${(face.bbox.h / 480) * 100}%`,
                              borderColor: '#fbbf24'
                            }}
                          >
                            <div
                              className="absolute -top-8 left-0 px-2 py-1 rounded text-white text-xs font-bold"
                              style={{ backgroundColor: '#fbbf24' }}
                            >
                              {face.emotion} ({face.confidence.toFixed(1)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative mx-auto" style={{maxWidth: '640px'}}>
                    <video
                      ref={videoRef}
                      width="640"
                      height="480"
                      autoPlay
                      muted
                      className="w-full rounded-xl shadow-lg border-4 border-blue-300"
                    />
                    {faces && faces.length > 0 && (
                      <div className="absolute inset-0">
                        {faces.map((face, index) => (
                          <div
                            key={index}
                            className="absolute border-2 rounded"
                            style={{
                              left: `${(face.bbox.x / 640) * 100}%`,
                              top: `${(face.bbox.y / 480) * 100}%`,
                              width: `${(face.bbox.w / 640) * 100}%`,
                              height: `${(face.bbox.h / 480) * 100}%`,
                              borderColor: '#fbbf24'
                            }}
                          >
                            <div
                              className="absolute -top-8 left-0 px-2 py-1 rounded text-white text-xs font-bold"
                              style={{ backgroundColor: '#fbbf24' }}
                            >
                              {face.emotion} ({face.confidence.toFixed(1)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  width="640"
                  height="480"
                  className="hidden"
                />

                {isLoading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                    <div className="bg-white rounded-lg p-4 flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-3"></div>
                      <span className="text-gray-700">Processing...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* All Camera Controls */}
              <div className="space-y-4">
                {/* Main Control Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={startCamera}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">🎥</span>
                    Start Camera
                  </button>

                  <button
                    onClick={stopCamera}
                    disabled={isLoading}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">⏹️</span>
                    Stop Camera
                  </button>

                  <button
                    onClick={captureAndSend}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">📸</span>
                    {isLoading ? 'Processing...' : 'Detect Emotion'}
                  </button>

                  <button
                    onClick={toggleRealTimeMode}
                    disabled={isLoading}
                    className={`${
                      isRealTimeMode
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-purple-500 hover:bg-purple-600'
                    } disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center`}
                  >
                    <span className="mr-2">{isRealTimeMode ? '⏸️' : '🔄'}</span>
                    {isRealTimeMode ? 'Stop Real-time' : 'Real-time (5s)'}
                  </button>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                    📁 Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isLoading}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-xl file:border-0 file:text-sm file:font-semibold
                    file:bg-gradient-to-r file:from-purple-500 file:to-pink-500
                    file:text-white hover:file:from-purple-600 hover:file:to-pink-600
                    file:transition-all file:duration-200 file:transform hover:file:scale-105
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Real-time Status */}
                {isRealTimeMode && (
                  <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-xl">
                    <div className="flex items-center justify-center">
                      <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-orange-700 dark:text-orange-300 font-medium">
                        🔄 Real-time detection active - analyzing every 5 seconds
                      </span>
                    </div>
                  </div>
                )}

                {/* Multi-face indicator */}
                {faces && faces.length > 1 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-xl">
                    <div className="flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 font-medium">
                        👥 {faces.length} faces detected
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results and Analytics Below */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Emotion Results */}
              <div>
                <EmotionCard
                  emotion={emotion}
                  confidence={confidence}
                  allEmotions={allEmotions}
                  isLoading={isLoading}
                />
              </div>

              {/* Analytics */}
              <div>
                <Analytics
                  analytics={analytics}
                  onResetSession={resetSession}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              🚀 Enhanced with advanced AI • Multiple face detection • Real-time analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
