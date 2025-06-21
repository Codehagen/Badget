import { siteConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageCircle, Instagram } from "lucide-react";

export default function CommunityPage() {
  const { discord, github, twitter, instagram } = siteConfig.links;

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
              Join the Badget Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with us and other users through our social channels. Get
              support, share feedback, and stay updated on the latest features.
            </p>
          </div>

          {/* Community Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Discord */}
            <div className="group p-8 border-r border-b border-border relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Discord Community
                </h3>
                <p className="text-muted-foreground mb-8">
                  Join our Discord server to chat with other users, get help,
                  and participate in discussions about personal finance.
                </p>
              </div>
              <Button asChild className="w-fit">
                <a href={discord} target="_blank" rel="noopener noreferrer">
                  Join Discord
                </a>
              </Button>
            </div>

            {/* GitHub */}
            <div className="group p-8 border-b border-border relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Github className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Open Source</h3>
                <p className="text-muted-foreground mb-8">
                  Contribute to our codebase, report issues, or explore how
                  Badget is built. We welcome all contributions!
                </p>
              </div>
              <Button asChild className="w-fit" variant="outline">
                <a href={github} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </div>

            {/* Twitter */}
            <div className="group p-8 border-r border-border relative flex flex-col md:border-b-0">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Twitter className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Twitter Updates</h3>
                <p className="text-muted-foreground mb-8">
                  Follow us for product updates, financial tips, and
                  behind-the-scenes content from the Badget team.
                </p>
              </div>
              <Button asChild className="w-fit" variant="outline">
                <a href={twitter} target="_blank" rel="noopener noreferrer">
                  Follow us
                </a>
              </Button>
            </div>

            {/* Instagram */}
            <div className="group p-8 relative flex flex-col">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Instagram className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instagram</h3>
                <p className="text-muted-foreground mb-8">
                  Get inspired with financial tips, user stories, and visual
                  content to help you on your money journey.
                </p>
              </div>
              <Button asChild className="w-fit" variant="outline">
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  Follow us
                </a>
              </Button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center space-y-4 pt-8 border-t border-border">
            <h2 className="text-lg font-medium">Stay Connected</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We&apos;re building Badget in the open and love hearing from our
              community. Whether you have questions, feedback, or just want to
              say hello, we&apos;re here to help!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
