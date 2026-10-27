import bcrypt from "bcryptjs";
import { db } from "../db";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  university?: string;
  faculty?: string;
  year?: string;
  specialization?: string;
};

export async function registerUser(input: RegisterInput) {
  const email = input.email.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email");
  }

  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  if (!input.firstName?.trim() || !input.lastName?.trim()) {
    throw new Error("First name and last name are required");
  }

  // Check if email already exists
  const existingUser = await db.orm.public.User
    .where({ email })
    .first();

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // Create user
  const user = await db.orm.public.User.create({
    email,
    passwordHash,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
  });

  // Create profile
  await db.orm.public.Profile.create({
    userId: user.id,
    university: input.university?.trim() || null,
    faculty: input.faculty?.trim() || null,
    year: input.year?.trim() || null,
    specialization: input.specialization?.trim() || null,
  });

  // Never return passwordHash
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}