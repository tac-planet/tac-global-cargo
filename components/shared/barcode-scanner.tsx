"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, CameraOff, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBarcodeScanner, type ScanResult } from "@/hooks/useBarcodeScanner";

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  title?: string;
  description?: string;
  className?: string;
  autoStop?: boolean;
}

export function BarcodeScanner({
  onScan,
  title = "Scan Barcode",
  description = "Point your camera at a barcode or QR code to scan.",
  className,
  autoStop = true,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScan = useCallback(
    (result: ScanResult) => {
      setScanHistory((prev) => {
        if (prev.length > 0 && prev[0].text === result.text) return prev;
        return [result, ...prev].slice(0, 10);
      });
      onScan(result);
      if (autoStop) {
        stopScanning();
      }
    },
    [onScan, autoStop]
  );

  const { isScanning, lastResult, error, startScanning, stopScanning, reset } =
    useBarcodeScanner(handleScan);

  const handleToggle = useCallback(async () => {
    if (isScanning) {
      stopScanning();
    } else if (videoRef.current) {
      await startScanning(videoRef.current);
    }
  }, [isScanning, startScanning, stopScanning]);

  const handleReset = useCallback(() => {
    reset();
    setScanHistory([]);
  }, [reset]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-foreground">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex gap-2">
            {scanHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
            <Button size="sm" onClick={handleToggle} variant={isScanning ? "destructive" : "default"}>
              {isScanning ? (
                <>
                  <CameraOff className="w-4 h-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-1" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-md overflow-hidden bg-muted border border-border">
          <video
            ref={videoRef}
            className={cn("w-full h-full object-cover", !isScanning && "hidden")}
            muted
            playsInline
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {lastResult ? "Scan complete" : "Camera preview"}
                </p>
              </div>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-[15%] border-2 border-primary/60 rounded-lg" />
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
            {error}
          </div>
        )}

        {scanHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Scan Results</p>
            <div className="space-y-1.5">
              {scanHistory.map((scan) => (
                <div
                  key={`${scan.text}-${scan.timestamp.getTime()}`}
                  className="flex items-center gap-2 rounded-md border border-border p-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="font-mono text-foreground truncate flex-1">{scan.text}</span>
                  <Badge variant="outline" className="shrink-0 text-xs">{scan.format}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
