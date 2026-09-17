import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-troque-em-producao"
);

export const ADMIN_COOKIE = "admin_session";

export async function signAdminToken(payload: {
  sub: string;
  email: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { sub: string; email: string };
  } catch {
    return null;
  }
}
