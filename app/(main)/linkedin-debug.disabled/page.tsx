'use client';

import { useState, useEffect } from 'react';
import { linkedinService } from '@/services/social';

export default function LinkedInDebugPage() {
  const [config, setConfig] = useState<any>({});
  const [serverConfig, setServerConfig] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('檢查中...');
  const [generatedAuthUrl, setGeneratedAuthUrl] = useState<string>('');

  useEffect(() => {
    checkConfiguration();
    checkServerConfiguration();
    checkConnection();
  }, []);

  const checkConfiguration = () => {
    const isClient = typeof window !== 'undefined';
    const origin = isClient ? window.location.origin : '';
    const redirectUri = `${origin}/api/auth/callback/linkedin`;

    setConfig({
      environment: process.env.NODE_ENV,
      origin,
      redirectUri,
      clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID ? '✅ 已設定' : '❌ 未設定',
      clientIdValue: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '未設定',
      // Client Secret cannot be checked from client-side
      clientSecret: '🔒 (僅伺服器端可存取)',
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
    });
  };

  const checkServerConfiguration = async () => {
    try {
      const response = await fetch('/api/debug/config');
      const data = await response.json();
      setServerConfig(data);
    } catch (error: any) {
      console.error('Failed to check server config:', error);
      setServerConfig({ error: error.message });
    }
  };

  const checkConnection = async () => {
    try {
      const token = await linkedinService.getStoredToken();
      if (token) {
        setConnectionStatus('✅ 已連結');
      } else {
        setConnectionStatus('❌ 未連結');
      }
    } catch (error: any) {
      setConnectionStatus(`❌ 錯誤: ${error.message}`);
    }
  };

  const testConnection = async () => {
    try {
      // Generate auth URL directly in this component to ensure correct origin
      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
      const origin = window.location.origin;
      const redirectUri = `${origin}/api/auth/callback/linkedin`;
      const state = Math.random().toString(36).substring(2, 15);

      // Store state in sessionStorage
      sessionStorage.setItem('linkedin_oauth_state', state);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId || '',
        redirect_uri: redirectUri,
        scope: 'openid profile email', // 使用基本權限
        state: state,
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
      setGeneratedAuthUrl(authUrl);
      console.log('🔍 Direct Auth URL Generation:', {
        origin,
        redirectUri,
        authUrl
      });

      window.open(authUrl, '_blank');
    } catch (error: any) {
      console.error('Test connection failed:', error);
      alert(`測試失敗: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-dark-primary mb-6">
          🔗 LinkedIn 連結診斷工具
        </h1>

        {/* Configuration Status - Client Side */}
        <div className="bg-surface-dark rounded-xl p-6 mb-6 border border-border-dark">
          <h2 className="text-xl font-semibold text-text-dark-primary mb-4">📋 設定狀態 (用戶端)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-dark-secondary">Client ID:</span>
              <span className={config.clientId?.includes('已設定') ? 'text-success' : 'text-error'}>
                {config.clientId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dark-secondary">Client ID 值:</span>
              <span className="font-mono text-text-dark-tertiary">{config.clientIdValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dark-secondary">Redirect URI:</span>
              <span className="font-mono text-text-dark-tertiary text-xs">
                {config.redirectUri}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-dark-secondary">Environment:</span>
              <span className="text-text-dark-primary">{config.environment}</span>
            </div>
          </div>
        </div>

        {/* Configuration Status - Server Side */}
        <div className="bg-surface-dark rounded-xl p-6 mb-6 border border-border-dark">
          <h2 className="text-xl font-semibold text-text-dark-primary mb-4">🖥️ 設定狀態 (伺服器端)</h2>
          {serverConfig ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-dark-secondary">Client ID:</span>
                <span className="font-mono text-text-dark-tertiary">{serverConfig.clientId || '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dark-secondary">Client Secret:</span>
                <span className={serverConfig.clientSecret?.includes('已設定') ? 'text-success' : 'text-error'}>
                  {serverConfig.clientSecret}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dark-secondary">Node Env:</span>
                <span className="text-text-dark-primary">{serverConfig.nodeEnv}</span>
              </div>
            </div>
          ) : (
            <p className="text-text-dark-secondary">載入中...</p>
          )}
        </div>

        {/* Connection Status */}
        <div className="bg-surface-dark rounded-xl p-6 mb-6 border border-border-dark">
          <h2 className="text-xl font-semibold text-text-dark-primary mb-4">🔗 連結狀態</h2>
          <p className="text-text-dark-primary mb-4">{connectionStatus}</p>
          <button
            onClick={testConnection}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark active:scale-95 transition-all"
          >
            測試 LinkedIn 連結
          </button>

          {/* Generated Auth URL (for debugging) */}
          {generatedAuthUrl && (
            <div className="mt-4 p-3 bg-background-dark rounded-lg border border-border-dark">
              <p className="text-xs text-text-dark-tertiary mb-2">生成的授權 URL (除錯用):</p>
              <code className="block text-xs text-primary break-all">
                {generatedAuthUrl}
              </code>
              <div className="mt-2 text-xs">
                <span className="text-text-dark-secondary">Redirect URI:</span>
                <span className={`ml-2 ${generatedAuthUrl.includes('localhost:3001') ? 'text-success' : 'text-error'}`}>
                  {generatedAuthUrl.includes('localhost:3001') ? '✅ 正確 (port 3001)' : '❌ 錯誤 (應為 port 3001)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-surface-dark rounded-xl p-6 border border-border-dark">
          <h2 className="text-xl font-semibold text-text-dark-primary mb-4">💡 設定說明</h2>
          <div className="space-y-4 text-sm text-text-dark-secondary">
            <div>
              <h3 className="font-semibold text-text-dark-primary mb-2">1. LinkedIn Developer Portal</h3>
              <p>前往 <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.linkedin.com/developers/</a></p>
            </div>

            <div>
              <h3 className="font-semibold text-text-dark-primary mb-2">2. 設定 OAuth 2.0 Redirect URL</h3>
              <code className="block bg-background-dark p-3 rounded-lg text-primary text-xs break-all mb-2">
                {config.redirectUri}
              </code>
              <p className="text-xs text-text-dark-tertiary mt-2">
                注意: 確保 LinkedIn Developer Portal 中的 Redirect URL 與上述完全一致
              </p>
            </div>

            <div className="bg-warning/10 border border-warning rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-warning mb-2">⚠️ 常見問題</h3>
              <ul className="space-y-2 text-xs">
                <li><strong>redirect_uri_mismatch:</strong> 確保 LinkedIn Portal 中的 Redirect URL 完全匹配 (包括 port 號碼)</li>
                <li><strong>invalid_client:</strong> 檢查 Client ID 是否正確</li>
                <li><strong>環境變數未載入:</strong> 修改 .env.local 後必須重啟伺服器 (Ctrl+C 然後重新執行 npm run dev)</li>
                <li><strong>Port 不匹配:</strong> 如果使用 port 3001，請在 LinkedIn Portal 加入 http://localhost:3001/api/auth/callback/linkedin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
