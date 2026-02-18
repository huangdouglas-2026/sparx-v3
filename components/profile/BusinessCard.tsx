'use client';

import { useState } from 'react';
import type { UserProfile } from '@/types';

interface BusinessCardProps {
  profile: UserProfile | null;
  onEdit?: () => void;
  onShare?: () => void;
}

export function BusinessCard({ profile, onEdit, onShare }: BusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate QR Code URL using API
  const getQRCodeUrl = () => {
    if (!profile) return '';

    const qrData = encodeURIComponent(JSON.stringify({
      name: profile.data.name.value,
      email: profile.data.email.value,
      phone: profile.data.phone.value,
      url: window.location.href,
    }));

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  };

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);

      // Get the current page URL for sharing
      const shareUrl = window.location.href;

      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: profile?.data.name.value || '我的數位名片',
          text: `你好，這是我的數位名片`,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('連結已複製到剪貼簿！');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const qrUrl = profile?.qrCodeUrl || getQRCodeUrl();

      // Fetch the QR code image
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `business-card-${Date.now()}.png`;
      link.click();

      // Clean up
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('下載失敗，請稍後再試');
    }
  };

  if (!profile) {
    return (
      <div className="w-full max-w-sm mx-auto bg-surface-dark rounded-xl border border-border-dark p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-4xl mb-3">👋</div>
          <h3 className="text-lg font-semibold text-text-dark-primary mb-2">
            還沒有建立名片
          </h3>
          <p className="text-sm text-text-dark-secondary text-center mb-4">
            建立你的數位名片，開始分享給其他人
          </p>
          <button
            onClick={onEdit}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            建立名片
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Card Container */}
      <div
        className="relative w-full h-[480px] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side */}
          <div
            className="absolute w-full h-full backface-hidden bg-surface-dark rounded-xl border-2 border-border-dark overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Header with gradient */}
            <div className="h-32 bg-gradient-to-br from-primary to-orange-400 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-4xl">
                      👤
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 px-6 pb-6">
              <h2 className="text-xl font-bold text-text-dark-primary mb-1">
                {profile.data.name.value}
              </h2>
              {profile.data.title.visible && (
                <p className="text-sm text-text-dark-secondary mb-4">
                  {profile.data.title.value}
                </p>
              )}

              {profile.data.company.visible && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-primary">🏢</span>
                  <span className="text-sm text-text-dark-primary">
                    {profile.data.company.value}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mt-4">
                {profile.data.email.visible && profile.data.email.value && (
                  <a
                    href={`mailto:${profile.data.email.value}`}
                    className="flex items-center gap-2 text-sm text-text-dark-secondary hover:text-primary transition-colors"
                  >
                    <span>✉️</span>
                    <span className="truncate">{profile.data.email.value}</span>
                  </a>
                )}
                {profile.data.phone.visible && profile.data.phone.value && (
                  <a
                    href={`tel:${profile.data.phone.value}`}
                    className="flex items-center gap-2 text-sm text-text-dark-secondary hover:text-primary transition-colors"
                  >
                    <span>📱</span>
                    <span>{profile.data.phone.value}</span>
                  </a>
                )}
                {profile.data.linkedin.visible && profile.data.linkedin.value && (
                  <a
                    href={profile.data.linkedin.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-text-dark-secondary hover:text-[#0077b5] transition-colors"
                  >
                    <span>🔗</span>
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  編輯
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  disabled={isSharing}
                  className="flex-1 py-2 bg-background-dark text-text-dark-primary rounded-lg text-sm font-medium hover:bg-surface-dark/80 transition-colors disabled:opacity-50"
                >
                  {isSharing ? '分享中...' : '分享'}
                </button>
              </div>
            </div>
          </div>

          {/* Back Side - QR Code */}
          <div
            className="absolute w-full h-full backface-hidden bg-surface-dark rounded-xl border-2 border-border-dark overflow-hidden flex flex-col items-center justify-center p-6"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <h3 className="text-lg font-semibold text-text-dark-primary mb-4">
              掃描 QR Code
            </h3>
            <p className="text-sm text-text-dark-secondary mb-4 text-center">
              取得我的聯絡資訊
            </p>

            <div className="bg-white p-3 rounded-lg shadow-lg mb-4">
              <img src={profile.qrCodeUrl || getQRCodeUrl()} alt="QR Code" className="w-48 h-48" />
            </div>

            <p className="text-xs text-text-dark-secondary mb-4">點擊翻轉名片</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadQR();
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              下載 QR Code
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-dark-secondary text-center mt-4">
        點擊名片翻轉查看 QR Code
      </p>
    </div>
  );
}
