from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

model = load_model("fer_model.keras")
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml")
emotion_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def preprocess_face(face_img):
    gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (48, 48))
    norm = resized.astype('float32') / 255.0
    return np.expand_dims(norm, axis=(0, -1))

@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    faces = face_cascade.detectMultiScale(img, 1.3, 5)

    for (x, y, w, h) in faces:
        face = img[y:y+h, x:x+w]
        processed = preprocess_face(face)
        prediction = model.predict(processed)
        emotion = emotion_labels[np.argmax(prediction)]
        confidence = float(np.max(prediction)) * 100
        print(f"Predicted Emotion: {emotion}, Confidence: {confidence:.2f}%")

        return jsonify({'emotion': emotion, 'confidence': confidence})


    return jsonify({'error': 'No face detected'})

@app.route('/webcam', methods=['POST'])
def webcam_image():
    data = request.json['image']
    encoded = base64.b64decode(data.split(',')[1])
    img = cv2.imdecode(np.frombuffer(encoded, np.uint8), cv2.IMREAD_COLOR)
    faces = face_cascade.detectMultiScale(img, 1.3, 5)

    for (x, y, w, h) in faces:
        face = img[y:y+h, x:x+w]
        processed = preprocess_face(face)
        prediction = model.predict(processed)
        emotion = emotion_labels[np.argmax(prediction)]
        confidence = float(np.max(prediction)) * 100
        print(f"Predicted Emotion: {emotion}, Confidence: {confidence:.2f}%")
        return jsonify({'emotion': emotion, 'confidence': confidence})

    return jsonify({'error': 'No face detected'})

if __name__ == '__main__':
    app.run(debug=True)
