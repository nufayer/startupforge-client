"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  Input,
  Button,
} from "@heroui/react";
import {
  Eye,
  EyeOff,
} from "lucide-react";
import { signIn } from "@/lib/auth.client";

const Chrome = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="21.17" x2="12" y1="8" y2="8" />
    <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
    <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
  </svg>
);

export default function LoginPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      await signIn.email({
        email,
        password,
      }, {
        onSuccess: () => {
          setSuccess("Login successful!");
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setError(ctx.error.message);
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <Card className="w-full max-w-md p-8 bg-zinc-950 border border-zinc-800">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center">
            Sign in
          </h1>
          <p className="text-zinc-400 mt-2 text-center">
            Enter your email and password.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500 p-3 text-green-400">
            {success}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div className="space-y-5">
            <h2>Email</h2>
            <Input
              label="Email"
              type="email"
              variant="bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <h2>Password</h2>
            <Input
              label="Password"
              variant="bordered"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            size="lg"
          >
            Login
          </Button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-b border-zinc-800"></div>
          <span className="px-4 text-zinc-500">
            OR
          </span>
          <div className="flex-1 border-b border-zinc-800"></div>
        </div>

        <Button
          variant="bordered"
          className="w-full"
          startContent={<Chrome size={18} />}
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>

        <p className="text-center text-zinc-400 mt-6">
          Do not have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary"
          >
            Register
          </Link>
        </p>

      </Card>

    </div>
  );
}