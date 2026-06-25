import HeroSection from "@/components/HeroSection";
import FeaturedStartups from "@/components/FeaturedStartups";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";
import WhyJoinUs from "@/components/WhyJoinUs";
import Testimonials from "@/components/Testimonials";

export default function Home() {
  return (
    <div className="w-full bg-zinc-50 font-sans dark:bg-black">
      <HeroSection />
      <FeaturedStartups />
      <FeaturedOpportunities />
      <WhyJoinUs />
      <Testimonials />
    </div>
  );
}
