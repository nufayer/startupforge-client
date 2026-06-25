import {
  Rocket,
  Users,
  Briefcase,
  Lightbulb,
} from "lucide-react";

const features = [
  {
    icon: Rocket,
    title: "Launch Your Startup",
    description:
      "Transform your ideas into reality by connecting with talented individuals who share your vision.",
  },
  {
    icon: Users,
    title: "Find the Right Team",
    description:
      "Meet developers, designers, marketers, and business professionals ready to collaborate.",
  },
  {
    icon: Briefcase,
    title: "Explore Opportunities",
    description:
      "Discover exciting startup projects and roles that match your skills and ambitions.",
  },
  {
    icon: Lightbulb,
    title: "Grow Through Innovation",
    description:
      "Work alongside passionate entrepreneurs and gain valuable real-world startup experience.",
  },
];

export default function WhyJoinSection() {
  return (
    <section className="py-24 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <span className="text-primary font-medium">
            WHY STARTUPFORGE
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Why Join StartupForge?
          </h2>

          <p className="text-zinc-400 mt-6 max-w-2xl mx-auto">
            StartupForge brings founders and talented individuals
            together in one place to build, collaborate, and grow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Icon
                    size={28}
                    className="text-primary"
                  />
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>

                <p className="text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}