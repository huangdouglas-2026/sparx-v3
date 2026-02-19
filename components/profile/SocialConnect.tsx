'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface SocialConnection {
  platform: 'linkedin' | 'google';
  connected: boolean;
  lastSync?: string;
  email?: string;
}

interface SocialConnectProps {
  onConnected?: () => void;
}

export function SocialConnect({ onConnected }: SocialConnectProps) {
  const [connections, setConnections] = useState<{
    linkedin: SocialConnection;
    google: SocialConnection;
  }>({
    linkedin: { platform: 'linkedin', connected: false },
    google: { platform: 'google', connected: false },
  });

  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [showDisconnect, setShowDisconnect] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSync?: string;
    count?: number;
  }>({
    isSyncing: false,
  });

  useEffect(() => {
    checkConnections();
    loadEmailNotifications();
  }, []);

  const checkConnections = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('social_connections')
        .select('platform, last_synced_at, profile_url')
        .eq('user_id', user.id);

      const linkedinConn = data?.find(c => c.platform === 'linkedin');
      const googleConn = data?.find(c => c.platform === 'google');

      setConnections({
        linkedin: {
          platform: 'linkedin',
          connected: !!linkedinConn,
          lastSync: linkedinConn?.last_synced_at,
        },
        google: {
          platform: 'google',
          connected: !!googleConn,
          lastSync: googleConn?.last_synced_at,
          email: googleConn?.profile_url,
        },
      });
    } catch (error) {
      console.error('Error checking connections:', error);
    }
  };

  const loadEmailNotifications = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { count } = await supabase
        .from('social_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      setSyncStatus(prev => ({ ...prev, count: count ?? undefined }));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleConnectLinkedIn = async () => {
    setIsConnecting('linkedin');
    try {
      // Call LinkedIn auth endpoint (existing implementation)
      const response = await fetch('/api/auth/linkedin');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting LinkedIn:', error);
      setIsConnecting(null);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnecting('google');
    try {
      const response = await fetch('/api/auth/google');
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting Google:', error);
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (platform: 'linkedin' | 'google') => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      await supabase
        .from('social_connections')
        .delete()
        .eq('user_id', user.id)
        .eq('platform', platform);

      await checkConnections();
      setShowDisconnect(null);
      onConnected?.();
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      alert('斷開連結失敗，請稍後再試');
    }
  };

  const handleManualSync = async () => {
    if (!connections.google.connected) return;

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      const response = await fetch('/api/sync/emails', { method: 'POST' });

      if (!response.ok) throw new Error('Sync failed');

      const { result } = await response.json();
      alert(`✅ 同步完成！\n處理了 ${result.processed} 封郵件`);

      await checkConnections();
      await loadEmailNotifications();
    } catch (error) {
      console.error('Error during manual sync:', error);
      alert('同步失敗，請稍後再試');
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return '從未同步';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return '剛剛';
    if (diffInMinutes < 60) return `${diffInMinutes} 分鐘前`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} 小時前`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} 天前`;
  };

  return (
    <div className="p-4 bg-surface-dark rounded-xl border border-border-dark">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📬</span>
          <h2 className="text-lg font-semibold text-text-dark-primary">社交媒體整合</h2>
        </div>
      </div>

      {/* Google (Gmail) - Email-based integration */}
      <div className="p-3 bg-background-dark rounded-lg border border-border-dark mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4285F4] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-dark-primary">
                Google (Gmail)
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">推薦</span>
              </h3>
              {connections.google.connected ? (
                <p className="text-xs text-primary">
                  {connections.google.email || '已連結'}
                </p>
              ) : (
                <p className="text-xs text-text-dark-secondary">透過 Email 通知整合 LinkedIn/Facebook</p>
              )}
            </div>
          </div>

          {showDisconnect !== 'google' ? (
            <button
              onClick={connections.google.connected ? () => setShowDisconnect('google') : handleConnectGoogle}
              disabled={isConnecting === 'google' || syncStatus.isSyncing}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-150 ${
                connections.google.connected
                  ? 'bg-background-dark text-text-dark-secondary border border-border-dark hover:bg-surface-dark/80'
                  : 'bg-[#4285F4] text-white hover:bg-[#4285F4]/90 active:scale-95'
              } ${isConnecting === 'google' || syncStatus.isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isConnecting === 'google' ? '連結中...' : connections.google.connected ? '管理' : '連結'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleDisconnect('google')}
                className="px-3 py-2 text-sm bg-error text-white rounded-lg font-medium hover:bg-error/90 transition-colors"
              >
                斷開連結
              </button>
              <button
                onClick={() => setShowDisconnect(null)}
                className="px-3 py-2 text-sm bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* Google Connection Info */}
        {connections.google.connected && (
          <div className="mt-3 pt-3 border-t border-border-dark space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-dark-secondary">
                ✓ 自動解析 LinkedIn & Facebook 通知郵件
              </p>
              <div className="flex items-center gap-2">
                {syncStatus.count !== undefined && (
                  <span className="text-xs text-primary">
                    最近 7 天：{syncStatus.count} 則通知
                  </span>
                )}
                {connections.google.lastSync && (
                  <span className="text-xs text-text-dark-tertiary">
                    上次同步：{formatLastSync(connections.google.lastSync)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncStatus.isSyncing}
              className={`w-full px-3 py-2 text-xs rounded-lg font-medium transition-all duration-150 ${
                syncStatus.isSyncing
                  ? 'bg-background-dark text-text-dark-tertiary cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
              }`}
            >
              {syncStatus.isSyncing ? '🔄 同步中...' : '🔄 立即同步 Email'}
            </button>
          </div>
        )}
      </div>

      {/* LinkedIn - Direct API integration (legacy) */}
      <div className="p-3 bg-background-dark/50 rounded-lg border border-border-dark opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0077b5] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-1.597-.838-1.597-1.919 0-.556.027-1.176.118-1.597 0 0-1.372 2.049-1.556 2.995-.176.96-.24-1.292-.996-1.292-1.919 0-1.176.895-2.068.895-3.615 0-1.946 1.428-3.047 2.671-1.674 2.957-3.244 2.957-5.206 0-4.739-1.796-7.944-5.721-7.944-1.556 0-3.113.661-3.113 2.226 0 2.226.661 2.226 2.226v-5.569z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-dark-primary">LinkedIn (API)</h3>
              <p className="text-xs text-text-dark-tertiary">需要申請 Developer 權限</p>
            </div>
          </div>

          {!showDisconnect ? (
            <button
              onClick={connections.linkedin.connected ? () => setShowDisconnect('linkedin') : handleConnectLinkedIn}
              disabled={isConnecting === 'linkedin'}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-150 ${
                connections.linkedin.connected
                  ? 'bg-background-dark text-text-dark-secondary border border-border-dark'
                  : 'bg-[#0077b5]/50 text-white cursor-not-allowed'
              }`}
            >
              {connections.linkedin.connected ? '已連結' : '建議使用 Gmail 方式'}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleDisconnect('linkedin')}
                className="px-3 py-2 text-sm bg-error text-white rounded-lg font-medium hover:bg-error/90 transition-colors"
              >
                斷開連結
              </button>
              <button
                onClick={() => setShowDisconnect(null)}
                className="px-3 py-2 text-sm bg-background-dark text-text-dark-secondary rounded-lg font-medium hover:text-text-dark-primary transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {connections.linkedin.connected && connections.linkedin.lastSync && (
          <div className="mt-3 pt-3 border-t border-border-dark">
            <span className="text-xs text-text-dark-tertiary">
              上次同步：{formatLastSync(connections.linkedin.lastSync)}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-xs text-text-dark-primary font-medium mb-2">
          💡 為什麼使用 Email 整合？
        </p>
        <ul className="text-xs text-text-dark-secondary space-y-1 ml-3">
          <li>✓ <strong>無需申請 API</strong> - 不需要等待開發者審核</li>
          <li>✓ <strong>設定簡單</strong> - 一步連結 Gmail 即可</li>
          <li>✓ <strong>支援多平台</strong> - LinkedIn + Facebook 通知都整合</li>
          <li>✓ <strong>即時通知</strong> - 收到 email 立即同步到 Spark</li>
          <li>✓ <strong>AI 解析</strong> - 自動偵測重要活動（升遷、新工作等）</li>
        </ul>
      </div>
    </div>
  );
}
