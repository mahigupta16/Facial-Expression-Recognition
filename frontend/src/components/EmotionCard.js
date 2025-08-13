import React from 'react';

const EmotionCard = ({ emotion, confidence, allEmotions, isLoading }) => {
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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Analyzing emotions...</p>
      </div>
    );
  }

  if (!emotion) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <p className="text-gray-600 dark:text-gray-300">Ready to detect emotions</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="text-center mb-6">
        <div className="text-8xl mb-4">{emotionEmojis[emotion] || '🤖'}</div>
        <h2 className="text-3xl font-bold mb-2" style={{ color: emotionColors[emotion] }}>
          {emotion}
        </h2>
        {confidence && (
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 w-32 mr-3">
              <div 
                className="h-4 rounded-full transition-all duration-500"
                style={{ 
                  width: `${confidence}%`,
                  backgroundColor: emotionColors[emotion]
                }}
              ></div>
            </div>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {confidence.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {allEmotions && Object.keys(allEmotions).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            All Emotions Detected:
          </h3>
          {Object.entries(allEmotions)
            .sort(([,a], [,b]) => b - a)
            .map(([emotionName, score]) => (
              <div key={emotionName} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{emotionEmojis[emotionName]}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {emotionName}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 mr-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: emotionColors[emotionName]
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {score.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default EmotionCard;
