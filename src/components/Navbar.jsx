"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Browse Startups",
      href: "/startups",
    },
    {
      name: "Browse Opportunities",
      href: "/opportunities",
    },
    {
      name: "Login",
      href: "/login",
    },
  ];

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
        </div>

        {/* Login Button */}
        <div className="flex items-center">
          <div className="hidden sm:block">
            <Button
              as={Link}
              href="/login"
              color="primary"
              variant="shadow"
            >
              Login
            </Button>
          </div>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-4 space-y-3 absolute top-16 left-0 w-full shadow-lg">
          {menuItems.map((item) => (
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
        </div>
      )}
    </nav>
  );
}