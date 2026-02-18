'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, UserProfileData, ProfileField } from '@/types';
import { profileService } from '@/services/profileService';
import { AvatarUpload } from '@/components/profile';

interface ProfileEditorProps {
  profile: UserProfile | null;
  onSave?: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>(profile?.data || getDefaultProfileData());
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile.data);
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const updateField = <K extends keyof UserProfileData>(field: K, updates: Partial<ProfileField>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...updates,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await profileService.updateProfile(undefined, formData, avatarUrl);
      alert('名片已更新');
      onSave?.({ ...profile, data: formData, avatarUrl } as UserProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  const basicFields: Array<{ key: keyof UserProfileData; label: string; type?: string }> = [
    { key: 'name', label: '姓名' },
    { key: 'alias', label: '別名（用於分享連結）' },
    { key: 'title', label: '職稱' },
    { key: 'company', label: '公司' },
  ];

  const contactFields: Array<{ key: keyof UserProfileData; label: string; type: string; icon: string }> = [
    { key: 'phone', label: '電話', type: 'tel', icon: '📱' },
    { key: 'email', label: '電子郵件', type: 'email', icon: '✉️' },
  ];

  const socialFields: Array<{ key: keyof UserProfileData; label: string; placeholder: string; icon: string }> = [
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...', icon: '🔗' },
    { key: 'line', label: 'LINE ID', placeholder: '您的 LINE ID', icon: '💬' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', icon: '👍' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', icon: '📷' },
    { key: 'threads', label: 'Threads', placeholder: 'https://threads.net/...', icon: '🧵' },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Upload Modal */}
      {showAvatarUpload && (
        <AvatarUpload
          currentAvatar={avatarUrl}
          onAvatarChange={(url) => {
            setAvatarUrl(url);
            setShowAvatarUpload(false);
          }}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}

      {/* Basic Information */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">基本資訊</h3>

        {/* Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              onClick={() => setShowAvatarUpload(true)}
              className="w-24 h-24 rounded-full bg-surface-dark border-2 border-border-dark overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>
            <div
              onClick={() => setShowAvatarUpload(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
            >
              <span className="text-sm">📷</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {basicFields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-dark-primary">{field.label}</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.key].visible}
                    onChange={(e) => updateField(field.key, { visible: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-text-dark-secondary">顯示</span>
                </label>
              </div>
              <input
                type="text"
                value={formData[field.key].value}
                onChange={(e) => updateField(field.key, { value: e.target.value })}
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
                placeholder={`請輸入${field.label}`}
              />
            </div>
          ))}

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-dark-primary">個人簡介</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bio.visible}
                  onChange={(e) => updateField('bio', { visible: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-text-dark-secondary">顯示</span>
              </label>
            </div>
            <textarea
              value={formData.bio.value}
              onChange={(e) => updateField('bio', { value: e.target.value })}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
              rows={3}
              placeholder="簡單介紹自己..."
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">聯絡方式</h3>
        <div className="space-y-4">
          {contactFields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{field.icon}</span>
                  <label className="text-sm font-medium text-text-dark-primary">{field.label}</label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.key].visible}
                    onChange={(e) => updateField(field.key, { visible: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-text-dark-secondary">顯示</span>
                </label>
              </div>
              <input
                type={field.type}
                value={formData[field.key].value}
                onChange={(e) => updateField(field.key, { value: e.target.value })}
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
                placeholder={`請輸入${field.label}`}
              />
            </div>
          ))}

          {/* Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <label className="text-sm font-medium text-text-dark-primary">地址</label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.address.visible}
                  onChange={(e) => updateField('address', { visible: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-text-dark-secondary">顯示</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.address.value}
              onChange={(e) => updateField('address', { value: e.target.value })}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="請輸入地址"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">社群媒體</h3>
        <div className="space-y-4">
          {socialFields.map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{field.icon}</span>
                  <label className="text-sm font-medium text-text-dark-primary">{field.label}</label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.key].visible}
                    onChange={(e) => updateField(field.key, { visible: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-xs text-text-dark-secondary">顯示</span>
                </label>
              </div>
              <input
                type="url"
                value={formData[field.key].value}
                onChange={(e) => updateField(field.key, { value: e.target.value })}
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">預覽</h3>
        <div className="bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg p-4 border border-primary/30">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
              👤
            </div>
            {formData.name.visible && (
              <h4 className="text-xl font-bold text-text-dark-primary">
                {formData.name.value || '您的姓名'}
              </h4>
            )}
            {formData.title.visible && formData.title.value && (
              <p className="text-sm text-text-dark-secondary">{formData.title.value}</p>
            )}
            {formData.company.visible && formData.company.value && (
              <p className="text-sm text-text-dark-primary mt-1">@ {formData.company.value}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {isLoading ? '儲存中...' : '儲存'}
        </button>
        <button
          onClick={onCancel || (() => router.back())}
          disabled={isLoading}
          className="px-6 py-3 bg-background-dark text-text-dark-secondary rounded-xl font-semibold hover:text-text-dark-primary transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}

function getDefaultProfileData(): UserProfileData {
  return {
    name: { id: 'name', label: '姓名', value: '', icon: '', visible: true },
    alias: { id: 'alias', label: '別名', value: '', icon: '', visible: true },
    title: { id: 'title', label: '職稱', value: '', icon: '', visible: true },
    company: { id: 'company', label: '公司', value: '', icon: '', visible: true },
    bio: { id: 'bio', label: '簡介', value: '', icon: 'info', visible: true },
    phone: { id: 'phone', label: '電話', value: '', icon: 'call', visible: true },
    email: { id: 'email', label: '電子郵件', value: '', icon: 'mail', visible: true },
    address: { id: 'address', label: '地址', value: '', icon: 'location_on', visible: false },
    linkedin: { id: 'linkedin', label: 'LinkedIn', value: '', icon: 'fab fa-linkedin', visible: true },
    line: { id: 'line', label: 'LINE', value: '', icon: 'fab fa-line', visible: true },
    facebook: { id: 'facebook', label: 'Facebook', value: '', icon: 'fab fa-facebook', visible: false },
    instagram: { id: 'instagram', label: 'Instagram', value: '', icon: 'fab fa-instagram', visible: true },
    threads: { id: 'threads', label: 'Threads', value: '', icon: 'fab fa-threads', visible: false },
  };
}
