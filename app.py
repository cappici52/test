from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import os
import json

app = Flask(__name__)
CORS(app)

# โหลดโมเดล
MODEL_PATH = "models.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# โหลด labels json
LABEL_PATH = "breed_labels.json"
with open(LABEL_PATH, "r") as f:
    breed_labels = json.load(f)

breed_labels = {int(k): v for k, v in breed_labels.items()}

@app.route("/breed_labels.json")
def get_labels():
    return jsonify(breed_labels)


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file found"}), 400

    file = request.files["file"]

    img_path = "temp.jpg"
    file.save(img_path)

    # Load image
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)

    preds = model.predict(x)
    class_id = int(np.argmax(preds[0]))
    confidence = float(preds[0][class_id])
    breed_name = breed_labels.get(class_id, "Unknown")

    return jsonify({
        "class_id": class_id,
        "breed": breed_name,
        "confidence": confidence
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
