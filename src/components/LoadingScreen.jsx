"use client";

import { motion } from "motion/react";

const dot = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  backgroundColor: "#8b5cf6",
  willChange: "transform",
};

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={dot}
            animate={{ y: -30 }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              delay: i * 0.2 - 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
