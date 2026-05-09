"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, Check, Loader2, FlipHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
}

export function CameraScanner({ isOpen, onClose, onTextExtracted }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [hasCamera, setHasCamera] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCamera(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasCamera(false);
      setError("Could not access camera. Please ensure camera permissions are granted.");
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  }, [stopCamera]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
    setIsCapturing(false);
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  }, [startCamera]);

  const processImage = useCallback(async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append("image", blob, "scan.jpg");
      
      const ocrResponse = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });
      
      const data = await ocrResponse.json();
      
      if (!ocrResponse.ok) {
        throw new Error(data.error || "Failed to extract text from image");
      }
      
      if (data.text && data.text.trim().length > 0) {
        onTextExtracted(data.text);
        onClose();
      } else {
        setError("No text detected in the image. Please try again with a clearer image.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  }, [capturedImage, onTextExtracted, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    onClose();
  }, [stopCamera, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl rounded-2xl bg-surface overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Scan Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Position the contract in the frame
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Camera View */}
            <div className="relative aspect-[4/3] bg-black">
              {!hasCamera ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Camera className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Camera not available</p>
                  <p className="text-sm text-white/70 text-center max-w-xs">
                    Please grant camera permissions or use the file upload option instead.
                  </p>
                </div>
              ) : capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scanning overlay */}
                  <div className="absolute inset-8 border-2 border-white/50 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  </div>
                </>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            
            {/* Controls */}
            <div className="p-4 border-t border-border">
              {capturedImage ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={retake}
                    disabled={isProcessing}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={processImage}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Extracting text...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Use this scan
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    disabled={!hasCamera}
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </Button>
                  <Button
                    className="flex-1 h-14"
                    onClick={captureImage}
                    disabled={!hasCamera || isCapturing}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Capture Document
                  </Button>
                </div>
              )}
            </div>
            
            {/* Tips */}
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground text-center">
                For best results, ensure good lighting and hold the document flat
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
