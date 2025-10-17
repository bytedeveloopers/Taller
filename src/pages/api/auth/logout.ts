// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

const JWT_COOKIE = "auth_token";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  // Expira la cookie
  res.setHeader(
    "Set-Cookie",
    serialize(JWT_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    })
  );
  return res.status(200).json({ success: true });
}
