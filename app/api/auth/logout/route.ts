import { clearSessionCookie } from "@/lib/auth/session";
import { dataResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSessionCookie();
  return dataResponse({ success: true });
}
