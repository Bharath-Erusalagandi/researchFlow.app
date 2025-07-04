import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface GmailConnectionButtonProps {
  userId?: string;
  onConnectionChange?: (isConnected: boolean, connectedAccountId?: string) => void;
}

export const GmailConnectionButton: React.FC<GmailConnectionButtonProps> = ({
  userId = 'default_user',
  onConnectionChange
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check for OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const oauthError = urlParams.get('oauth_error');
    const connectedAccountId = urlParams.get('connected_account_id');
    const oauthPending = urlParams.get('oauth_pending');
    
    console.log('GmailConnectionButton - checking URL params:', {
      oauthSuccess, oauthError, connectedAccountId, oauthPending
    });
    
    if (oauthSuccess === 'true') {
      console.log('✅ OAuth success detected');
      setIsConnected(true);
      setIsLoading(false); // Clear any loading state
      setError(null); // Clear any errors
      if (connectedAccountId) {
        setConnectedAccountId(connectedAccountId);
        onConnectionChange?.(true, connectedAccountId);
      }
      // Clean up URL parameters
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    } else if (oauthPending === 'true') {
      console.log('⏳ OAuth pending detected');
      setIsLoading(true);
      setError('Connection in progress... Please wait.');
      if (connectedAccountId) {
        setConnectedAccountId(connectedAccountId);
        // Recheck status after a delay
        setTimeout(() => checkConnectionStatus(), 3000);
      }
    } else if (oauthError) {
      console.log('❌ OAuth error detected:', oauthError);
      setError(decodeURIComponent(oauthError));
      setIsConnected(false);
      setIsLoading(false); // Clear any loading state
      onConnectionChange?.(false);
      // Clean up URL parameters
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [onConnectionChange]);

  const checkConnectionStatus = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch(`/api/composio/connection-status?entityId=${userId}`);
      const result = await response.json();

      if (result.success && result.isConnected) {
        setIsConnected(true);
        setConnectedAccountId(result.connectedAccountId);
        onConnectionChange?.(true, result.connectedAccountId);
      } else {
        setIsConnected(false);
        setConnectedAccountId(null);
        onConnectionChange?.(false);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setError('Failed to check connection status');
      setIsConnected(false);
      onConnectionChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Store current location for proper redirect back
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      localStorage.setItem('oauth_return_path', currentPath);
      
      const response = await fetch('/api/composio/connect-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          returnPath: currentPath // Pass return path to backend
        }),
      });

      const result = await response.json();

      if (result.success && result.redirectUrl) {
        console.log('Redirecting to OAuth URL:', result.redirectUrl);
        
        // Set a timeout to clear loading state if user doesn't complete OAuth
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            setIsLoading(false);
            setError('OAuth process timed out. Please try connecting again.');
          }
        }, 60000); // 1 minute timeout
        
        // Use window.open for popup or redirect based on preference
        const openInPopup = false; // Set to true if you want popup behavior
        
        if (openInPopup) {
          const popup = window.open(result.redirectUrl, 'gmail-oauth', 'width=500,height=600,scrollbars=yes,resizable=yes');
          
          // Check for popup completion
          const checkClosed = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkClosed);
              setIsLoading(false);
              checkConnectionStatus(); // Refresh connection status
            }
          }, 1000);
        } else {
          // Redirect in same window
          window.location.href = result.redirectUrl;
        }
      } else {
        throw new Error(result.error || 'Failed to initiate Gmail connection');
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect Gmail');
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, just clear the local state
      // In a production app, you'd want to revoke the connection via API
      setIsConnected(false);
      setConnectedAccountId(null);
      onConnectionChange?.(false);
      
      // You can implement actual disconnection here if needed
      // await fetch('/api/composio/disconnect-gmail', { method: 'POST', ... });
      
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Checking Gmail connection...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg"
      >
        <CheckCircle className="h-5 w-5 text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-400">Gmail Connected</p>
          <p className="text-xs text-green-300/80">Ready to send emails</p>
          {connectedAccountId && (
            <p className="text-xs text-gray-400 mt-1">ID: {connectedAccountId}</p>
          )}
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isLoading}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {isLoading ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0CF2A0] hover:bg-[#0CF2A0]/90 disabled:bg-[#0CF2A0]/50 text-black font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Mail className="h-5 w-5" />
        )}
        {isLoading ? 'Connecting...' : 'Connect Gmail'}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
        >
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-400">Connection Error</p>
            <p className="text-xs text-red-300/80">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      <div className="text-xs text-gray-400 text-center">
        <p>Connect your Gmail account to send personalized emails</p>
        <p className="mt-1">Your credentials are secured via OAuth 2.0</p>
      </div>
    </div>
  );
}; 