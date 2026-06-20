"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input } from "@heroui/react";
import { useSession, updateUser } from "@/lib/auth.client";
import { AlertCircle, User, Check, Edit2, Shield } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync state with session
  useEffect(() => {
    if (session) {
      setName(session.user.name || "");
      setImage(session.user.image || "");
    }
  }, [session]);

  // Redirect if guest
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-violet-500 animate-spin mb-4"></div>
        <p className="text-zinc-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-zinc-400 max-w-md mb-6">
          You must be signed in to view your profile.
        </p>
        <Button as={Link} href="/auth/signin" color="primary">
          Go to Login
        </Button>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, error: updateErr } = await updateUser({
        name,
        image: image || undefined,
      });

      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess("Profile updated successfully!");
        if (refetch) {
          await refetch();
        } else {
          // Fallback if refetch is not available
          window.location.reload();
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Breadcrumb / Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-6 transition-colors"
        >
          ← Back to Dashboard
        </Link>

        <Card className="bg-zinc-950 border border-zinc-800 p-8 shadow-2xl">
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-zinc-900 pb-8">
            {/* Avatar Preview */}
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-2 border-violet-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-3xl font-extrabold border-2 border-violet-500">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="text-center md:text-left space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{name}</h1>
              <p className="text-zinc-500 text-sm">{session.user.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mt-2 text-xs font-semibold text-violet-400">
                <Shield size={12} />
                {session.user.role || "Collaborator"}
              </div>
            </div>
          </div>

          {/* Form Alert States */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-400 flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleUpdate} className="space-y-6">
            
            <Input
              label="Full Name"
              variant="bordered"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-white"
            />

            <Input
              label="Profile Image URL"
              placeholder="https://example.com/avatar.jpg"
              variant="bordered"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="text-white"
            />

            <Input
              label="Email Address (Cannot be changed)"
              variant="bordered"
              value={session.user.email}
              disabled
              className="opacity-50 text-zinc-500 cursor-not-allowed"
            />

            <Input
              label="Role (Cannot be changed)"
              variant="bordered"
              value={session.user.role || "Collaborator"}
              disabled
              className="opacity-50 text-zinc-500 cursor-not-allowed"
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-bold shadow-lg shadow-violet-500/10"
              isLoading={loading}
            >
              Update Profile
            </Button>
          </form>

        </Card>

      </div>
    </div>
  );
}
