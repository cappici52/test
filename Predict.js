import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";

export default function Predict() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  const webcamRef = useRef(null);

  const [labels, setLabels] = useState({});
  const [cameraOn, setCameraOn] = useState(false); // เปิด/ปิดกล้อง

  // โหลด labels จาก Backend
  useEffect(() => {
    fetch("http://127.0.0.1:5000/breed_labels.json")
      .then((res) => res.json())
      .then((data) => setLabels(data));
  }, []);

  // เมื่อเลือกไฟล์
  const handleUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  // ถ่ายภาพจากกล้อง
  const captureFromCamera = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera.jpg");
        setImageFile(file);
        setPreview(imageSrc);
        setResult(null);
      });
  };

  // Predict
  const handlePredict = async () => {
    if (!imageFile) {
      alert("กรุณาเลือกรูปหรือถ่ายรูปก่อน");
      return;
    }

    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error connecting to server");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>🐶 Dog Breed Predictor</h1>

      {/* ปุ่มเปิด/ปิดกล้อง */}
      <button
        onClick={() => setCameraOn(!cameraOn)}
        style={{
          width: "100%",
          padding: "10px",
          background: cameraOn ? "red" : "#0099ff",
          color: "white",
          borderRadius: 8,
          border: "none",
          marginBottom: 10,
        }}
      >
        {cameraOn ? "🔴 ปิดกล้อง" : "📷 เปิดกล้อง"}
      </button>

      {/* กล้อง */}
      {cameraOn && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ width: "100%", borderRadius: 10 }}
          />

          <button
            onClick={captureFromCamera}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              background: "green",
              color: "white",
              borderRadius: 8,
              border: "none",
            }}
          >
            📸 ถ่ายรูป
          </button>
        </>
      )}

      <hr style={{ margin: "20px 0" }} />

      {/* Upload */}
      <input type="file" accept="image/*" onChange={handleUpload} />

      {/* Preview */}
      {preview && (
        <div style={{ marginTop: "20px" }}>
          <img src={preview} alt="Preview" style={{ width: "100%", borderRadius: 10 }} />
        </div>
      )}

      {/* Predict Button */}
      <button
        onClick={handlePredict}
        style={{
          width: "100%",
          marginTop: "15px",
          padding: "12px",
          background: "purple",
          color: "white",
          borderRadius: 8,
          border: "none",
        }}
      >
        🔍 Predict
      </button>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            background: "#f3f3f3",
            borderRadius: 10,
          }}
        >
          <h3>ผลลัพธ์การทำนาย</h3>

          <p>
            <b>สายพันธุ์:</b> {result.breed}
          </p>
          <p>
            <b>ความมั่นใจ:</b> {(result.confidence * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
}
