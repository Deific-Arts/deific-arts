import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import type { Router, Request, Response } from 'express';
import * as nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

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
const JWT_SECRET: string = process.env.JWT_SECRET || 'hardcoded-jwt-secret';

// Allowed domains and their tokens
const DOMAIN_TOKENS = {
  'deificarts.com': 'public-token-deificarts',
  'localhost': 'public-token-localhost'
};


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
      from: `"${fullname}" <${process.env.EMAIL_USER}>`,
      replyTo: replyemail,
      to: to,
      subject: subject || `${fullname} has reached out to you.`,
      text: text,
      html: html || `<p>${text}</p>`
    };

    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId
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
