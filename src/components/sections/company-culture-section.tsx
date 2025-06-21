import { SectionHeader } from "@/components/section-header";

export function CompanyCultureSection() {
  // Placeholder images for development - replace with actual company photos
  const cultureImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
      alt: "Team collaboration",
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
      alt: "Office workspace",
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop",
      alt: "Team meeting",
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=400&h=300&fit=crop",
      alt: "Development work",
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
      alt: "Team building",
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop",
      alt: "Remote work",
    },
    {
      id: 7,
      src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
      alt: "Planning session",
    },
    {
      id: 8,
      src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
      alt: "Coding session",
    },
    {
      id: 9,
      src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
      alt: "Team celebration",
    },
  ];

  return (
    <section
      id="culture"
      className="flex flex-col items-center justify-center w-full relative px-5 md:px-10"
    >
      <div className="border-x mx-5 md:mx-10 relative">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <SectionHeader>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1">
            Life at Badget
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            We&apos;re builders from all corners of the world who come together
            to build the next, but we don&apos;t know where to ship because when
            the build is coming closer to ship.
          </p>
        </SectionHeader>

        <div className="px-6 md:px-10 pb-10">
          <div className="max-w-6xl mx-auto">
            {/* Culture Description */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Building the future of personal finance requires a diverse,
                passionate team that understands the real challenges families
                face with money. Our remote-first culture brings together
                developers, designers, and financial experts from around the
                world, united by our mission to make financial wellness
                accessible to everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">🌍 Remote First</h3>
                  <p className="text-sm text-muted-foreground">
                    Work from anywhere while staying connected with our global
                    team
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">⚡ Fast Moving</h3>
                  <p className="text-sm text-muted-foreground">
                    Ship early, iterate quickly, and learn from our community
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">🤝 Open Source</h3>
                  <p className="text-sm text-muted-foreground">
                    Build in the open with transparency and community
                    collaboration
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cultureImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`
                    relative overflow-hidden rounded-xl group cursor-pointer transition-all duration-300 hover:scale-105
                    ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}
                    ${index === 4 ? "md:col-span-2" : ""}
                  `}
                >
                  <div className="relative w-full h-48 md:h-64 bg-secondary/20">
                    {/* Placeholder for actual images */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20 border border-border/50">
                      <div className="text-center space-y-2">
                        <div className="text-2xl opacity-50">📸</div>
                        <p className="text-xs text-muted-foreground px-4">
                          {image.alt}
                        </p>
                      </div>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Join Team CTA */}
            <div className="text-center mt-12 space-y-4">
              <h3 className="text-xl font-semibold">
                Want to join our mission?
              </h3>
              <p className="text-muted-foreground">
                We&apos;re always looking for passionate people who want to make
                personal finance better for families everywhere.
              </p>
              <div className="pt-4">
                <a
                  href="/open"
                  className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
                >
                  View open positions →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
