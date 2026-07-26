export const ROUTE_RATE_LIMITS: Record<string, number> = {
  '/user/profile': 30,
};
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export const RISK_WEIGHTS = {
  IP_CHANGE: 30,
  HIGH_REQUEST_RATE: 25,
  GEO_ANOMALY: 35,
};

export const RISK_THRESHOLDS = {
  LOW: 20,
  MEDIUM: 50,
};

export interface RiskInput {
  userId: string;
  ip: string;
  previousIp?: string;
  requestCount: number;
  geoLocation?: string;
  previousGeo?: string;
}
