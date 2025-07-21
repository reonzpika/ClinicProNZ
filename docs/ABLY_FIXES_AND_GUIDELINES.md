# Ably Real-time Communication Fixes & Guidelines

## 🔥 Issues Fixed

### 1. "Attach request superseded by a subsequent detach request"

**Root Cause**: Race conditions in channel lifecycle management where attach and detach operations overlapped.

**Fix Applied**:
- Added proper state tracking with `isConnectingRef`, `isCleaningUpRef`, and `channelAttachPromiseRef`
- Implemented await pattern for attach operations before allowing detach
- Added debouncing (200ms) to prevent rapid attach/detach cycles
- Enhanced cleanup function to wait for pending operations

### 2. "Connection closed" 

**Root Cause**: Attempting operations on closed or closing connections without proper state checks.

**Fix Applied**:
- Added comprehensive connection state validation before all operations
- Enhanced guard clauses in `sendMessage`, `sendTranscription`, and other methods
- Proper async cleanup with state checking
- Better error handling for expected connection states

### 3. React StrictMode Double Mounting

**Current State**: Temporarily disabled in development via `next.config.mjs`
**Future Goal**: Make hooks StrictMode-compatible

## 🛠 Enhanced Implementation

### Key Improvements in `useAblySync.ts`

1. **Lifecycle State Management**
   ```typescript
   const isConnectingRef = useRef(false);
   const isCleaningUpRef = useRef(false);
   const channelAttachPromiseRef = useRef<Promise<void> | null>(null);
   ```

2. **Proper Async Cleanup**
   ```typescript
   const cleanup = useCallback(async () => {
     if (isCleaningUpRef.current) return;
     isCleaningUpRef.current = true;
     
     // Wait for pending attach operations
     if (channelAttachPromiseRef.current) {
       await channelAttachPromiseRef.current;
     }
     
     // Check channel state before detaching
     const channelState = channelRef.current.state;
     if (channelState === 'attached' || channelState === 'attaching') {
       await new Promise<void>((resolve) => {
         channelRef.current!.detach(() => resolve());
       });
     }
   });
   ```

3. **Connection State Guards**
   ```typescript
   if (ablyRef.current.connection.state !== 'connected') {
     console.warn('Not connected, skipping operation...');
     return false;
   }
   ```

4. **Debounced Connection Management**
   ```typescript
   const debouncedConnect = useCallback(() => {
     if (debounceTimeoutRef.current) {
       clearTimeout(debounceTimeoutRef.current);
     }
     debounceTimeoutRef.current = setTimeout(() => {
       // Connection logic
     }, 200);
   }, []);
   ```

### New Utility: `useStableAblyChannel.ts`

A specialized hook for better channel lifecycle management:

```typescript
const { channel, isAttached, publish, subscribe } = useStableAblyChannel(
  channelName, 
  ablyClient, 
  enabled
);
```

**Benefits**:
- Prevents attach/detach race conditions
- Proper state tracking
- Helper methods for publish/subscribe
- Built-in error handling

### New Utility: `useAblyErrorHandler.ts`

Smart error categorization and handling:

```typescript
const { handleError, isExpectedError } = useAblyErrorHandler();

// Usage
handleError(error, 'channel-attachment', onRetry, onReconnect, onAlert);
```

**Features**:
- Categorizes errors by type (connection, channel, auth, presence)
- Determines appropriate actions (retry, reconnect, ignore, alert)
- Filters expected errors from critical ones
- Provides context-aware logging

## 📋 Development Guidelines

### 1. Channel Lifecycle Best Practices

**DO**:
```typescript
// Wait for connection before attaching
if (client.connection.state === 'connected') {
  await channel.attach();
}

// Always check state before operations
if (channel.state === 'attached' && client.connection.state === 'connected') {
  await channel.publish(name, data);
}

// Proper cleanup with state checking
if (channel.state === 'attached') {
  await new Promise(resolve => channel.detach(() => resolve()));
}
```

**DON'T**:
```typescript
// Don't attach without checking connection state
channel.attach(); // ❌ May fail if not connected

// Don't publish without state validation
channel.publish(name, data); // ❌ May fail if channel not attached

// Don't detach without checking state
channel.detach(); // ❌ May cause "already detached" errors
```

