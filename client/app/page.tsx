import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import LandingTicker from "@/components/landing/LandingTicker";
import LandingProblem from "@/components/landing/LandingProblem";
import LandingSecurity from "@/components/landing/LandingSecurity";
import LandingPlatform from "@/components/landing/LandingPlatform";
import LandingMission from "@/components/landing/LandingMission";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Page() {
  return (
    <div className="bg-[#06090f] text-white font-sans antialiased">
      <LandingNav />
      <LandingHero />
      <LandingTicker />
      <LandingProblem />
      <LandingSecurity />
      <LandingPlatform />
      <LandingMission />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
