# API Hook Pattern

## Generic API Hook Template

```typescript
import { useState, useEffect, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface ApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
}

function useApi<T>(
  url: string,
  options: ApiOptions = {}
): ApiState<T> & {
  refetch: () => Promise<void>;
  reset: () => void;
} {
  const { immediate = true, retries = 0, retryDelay = 1000 } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async (attempt = 0) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';

      if (attempt < retries) {
        setTimeout(() => fetchData(attempt + 1), retryDelay * (attempt + 1));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error
        }));
      }
    }
  }, [url, retries, retryDelay]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    ...state,
    refetch,
    reset
  };
}

// Usage examples:
// const { data, loading, error, refetch } = useApi<User[]>('/api/users');
// const { data, loading, error } = useApi('/api/data', { immediate: false });
```

## POST/PUT/PATCH Hook

```typescript
interface MutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface MutationOptions<T, V> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  onSuccessData?: (data: T, variables: V) => void;
}

function useMutation<T = any, V = any>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options: MutationOptions<T, V> = {}
): MutationState<T> & {
  execute: (variables?: V, customUrl?: string) => Promise<T>;
  reset: () => void;
} {
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (variables?: V, customUrl?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(customUrl || url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: variables ? JSON.stringify(variables) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data,
        loading: false,
        error: null
      });

      options.onSuccess?.(data);
      if (variables && options.onSuccessData) {
        options.onSuccessData(data, variables);
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';

      setState(prev => ({
        ...prev,
        loading: false,
        error
      }));

      options.onError?.(error);
      throw err;
    }
  }, [method, url, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Usage examples:
// const { execute, loading, error } = useMutation<User, Partial<User>>('POST', '/api/users');
// await execute({ name: 'John', email: 'john@example.com' });
```

## Optimized Hook with Caching

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry<any>>();

function useCachedApi<T>(
  url: string,
  cacheTime = 5 * 60 * 1000 // 5 minutes
): ApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchData = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      const cached = apiCache.get(url);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setState({
          data: cached.data,
          loading: false,
          error: null,
          lastUpdated: new Date(cached.timestamp)
        });
        return;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update cache
      apiCache.set(url, {
        data,
        timestamp: Date.now()
      });

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred';

      setState(prev => ({
        ...prev,
        loading: false,
        error
      }));
    }
  }, [url, cacheTime]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch
  };
}
```

## Real-time Data with WebSockets

```typescript
interface WebSocketState<T> {
  data: T | null;
  connected: boolean;
  error: string | null;
}

function useWebSocket<T>(
  url: string
): WebSocketState<T> & {
  send: (data: any) => void;
  reconnect: () => void;
} {
  const [state, setState] = useState<WebSocketState<T>>({
    data: null,
    connected: false,
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          connected: true,
          error: null
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            data
          }));
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setState(prev => ({
          ...prev,
          connected: false
        }));

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setState(prev => ({
          ...prev,
          connected: false,
          error: 'WebSocket connection error'
        }));
      };
    } catch (err) {
      setState(prev => ({
        ...prev,
        connected: false,
        error: 'Failed to create WebSocket connection'
      }));
    }
  }, [url]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    ...state,
    send,
    reconnect
  };
}
```

## Best Practices

1. **Error Handling**
   - Always handle loading and error states
   - Provide meaningful error messages
   - Implement retry logic for network failures
   - Consider exponential backoff for retries

2. **Performance**
   - Use caching for frequently accessed data
   - Implement debouncing for search inputs
   - Cancel pending requests when component unmounts
   - Use request deduplication for identical requests

3. **Memory Management**
   - Clean up side effects in useEffect
   - Abort fetch requests on unmount
   - Clear timeouts and intervals
   - Remove event listeners

4. **Type Safety**
   - Use generics for reusable hooks
   - Define proper response types
   - Handle null/undefined cases
   - Use discriminated unions for different response states