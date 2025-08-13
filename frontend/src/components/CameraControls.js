import React from 'react';

const CameraControls = ({ 
  onStartCamera, 
  onStopCamera, 
  onCapture, 
  onToggleRealTime,
  isRealTimeMode,
  isLoading 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        📹 Camera Controls
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onStartCamera}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center"
        >
          <span className="mr-2">🎥</span>
          Start Camera
        </button>
        
        <button 
          onClick={onStopCamera}
          disabled={isLoading}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center"
        >
          <span className="mr-2">⏹️</span>
          Stop Camera
        </button>
        
        <button 
          onClick={onCapture}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center"
        >
          <span className="mr-2">📸</span>
          {isLoading ? 'Processing...' : 'Detect Emotion'}
        </button>
        
        <button 
          onClick={onToggleRealTime}
          disabled={isLoading}
          className={`${
            isRealTimeMode 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-purple-500 hover:bg-purple-600'
          } disabled:bg-gray-400 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center`}
        >
          <span className="mr-2">{isRealTimeMode ? '⏸️' : '🔄'}</span>
          {isRealTimeMode ? 'Stop Real-time' : 'Real-time Mode'}
        </button>
      </div>
      
      {isRealTimeMode && (
        <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
          <div className="flex items-center">
            <div className="animate-pulse w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
              Real-time detection active - analyzing every 2 seconds
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraControls;
