import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email?: string; emailVerified: boolean; phone?: string };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const decoded = await getAuth().verifyIdToken(header.slice(7), true);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
      phone: decoded.phone_number
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}
