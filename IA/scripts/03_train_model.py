#!/usr/bin/env python3
"""ÉTAPE 8: Train Neural Network Model"""

import numpy as np
import os
from tensorflow import keras
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

print("=" * 80)
print("ÉTAPE 8: ENTRAÎNER LE MODÈLE DE RÉSEAU DE NEURONES")
print("=" * 80 + "\n")

script_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(os.path.dirname(script_dir), 'data')
models_dir = os.path.join(os.path.dirname(script_dir), 'models')

# Load data
X_train = np.load(os.path.join(data_dir, 'X_train.npy'))
X_val = np.load(os.path.join(data_dir, 'X_val.npy'))
X_test = np.load(os.path.join(data_dir, 'X_test.npy'))
y_train = np.load(os.path.join(data_dir, 'y_train.npy'))
y_val = np.load(os.path.join(data_dir, 'y_val.npy'))
y_test = np.load(os.path.join(data_dir, 'y_test.npy'))

print(f"✓ Data loaded: Train {X_train.shape}, Val {X_val.shape}, Test {X_test.shape}\n")

# Build model
model = keras.Sequential([
    keras.layers.Input(shape=(10,)),
    keras.layers.Dense(20, activation='relu', name='hidden_1'),
    keras.layers.Dropout(0.3),
    keras.layers.Dense(10, activation='relu', name='hidden_2'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(1, activation='sigmoid', name='output')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='binary_crossentropy',
    metrics=['accuracy', keras.metrics.Precision(), keras.metrics.Recall(), keras.metrics.AUC()]
)

print("Model Architecture:")
model.summary()
print()

# Train
print("Training (this may take a few minutes)...\n")
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=32,
    callbacks=[keras.callbacks.EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)],
    verbose=1
)

# Evaluate
print("\n" + "=" * 80)
print("EVALUATION")
print("=" * 80 + "\n")

def eval_metrics(y_true, y_pred, y_pred_proba, name):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    auc = roc_auc_score(y_true, y_pred_proba)

    print(f"{name}: Acc={acc:.4f}, Prec={prec:.4f}, Rec={rec:.4f}, F1={f1:.4f}, AUC={auc:.4f}")
    return {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1, 'auc': auc}

y_train_pred = (model.predict(X_train, verbose=0) > 0.5).astype(int).flatten()
y_val_pred = (model.predict(X_val, verbose=0) > 0.5).astype(int).flatten()
y_test_pred = (model.predict(X_test, verbose=0) > 0.5).astype(int).flatten()

y_train_proba = model.predict(X_train, verbose=0).flatten()
y_val_proba = model.predict(X_val, verbose=0).flatten()
y_test_proba = model.predict(X_test, verbose=0).flatten()

m_train = eval_metrics(y_train, y_train_pred, y_train_proba, "TRAIN")
m_val = eval_metrics(y_val, y_val_pred, y_val_proba, "VAL")
m_test = eval_metrics(y_test, y_test_pred, y_test_proba, "TEST")

# Save
model.save(os.path.join(models_dir, 'recommendation_model.h5'))
import pickle
with open(os.path.join(models_dir, 'training_history.pkl'), 'wb') as f:
    pickle.dump(history.history, f)
with open(os.path.join(models_dir, 'model_metrics.pkl'), 'wb') as f:
    pickle.dump({'train': m_train, 'val': m_val, 'test': m_test}, f)

print(f"\n✓ Model saved to models/recommendation_model.h5")
print("✅ ÉTAPE 8 COMPLÉTÉE\n")
