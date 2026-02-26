import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY || '')

// Send order confirmation email
export async function sendOrderConfirmation({ to, productTitle, downloadUrl }) {
  try {
    await resend.emails.send({
      from: 'Malak Miqdad <onboarding@resend.dev>', // Replace with your verified domain
      to,
      subject: `Your purchase: ${productTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for your purchase!</h2>
          <p>You bought <strong>${productTitle}</strong>.</p>
          <p>Download your product:</p>
          <a href="${downloadUrl}" style="display:inline-block;background:#0284c7;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;">
            Download Now
          </a>
          <p style="margin-top:24px;color:#666;font-size:14px;">This link expires in 24 hours. You can always re-download from your account.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
          <p style="color:#999;font-size:12px;">Malak Miqdad — Preserving Heritage Through Food</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send order email:', error)
  }
}

// Send booking notification to admin
export async function sendBookingNotification({ customerName, packageTitle, brief }) {
  try {
    await resend.emails.send({
      from: 'Malak Miqdad <onboarding@resend.dev>',
      to: 'admin@malakmiqdad.com', // Replace with actual admin email
      subject: `New booking: ${packageTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Service Booking</h2>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Package:</strong> ${packageTitle}</p>
          <p><strong>Brief:</strong></p>
          <blockquote style="background:#f8fafc;padding:16px;border-left:4px solid #0284c7;border-radius:4px;">${brief}</blockquote>
          <p>Log in to the admin dashboard to review and accept this booking.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send booking notification:', error)
  }
}

// Send booking status update to customer
export async function sendBookingStatusUpdate({ to, packageTitle, status, paymentUrl }) {
  const statusMessages = {
    accepted: 'Your booking has been accepted! Please proceed with payment to start the project.',
    in_progress: 'Great news — work on your project has started!',
    revision: 'A revision has been submitted for your review.',
    completed: 'Your project is complete! Check your account to download the deliverables.',
    cancelled: 'Your booking has been cancelled.',
  }

  const message = statusMessages[status] || `Your booking status has been updated to: ${status}`

  try {
    await resend.emails.send({
      from: 'Malak Miqdad <onboarding@resend.dev>',
      to,
      subject: `Booking update: ${packageTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking Update</h2>
          <p><strong>Service:</strong> ${packageTitle}</p>
          <p>${message}</p>
          ${paymentUrl ? `
            <a href="${paymentUrl}" style="display:inline-block;background:#0284c7;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;">
              Pay Now
            </a>
          ` : ''}
          <hr style="margin:24px 0;border:none;border-top:1px solid #e2e8f0;" />
          <p style="color:#999;font-size:12px;">Malak Miqdad — Design Services</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('Failed to send booking status email:', error)
  }
}
