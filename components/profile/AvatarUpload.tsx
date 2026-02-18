'use client';

import { useState, useRef, useEffect } from 'react';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange: (avatarUrl: string) => void;
  onClose?: () => void;
}

export function AvatarUpload({ currentAvatar, onAvatarChange, onClose }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentAvatar || '');
  const [cropImageUrl, setCropImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setPreviewUrl(currentAvatar || '');
  }, [currentAvatar]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('圖片大小不能超過 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setCropImageUrl(url);
      setIsCropping(true);

      // Load image for cropping
      const img = new Image();
      img.onload = () => {
        // Calculate initial crop (centered square)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        setCrop({ x, y, width: size, height: size });
        setImageSize({ width: img.width, height: img.height });

        if (imageRef.current) {
          imageRef.current.src = url;
        }

        setIsUploading(false);
      };
      img.onerror = () => {
        alert('圖片載入失敗');
        setIsUploading(false);
        setIsCropping(false);
      };
      img.src = url;
    } catch (error) {
      console.error('Error processing image:', error);
      alert('圖片處理失敗');
      setIsUploading(false);
    }
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size (output will be 200x200)
    canvas.width = 200;
    canvas.height = 200;

    // Calculate scale ratios
    const scaleX = 200 / crop.width;
    const scaleY = 200 / crop.height;

    // Draw cropped image
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      200,
      200
    );

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPreviewUrl(dataUrl);
    onAvatarChange(dataUrl);
    setIsCropping(false);

    // Clean up
    URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl('');
  };

  const handleCancelCrop = () => {
    setIsCropping(false);
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl('');
    }
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onAvatarChange('');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    const scaleX = imageSize.width / containerWidth;
    const scaleY = imageSize.height / containerHeight;

    const startX = (e.clientX - rect.left) * scaleX;
    const startY = (e.clientY - rect.top) * scaleY;

    const maxCropSize = Math.min(imageSize.width, imageSize.height);
    const cropSize = maxCropSize;

    let x = startX - cropSize / 2;
    let y = startY - cropSize / 2;

    // Clamp values
    x = Math.max(0, Math.min(x, imageSize.width - cropSize));
    y = Math.max(0, Math.min(y, imageSize.height - cropSize));

    setCrop({ x, y, width: cropSize, height: cropSize });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">編輯照片</h2>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          ✕
        </button>
      </div>

      {!isCropping ? (
        /* Upload Interface */
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <label className="block text-sm font-medium text-white mb-2">頭像照片</label>

          {/* Avatar Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center text-5xl cursor-pointer hover:bg-primary/30 transition-colors overflow-hidden border-2 border-dashed border-white/30"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>📷</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {isUploading ? '上傳中...' : '上傳照片'}
            </button>
            {previewUrl && (
              <>
                <button
                  onClick={handleRemove}
                  className="w-full py-3 bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-red-500 transition-colors"
                >
                  移除照片
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-background-dark text-white rounded-lg font-medium hover:bg-background-dark/80 transition-colors"
                >
                  完成
                </button>
              </>
            )}
            <p className="text-xs text-center text-white/60">
              建議尺寸：200x200，最大 5MB
            </p>
          </div>
        </div>
      ) : (
        /* Cropping Interface */
        <div className="flex-1 flex flex-col justify-center space-y-4">
          <div className="text-sm text-white/80 mb-2">
            拖曳調整裁切區域
          </div>

          {/* Crop Preview */}
          <div className="relative w-full aspect-square bg-background-dark rounded-lg overflow-hidden cursor-crosshair mx-auto"
               style={{ maxWidth: '400px' }}
               onMouseDown={handleMouseDown}
          >
            <img
              ref={imageRef}
              src={cropImageUrl}
              alt="Crop preview"
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />

            {/* Crop Overlay */}
            <div
              className="absolute border-2 border-white bg-white/20 pointer-events-none"
              style={{
                left: `${(crop.x / imageSize.width) * 100}%`,
                top: `${(crop.y / imageSize.height) * 100}%`,
                width: `${(crop.width / imageSize.width) * 100}%`,
                height: `${(crop.height / imageSize.height) * 100}%`,
              }}
            />
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Crop Actions */}
          <div className="flex gap-2 w-full max-w-xs mx-auto">
            <button
              onClick={handleCrop}
              className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              確認裁切
            </button>
            <button
              onClick={handleCancelCrop}
              className="flex-1 py-3 bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
