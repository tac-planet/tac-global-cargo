"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, BarcodeScanner } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ScanResult } from "@/hooks/useBarcodeScanner";

export default function ScanningPage() {
  const router = useRouter();
  const [history, setHistory] = useState<ScanResult[]>([]);

  const handleScan = useCallback(
    (result: ScanResult) => {
      setHistory((prev) => [result, ...prev].slice(0, 20));
      toast.success(`Scanned: ${result.text}`);
    },
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barcode Scanner"
        description="Scan shipment barcodes or QR codes for quick lookup and tracking updates."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarcodeScanner
          onScan={handleScan}
          title="Scan Shipment"
          description="Point camera at a CN barcode or QR code."
          autoStop={false}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No scans yet. Start scanning to see results here.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((scan, i) => (
                  <div
                    key={`${scan.text}-${scan.timestamp.getTime()}-${i}`}
                    className="flex items-center justify-between rounded-md border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-mono font-medium text-foreground truncate">
                        {scan.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(scan.timestamp, "HH:mm:ss")}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                      {scan.format}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
