import { db } from "../db";
import { verifyPassword } from "./auth";
import { createSession } from "./session";

type LoginInput = {
  email: string;
  password: string;
};

export async function loginUser(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email");
  }

  if (!input.password) {
    throw new Error("Password is required");
  }

  // Find user
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check account status
  if (!user.isActive) {
    throw new Error("Account is inactive");
  }

  // Verify password
  const passwordValid = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  // Create secure session
  const session = await createSession(user.id);

  // Never return passwordHash
  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    session: {
      token: session.token,
      expiresAt: session.expiresAt,
    },
  };
}