'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessCard, ScanHistory, SocialConnect } from '@/components/profile';
import { profileService } from '@/services/profileService';
import type { UserProfile } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showScanHistory, setShowScanHistory] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push('/profile/edit');
  };

  const handleShare = () => {
    // Share functionality is handled in BusinessCard component
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-dark-primary mb-1">我的名片</h1>
          <p className="text-text-dark-secondary">個人數位名片</p>
        </div>
        <button
          onClick={() => router.push('/linkedin-debug')}
          className="text-xs text-text-dark-tertiary hover:text-primary transition-colors"
        >
          🔧 LinkedIn 診斷
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-text-dark-secondary">
          載入中...
        </div>
      ) : (
        <BusinessCard
          profile={profile}
          onEdit={handleEdit}
          onShare={handleShare}
        />
      )}

      {/* Additional Actions */}
      {profile && (
        <div className="mt-6 space-y-3 max-w-sm mx-auto">
          {/* Social Connect */}
          <SocialConnect onConnected={() => {/* Refresh profile if needed */}} />

          <button
            onClick={() => router.push('/profile/edit')}
            className="w-full p-3 bg-surface-dark border border-border-dark rounded-lg text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✏️</span>
              <div>
                <h3 className="text-sm font-semibold text-text-dark-primary">編輯名片</h3>
                <p className="text-xs text-text-dark-secondary">更新你的資訊</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowScanHistory(!showScanHistory)}
            className="w-full p-3 bg-surface-dark border border-border-dark rounded-lg text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📜</span>
              <div>
                <h3 className="text-sm font-semibold text-text-dark-primary">掃描歷史</h3>
                <p className="text-xs text-text-dark-secondary">查看掃描過的名片</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              // TODO: Implement share analytics
              alert('分享分析功能開發中');
            }}
            className="w-full p-3 bg-surface-dark border border-border-dark rounded-lg text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <div>
                <h3 className="text-sm font-semibold text-text-dark-primary">分享分析</h3>
                <p className="text-xs text-text-dark-secondary">查看名片被查看的次數</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Scan History */}
      {showScanHistory && (
        <div className="mt-6 max-w-sm mx-auto">
          <ScanHistory onContactClick={(contactId) => router.push(`/network/${contactId}`)} />
        </div>
      )}
    </div>
  );
}
