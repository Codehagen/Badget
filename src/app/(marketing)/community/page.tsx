import { siteConfig } from "@/lib/config";
import Link from "next/link";

export default function CommunityPage() {
  const { discord, github, twitter, instagram } = siteConfig.links;
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5 space-y-6">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight">Join the Badget Community</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Connect with us and other users through our social channels.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href={discord} target="_blank" className="underline text-primary">
          Discord
        </Link>
        <Link href={github} target="_blank" className="underline text-primary">
          GitHub
        </Link>
        <Link href={twitter} target="_blank" className="underline text-primary">
          X
        </Link>
        <Link href={instagram} target="_blank" className="underline text-primary">
          Instagram
        </Link>
      </div>
    </main>
  );
}
