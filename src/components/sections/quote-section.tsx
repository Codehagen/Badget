 
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";

export function QuoteSection() {
  const { quoteSection } = siteConfig;

  return (
    <section
      id="quote"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        {/* Section Header */}
        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance">
            <span className="text-muted-foreground">
              {quoteSection.subtitle}
            </span>{" "}
            {quoteSection.title}
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            {quoteSection.description}
          </p>
        </SectionHeader>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3 justify-center pb-8 flex-wrap">
          <Button asChild className="pr-2">
            <Link href={quoteSection.primaryButton.href}>
              {quoteSection.primaryButton.text}
              <ChevronRight
                strokeWidth={2.5}
                className="size-3.5! opacity-50"
              />
            </Link>
          </Button>
          <Button asChild variant="outline" className="pl-2.5">
            <Link href={quoteSection.secondaryButton.href}>
              <Calendar className="!size-3.5 opacity-50" strokeWidth={2.5} />
              {quoteSection.secondaryButton.text}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
