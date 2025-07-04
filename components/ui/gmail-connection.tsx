import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

interface GmailConnectionProps {
  onConnectionStatusChange?: (isConnected: boolean) => void;
}

export const GmailConnection: React.FC<GmailConnectionProps> = ({ onConnectionStatusChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [entityId, setEntityId] = useState<string | null>(null);
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  const checkGmailConnection = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Try to get stored connection details first
      const storedConnectedAccountId = localStorage.getItem('composio_connected_account_id');
      const storedEntityId = localStorage.getItem('composio_entity_id');
      
      let params = new URLSearchParams();
      if (storedConnectedAccountId) params.append('connectedAccountId', storedConnectedAccountId);
      if (storedEntityId) params.append('entityId', storedEntityId);
      
      const response = await fetch(`/api/composio/connection-status?${params.toString()}`);
      const data = await response.json();
      
      if (data.success && data.isConnected) {
        setIsConnected(true);
        setConnectedAccountId(data.connectedAccountId);
        setEntityId(data.entityId);
        onConnectionStatusChange?.(true);
        
        // Update local storage with fresh data
        if (data.connectedAccountId) {
          localStorage.setItem('composio_connected_account_id', data.connectedAccountId);
        }
        if (data.entityId) {
          localStorage.setItem('composio_entity_id', data.entityId);
        }
      } else {
        setIsConnected(false);
        onConnectionStatusChange?.(false);
        setInstructions({
          message: "Connect your Gmail account to send emails directly from the website.",
          documentation: "https://docs.composio.dev/apps/gmail"
        });
      }
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setError(error instanceof Error ? error.message : 'Failed to check Gmail connection');
      setIsConnected(false);
      onConnectionStatusChange?.(false);
      
      setInstructions({
        message: "Unable to check Gmail connection. Please try again.",
        documentation: "https://docs.composio.dev/apps/gmail"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkGmailConnection();
    
    // Check URL parameters for OAuth callback results
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const connectedAccountFromUrl = urlParams.get('connected_account_id');
    const entityIdFromUrl = urlParams.get('entity_id');
    
    if (oauthSuccess === 'true' && connectedAccountFromUrl) {
      setIsConnected(true);
      setConnectedAccountId(connectedAccountFromUrl);
      if (entityIdFromUrl) {
        setEntityId(entityIdFromUrl);
      }
      onConnectionStatusChange?.(true);
      
      // Store the connection details
      localStorage.setItem('composio_connected_account_id', connectedAccountFromUrl);
      if (entityIdFromUrl) {
        localStorage.setItem('composio_entity_id', entityIdFromUrl);
      }
    }
  }, [onConnectionStatusChange]);

  const handleRetryConnection = () => {
    checkGmailConnection();
  };

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Generate unique entity ID for this user session
      const newEntityId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use GET method as per the updated API
      const response = await fetch(`/api/composio/connect-gmail?userId=${newEntityId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success && (data.authUrl || data.redirectUrl)) {
        const authUrl = data.authUrl || data.redirectUrl;
        
        // Store the entity ID and connected account ID for later use
        setEntityId(newEntityId);
        if (data.connectedAccountId) {
          setConnectedAccountId(data.connectedAccountId);
          localStorage.setItem('composio_connected_account_id', data.connectedAccountId);
        }
        localStorage.setItem('composio_entity_id', newEntityId);
        
        // Open the OAuth URL in a popup window
        const popup = window.open(
          authUrl,
          'gmail-oauth',
          'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
        );

        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site and try again.');
        }

        // Listen for the popup to close
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            
            // Refresh the connection status after OAuth
            setTimeout(() => {
              checkGmailConnection();
            }, 1000);
          }
        }, 1000);

        // Timeout after 10 minutes
        setTimeout(() => {
          if (popup && !popup.closed) {
            popup.close();
            setIsConnecting(false);
            setError('OAuth timeout - please try again');
          }
          clearInterval(checkClosed);
        }, 600000);

      } else {
        throw new Error(data.error || 'Failed to initiate Gmail connection');
      }

    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect Gmail');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (entityId) {
        // Clear the connection from our status manager
        await fetch(`/api/composio/connection-status?entityId=${entityId}`, {
          method: 'DELETE',
        });
      }
      
      // Clear local storage
      localStorage.removeItem('composio_connected_account_id');
      localStorage.removeItem('composio_entity_id');
      
      // Reset state
      setIsConnected(false);
      setConnectedAccountId(null);
      setEntityId(null);
      onConnectionStatusChange?.(false);
      
      setInstructions({
        message: "Gmail disconnected. You can reconnect anytime.",
        documentation: "https://docs.composio.dev/apps/gmail"
      });
      
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      setError('Failed to disconnect properly, but local connection cleared');
    }
  };

  if (isChecking) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center p-6 bg-gray-900/50 rounded-lg border border-gray-700"
      >
        <Loader2 className="h-5 w-5 animate-spin text-[#0CF2A0] mr-2" />
        <span className="text-sm text-gray-400">Checking Gmail connection...</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Connection Status */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-center space-x-3">
          {isConnected ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">Gmail Connected</p>
                <p className="text-xs text-gray-400">Ready to send emails</p>
                {connectedAccountId && (
                  <p className="text-xs text-gray-500 mt-1">ID: {connectedAccountId.slice(0, 8)}...</p>
                )}
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">Gmail Not Connected</p>
                <p className="text-xs text-gray-400">Connect to send emails directly</p>
              </div>
            </>
          )}
        </div>

        <div className="text-right">
          {isConnected ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-500/30">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-500/30">
              Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Instructions */}
      {instructions && !isConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
        >
          <p className="text-blue-400 text-sm mb-2">{instructions.message}</p>
          <a 
            href={instructions.documentation} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs underline"
          >
            View Documentation →
          </a>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!isConnected ? (
          <motion.button
            onClick={handleConnectGmail}
            disabled={isConnecting}
            className="px-6 py-3 bg-[#0CF2A0] text-black rounded-lg font-medium hover:bg-[#0CF2A0]/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isConnecting ? 1 : 1.02 }}
            whileTap={{ scale: isConnecting ? 1 : 0.98 }}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Connect Gmail
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Disconnect
          </motion.button>
        )}

        <motion.button
          onClick={handleRetryConnection}
          disabled={isConnecting}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          whileHover={{ scale: isConnecting ? 1 : 1.02 }}
          whileTap={{ scale: isConnecting ? 1 : 0.98 }}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </motion.button>
        
        <motion.button
          onClick={() => window.open('https://docs.composio.dev/apps/gmail', '_blank')}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink className="h-4 w-4" />
          Help Guide
        </motion.button>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="text-red-400 hover:text-red-300 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}; 