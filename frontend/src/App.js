import React, { useRef, useState } from 'react';

function App() {
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    streamRef.current = stream;
    setImagePreview(null);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

  const captureAndSend = async () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 300, 300);
    const base64 = canvasRef.current.toDataURL('image/jpeg');

    const res = await fetch('http://localhost:5000/webcam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    const data = await res.json();
    setEmotion(data.emotion || 'No face detected');
    setConfidence(data.confidence || null);

  };

  const handleUpload = async (e) => {
    stopCamera();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setImagePreview(URL.createObjectURL(file));

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setEmotion(data.emotion || 'No face detected');
    setConfidence(data.confidence || null);

  };

  const removeImage = () => {
    setImagePreview(null);
    setEmotion('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-6 text-purple-800 drop-shadow">Facial Expression Recognition</h1>

      {/* Display Webcam or Uploaded Image */}
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-72 h-72 object-cover rounded-xl border-4 border-purple-300 shadow-md"
        />
      ) : (
        <video
          ref={videoRef}
          width="300"
          height="300"
          autoPlay
          className="rounded-xl shadow-lg border-4 border-blue-300"
        />
      )}

      <canvas ref={canvasRef} width="300" height="300" className="hidden" />

      {/* Buttons */}
      <div className="mt-5 flex flex-wrap justify-center gap-4">
        <button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full shadow transition">
          Start Camera
        </button>
        <button onClick={stopCamera} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full shadow transition">
          Stop Camera
        </button>
        <button onClick={captureAndSend} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full shadow transition">
          Detect Emotion
        </button>
        {imagePreview && (
          <button onClick={removeImage} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-full shadow transition">
            Remove Image
          </button>
        )}
      </div>

      {/* Upload */}
      <div className="mt-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0 file:text-sm file:font-semibold
          file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition"
        />
      </div>

      {/* Emotion Output */}
      <h2 className="text-2xl mt-6 text-gray-800">
        Emotion: <span className="font-semibold text-purple-800">{emotion}</span>
      </h2>
      {confidence !== null && (
        <h2 className="text-xl text-gray-700 mt-2">
          Confidence: <span className="font-semibold text-green-700">{confidence}%</span>
        </h2>
      )}

    </div>
  );
}

export default App;
