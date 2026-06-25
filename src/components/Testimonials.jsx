import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Startup Founder",
    quote:
      "StartupForge helped me find a talented developer and designer within days. Our MVP was launched much faster than expected.",
  },
  {
    name: "Michael Tan",
    role: "Full Stack Developer",
    quote:
      "I joined StartupForge looking for experience and ended up becoming part of an exciting startup team.",
  },
  {
    name: "Emily Johnson",
    role: "Product Designer",
    quote:
      "The platform made it easy to connect with founders who truly valued collaboration and innovation.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">

          <span className="text-primary font-medium">
            TESTIMONIALS
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            What Our Community Says
          </h2>

          <p className="text-zinc-400 mt-6 max-w-2xl mx-auto">
            Entrepreneurs and collaborators are already building
            meaningful connections through StartupForge.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
            >

              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-zinc-300 italic mb-6">
                "{testimonial.quote}"
              </p>

              <div>
                <h4 className="font-semibold">
                  {testimonial.name}
                </h4>

                <p className="text-zinc-500 text-sm">
                  {testimonial.role}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}