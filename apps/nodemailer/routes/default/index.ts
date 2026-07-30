import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import type { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Mailjet from 'node-mailjet';

// Extend Request interface to include domain
declare global {
  namespace Express {
    interface Request {
      domain?: string;
    }
  }
}

const router = express.Router();

// Hardcoded JWT secret for demonstration
const JWT_SECRET: string = process.env.DEFAULT_JWT_SECRET || 'hardcoded-jwt-secret';

// Allowed domains and their tokens
const DOMAIN_TOKENS = {
  'deificarts.com': 'public-token-deificarts',
  'localhost': 'public-token-localhost'
};


// Mailjet API client setup
const mailjet = new Mailjet({
  apiKey: process.env.DEFAULT_MAILJET_API_KEY,
  apiSecret: process.env.DEFAULT_MAILJET_API_SECRET
});

// Validate token middleware
function validateToken(req: Request, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  // Check if it's a valid token (public or JWT)
  const validTokens = Object.values(DOMAIN_TOKENS);

  if (validTokens.includes(token)) {
    return next();
  }

  // Otherwise, validate as JWT
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
}

// POST route for sending email
router.post('/', validateToken, async (req: Request, res: Response) => {
  try {
    const { replyemail, to, fullname, subject, text, html } = req.body;

    // Validate required fields
    if (!replyemail || !to || !fullname || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields.'
      });
    }

    const mailOptions = {
      Messages: [
        {
          From: {
            Email: process.env.DEFAULT_EMAIL_FROM,
            Name: fullname
          },
          ReplyTo: {
            Email: replyemail
          },
          To: [
            {
              Email: to
            }
          ],
          Subject: subject || `${fullname}, is interested in Deific Arts LLC`,
          TextPart: text,
          HTMLPart: html || `<div>${text}</div>`
        }
      ]
    };

    const info = await mailjet.post('send', { version: 'v3.1' }).request(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: (info.body as any).Messages[0].MessageID
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

export default router;