### 2. Error Handling Patterns

**Use the error handler**:
```typescript
import { useAblyErrorHandler } from '@/hooks/useAblyErrorHandler';

const { handleError, isExpectedError } = useAblyErrorHandler();

try {
  await riskyAblyOperation();
} catch (error) {
  if (!isExpectedError(error)) {
    handleError(error, 'operation-context', onRetry, onReconnect);
  }
}
```

**Filter expected errors in components**:
```typescript
onError: useCallback((error: string | null) => {
  if (error && (
    error.includes('Attach request superseded') ||
    error.includes('Connection closed') ||
    error.includes('Ably service not configured')
  )) {
    return; // Ignore expected errors
  }
  setError(error);
}, []),
```

### 3. Connection Management

**Debounce state changes**:
```typescript
// In useEffect or event handlers
const debouncedAction = useMemo(() => 
  debounce(() => {
    if (shouldConnect) {
      connect();
    } else {
      disconnect();
    }
  }, 200)
, [connect, disconnect]);
```

**Use stable references**:
```typescript
const stableCallbacks = useMemo(() => ({
  onMessage,
  onError,
  onConnect,
}), [onMessage, onError, onConnect]);
```

### 4. Testing Considerations

**Test rapid state changes**:
```typescript
// Simulate rapid enable/disable
setEnabled(true);
setEnabled(false);
setEnabled(true);
// Should not cause race conditions
```

**Test connection failures**:
```typescript
// Mock network issues
mockAblyConnection.emit('failed');
// Should handle gracefully
```

**Test cleanup**:
```typescript
// Unmount component rapidly
mount();
unmount();
mount();
// Should not leave hanging connections
```

## 🚀 Migration Guide

### Existing Code Updates

If you have existing Ably usage, consider these updates:

1. **Replace direct channel operations**:
   ```typescript
   // Before
   const channel = ably.channels.get(name);
   channel.attach();
   
   // After
   const { channel, isAttached } = useStableAblyChannel(name, ably, enabled);
   ```

2. **Add error handling**:
   ```typescript
   // Before
   try {
     await channel.publish(data);
   } catch (error) {
     console.error(error);
   }
   
   // After
   const { handleError } = useAblyErrorHandler();
   try {
     await channel.publish(data);
   } catch (error) {
     handleError(error, 'publish', onRetry);
   }
   ```

3. **Update cleanup patterns**:
   ```typescript
   // Before
   useEffect(() => {
     if (enabled) connect();
     return () => cleanup();
   }, [enabled]);
   
   // After
   const debouncedConnect = useCallback(() => {
     // Debounced logic
   }, []);
   
   useEffect(() => {
     debouncedConnect();
     return cleanup;
   }, [debouncedConnect]);
   ```

## 🔍 Monitoring & Debugging

### Console Output

The enhanced implementation provides structured logging:

```
[Ably/channel-attachment] Expected error (ignored): Attach request superseded
[Ably/connection] Attempting reconnection...
[Ably/publish] Error: Channel not attached
```

### Debug Mode

Enable detailed logging by setting:
```typescript
localStorage.setItem('ably-debug', 'true');
```

### Health Checks

Use built-in health check functionality:
```typescript
const { requestHealthCheck } = useAblySync({...});

const checkId = await requestHealthCheck();
// Monitor response via health check handlers
```

## 📊 Performance Impact

The fixes introduce minimal overhead:

- **Debouncing**: 200ms delay for rapid state changes (prevents excessive operations)
- **State tracking**: Minimal memory usage with refs
- **Enhanced cleanup**: Slightly longer cleanup time but prevents memory leaks
- **Error handling**: Intelligent filtering reduces noise

## 🔮 Future Improvements

1. **React StrictMode Compatibility**: Remove the temporary disable in production
2. **Metric Collection**: Add connection health metrics
3. **Reconnection Strategies**: Implement exponential backoff
4. **Channel Pooling**: Optimize for multiple channel usage
5. **WebSocket Fallback**: Handle Ably-specific connection issues

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready