import { SectionHeader } from "@/components/section-header";

export function WhatIsBadgetSection() {
  return (
    <section
      id="what-is-badget"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            What is Badget?
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Badget is a modern, open-source AI-powered personal finance
            platform. We power smart budgets, spending insights, and predictive
            analytics tailored for 1,000+ families globally.
          </p>
        </SectionHeader>

        <div className="px-6 md:px-10 pb-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Our advanced AI algorithms analyze your spending patterns,
                  predict future expenses, and provide personalized
                  recommendations to help you achieve your financial goals
                  faster.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Family-First Design</h3>
                <p className="text-muted-foreground">
                  Built specifically for families, Badget helps you manage
                  shared expenses, set family budgets, and teach financial
                  literacy to the next generation through intuitive tools and
                  dashboards.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Real-Time Tracking</h3>
                <p className="text-muted-foreground">
                  Connect your accounts and get instant insights into your
                  spending. Our platform automatically categorizes transactions
                  and provides real-time budget tracking to keep you on track.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Open Source</h3>
                <p className="text-muted-foreground">
                  We believe in transparency and community-driven development.
                  Our platform is open source, ensuring security, privacy, and
                  the ability to customize to your needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
