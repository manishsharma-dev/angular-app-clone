export interface ErrorMessage {
  headers: Headers;
  status: number;
  statusText: string;
  url: string;
  ok: boolean;
  name: string;
  message: string;
  error: Error;
}

export interface Error {
  timestamp?: string;
  message?: string;
  details?: string;
  systemMessage?: string;
  errorCode?: number;
}

export interface Headers {
  normalizedNames: NormalizedNames;
  lazyUpdate: null;
}

export interface NormalizedNames {}
