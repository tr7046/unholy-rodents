// Email notification service using Resend
// Configure RESEND_API_KEY and NOTIFICATION_EMAIL in environment variables

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'book@unholyrodents.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@unholyrodents.com';

interface ContactNotificationData {
  type: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  id: string;
}

const typeLabels: Record<string, string> = {
  booking: 'Booking Inquiry',
  press: 'Press/Media Request',
  merch: 'Merch Question',
  general: 'General Message',
};

const typeEmojis: Record<string, string> = {
  booking: '🎸',
  press: '📰',
  merch: '👕',
  general: '💬',
};

export async function sendContactNotification(data: ContactNotificationData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not configured - skipping email notification');
    console.log('[Email] Would have sent notification for contact from:', data.email);
    return false;
  }

  const typeLabel = typeLabels[data.type] || 'Contact Form';
  const emoji = typeEmojis[data.type] || '📧';

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #f5f5f0; font-size: 24px; font-weight: bold;">
                ${emoji} NEW ${typeLabel.toUpperCase()}
              </h1>
              <p style="margin: 10px 0 0; color: rgba(245, 245, 240, 0.8); font-size: 14px;">
                Unholy Rodents Website
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; border: 1px solid #333; border-top: none;">
              <!-- Contact Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px; background-color: #252525; border-radius: 6px;">
                    <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase;">From</p>
                    <p style="margin: 0; color: #f5f5f0; font-size: 16px; font-weight: 600;">${escapeHtml(data.name)}</p>
                    <p style="margin: 4px 0 0; color: #c41e3a; font-size: 14px;">
                      <a href="mailto:${escapeHtml(data.email)}" style="color: #c41e3a; text-decoration: none;">${escapeHtml(data.email)}</a>
                    </p>
                  </td>
                </tr>
              </table>

              ${data.subject ? `
              <!-- Subject -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Subject</p>
                    <p style="margin: 0; color: #f5f5f0; font-size: 14px;">${escapeHtml(data.subject)}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Message -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase;">Message</p>
                    <div style="background-color: #0a0a0a; border: 1px solid #333; border-radius: 6px; padding: 16px;">
                      <p style="margin: 0; color: #f5f5f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="mailto:${escapeHtml(data.email)}?subject=Re: ${encodeURIComponent(data.subject || 'Your message to Unholy Rodents')}"
                       style="display: inline-block; background-color: #c41e3a; color: #f5f5f0; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                      Reply to ${escapeHtml(data.name)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #333; border-top: none;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                Hail Squatan. Fuck Animal Control. Stay Nuts.
              </p>
              <p style="margin: 8px 0 0; color: #444; font-size: 11px;">
                Message ID: ${data.id}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const textContent = `
NEW ${typeLabel.toUpperCase()}
==============================

From: ${data.name}
Email: ${data.email}
Type: ${typeLabel}
${data.subject ? `Subject: ${data.subject}` : ''}

Message:
${data.message}

---
Reply to this message: mailto:${data.email}
Message ID: ${data.id}

Hail Squatan. Fuck Animal Control. Stay Nuts.
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Unholy Rodents <${FROM_EMAIL}>`,
        to: [NOTIFICATION_EMAIL],
        subject: `${emoji} New ${typeLabel}: ${data.name}`,
        html: htmlContent,
        text: textContent,
        reply_to: data.email,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Failed to send notification:', error);
      return false;
    }

    const result = (await response.json()) as { id?: string };
    console.log('[Email] Notification sent successfully:', result.id);
    return true;
  } catch (error) {
    console.error('[Email] Error sending notification:', error);
    return false;
  }
}

function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}
