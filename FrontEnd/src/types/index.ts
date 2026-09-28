export interface HealthStatus {
  status: string;
  service: string;
  environment: string;
  database?: string;
  timestamp: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[];
}

export interface Photo {
  id: string;
  title: string;
  url: string;
}
