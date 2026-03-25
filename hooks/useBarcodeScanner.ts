"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ScanResult {
  text: string;
  format: string;
  timestamp: Date;
}

interface UseBarcodeScanner {
  isScanning: boolean;
  lastResult: ScanResult | null;
  error: string | null;
  startScanning: (videoEl: HTMLVideoElement) => Promise<void>;
  stopScanning: () => void;
  reset: () => void;
}

export function useBarcodeScanner(
  onScan?: (result: ScanResult) => void
): UseBarcodeScanner {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanning = useCallback(
    async (videoEl: HTMLVideoElement) => {
      setError(null);
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");

        if (!readerRef.current) {
          readerRef.current = new BrowserMultiFormatReader();
        }

        const reader = readerRef.current;
        setIsScanning(true);

        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoEl,
          (result: any, err: any) => {
            if (result) {
              const scanResult: ScanResult = {
                text: result.getText(),
                format: result.getBarcodeFormat()?.toString() ?? "UNKNOWN",
                timestamp: new Date(),
              };
              setLastResult(scanResult);
              onScan?.(scanResult);
            }
            if (err && !(err instanceof TypeError)) {
              // NotFoundException is expected when no barcode is in frame
            }
          }
        );
      } catch (e: any) {
        const message =
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access."
            : e?.message ?? "Failed to start scanner";
        setError(message);
        setIsScanning(false);
      }
    },
    [onScan]
  );

  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return { isScanning, lastResult, error, startScanning, stopScanning, reset };
}
