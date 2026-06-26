"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Home, Search, Rocket } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6">

      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right,#27272a 1px,transparent 1px),linear-gradient(to bottom,#27272a 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-3xl text-center">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30">
            <Rocket size={40} />
          </div>
        </div>

        {/* 404 */}
        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-8xl font-extrabold text-transparent md:text-9xl">
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-6 text-3xl font-bold text-white md:text-5xl">
          Startup Not Found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Looks like this page never made it out of the prototype stage.
          The route you're looking for doesn't exist or may have been moved.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

          <Link href="/">
            <Button
              color="primary"
              size="lg"
              startContent={<Home size={18} />}
            >
              Back to Home
            </Button>
          </Link>

          <Link href="/startups">
            <Button
              variant="bordered"
              size="lg"
              className="border-zinc-700 text-white"
              startContent={<Search size={18} />}
            >
              Browse Startups
            </Button>
          </Link>

        </div>

        {/* Divider */}
        <div className="my-14 h-px w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

        {/* Fun Quote */}
        <p className="text-sm italic text-zinc-500">
          "Every successful startup starts by finding the right direction."
        </p>

      </div>

    </section>
  );
}