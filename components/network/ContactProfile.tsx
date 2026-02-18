'use client';

import type { DashboardContact } from '@/types';
import { scoreCalculator } from '@/lib/relationship-engine/scoreCalculator';

interface ContactProfileProps {
  contact: DashboardContact;
}

export function ContactProfile({ contact }: ContactProfileProps) {
  // Calculate mock relationship score
  const relationshipScore = scoreCalculator.calculateRelationshipScore({
    interaction_frequency: 4, // Mock: 4 times per month
    response_rate: 75, // Mock: 75%
    common_topics: 3, // Mock: 3 common topics
    last_interaction_days: Math.floor(
      (Date.now() - new Date(contact.lastContact).getTime()) / (1000 * 60 * 60 * 24)
    ),
    referral_count: 0,
  });

  const formatLastContact = (date: string) => {
    const now = new Date();
    const contactDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  };

  const formatBirthday = (date?: string) => {
    if (!date) return null;
    const birthday = new Date(date);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    const diffDays = Math.ceil((thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天是生日！🎂';
    if (diffDays > 0 && diffDays <= 30) return `${diffDays} 後是生日`;
    return null;
  };

  const birthdayReminder = formatBirthday(contact.birthday);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-full h-full object-cover"
              />
            ) : (
              '👤'
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-text-dark-primary">{contact.name}</h2>
            {contact.englishName && (
              <p className="text-sm text-text-dark-secondary">{contact.englishName}</p>
            )}
            <p className="text-sm text-text-dark-primary mt-1">
              {contact.title}
              {contact.company && ` @ ${contact.company}`}
            </p>
            {contact.industry && (
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {contact.industry}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs`}
                  style={{
                    backgroundColor: `${scoreCalculator.getLevelColor(relationshipScore.level)}20`,
                    color: scoreCalculator.getLevelColor(relationshipScore.level)
                  }}
                >
                  {scoreCalculator.getLevelLabel(relationshipScore.level)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Birthday Reminder */}
        {birthdayReminder && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/20 to-orange-500/20 rounded-lg border border-primary/30">
            <p className="text-sm font-semibold text-primary">{birthdayReminder}</p>
          </div>
        )}
      </div>

      {/* Relationship Score */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-3">關係深度</h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-2 bg-background-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all"
              style={{ width: `${relationshipScore.score}%` }}
            />
          </div>
          <span className="text-lg font-bold text-text-dark-primary">
            {relationshipScore.score}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-dark-secondary">互動頻率</span>
            <span className="text-text-dark-primary">{relationshipScore.breakdown.interaction_frequency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dark-secondary">回應率</span>
            <span className="text-text-dark-primary">{relationshipScore.breakdown.response_rate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dark-secondary">共同話題</span>
            <span className="text-text-dark-primary">{relationshipScore.breakdown.common_topics}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-dark-secondary">最近聯繫</span>
            <span className="text-text-dark-primary">{formatLastContact(contact.lastContact)}</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-3">聯絡資訊</h3>
        <div className="space-y-3">
          {contact.workEmail && (
            <a
              href={`mailto:${contact.workEmail}`}
              className="flex items-center gap-3 text-sm text-text-dark-secondary hover:text-primary transition-colors"
            >
              <span className="text-base">✉️</span>
              <span className="truncate">{contact.workEmail}</span>
            </a>
          )}
          {contact.personalEmail && contact.personalEmail !== contact.workEmail && (
            <a
              href={`mailto:${contact.personalEmail}`}
              className="flex items-center gap-3 text-sm text-text-dark-secondary hover:text-primary transition-colors"
            >
              <span className="text-base">📧</span>
              <span className="truncate">{contact.personalEmail}</span>
            </a>
          )}
          {contact.mobilePhone && (
            <a
              href={`tel:${contact.mobilePhone}`}
              className="flex items-center gap-3 text-sm text-text-dark-secondary hover:text-primary transition-colors"
            >
              <span className="text-base">📱</span>
              <span>{contact.mobilePhone}</span>
            </a>
          )}
          {contact.workPhone && (
            <a
              href={`tel:${contact.workPhone}`}
              className="flex items-center gap-3 text-sm text-text-dark-secondary hover:text-primary transition-colors"
            >
              <span className="text-base">📞</span>
              <span>{contact.workPhone}</span>
            </a>
          )}
          {contact.linkedin && (
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-text-dark-secondary hover:text-[#0077b5] transition-colors"
            >
              <span className="text-base">🔗</span>
              <span className="truncate">LinkedIn</span>
            </a>
          )}
          {contact.line && (
            <div className="flex items-center gap-3 text-sm text-text-dark-secondary">
              <span className="text-base">💬</span>
              <span className="truncate">{contact.line}</span>
            </div>
          )}
          {contact.companyAddress && (
            <div className="flex items-start gap-3 text-sm text-text-dark-secondary">
              <span className="text-base">🏢</span>
              <span className="flex-1">{contact.companyAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
        <h3 className="text-sm font-semibold text-text-dark-primary mb-3">備註</h3>
        <div className="flex items-center gap-2 text-sm text-text-dark-secondary">
          <span>📍</span>
          <span>初次見面：{contact.metAt}</span>
        </div>
      </div>
    </div>
  );
}
