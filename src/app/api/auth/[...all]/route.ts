import { getAuth } from "@/lib/auth";
async function handle(request: Request) {
  try { return await getAuth().handler(request); }
  catch { return Response.json({ message: "Authentication is temporarily unavailable." }, { status: 503 }); }
}
export const GET = handle;
export const POST = handle;
