import React from 'react';

const VideoDisplay = ({ 
  videoRef, 
  canvasRef, 
  imagePreview, 
  faces, 
  onFileUpload, 
  onRemoveImage,
  isLoading 
}) => {
  const emotionColors = {
    'Angry': '#ef4444',
    'Disgust': '#22c55e',
    'Fear': '#8b5cf6',
    'Happy': '#fbbf24', 
    'Sad': '#3b82f6',
    'Surprise': '#f97316',
    'Neutral': '#6b7280'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        🎯 Live Detection
      </h3>
      
      <div className="relative">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-w-md mx-auto rounded-xl border-4 border-purple-300 shadow-lg"
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
                      borderColor: emotionColors[face.emotion] || '#6b7280'
                    }}
                  >
                    <div 
                      className="absolute -top-8 left-0 px-2 py-1 rounded text-white text-xs font-bold"
                      style={{ backgroundColor: emotionColors[face.emotion] || '#6b7280' }}
                    >
                      {face.emotion} ({face.confidence.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={onRemoveImage}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              width="640"
              height="480"
              autoPlay
              muted
              className="w-full max-w-md mx-auto rounded-xl shadow-lg border-4 border-blue-300"
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
                      borderColor: emotionColors[face.emotion] || '#6b7280'
                    }}
                  >
                    <div 
                      className="absolute -top-8 left-0 px-2 py-1 rounded text-white text-xs font-bold"
                      style={{ backgroundColor: emotionColors[face.emotion] || '#6b7280' }}
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

      <div className="mt-6">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          📁 Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={onFileUpload}
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

      {faces && faces.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 dark:text-blue-300 font-medium">
              👥 {faces.length} faces detected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;
