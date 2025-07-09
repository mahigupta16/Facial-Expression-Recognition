from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

train_dir = '../dataset/train'
test_dir = '../dataset/test'

img_size = 48
batch_size = 64

# Data generators (same as before)
train_datagen = ImageDataGenerator(rescale=1./255)
test_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    train_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    color_mode='grayscale',
    class_mode='sparse'
)

test_gen = test_datagen.flow_from_directory(
    test_dir,
    target_size=(img_size, img_size),
    batch_size=batch_size,
    color_mode='grayscale',
    class_mode='sparse'
)

# Load trained model
model = load_model('fer_model.keras')

# Evaluate on training data
train_loss, train_acc = model.evaluate(train_gen)
print(f"Training Accuracy: {train_acc * 100:.2f}%")

# Evaluate on test data
test_loss, test_acc = model.evaluate(test_gen)
print(f"Test Accuracy: {test_acc * 100:.2f}%")
