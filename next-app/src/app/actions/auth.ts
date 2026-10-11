"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

export async function signupUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const notification_channel = formData.get("notification") as string;

  if (!name || !email || !phone || !password) {
    return { error: "All fields are required." };
  }

  // Format phone to E.164
  const formattedPhone = `+91${phone.replace(/\D/g, "")}`;

  try {
    // Check uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) return { error: "This email is already registered. Please log in." };

    const existingPhone = await prisma.user.findUnique({ where: { phone: formattedPhone } });
    if (existingPhone) return { error: "This phone number is already linked to another account." };

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: formattedPhone,
        passwordHash,
        notificationChannel: notification_channel as any,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Signup Error:", err);
    return { error: "An error occurred during signup." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    
    // Security: Do not reveal if email is wrong
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return { error: "Invalid email or password" };
    }

    // Create session (JWT)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    // Set cookie
    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    console.error("Login Error:", err);
    return { error: "An error occurred during login." };
  }
}
