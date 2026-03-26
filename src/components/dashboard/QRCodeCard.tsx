"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Copy, Download, Loader2, QrCode } from "lucide-react";

interface QRCodeCardProps {
  url: string;
}

export function QRCodeCard({ url }: QRCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }, (error) => {
        if (error) console.error(error);
        setLoading(false);
      });
    }
  }, [url]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "form-qr-code.png";
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-sm border-slate-100 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <QrCode className="h-5 w-5 text-indigo-600" />
          Share Form
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 min-h-[232px] flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-xl">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
          )}
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Button variant="outline" size="sm" onClick={copyLink} className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button size="sm" onClick={downloadQRCode} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
