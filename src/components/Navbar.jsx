"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { useSession, signOut } from "@/lib/auth.client";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const handleLogout = async () => {
    await signOut({
      onSuccess: () => {
        window.location.href = "/";
      }
    });
  };

  const getMenuItems = () => {
    const items = [
      { name: "Home", href: "/" },
      { name: "Browse Startups", href: "/startups" },
      { name: "Browse Opportunities", href: "/opportunities" },
    ];
    if (session) {
      items.push({ name: "Dashboard", href: "/dashboard" });
      items.push({ name: "Profile", href: "/profile" });
    } else {
      items.push({ name: "Login", href: "/auth/signin" });
      items.push({ name: "Register", href: "/auth/signup" });
    }
    return items;
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl text-white"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500" />
            StartupForge
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-8">
          <Link href="/" className="text-zinc-300 hover:text-white text-sm font-medium">
            Home
          </Link>
          <Link
            href="/startups"
            className="text-zinc-300 hover:text-white text-sm font-medium"
          >
            Browse Startups
          </Link>
          <Link
            href="/opportunities"
            className="text-zinc-300 hover:text-white text-sm font-medium"
          >
            Browse Opportunities
          </Link>
          {session && (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-300 hover:text-white text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-zinc-300 hover:text-white text-sm font-medium"
              >
                Profile
              </Link>
            </>
          )}
        </div>

        {/* Login / User Status */}
        <div className="flex items-center">
          <div className="hidden sm:block">
            {isPending ? (
              <div className="w-8 h-8 rounded-full border border-zinc-800 animate-pulse bg-zinc-900" />
            ) : session ? (
              <div className="flex items-center gap-3">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-zinc-300 text-sm font-medium hidden md:inline-block">
                  {session.user.name}
                </span>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button
                    color="default"
                    variant="light"
                    size="sm"
                    className="text-zinc-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    color="primary"
                    variant="shadow"
                    size="sm"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-4 space-y-3 absolute top-16 left-0 w-full shadow-lg">
          {getMenuItems().map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-2 text-base text-zinc-300 hover:text-white"
              >
                {item.name}
              </Link>
            </div>
          ))}
          {session && (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="block w-full py-2 text-left text-base text-red-400 hover:text-red-300 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}