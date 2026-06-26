"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import {
  Rocket,
  Briefcase,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react"


export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/banner.jpg')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-4xl">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md">
            <Rocket size={16} />
            <span className="text-sm text-violet-300">
              Build • Connect • Scale
            </span>
          </div>

          {/* Heading */}
          <motion.h1 className="text-5xl md:text-7xl font-bold leading-tight">
           Build The Next
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-purple-900 bg-clip-text text-transparent">
              Great Startup
            </span>
          </motion.h1>

          {/* Description */}
          <p className="mt-6 text-zinc-300 text-lg md:text-xl max-w-2xl leading-relaxed">
            StartupForge helps founders discover talented team
            members, connect with investors, and find exciting
            opportunities to bring ideas to life.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">

            <Button
              as={Link}
              href="/startups"
              size="lg"
              className="font-semibold bg-purple-900"
            >
              Browse Startups
            </Button>

            <Button
              as={Link}
              href="/opportunities"
              size="lg"
              variant="bordered"
              className="border-zinc-600 text-white"
            >
              Explore Opportunities
            </Button>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">

            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5">
              <Users className="mb-3 text-violet-400" />
              <h3 className="text-3xl font-bold">2K+</h3>
              <p className="text-zinc-400 text-sm">
                Active Members
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5">
              <Rocket className="mb-3 text-purple-900" />
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-zinc-400 text-sm">
                Startups
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5">
              <Briefcase className="mb-3 text-green-400" />
              <h3 className="text-3xl font-bold">1.5K+</h3>
              <p className="text-zinc-400 text-sm">
                Opportunities
              </p>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl p-5">
              <TrendingUp className="mb-3 text-orange-400" />
              <h3 className="text-3xl font-bold">120+</h3>
              <p className="text-zinc-400 text-sm">
                Successful Matches
              </p>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
}