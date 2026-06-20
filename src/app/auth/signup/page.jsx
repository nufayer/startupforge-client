"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  Input,
  Button,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth.client";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
    password: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!validatePassword(formData.password)) {
      return setError(
        "Password must contain at least 6 characters, one uppercase letter and one lowercase letter."
      );
    }

    if (!formData.role) {
      return setError("Please select a role.");
    }

    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        image: formData.image || undefined,
        role: formData.role,
      }, {
        onSuccess: () => {
          setSuccess("Account created successfully!");
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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <Card className="w-full max-w-lg p-8 bg-zinc-950 border border-zinc-800">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center">
            Create account
          </h1>
          <p className="text-zinc-400 mt-2 text-center">
            Fill the details below to get started.
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
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-5">
            <p>Name</p>
            <Input
              label="Name"
              variant="bordered"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              isRequired
            />
            <p>Email</p>
            <Input
              label="Email"
              type="email"
              variant="bordered"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              isRequired
            />
            
            <p>Image</p>
            <Input
              label="Image"
              description="Optional — Image URL"
              variant="bordered"
              value={formData.image}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image: e.target.value,
                })
              }
            />



            <p>Password</p>
            <Input
              label="Password"
              variant="bordered"
              type={showPassword ? "text" : "password"}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              isRequired
            />

            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-zinc-200">Role selection</div>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value,
                  })
                }
                className="w-full h-12 px-3 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                required
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="Founder">Founder</option>
                <option value="Collaborator">Collaborator</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
          >
            Create
          </Button>
        </form>

        <p className="text-center text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-primary"
          >
            Login
          </Link>
        </p>

      </Card>

    </div>
  );
}