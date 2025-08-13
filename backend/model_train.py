import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNet
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint, LearningRateScheduler
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.mixed_precision import experimental as mixed_precision
import matplotlib.pyplot as plt

# Enable mixed precision training
policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_policy(policy)

TRAIN_DIR = 'data/train'
VAL_DIR = 'data/val'

# Data augmentation
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True
)
val_datagen = ImageDataGenerator(rescale=1./255)

train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(128, 128),  # Smaller image size
    batch_size=32,  # Smaller batch size
    class_mode='categorical',
    color_mode='rgb'
)
val_generator = val_datagen.flow_from_directory(
    VAL_DIR,
    target_size=(128, 128),
    batch_size=32,
    class_mode='categorical',
    color_mode='rgb'
)

# Use MobileNet, freeze all but last 10 layers
base_model = MobileNet(weights='imagenet', include_top=False, input_shape=(128, 128, 3))
for layer in base_model.layers[:-10]:
    layer.trainable = False
for layer in base_model.layers[-10:]:
    layer.trainable = True

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dropout(0.5)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.3)(x)
predictions = Dense(train_generator.num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

# Use SGD optimizer
model.compile(optimizer=SGD(learning_rate=0.01, momentum=0.9), loss='categorical_crossentropy', metrics=['accuracy'])

# Learning rate scheduler
def lr_schedule(epoch):
    initial_lr = 0.001
    drop = 0.5
    epochs_drop = 5
    return initial_lr * (drop ** (epoch // epochs_drop))

callbacks = [
    EarlyStopping(patience=4, restore_best_weights=True),
    ReduceLROnPlateau(patience=2, factor=0.2),
    ModelCheckpoint('best_fer_model.keras', save_best_only=True),
    LearningRateScheduler(lr_schedule)
]

# Train the model
model.fit(
    train_generator,
    epochs=10,  # Reduced epochs
    validation_data=val_generator,
    callbacks=callbacks
)

model.save('fer_model.keras')
print("Training complete. Model saved as 'fer_model.keras' and best as 'best_fer_model.keras'.")

# Evaluate the model
loss, acc = model.evaluate(val_generator, verbose=0)
print(f"\nEnhanced Model Test Accuracy: {acc * 100:.2f}%")

# Plot training history
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Model Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.tight_layout()
plt.savefig('training_history.png', dpi=300, bbox_inches='tight')
plt.show()

print("Enhanced model training completed!")