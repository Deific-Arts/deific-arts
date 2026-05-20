import { Router, Request, Response } from 'express';

const router = Router();

// Test route - renders the email form using Liquid template
router.get('/', (request: Request, response: Response) => {
  response.render('test', {
    title: 'Deific Arts LLC Nodemailer',
    header: '📧 Deific Arts LLC Nodemailer',
    description: 'Send emails through this Express app using Nodemailer.',
    recipient_email: 'contact@deificarts.com',
    button_text: 'Send Email',
    api_endpoint: '/default',
    auth_token: 'public-token-localhost',
    error_message: 'Failed to send email. Please try again.'
  });
});

export default router;
