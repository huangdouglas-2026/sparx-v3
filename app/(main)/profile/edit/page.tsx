'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileEditor } from '@/components/profile';
import { profileService } from '@/services/profileService';
import type { UserProfile } from '@/types';

export default function ProfileEditPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

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
      alert('載入失敗');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-text-dark-secondary">
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 bg-surface-dark rounded-lg text-text-dark-primary hover:bg-surface-dark/80 transition-colors"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-text-dark-primary">編輯名片</h1>
      </div>

      {/* Content */}
      <ProfileEditor
        profile={profile}
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}
