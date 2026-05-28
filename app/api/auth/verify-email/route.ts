import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { errorResponse, dataResponse } from "@/lib/http";

const verifySchema = z.object({
  code: z.string().length(6, "验证码为 6 位数字")
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("NOT_FOUND", "请先登录。", 401);
    }

    const body = await request.json();
    const payload = verifySchema.parse(body);

    // Find a valid, unused code for this email
    const record = await prisma.verificationCode.findFirst({
      where: {
        email: session.email,
        code: payload.code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!record) {
      return errorResponse(
        "VALIDATION_ERROR",
        "验证码错误或已过期，请重新获取。",
        400
      );
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { used: true }
    });

    // Mark user as verified
    await prisma.user.update({
      where: { id: session.userId },
      data: { emailVerified: true }
    });

    return dataResponse({ verified: true, message: "邮箱验证成功。" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VALIDATION_ERROR", "验证码格式不正确。", 400);
    }
    console.error("Verify email error:", error);
    return errorResponse("INTERNAL_ERROR", "验证失败，请稍后重试。", 500);
  }
}
