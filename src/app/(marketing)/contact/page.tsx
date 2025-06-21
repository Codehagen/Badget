import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, HelpCircle, Github } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="flex flex-col items-center justify-center w-full relative px-5 md:px-10 py-20">
      <div className="border-x mx-5 md:mx-10 relative w-full max-w-4xl">
        {/* Decorative borders */}
        <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
        <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

        <div className="px-6 md:px-10 py-10 flex flex-col gap-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              How can we help?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get in touch for support, feedback, or questions about Badget.
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Support */}
            <div className="group p-8 border-r border-b border-border relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Support</h3>
                <p className="text-muted-foreground mb-8">
                  Chat with us about product support, resolve billing questions,
                  or provide feedback.
                </p>
              </div>
              <Button asChild className="w-fit">
                <a href={`mailto:${siteConfig.links.email}`}>Get support</a>
              </Button>
            </div>

            {/* Feedback */}
            <div className="group p-8 border-b border-border relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Feedback</h3>
                <p className="text-muted-foreground mb-8">
                  Share your thoughts, suggestions, or report issues with our
                  app.
                </p>
              </div>
              <Button asChild className="w-fit">
                <a href={`mailto:${siteConfig.links.email}?subject=Feedback`}>
                  Send Feedback
                </a>
              </Button>
            </div>

            {/* Help & FAQ */}
            <div className="group p-8 border-r border-border relative flex flex-col md:border-b-0">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Questions</h3>
                <p className="text-muted-foreground mb-8">
                  Read our help articles to find the answer to your question.
                </p>
              </div>
              <Button asChild className="w-fit" variant="outline">
                <Link href="/#faq">View Help Center</Link>
              </Button>
            </div>

            {/* Developer */}
            <div className="group p-8 relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Github className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Developer Docs</h3>
                <p className="text-muted-foreground mb-8">
                  Read about Badget platform development and contribute to our
                  codebase.
                </p>
              </div>
              <Button asChild className="w-fit" variant="outline">
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read docs
                </a>
              </Button>
            </div>
          </div>

          {/* Alternative Contact Methods */}
          <div className="text-center space-y-4 pt-8 border-t border-border">
            <h2 className="text-lg font-medium">Other Ways to Reach Us</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a
                  href={`mailto:${siteConfig.links.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {siteConfig.links.email}
                </a>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Follow us on Twitter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
