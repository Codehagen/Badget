import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutHeroSection() {
  return (
    <section id="about-hero" className="w-full relative">
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0 -z-10 h-[600px] md:h-[800px] w-full [background:radial-gradient(125%_125%_at_50%_10%,var(--background)_40%,var(--secondary)_100%)] rounded-b-xl"></div>
        </div>
        <div className="relative z-10 pt-32 max-w-4xl mx-auto h-full w-full flex flex-col gap-10 items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tighter text-balance text-center text-primary">
              A dedicated team committed to powering your
              <span className="text-primary"> financial growth</span> with the
              ultimate budgeting tools.
            </h1>
            <p className="text-base md:text-lg text-center text-muted-foreground font-medium text-balance leading-relaxed tracking-tight max-w-2xl">
              We&apos;re building the all-in-one AI attribution platform for
              modern personal finance teams.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button asChild size="lg">
              <Link href="#founder">Meet our team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
