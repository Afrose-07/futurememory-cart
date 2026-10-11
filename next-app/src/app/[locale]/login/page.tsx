"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "../../../components/PasswordInput";
import Link from "next/link";

import { loginUser } from "../../actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await loginUser(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-background">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-sm border border-border">
        <h1 className="text-2xl font-bold mb-6 text-foreground text-center">Log In</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>

          <PasswordInput label="Password" name="password" required />

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="text-brand-600 focus:ring-brand-500 rounded" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-brand-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 px-4 py-2 bg-brand-800 text-white rounded-xl hover:bg-brand-900 transition-colors flex justify-center disabled:opacity-70">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        
        <p className="text-sm text-center mt-6 text-gray-600">
          Don't have an account? <Link href="/signup" className="text-brand-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
