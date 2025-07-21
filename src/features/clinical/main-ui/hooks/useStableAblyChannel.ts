import * as Ably from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A stable Ably channel hook that prevents attach/detach race conditions
 * and provides proper cleanup mechanisms
 */
export function useStableAblyChannel(
  channelName: string, 
  client: Ably.Realtime | null,
  enabled: boolean = true
) {
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [isAttached, setIsAttached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track attachment state to prevent race conditions
  const isAttachingRef = useRef(false);
  const isDetachingRef = useRef(false);
  const attachPromiseRef = useRef<Promise<void> | null>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  // Cleanup function that properly handles detachment
  const cleanup = useCallback(async () => {
    if (isDetachingRef.current) {
      return;
    }
    isDetachingRef.current = true;

    try {
      // Wait for any pending attach to complete first
      if (attachPromiseRef.current) {
        try {
          await attachPromiseRef.current;
        } catch {
          // Ignore attach errors during cleanup
        }
        attachPromiseRef.current = null;
      }

      const currentChannel = channelRef.current;
      if (currentChannel) {
        try {
          // Check channel state before detaching
          const channelState = currentChannel.state;
          if (channelState === 'attached' || channelState === 'attaching') {
                       try {
             currentChannel.detach();
           } catch (err) {
             console.warn('Channel detach error (ignored):', err);
           }
          }
        } catch (err) {
          console.warn('Channel cleanup error (ignored):', err);
        }
        
        channelRef.current = null;
        setChannel(null);
        setIsAttached(false);
      }
    } finally {
      isDetachingRef.current = false;
    }
  }, []);

  // Attach to channel with proper state management
  const attachToChannel = useCallback(async () => {
    if (!client || !channelName || !enabled || isAttachingRef.current || isDetachingRef.current) {
      return;
    }

    // Check if client connection is in a valid state
    const connectionState = client.connection.state;
    if (connectionState === 'closed' || connectionState === 'closing' || connectionState === 'failed') {
      setError('Client connection is not available');
      return;
    }

    isAttachingRef.current = true;
    setError(null);

    try {
      // Clean up any existing channel first
      await cleanup();

      const ch = client.channels.get(channelName);
      channelRef.current = ch;

      // Create attach promise and track it
      attachPromiseRef.current = new Promise<void>((resolve) => {
        try {
          ch.attach();
          resolve();
        } catch (err) {
          throw err;
        }
      });

      // Wait for attachment to complete
      await attachPromiseRef.current;
      attachPromiseRef.current = null;

      // Only set state if we're still trying to attach (not cancelled)
      if (isAttachingRef.current && channelRef.current === ch) {
        setChannel(ch);
        setIsAttached(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Attachment failed';
      setError(errorMessage);
      console.error('Channel attach failed:', err);
      
      // Clean up on error
      channelRef.current = null;
      setChannel(null);
      setIsAttached(false);
    } finally {
      isAttachingRef.current = false;
    }
  }, [client, channelName, enabled, cleanup]);

  // Effect to manage channel lifecycle
  useEffect(() => {
    if (enabled && client && channelName) {
      // Wait for client to be connected before attaching
      if (client.connection.state === 'connected') {
        attachToChannel();
      } else {
        // Wait for connection
        const handleConnected = () => {
          attachToChannel();
        };

        client.connection.on('connected', handleConnected);

        return () => {
          client.connection.off('connected', handleConnected);
          cleanup();
        };
      }
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, client, channelName, attachToChannel, cleanup]);

  // Subscribe helper function
  const subscribe = useCallback((
    eventNameOrCallback: string | ((message: Ably.Message) => void),
    callback?: (message: Ably.Message) => void
  ) => {
    if (!channel || !isAttached) {
      console.warn('Cannot subscribe: channel not attached');
      return () => {}; // Return empty unsubscribe function
    }

    try {
      if (typeof eventNameOrCallback === 'string' && callback) {
        channel.subscribe(eventNameOrCallback, callback);
        return () => {
          if (channel) {
            channel.unsubscribe(eventNameOrCallback, callback);
          }
        };
      } else if (typeof eventNameOrCallback === 'function') {
        channel.subscribe(eventNameOrCallback);
        return () => {
          if (channel) {
            channel.unsubscribe(eventNameOrCallback);
          }
        };
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    }

    return () => {}; // Return empty unsubscribe function on error
  }, [channel, isAttached]);

  // Publish helper function
  const publish = useCallback(async (
    name: string, 
    data: any
  ): Promise<boolean> => {
    if (!channel || !isAttached) {
      console.warn('Cannot publish: channel not attached');
      return false;
    }

    // Double-check connection state before publishing
    if (client && client.connection.state !== 'connected') {
      console.warn('Cannot publish: client not connected');
      return false;
    }

    try {
      await channel.publish(name, data);
      return true;
    } catch (err) {
      console.error('Publish error:', err);
      return false;
    }
  }, [channel, isAttached, client]);

  return {
    channel,
    isAttached,
    error,
    subscribe,
    publish,
    reconnect: attachToChannel,
    disconnect: cleanup,
  };
}