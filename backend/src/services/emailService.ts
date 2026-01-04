import { env } from '@/config/env'

interface EmailOptions {
    to: string
    subject: string
    htmlContent: string
    name?: string
}

export default class EmailService {
    private static apiKey = process.env.BREVO_API_KEY
    private static sender = { email: process.env.SENDER_EMAIL || 'noreply@realtime-notes.com', name: 'Realtime Notes' }

    private static async sendEmail({ to, subject, htmlContent, name }: EmailOptions) {
        if (!this.apiKey) {
            console.warn('BREVO_API_KEY not set. Email not sent:', { to, subject })
            return
        }

        try {
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: this.sender,
                    to: [{ email: to, name: name || to.split('@')[0] }],
                    subject: subject,
                    htmlContent: htmlContent
                })
            })

            if (!response.ok) {
                const error = await response.json()
                console.error('Brevo API Error:', error)
                throw new Error('Failed to send email')
            }
        } catch (error) {
            console.error('EmailService Error:', error)
            // Don't crash the app if email fails, just log it
        }
    }

    private static getBaseTemplate(title: string, body: string, actionUrl?: string, actionText?: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { background: #18181b; padding: 24px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
                .content { padding: 32px; color: #3f3f46; line-height: 1.6; }
                .button { display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 24px; }
                .footer { background: #f4f4f5; padding: 24px; text-align: center; color: #71717a; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${title}</h1>
                </div>
                <div class="content">
                    ${body}
                    ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="button">${actionText}</a></div>` : ''}
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Realtime Notes. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `
    }

    static async sendVerificationEmail(to: string, name: string, token: string) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
        const html = this.getBaseTemplate(
            'Verify your Email',
            `<p>Hi ${name},</p><p>Welcome to Realtime Notes! Please verify your email address to get started.</p>`,
            verifyUrl,
            'Verify Email'
        )
        await this.sendEmail({ to, subject: 'Verify your email', htmlContent: html, name })
    }

    static async sendPasswordResetEmail(to: string, name: string, token: string) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        const html = this.getBaseTemplate(
            'Reset your Password',
            `<p>Hi ${name},</p><p>We received a request to reset your password. If you didn't ask for this, you can safely ignore this email.</p>`,
            resetUrl,
            'Reset Password'
        )
        await this.sendEmail({ to, subject: 'Reset Password Request', htmlContent: html, name })
    }

    static async sendWelcomeEmail(to: string, name: string) {
        const html = this.getBaseTemplate(
            'Welcome to Realtime Notes!',
            `<p>Hi ${name},</p><p>We're excited to have you on board. Start creating and sharing notes in real-time!</p>`,
            `${process.env.FRONTEND_URL}/notes`,
            'Go to Dashboard'
        )
        await this.sendEmail({ to, subject: 'Welcome!', htmlContent: html, name })
    }
}
