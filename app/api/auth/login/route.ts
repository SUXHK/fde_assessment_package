import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { errorResponse, dataResponse } from "@/lib/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      return errorResponse("VALIDATION_ERROR", "邮箱或密码错误。", 401);
    }

    const valid = await verifyPassword(payload.password, user.passwordHash);
    if (!valid) {
      return errorResponse("VALIDATION_ERROR", "邮箱或密码错误。", 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return dataResponse({
      userId: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "请输入有效的邮箱和密码。", 400);
    }
    console.error("Login error:", error);
    return errorResponse("INTERNAL_ERROR", "登录失败，请稍后重试。", 500);
  }
}
