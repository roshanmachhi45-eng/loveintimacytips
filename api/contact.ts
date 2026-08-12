
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email and message are required.',
      });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'Email service is not configured.',
      });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Loveons Contact <onboarding@resend.dev>',
        to: ['roshan.machhi.45@gmail.com'],
        subject: `New Contact Message from ${name}`,
        reply_to: email,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Form Message</h2>

            <p><strong>Name:</strong> ${name}</p>

            <p><strong>Email:</strong> ${email}</p>

            <p><strong>Message:</strong></p>

            <p style="white-space: pre-wrap;">
              ${message}
            </p>

            <hr />

            <p>
              Sent from the Loveons contact form.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || 'Failed to send email.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully.',
    });
  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      error: 'Something went wrong while sending the message.',
    });
  }
}
