'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarUpload } from '@/components/profile';
import type { DashboardContact } from '@/types';
import { contactService } from '@/services/contactService';

interface ContactEditorProps {
  contact?: DashboardContact | null;
  initialData?: Partial<DashboardContact> | null;
  onSave?: (contact: DashboardContact) => void;
  onCancel?: () => void;
}

type Category = DashboardContact['category'];

export function ContactEditor({ contact, initialData, onSave, onCancel }: ContactEditorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [formData, setFormData] = useState<Partial<DashboardContact>>({
    name: '',
    englishName: '',
    title: '',
    department: '',
    company: '',
    industry: '',
    avatarUrl: '',
    personalEmail: '',
    workEmail: '',
    mobilePhone: '',
    workPhone: '',
    linkedin: '',
    line: '',
    facebook: '',
    instagram: '',
    website: '',
    companyAddress: '',
    homeAddress: '',
    birthday: '',
    metAt: new Date().toISOString().split('T')[0],
    metAtNote: '',                                              // 新增：初次見面備註
    category: 'restart',
  });

  useEffect(() => {
    if (contact) {
      // Convert null values to empty strings for controlled inputs
      setFormData({
        ...contact,
        birthday: contact.birthday || '',
        metAt: contact.metAt || new Date().toISOString().split('T')[0],
        metAtNote: contact.metAtNote || '',                      // 新增：初次見面備註
        // Ensure social media fields are never null
        linkedin: contact.linkedin || '',
        line: contact.line || '',
        wechat: contact.wechat || '',
        whatsapp: contact.whatsapp || '',
        facebook: contact.facebook || '',
        instagram: contact.instagram || '',
        threads: contact.threads || '',
      });
    } else if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        birthday: initialData.birthday || '',
        metAt: initialData.metAt || new Date().toISOString().split('T')[0],
        metAtNote: initialData.metAtNote || '',                  // 新增：初次見面備註
        // Ensure social media fields are never null
        linkedin: initialData.linkedin || '',
        line: initialData.line || '',
        wechat: initialData.wechat || '',
        whatsapp: initialData.whatsapp || '',
        facebook: initialData.facebook || '',
        instagram: initialData.instagram || '',
        threads: initialData.threads || '',
      }));
    }
  }, [contact, initialData]);

  const handleChange = (field: keyof DashboardContact, value: any) => {
    // Ensure specific fields never have null values (React controlled inputs require string or undefined)
    const nullToEmptyFields = ['birthday', 'metAt', 'metAtNote', 'linkedin', 'line', 'wechat', 'whatsapp', 'facebook', 'instagram', 'threads'];
    if (nullToEmptyFields.includes(field) && value === null) {
      value = '';
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name?.trim()) {
      alert('請輸入姓名');
      return;
    }

    if (!formData.company?.trim()) {
      alert('請輸入公司');
      return;
    }

    if (!formData.industry?.trim()) {
      alert('請輸入產業');
      return;
    }

    try {
      setIsLoading(true);

      if (contact) {
        // Update existing contact
        console.log('Updating contact:', contact.id, formData);
        await contactService.updateContact(contact.id, formData);
      } else {
        // Create new contact
        console.log('Creating new contact:', formData);
        await contactService.createContact(formData as Omit<DashboardContact, 'id'>);
      }

      alert(contact ? '聯絡人已更新' : '聯絡人已新增');
      onSave?.(formData as DashboardContact);
    } catch (error: any) {
      console.error('Error saving contact:', error);
      const errorMsg = error?.message || error?.error_description || error?.error || '儲存失敗，請稍後再試';
      alert(`儲存失敗：${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const industries = [
    '科技', '金融', '行銷', '顧問', '教育', '醫療',
    '製造', '零售', '電商', '媒體', '建築', '法律',
    '其他'
  ];

  return (
    <div className="space-y-4">
      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            onClick={() => setShowAvatarCrop(true)}
            className="w-24 h-24 rounded-full bg-surface-dark border-2 border-border-dark overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {formData.avatarUrl ? (
              <img
                src={formData.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary/90 transition-colors shadow-lg" onClick={() => setShowAvatarCrop(true)}>
            <span className="text-sm">📷</span>
          </div>
          {formData.avatarUrl && (
            <button
              onClick={() => handleChange('avatarUrl', '')}
              className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors shadow-lg"
              title="移除照片"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Avatar Crop Modal */}
      {showAvatarCrop && (
        <AvatarUpload
          currentAvatar={formData.avatarUrl}
          onAvatarChange={(avatarUrl) => {
            handleChange('avatarUrl', avatarUrl);
            setShowAvatarCrop(false);
          }}
          onClose={() => setShowAvatarCrop(false)}
        />
      )}

      {/* Basic Information */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">基本資訊</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="請輸入姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">英文名</label>
            <input
              type="text"
              value={formData.englishName}
              onChange={(e) => handleChange('englishName', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="英文名或暱稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">
              職稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="例如：產品經理"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">部門</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="例如：研發部"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">
              公司 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="公司名稱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">
              產業 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            >
              <option value="">請選擇產業</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">
              分類
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            >
              <option value="weekly">每週聯繫</option>
              <option value="monthly">每月聯繫</option>
              <option value="restart">重新啟動</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">初次見面</label>
            <div className="space-y-2">
              <input
                type="date"
                value={formData.metAt}
                onChange={(e) => handleChange('metAt', e.target.value)}
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              />
              <input
                type="text"
                value={formData.metAtNote}
                onChange={(e) => handleChange('metAtNote', e.target.value)}
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
                placeholder="地點、場合等資訊（例如：台北職涯論壇、通過朋友介紹）"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">生日</label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">聯絡方式</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">個人 Email</label>
            <input
              type="email"
              value={formData.personalEmail}
              onChange={(e) => handleChange('personalEmail', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="個人電子郵件"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">公司 Email</label>
            <input
              type="email"
              value={formData.workEmail}
              onChange={(e) => handleChange('workEmail', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="公司電子郵件"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">手機</label>
            <input
              type="tel"
              value={formData.mobilePhone}
              onChange={(e) => handleChange('mobilePhone', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="手機號碼"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">公司電話</label>
            <input
              type="tel"
              value={formData.workPhone}
              onChange={(e) => handleChange('workPhone', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="公司電話"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">社群媒體</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2 flex items-center gap-2">
              <span>🔗</span> LinkedIn
            </label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2 flex items-center gap-2">
              <span>💬</span> LINE
            </label>
            <input
              type="text"
              value={formData.line}
              onChange={(e) => handleChange('line', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="LINE ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2 flex items-center gap-2">
              <span>👍</span> Facebook
            </label>
            <input
              type="url"
              value={formData.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2 flex items-center gap-2">
              <span>📷</span> Instagram
            </label>
            <input
              type="url"
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">網站</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-lg font-semibold text-text-dark-primary mb-4">地址</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">公司地址</label>
            <textarea
              value={formData.companyAddress}
              onChange={(e) => handleChange('companyAddress', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
              rows={2}
              placeholder="公司地址"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark-primary mb-2">住家地址</label>
            <textarea
              value={formData.homeAddress}
              onChange={(e) => handleChange('homeAddress', e.target.value)}
              className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-text-dark-primary focus:outline-none focus:border-primary resize-none"
              rows={2}
              placeholder="住家地址"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          {isLoading ? '儲存中...' : contact ? '更新' : '新增'}
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
