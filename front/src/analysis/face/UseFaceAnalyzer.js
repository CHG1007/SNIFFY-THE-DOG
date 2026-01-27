import { useRef } from "react";
import * as faceapi from "face-api.js";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

export function useFaceAnalyzer() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const initVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    await new Promise(resolve => {
      videoRef.current.onloadedmetadata = resolve;
    });
  };

  const loadModels = async () => {
    await faceapi.tf.setBackend("webgl");
    await faceapi.tf.ready();

    await faceapi.nets.tinyFaceDetector.loadFromUri(
      "/models/tiny_face_detector"
    );
    await faceapi.nets.faceExpressionNet.loadFromUri(
      "/models/face_expression_model"
    );

    console.log("face-api models loaded");
  };

  const analyzeOnce = async () => {
    if (!videoRef.current) return null;

    const result = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceExpressions();

    if (!result) {
      return { faceDetected: false };
    }

    return {
      faceDetected: true,
      expressions: result.expressions,
    };
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  return {
    videoRef,
    initVideo,
    loadModels,
    analyzeOnce,
    stop,
  };
}
