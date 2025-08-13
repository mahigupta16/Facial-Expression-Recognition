from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import os
import time
from datetime import datetime
from tensorflow.keras.models import load_model
import json
from collections import deque
import threading

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Try to load enhanced model first, fallback to original
model_path = "fer_model_enhanced.keras" if os.path.exists("fer_model_enhanced.keras") else "fer_model.keras"
model = load_model(model_path)
print(f"Loaded model: {model_path}")

# Enhanced face detection with multiple cascade classifiers
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Emotion colors for visualization
emotion_colors = {
    'Angry': (0, 0, 255),      # Red
    'Disgust': (0, 128, 0),    # Dark Green
    'Fear': (128, 0, 128),     # Purple
    'Happy': (0, 255, 255),    # Yellow
    'Sad': (255, 0, 0),        # Blue
    'Surprise': (0, 165, 255), # Orange
    'Neutral': (128, 128, 128) # Gray
}

# Store emotion history for analytics
emotion_history = deque(maxlen=100)
session_stats = {
    'start_time': time.time(),
    'total_predictions': 0,
    'emotion_counts': {emotion: 0 for emotion in emotion_labels}
}

def preprocess_face(face_img, target_size=48):
    """Enhanced preprocessing with better normalization"""

    gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)

    # Apply histogram equalization for better contrast
    gray = cv2.equalizeHist(gray)

    # Resize to target size
    resized = cv2.resize(gray, (target_size, target_size))

    # Normalize
    norm = resized.astype('float32') / 255.0

    # Add batch and channel dimensions
    return np.expand_dims(norm, axis=(0, -1))

def detect_multiple_faces(img):
    """Enhanced face detection with multiple scales"""
    faces = face_cascade.detectMultiScale(
        img,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE
    )
    return faces

def get_emotion_confidence_all(prediction):
    """Get confidence scores for all emotions"""
    confidence_scores = {}
    for i, emotion in enumerate(emotion_labels):
        confidence_scores[emotion] = float(prediction[0][i] * 100)
    return confidence_scores

def add_to_history(emotion, confidence, timestamp=None):
    """Add prediction to emotion history"""
    if timestamp is None:
        timestamp = datetime.now().isoformat()

    emotion_history.append({
        'emotion': emotion,
        'confidence': confidence,
        'timestamp': timestamp
    })

    # Update session stats
    session_stats['total_predictions'] += 1
    session_stats['emotion_counts'][emotion] += 1

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        file = request.files['image']
        img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
        faces = detect_multiple_faces(img)

        if len(faces) == 0:
            return jsonify({'error': 'No face detected'})

        results = []
        for i, (x, y, w, h) in enumerate(faces):
            face = img[y:y+h, x:x+w]
            processed = preprocess_face(face)
            prediction = model.predict(processed, verbose=0)

            emotion = emotion_labels[np.argmax(prediction)]
            confidence = float(np.max(prediction)) * 100
            all_confidences = get_emotion_confidence_all(prediction)

            # Add to history
            add_to_history(emotion, confidence)

            results.append({
                'face_id': i,
                'emotion': emotion,
                'confidence': confidence,
                'all_emotions': all_confidences,
                'bbox': {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
            })

            print(f"Face {i+1} - Predicted Emotion: {emotion}, Confidence: {confidence:.2f}%")

        return jsonify({
            'faces': results,
            'total_faces': len(faces),
            'primary_emotion': results[0]['emotion'] if results else None,
            'primary_confidence': results[0]['confidence'] if results else None
        })

    except Exception as e:
        print(f"Error in upload_image: {str(e)}")
        return jsonify({'error': 'Processing failed'}), 500

@app.route('/webcam', methods=['POST'])
def webcam_image():
    try:
        data = request.json['image']
        encoded = base64.b64decode(data.split(',')[1])
        img = cv2.imdecode(np.frombuffer(encoded, np.uint8), cv2.IMREAD_COLOR)
        faces = detect_multiple_faces(img)

        if len(faces) == 0:
            return jsonify({'error': 'No face detected'})

        results = []
        for i, (x, y, w, h) in enumerate(faces):
            face = img[y:y+h, x:x+w]
            processed = preprocess_face(face)
            prediction = model.predict(processed, verbose=0)

            emotion = emotion_labels[np.argmax(prediction)]
            confidence = float(np.max(prediction)) * 100
            all_confidences = get_emotion_confidence_all(prediction)

            # Add to history
            add_to_history(emotion, confidence)

            results.append({
                'face_id': i,
                'emotion': emotion,
                'confidence': confidence,
                'all_emotions': all_confidences,
                'bbox': {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
            })

        return jsonify({
            'faces': results,
            'total_faces': len(faces),
            'primary_emotion': results[0]['emotion'] if results else None,
            'primary_confidence': results[0]['confidence'] if results else None
        })

    except Exception as e:
        print(f"Error in webcam_image: {str(e)}")
        return jsonify({'error': 'Processing failed'}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get emotion analytics and history"""
    try:
        current_time = time.time()
        session_duration = current_time - session_stats['start_time']

        # Calculate emotion percentages
        total_predictions = session_stats['total_predictions']
        emotion_percentages = {}
        if total_predictions > 0:
            for emotion, count in session_stats['emotion_counts'].items():
                emotion_percentages[emotion] = (count / total_predictions) * 100

        # Get recent emotion history
        recent_history = list(emotion_history)[-20:]  # Last 20 predictions

        return jsonify({
            'session_stats': {
                'duration_minutes': round(session_duration / 60, 2),
                'total_predictions': total_predictions,
                'emotion_counts': session_stats['emotion_counts'],
                'emotion_percentages': emotion_percentages
            },
            'recent_history': recent_history,
            'dominant_emotion': max(session_stats['emotion_counts'],
                                  key=session_stats['emotion_counts'].get) if total_predictions > 0 else None
        })

    except Exception as e:
        print(f"Error in get_analytics: {str(e)}")
        return jsonify({'error': 'Analytics failed'}), 500

@app.route('/reset-session', methods=['POST'])
def reset_session():
    """Reset session statistics"""
    try:
        global session_stats, emotion_history

        session_stats = {
            'start_time': time.time(),
            'total_predictions': 0,
            'emotion_counts': {emotion: 0 for emotion in emotion_labels}
        }
        emotion_history.clear()

        return jsonify({'message': 'Session reset successfully'})

    except Exception as e:
        print(f"Error in reset_session: {str(e)}")
        return jsonify({'error': 'Reset failed'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_path': model_path,
        'supported_emotions': emotion_labels,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Enhanced Facial Expression Recognition API Starting...")
    print(f"📊 Model: {model_path}")
    print(f"🎭 Supported Emotions: {', '.join(emotion_labels)}")
    print("🌐 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
