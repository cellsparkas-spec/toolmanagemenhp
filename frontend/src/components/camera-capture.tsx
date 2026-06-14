import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CameraCapture({ onCapture }: { onCapture: (dataUrl: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center border">
        {!isCameraActive && !capturedImage && (
          <Button variant="outline" type="button" onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
        )}
        {isCameraActive && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
        {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex justify-center gap-2">
        {isCameraActive && <Button type="button" onClick={capturePhoto}>Capture Photo</Button>}
        {capturedImage && (
          <Button type="button" variant="outline" onClick={retakePhoto}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retake
          </Button>
        )}
      </div>
    </div>
  );
}
