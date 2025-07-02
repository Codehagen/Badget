"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { IconTable } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface EnhancedTableOfContentsProps {
  className?: string;
}

export function EnhancedTableOfContents({
  className,
}: EnhancedTableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
    itemRefs.current = new Array(items.length).fill(null);
  }, []);

  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      // Find the current section
      let currentId = "";
      let currentIndex = 0;

      for (let i = 0; i < tocItems.length; i++) {
        const item = tocItems[i];
        const element = document.getElementById(item.id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            currentId = item.id;
            currentIndex = i;
          }
        }
      }

      setActiveId(currentId);
      setActiveIndex(currentIndex);
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

  const getActiveItemPosition = () => {
    const activeItem = itemRefs.current[activeIndex];
    if (activeItem) {
      return {
        top: activeItem.offsetTop,
        height: activeItem.offsetHeight,
      };
    }
    return { top: 0, height: 0 };
  };

  if (tocItems.length === 0) {
    return null;
  }

  const { top, height } = getActiveItemPosition();

  return (
    <div className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
        <IconTable className="w-4 h-4" />
        <span>On this page</span>
      </div>

      {/* Navigation with animated line */}
      <div className="relative">
        {/* Animated line indicator */}
        <motion.div
          className="absolute left-0 w-0.5 bg-foreground rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            top: top,
            height: height,
            opacity: activeId ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 30,
          }}
        />

        {/* Static line background */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />

        {/* Navigation items */}
        <nav className="space-y-1 max-h-96 overflow-y-auto pl-4">
          {tocItems.map((item, index) => (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "block w-full text-left text-sm py-2 transition-colors text-muted-foreground hover:text-foreground",
                activeId === item.id && "text-foreground font-medium",
                item.level === 1 && "font-medium",
                item.level === 2 && "pl-3",
                item.level === 3 && "pl-6 text-xs",
                item.level === 4 && "pl-9 text-xs",
                item.level >= 5 && "pl-12 text-xs"
              )}
            >
              <span className="line-clamp-2">{item.text}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
