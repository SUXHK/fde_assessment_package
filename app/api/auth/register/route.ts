import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { sendVerificationCode } from "@/lib/auth/email";
import { errorResponse, dataResponse } from "@/lib/http";

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少 6 位"),
  name: z.string().min(1, "请输入用户名").max(32)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: payload.email }
    });
    if (existing) {
      return errorResponse(
        "VALIDATION_ERROR",
        "该邮箱已注册，请直接登录。",
        409
      );
    }

    // Generate 6-digit verification code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Save code
    await prisma.verificationCode.create({
      data: {
        email: payload.email,
        code,
        expiresAt
      }
    });

    // Send email (mock in dev, real with SMTP configured)
    await sendVerificationCode(payload.email, code);

    // Create user (unverified)
    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        passwordHash,
        name: payload.name
      }
    });

    // Auto-login after registration
    const token = signToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return dataResponse(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false,
        message: "验证码已生成。", verificationCode: code
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        "VALIDATION_ERROR",
        error.issues.map((i) => i.message).join("; "),
        400
      );
    }
    console.error("Register error:", error);
    return errorResponse("INTERNAL_ERROR", "注册失败，请稍后重试。", 500);
  }
}
