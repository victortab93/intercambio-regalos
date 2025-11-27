// src/lib/api.ts

/**
 * Enterprise API Client for Next.js
 * ---------------------------------
 * - Works in Client and Server Components
 * - Auto JSON parsing
 * - Standard response shape: { ok, data?, error? }
 * - Query string builder
 * - Automatic headers
 */

export interface ApiResponse<T = any> {
    ok: boolean;
    data?: T;
    error?: string;
    status?: number;
  }
  
  class ApiClient {
    private buildUrl(path: string, query?: Record<string, any>): string {
      if (!query) return path;
  
      const params = new URLSearchParams();
  
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
  
      return `${path}?${params.toString()}`;
    }
  
    private async request<T>(
      method: string,
      path: string,
      body?: any,
      query?: Record<string, any>
    ): Promise<ApiResponse<T>> {
      try {
        const url = this.buildUrl(path, query);
  
        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json"
          },
          body: body ? JSON.stringify(body) : undefined,
          credentials: "include"
        });
  
        const status = res.status;
        const json = await res.json().catch(() => null);
  
        if (!json) {
          return {
            ok: false,
            error: "Invalid server response",
            status
          };
        }
  
        if (!json.ok) {
          return {
            ok: false,
            error: json.error || "Unknown error",
            status
          };
        }
  
        return {
          ok: true,
          data: json,
          status
        };
      } catch (err: any) {
        console.error("API Error:", err);
  
        return {
          ok: false,
          error: err.message || "Network error"
        };
      }
    }
  
    // -------------------------------
    // HTTP METHODS
    // -------------------------------
    get<T = any>(path: string, query?: Record<string, any>) {
      return this.request<T>("GET", path, undefined, query);
    }
  
    post<T = any>(path: string, body?: any, query?: Record<string, any>) {
      return this.request<T>("POST", path, body, query);
    }
  
    put<T = any>(path: string, body?: any, query?: Record<string, any>) {
      return this.request<T>("PUT", path, body, query);
    }
  
    patch<T = any>(path: string, body?: any, query?: Record<string, any>) {
      return this.request<T>("PATCH", path, body, query);
    }
  
    delete<T = any>(path: string, query?: Record<string, any>) {
      return this.request<T>("DELETE", path, undefined, query);
    }
  }
  
  // Export singleton
  export const api = new ApiClient();
  