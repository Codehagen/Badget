"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export function TableOfContents({ className }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from the article
    const article = document.querySelector("article");
    if (!article) return;

    const headings = article.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const items: TocItem[] = [];

    headings.forEach((heading) => {
      const id = heading.id;
      const text = heading.textContent || "";
      const level = parseInt(heading.tagName.charAt(1));

      if (id && text) {
        items.push({ id, text, level });
      }
    });

    setTocItems(items);
  }, []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      // Find the current section
      let currentId = "";
      for (const item of tocItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentId = item.id;
          }
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Set initial active item

    return () => window.removeEventListener("scroll", handleScroll);
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for fixed header
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className="text-sm font-semibold text-foreground mb-4 px-3">
        Table of Contents
      </div>
      
      <nav className="space-y-1 max-h-96 overflow-y-auto">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToHeading(item.id)}
            className={cn(
              "block w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
              "hover:bg-muted hover:text-foreground",
              activeId === item.id
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground border-l-2 border-transparent",
              item.level === 1 && "font-medium",
              item.level === 2 && "pl-6",
              item.level === 3 && "pl-9 text-xs",
              item.level === 4 && "pl-12 text-xs",
              item.level >= 5 && "pl-15 text-xs"
            )}
          >
            <span className="line-clamp-2">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}