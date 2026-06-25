import HeroSection from "@/components/HeroSection";
import FeaturedStartups from "@/components/FeaturedStartups";
import FeaturedOpportunities from "@/components/FeaturedOpportunities";

export default function Home() {
  return (
    <div className="w-full bg-zinc-50 font-sans dark:bg-black">
      <HeroSection />
      <FeaturedStartups />
      <FeaturedOpportunities />
    </div>
  );
}
