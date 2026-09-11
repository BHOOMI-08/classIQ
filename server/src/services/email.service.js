import { env } from '../config/env.js';

export class EmailService {
  static async sendVerificationEmail(email, rawToken) {
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
    console.log(`\n========================================`);
    console.log(`📧 EMAIL VERIFICATION LINK FOR [${email}]`);
    console.log(`🔗 URL: ${verificationUrl}`);
    console.log(`========================================\n`);
  }

  static async sendPasswordResetEmail(email, rawToken) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    console.log(`\n========================================`);
    console.log(`🔑 PASSWORD RESET LINK FOR [${email}]`);
    console.log(`🔗 URL: ${resetUrl}`);
    console.log(`========================================\n`);
  }

  static async sendSecurityAlert(email, subject, details) {
    console.log(`\n========================================`);
    console.log(`⚠️ SECURITY ALERT FOR [${email}]`);
    console.log(`📌 Subject: ${subject}`);
    console.log(`📝 Details: ${details}`);
    console.log(`========================================\n`);
  }
}
