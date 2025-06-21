import { Button } from "@/components/ui/button";
import { Github, Twitter } from "lucide-react";
import Link from "next/link";
import BlurImage from "@/lib/blur-image";

export function FounderSection() {
  return (
    <section
      id="founder"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <div className="px-6 md:px-10 py-10">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Founder Image/Video Section */}
            <div className="flex flex-col items-center space-y-8">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-2 border-border">
                  <BlurImage
                    src="/author.png"
                    alt="Christer Hagen - Founder & CEO"
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="text-center space-y-4 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                  We&apos;re on a mission to reimagine personal finance for the
                  modern family.
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  After struggling with traditional budgeting apps that
                  didn&apos;t work for families, I decided to build something
                  better. Badget combines AI-powered insights with
                  family-focused design to make financial management intuitive
                  and collaborative.
                </p>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="bg-secondary/5 rounded-2xl p-8 md:p-12 border border-border/50">
              <div className="space-y-6 text-center">
                <h3 className="text-2xl md:text-3xl font-semibold">
                  Building the future of family finances
                </h3>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                  We believe that managing money shouldn&apos;t be stressful or
                  complicated. Through AI-powered insights, real-time tracking,
                  and family-centered design, we&apos;re creating tools that
                  help families build better financial habits and achieve their
                  goals together.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="https://github.com/codehagen" target="_blank">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="https://x.com/codehagen" target="_blank">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
