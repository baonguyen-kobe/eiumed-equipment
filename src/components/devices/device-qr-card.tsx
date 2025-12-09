"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Download, QrCode } from "lucide-react";
import { generateDeviceQrSvg, getDeviceQrUrl } from "@/lib/devices/qr";

interface DeviceQrCardProps {
  deviceId: string;
  code: string;
  name: string;
}

export function DeviceQrCard({ deviceId, code, name }: DeviceQrCardProps) {
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQr = async () => {
      try {
        const svg = await generateDeviceQrSvg(deviceId);
        setQrSvg(svg);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadQr();
  }, [deviceId]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && qrSvg) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${code}</title>
            <style>
              body {
                font-family: 'Be Vietnam Pro', Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
              }
              .container {
                text-align: center;
                border: 2px solid #1455A3;
                border-radius: 12px;
                padding: 24px;
                max-width: 300px;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                color: #1455A3;
                margin-bottom: 8px;
              }
              .name {
                font-size: 14px;
                color: #666;
                margin-bottom: 16px;
              }
              .qr {
                margin: 16px 0;
              }
              .url {
                font-size: 10px;
                color: #999;
                word-break: break-all;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="code">${code}</div>
              <div class="name">${name}</div>
              <div class="qr">${qrSvg}</div>
              <div class="url">${getDeviceQrUrl(deviceId)}</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    if (!qrSvg) return;

    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR-${code}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCode className="h-4 w-4" />
          Mã QR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* QR Code Display */}
          <div className="mb-4 rounded-lg border p-4 bg-white">
            {isLoading ? (
              <div className="h-[200px] w-[200px] flex items-center justify-center text-muted-foreground">
                Đang tạo QR...
              </div>
            ) : qrSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: qrSvg }}
                className="[&>svg]:w-[200px] [&>svg]:h-[200px]"
              />
            ) : (
              <div className="h-[200px] w-[200px] flex items-center justify-center text-muted-foreground">
                Không thể tạo QR
              </div>
            )}
          </div>

          {/* Device Info */}
          <div className="text-center mb-4">
            <p className="font-bold text-primary">{code}</p>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={!qrSvg}
            >
              <Printer className="h-4 w-4 mr-1" />
              In QR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!qrSvg}
            >
              <Download className="h-4 w-4 mr-1" />
              Tải SVG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
