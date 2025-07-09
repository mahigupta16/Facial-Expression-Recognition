import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Dataset directories
test_dir = '../dataset/test'
img_size = 48
batch_size = 64

# Rescale the test images
test_datagen = ImageDataGenerator(rescale=1./255)
test_gen = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    color_mode='grayscale',
    class_mode='sparse'
)

# Load the trained model
model = tf.keras.models.load_model('fer_model.keras')

# Evaluate the model
loss, acc = model.evaluate(test_gen)
print(f"Test Accuracy: {acc * 100:.2f}%")
