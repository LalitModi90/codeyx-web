/**
 * A lightweight HTTP client wrapping Node.js native fetch.
 * Mimics Axios and GraphQL Request interfaces to avoid compilation errors and external dependencies.
 */

export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export const axios = {
  get: async <T = any>(url: string, config?: { headers?: Record<string, string>; timeout?: number }): Promise<AxiosResponse<T>> => {
    const controller = new AbortController();
    const id = config?.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;

    try {
      let origin = 'https://leetcode.com';
      let referer = 'https://leetcode.com/';
      try {
        const urlObj = new URL(url);
        origin = urlObj.origin;
        referer = urlObj.origin + '/';
      } catch (e) {}

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': referer,
          'Origin': origin,
          ...config?.headers,
        },
        signal: controller.signal,
      });

      if (id) clearTimeout(id);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      if (id) clearTimeout(id);
      throw error;
    }
  },

  post: async <T = any>(url: string, data?: any, config?: { headers?: Record<string, string>; timeout?: number }): Promise<AxiosResponse<T>> => {
    const controller = new AbortController();
    const id = config?.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;

    try {
      let origin = 'https://leetcode.com';
      let referer = 'https://leetcode.com/';
      try {
        const urlObj = new URL(url);
        origin = urlObj.origin;
        referer = urlObj.origin + '/';
      } catch (e) {}

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': referer,
          'Origin': origin,
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      if (id) clearTimeout(id);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const resData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return {
        data: resData as T,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      if (id) clearTimeout(id);
      throw error;
    }
  },
};

/**
 * Lightweight helper to mimic graphql-request client.
 */
export async function graphqlRequest<T = any>(
  url: string,
  query: string,
  variables?: Record<string, any>,
  headers?: Record<string, string>
): Promise<T> {
  const response = await axios.post<{ data: T; errors?: any[] }>(url, {
    query,
    variables,
  }, { 
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': 'https://leetcode.com/',
      'Origin': 'https://leetcode.com',
      ...headers,
    } 
  });

  if (response.data.errors && response.data.errors.length > 0) {
    throw new Error(response.data.errors[0].message);
  }

  return response.data.data;
}
