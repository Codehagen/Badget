"use client";

import Image from "next/image";
import Link from "next/link";
import { Twitter } from "lucide-react";

interface AuthorProps {
  name: string;
  image: string;
  twitter?: string;
  bio?: string;
}

export function Author({ name, image, twitter, bio }: AuthorProps) {
  return (
    <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-lg border border-border">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="64px"
            onError={() => {
              // Handle image load error
            }}
          />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-foreground mb-1">{name}</h3>

        {twitter && (
          <Link
            href={`https://twitter.com/${twitter.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <Twitter className="w-4 h-4" />
            <span>@{twitter.replace("@", "")}</span>
          </Link>
        )}

        {bio && (
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        )}
      </div>
    </div>
  );
}
