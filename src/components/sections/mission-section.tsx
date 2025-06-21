import { SectionHeader } from "@/components/section-header";
import { Heart, Shield, Users, Lightbulb } from "lucide-react";

export function MissionSection() {
  return (
    <section
      id="mission"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            We care deeply about the human side of money
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Our philosophy is built on transparency, family values, and creating
            lasting financial wellness for everyone.
          </p>
        </SectionHeader>

        <div className="px-6 md:px-10 pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Core Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Family First</h3>
                <p className="text-sm text-muted-foreground">
                  We design every feature with families in mind, making
                  financial management collaborative and inclusive for all
                  family members.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Your financial data is sacred. We use bank-level security and
                  give you complete control over your information with full
                  transparency.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Community Driven</h3>
                <p className="text-sm text-muted-foreground">
                  We build in the open, listen to our community, and believe
                  that the best financial tools come from real user feedback and
                  collaboration.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Innovation</h3>
                <p className="text-sm text-muted-foreground">
                  We leverage cutting-edge AI and modern technology to make
                  personal finance more intuitive, predictive, and helpful than
                  ever before.
                </p>
              </div>
            </div>

            {/* Philosophy Statement */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 border border-primary/10">
              <div className="max-w-3xl mx-auto space-y-6 text-center">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Money is personal, family is everything
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  We believe that financial wellness isn&apos;t just about
                  numbers in a spreadsheet. It&apos;s about reducing stress,
                  building confidence, and creating opportunities for families
                  to thrive together. Every feature we build, every decision we
                  make, is guided by our commitment to making money management
                  more human, more accessible, and more meaningful.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">1000+</div>
                    <div className="text-sm text-muted-foreground">
                      Families served
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">$2M+</div>
                    <div className="text-sm text-muted-foreground">
                      Money managed
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-sm text-muted-foreground">
                      User satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
