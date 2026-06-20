import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const Github = ({ size = 24, className = "" }) => (
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
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = ({ size = 24, className = "" }) => (
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Twitter = ({ size = 24, className = "" }) => (
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
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo Section */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500" />
              <span className="font-bold text-xl text-white">
                StartupForge
              </span>
            </Link>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Connect founders, developers, designers, marketers,
              and investors to build the next generation of startups.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-zinc-400 hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/startups"
                  className="text-zinc-400 hover:text-white"
                >
                  Browse Startups
                </Link>
              </li>

              <li>
                <Link
                  href="/opportunities"
                  className="text-zinc-400 hover:text-white"
                >
                  Opportunities
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-zinc-400 hover:text-white"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Social Links
            </h3>

            <div className="flex gap-4">
              <Link
                href="#"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800"
              >
                <Github size={18} />
              </Link>

              <Link
                href="#"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800"
              >
                <Linkedin size={18} />
              </Link>

              <Link
                href="#"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800"
              >
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <div className="space-y-4 text-zinc-400">

              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>contact@startupforge.com</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={18} />
                <span>Global Remote Platform</span>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800 mt-10 pt-6 text-center">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} StartupForge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}