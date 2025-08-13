
# 😃 Facial Expression Recognition App

A full-stack deep learning application that detects and classifies facial expressions from either a webcam feed or image uploads. The project combines a React.js frontend with a Flask backend powered by a Convolutional Neural Network (CNN) trained using Keras and TensorFlow.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Flask, Python
- **Deep Learning:** TensorFlow, Keras
- **Image Processing:** OpenCV
- **Deployment:** Localhost (can be extended to cloud platforms)

## 📸 Features

- Detects faces in real-time using webcam or uploaded images
- Classifies facial expressions into one of seven emotions:
  - Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
- Clean and responsive UI built with Tailwind CSS
- Live feedback on predicted emotions with high accuracy

## 🧠 Model Info

- Input: 48×48 grayscale facial images
- Architecture: Custom CNN with BatchNormalization, Dropout, and multiple Conv2D layers
- Optimization:
  - Data Augmentation
  - EarlyStopping
  - ReduceLROnPlateau
- Accuracy: Achieves ~75% test accuracy after optimization

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/facial-expression-recognition.git
cd facial-expression-recognition
```

### 2. Backend Setup (Flask + Keras)

```bash
cd backend
pip install -r requirements.txt
python model_train.py  # or model_train_v2.py for optimized version
python app.py  # start Flask API server
```

### 3. Frontend Setup (React + Tailwind)

```bash
cd ../frontend
npm install
npm start
```

### 4. Access the App

Visit: [http://localhost:3000](http://localhost:3000)

Upload an image or use the webcam to detect facial expression in real-time.

## 📁 Folder Structure

```
facial-expression-recognition/
├── backend/
│   ├── model_train.py / model_train_v2.py
│   ├── app.py
│   └── fer_model.keras
├── frontend/
│   ├── src/
│   └── public/
└── README.md
```

## 📈 Future Improvements

- Use RGB input and pretrained models like MobileNetV2 for higher accuracy
- Add support for multiple faces in a frame
- Deploy backend and frontend to cloud (e.g., Heroku, Render, Vercel)

## 🧑‍💻 Author

Mahi Gupta

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
