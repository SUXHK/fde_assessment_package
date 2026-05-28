import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { errorResponse, dataResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return errorResponse("NOT_FOUND", "未登录。", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true
    }
  });

  if (!user) {
    return errorResponse("NOT_FOUND", "用户不存在。", 404);
  }

  return dataResponse(user);
}
