const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class HttpError extends Error {
  status: number;
  body: any;

  constructor(status: number, message: string, body: any = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

class ApiService {
  private authToken: string | null = null;
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async setAuthToken(token: string | null): Promise<void> {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});

    headers.append('Accept', 'application/json');

    if (this.authToken) {
      headers.append('Authorization', `Bearer ${this.authToken}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
      if (!headers.has('Content-Type')) {
        headers.append('Content-Type', 'application/json');
      }
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          try {
            errorBody = await response.text();
          } catch (textError) {
            errorBody = 'Failed to parse error response body.';
          }
        }
        throw new HttpError(
          response.status,
          `HTTP error ${response.status}: ${response.statusText || 'An error occurred'}`,
          errorBody
        );
      }

      // Handle 204 No Content specifically
      if (response.status === 204) {
        return undefined as T;
      }
      
      // Check if response is JSON before trying to parse
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json() as Promise<T>;
      } else {
        return response.text() as unknown as Promise<T>; 
      }

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      // For network errors or other fetch-related issues
      console.error('ApiService Request Error:', error);
      throw new Error(`Network request failed: ${(error as Error).message}`);
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiService = new ApiService(BASE_URL);
