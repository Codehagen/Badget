import { siteConfig } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5">
      <div className="border-x mx-5 md:mx-10 relative w-full max-w-3xl">
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="px-6 md:px-10 py-10 flex flex-col items-center gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Contact Us</h1>
            <p className="text-muted-foreground">Have questions or need help? Send us a message.</p>
          </div>
          <form className="grid gap-4 w-full max-w-md mx-auto">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <textarea id="message" className="min-h-[120px] p-2 border rounded-md" placeholder="How can we help?" />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
          <p className="text-muted-foreground text-sm text-center">
            Or email us directly at{' '}
            <a href={`mailto:${siteConfig.links.email}`} className="underline">
              {siteConfig.links.email}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
