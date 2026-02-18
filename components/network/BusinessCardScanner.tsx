'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { DashboardContact } from '@/types';
import { scanBusinessCard } from '@/services/geminiService';

interface BusinessCardScannerProps {
  onScanComplete?: (scannedData: Partial<DashboardContact>) => void;
  onClose?: () => void;
}

export function BusinessCardScanner({ onScanComplete, onClose }: BusinessCardScannerProps) {
  const router = useRouter();
  const [scanMode, setScanMode] = useState<'card' | 'qr'>('card');
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableStream = async () => {
      const isSecure = window.isSecureContext;

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatusMessage('無法存取相機。此功能需要 HTTPS 或 localhost。');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => console.error('Video play failed:', e));
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setStatusMessage('無法存取相機。請檢查權限設定。');
      }
    };

    enableStream();

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const showStatusMessage = (message: string, duration: number = 3000) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  };

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) {
      alert('相機串流尚未準備就緒，請稍候。');
      return;
    }

    setIsScanning(true);
    setStatusMessage('正在捕捉畫面...');

    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setIsScanning(false);
      return;
    }

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);

    try {
      setStatusMessage('AI 正在辨識您的名片...');
      const scannedData = await scanBusinessCard(imageDataUrl);

      // Check if we got meaningful data
      if (!scannedData) {
        showStatusMessage('無法辨識名片，請確保圖片清晰。');
        return;
      }

      // Check if at least name or company was detected
      const hasName = scannedData.name && scannedData.name !== 'Unknown';
      const hasCompany = scannedData.company && scannedData.company !== 'Unknown Company';

      if (!hasName && !hasCompany) {
        showStatusMessage('無法辨識名片資訊，請重試或手動新增。');
        return;
      }

      onScanComplete?.(scannedData);
      // Navigate to contact editor with scanned data
      router.push(`/network/new?data=${encodeURIComponent(JSON.stringify(scannedData))}`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || '掃描失敗';
      showStatusMessage(`掃描失敗: ${errMsg}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setIsScanning(true);
        try {
          setStatusMessage('AI 正在辨識您的名片...');
          const scannedData = await scanBusinessCard(base64);

          // Check if we got meaningful data
          if (!scannedData) {
            showStatusMessage('無法辨識名片，請確保圖片清晰。');
            return;
          }

          // Check if at least name or company was detected
          const hasName = scannedData.name && scannedData.name !== 'Unknown';
          const hasCompany = scannedData.company && scannedData.company !== 'Unknown Company';

          if (!hasName && !hasCompany) {
            showStatusMessage('無法辨識名片資訊，請重試或手動新增。');
            return;
          }

          onScanComplete?.(scannedData);
          router.push(`/network/new?data=${encodeURIComponent(JSON.stringify(scannedData))}`);
        } catch (err) {
          console.error(err);
          showStatusMessage('無法辨識名片，請重試。');
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white">
      {/* Flash Effect */}
      {isScanning && (
        <div className="absolute inset-0 bg-white z-[110] animate-pulse" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="absolute top-0 z-20 flex items-center justify-between p-4 w-full bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="p-2 -m-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          ✕
        </button>
        <div className="flex-1 flex justify-center">
          <div className="bg-surface-dark/80 backdrop-blur px-3 py-1.5 rounded-full flex gap-2">
            <button
              onClick={() => setScanMode('card')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                scanMode === 'card' ? 'bg-primary text-white' : 'text-text-dark-secondary hover:text-white'
              }`}
            >
              名片
            </button>
            <button
              onClick={() => setScanMode('qr')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                scanMode === 'qr' ? 'bg-primary text-white' : 'text-text-dark-secondary hover:text-white'
              }`}
            >
              QR Code
            </button>
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* Main Camera View */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan Frame */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`transition-all duration-300 border-4 border-dashed border-primary rounded-2xl bg-black/20 ${
              scanMode === 'card' ? 'w-11/12 max-w-sm aspect-[1.7]' : 'w-3/4 max-w-xs aspect-square'
            }`}
          />

          <div className="absolute bottom-32 text-center px-4">
            <p className="text-sm font-semibold text-white">
              {scanMode === 'card' ? '請將名片對齊掃描框' : '請將 QR Code 對齊掃描框'}
            </p>
            <p className="text-xs text-slate-300 mt-1">掃描後的資訊可在下一步編輯</p>
          </div>
        </div>
      </main>

      {/* Status Message */}
      {statusMessage && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-white text-sm px-6 py-3 rounded-full shadow-lg backdrop-blur-sm">
          {statusMessage}
        </div>
      )}

      {/* Footer Actions */}
      <footer className="absolute bottom-0 left-0 right-0 w-full h-24 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-start justify-center gap-8 z-10 px-8">
        <button
          onClick={handleGalleryClick}
          disabled={isScanning}
          className="flex flex-col items-center gap-1 text-text-dark-secondary w-16 disabled:opacity-50"
        >
          <span className="text-2xl">🖼️</span>
          <span className="text-xs">相簿</span>
        </button>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex flex-col items-center gap-1 text-primary w-16 disabled:opacity-50"
        >
          <div className="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/50 flex items-center justify-center">
            {isScanning ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <span className="text-2xl">📸</span>
            )}
          </div>
          <span className="text-xs font-bold">掃描</span>
        </button>
      </footer>
    </div>
  );
}
