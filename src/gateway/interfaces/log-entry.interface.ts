export interface LogEntry {
  userId: string | null;
  endpoint: string;
  method: string;
  timestamp: Date;
  status: number;
  duration: number;
  ip?: string;
}