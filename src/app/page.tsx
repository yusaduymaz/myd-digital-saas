import { Header, Footer } from "@/components/layout";
import { HeroSection, ServicesSection, FrameworkSection, CTASection } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <FrameworkSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
