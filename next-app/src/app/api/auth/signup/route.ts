import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/utils/validations';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate Input
    const validatedData = signUpSchema.parse(body);
    
    // 2. Check for existing Email or Phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json({ error: 'This email is already registered. Please log in.' }, { status: 400 });
      }
      if (existingUser.phone === validatedData.phone) {
        return NextResponse.json({ error: 'This phone number is already linked to another account.' }, { status: 400 });
      }
    }

    // 3. Hash Password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // 4. Create User
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash,
        notificationChannel: validatedData.notificationChannel,
        promoOptIn: validatedData.promoOptIn,
        isPhoneVerified: false, // Must verify OTP to activate
      }
    });

    // 5. Generate and Store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    
    await prisma.otp.create({
      data: {
        phone: newUser.phone,
        userId: newUser.id,
        hash: otpHash,
        purpose: 'SIGNUP',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
      }
    });

    // 6. Queue WhatsApp OTP Message (Always WhatsApp for Signup Verification as per rules)
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        event: 'SIGNUP_OTP',
        channel: 'WHATSAPP',
        template: 'otp_verification',
        language: 'EN', // Defaulting to EN, can be pulled from headers
        status: 'QUEUED',
      }
    });

    // Note: A background worker will pick up the QUEUED notification and send it via whatsappService

    return NextResponse.json({ 
      message: 'Account created. Please check your WhatsApp for the OTP.',
      userId: newUser.id,
      phone: newUser.phone
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
