
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required.',
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'Loveons Contact Form <onboarding@resend.dev>',
      to: ['contact.loveons@gmail.com'],
      subject: `New Loveons Contact Message from ${name}`,
      replyTo: email,
      html: `
        <h2>New message from Loveons Contact Form</h2>

        <p><strong>Name:</strong> ${name}</p>

        <p><strong>Email:</strong> ${email}</p>

        <p><strong>Message:</strong></p>

        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);

      return res.status(500).json({
        error: 'Unable to send email.',
      });
    }

    return res.status(200).json({
      success: true,
      id: data?.id,
    });
  } catch (error) {
    console.error('Contact form error:', error);

    return res.status(500).json({
      error: 'Something went wrong.',
    });
  }
}

