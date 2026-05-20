export interface EmailRequest {
  from: string;
  to: string;
  fullname: string;
  text?: string;
  html?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  domain?: string;
  error?: string;
}

export interface TokenValidation {
  valid: boolean;
  domain?: string;
  message?: string;
}

export interface JwtPayload {
  domain: string;
  timestamp: number;
  iat?: number;
}

export interface MailOptions {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
