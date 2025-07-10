// Shared API client functions will be exported from here

// Placeholder for now
export class ApiClient {
  constructor(private baseUrl: string) {}

  async get(path: string) {
    // Implementation will go here
    return fetch(`${this.baseUrl}${path}`);
  }
}

export const API_CLIENT_PACKAGE_VERSION = '0.1.0';
