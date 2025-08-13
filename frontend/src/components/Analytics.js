import React from 'react';

const Analytics = ({ analytics, onResetSession }) => {
  if (!analytics || !analytics.session_stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          📊 Session Analytics
        </h3>
        <p className="text-gray-600 dark:text-gray-400">No data available yet</p>
      </div>
    );
  }

  const { session_stats, dominant_emotion, recent_history } = analytics;
  const { duration_minutes, total_predictions, emotion_percentages } = session_stats;

  const emotionColors = {
    'Angry': '#ef4444',
    'Disgust': '#22c55e',
    'Fear': '#8b5cf6', 
    'Happy': '#fbbf24',
    'Sad': '#3b82f6',
    'Surprise': '#f97316',
    'Neutral': '#6b7280'
  };

  const emotionEmojis = {
    'Angry': '😠',
    'Disgust': '🤢',
    'Fear': '😨',
    'Happy': '😊', 
    'Sad': '😢',
    'Surprise': '😲',
    'Neutral': '😐'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          📊 Session Analytics
        </h3>
        <button
          onClick={onResetSession}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
            {total_predictions}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">
            Total Predictions
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-xl">
          <div className="text-2xl font-bold text-green-600 dark:text-green-300">
            {duration_minutes}m
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">
            Session Duration
          </div>
        </div>
      </div>

      {dominant_emotion && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{emotionEmojis[dominant_emotion]}</span>
            <div>
              <div className="font-semibold text-gray-800 dark:text-white">
                Dominant Emotion: {dominant_emotion}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Most frequently detected emotion
              </div>
            </div>
          </div>
        </div>
      )}

      {emotion_percentages && Object.keys(emotion_percentages).length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Emotion Distribution
          </h4>
          <div className="space-y-2">
            {Object.entries(emotion_percentages)
              .filter(([, percentage]) => percentage > 0)
              .sort(([,a], [,b]) => b - a)
              .map(([emotion, percentage]) => (
                <div key={emotion} className="flex items-center">
                  <span className="text-xl mr-2">{emotionEmojis[emotion]}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">
                    {emotion}
                  </span>
                  <div className="flex-1 mx-3">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: emotionColors[emotion]
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {recent_history && recent_history.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Activity
          </h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {recent_history.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="mr-2">{emotionEmojis[entry.emotion]}</span>
                  <span className="text-gray-600 dark:text-gray-400">{entry.emotion}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-500">
                  {entry.confidence.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
