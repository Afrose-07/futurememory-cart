"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/PasswordInput';
import { signupUser } from '../../actions/auth'; // Ensure this points to the right path based on your tsconfig alias

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    notificationPreference: 'WHATSAPP'
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  // Strict Phone Validation
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+91\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Strict Password Validation
  const validatePassword = (pass: string) => {
    // 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
    return strongRegex.test(pass);
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(formData.phone)) {
      setError('Phone number must be exactly 10 digits starting with +91 (e.g., +919876543210)');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be 8+ characters, including 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Move to OTP Step
    setStep('OTP');
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp !== '1234') { // Dummy check for now
      setError('Invalid OTP. Please try again.');
      return;
    }

    alert('Account successfully created! Redirecting to login...');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl border border-border premium-shadow">
        <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight text-center">
          {step === 'DETAILS' ? 'Create Account' : 'Verify Phone'}
        </h2>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          {step === 'DETAILS' 
            ? 'Join FutureMemory Cart today.' 
            : `A WhatsApp OTP has been sent to ${formData.phone}`}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {step === 'DETAILS' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Full Name</label>
              <input 
                required
                type="text" 
                placeholder="John Doe"
                className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Email Address</label>
              <input 
                required
                type="email" 
                placeholder="john@example.com"
                className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Phone Number (with +91)</label>
              <input 
                required
                type="text" 
                placeholder="+919876543210"
                className="w-full h-12 px-4 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            {/* Password Field with Eye Icon Logic via existing PasswordInput component */}
            <PasswordInput 
              label="Password" 
              name="password" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />

            <PasswordInput 
              label="Confirm Password" 
              name="confirmPassword" 
              value={formData.confirmPassword}
              onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
            />

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3 mt-4">Notification Preference</label>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="notification" 
                    value="WHATSAPP"
                    checked={formData.notificationPreference === 'WHATSAPP'}
                    onChange={e => setFormData({...formData, notificationPreference: e.target.value})}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">WhatsApp (Recommended)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="notification" 
                    value="EMAIL"
                    checked={formData.notificationPreference === 'EMAIL'}
                    onChange={e => setFormData({...formData, notificationPreference: e.target.value})}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Email</span>
                </label>
              </div>
            </div>

            <button type="submit" className="w-full h-14 premium-button mt-4 text-lg">
              Send OTP
            </button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1 text-center">Enter 4-Digit OTP</label>
              <input 
                required
                type="text" 
                maxLength={4}
                className="w-full h-16 text-center text-2xl tracking-[1em] rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all font-mono"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            
            <button type="submit" className="w-full h-14 premium-button text-lg">
              Verify & Create Account
            </button>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              Didn't receive code? <button type="button" className="text-primary font-bold hover:underline" onClick={() => alert('Resent WhatsApp OTP!')}>Resend OTP</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
