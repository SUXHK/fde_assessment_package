import nodemailer from "nodemailer";

// In development, we log verification codes to console.
// Set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS for real sending.
const useMock = !process.env.SMTP_HOST;

const transporter = useMock
  ? null
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!
      }
    });

export async function sendVerificationCode(
  email: string,
  code: string
): Promise<{ success: boolean; mock?: boolean }> {
  if (useMock || !transporter) {
    console.log("=".repeat(48));
    console.log(`[DEV] 验证码: ${code}`);
    console.log(`[DEV] 收件人: ${email}`);
    console.log("=".repeat(48));
    return { success: true, mock: true };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER!,
    to: email,
    subject: "AI 工作项看板 - 邮箱验证码",
    text: `您的验证码是: ${code}\n\n该验证码 10 分钟内有效。`
  });

  return { success: true, mock: false };
}
