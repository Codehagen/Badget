"use client";

import { useState, useEffect, useMemo } from "react";
import { allHelps } from "content-collections";
import Fuse from "fuse.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface HelpSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Prepare help articles for search
const searchableHelps = allHelps.map((article) => ({
  ...article,
  // Combine all searchable text
  searchText: `${article.title} ${article.description} ${article.summary || ""} ${
    article.tags?.join(" ") || ""
  }`.toLowerCase(),
}));

// Configure Fuse.js options
const fuseOptions = {
  keys: [
    { name: "title", weight: 0.4 },
    { name: "description", weight: 0.3 },
    { name: "summary", weight: 0.2 },
    { name: "searchText", weight: 0.1 },
    { name: "tags", weight: 0.1 },
  ],
  threshold: 0.3, // Lower = more strict matching
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
};

export function HelpSearchDialog({ open, onOpenChange }: HelpSearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Initialize Fuse.js
  const fuse = useMemo(() => new Fuse(searchableHelps, fuseOptions), []);

  // Perform search when query changes
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults = fuse.search(query).slice(0, 8); // Limit to 8 results
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, fuse]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            const slug = results[selectedIndex].item.slug;
            window.location.href = `/help/${slug}`;
            onOpenChange(false);
          }
          break;
        case "Escape":
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, selectedIndex, onOpenChange]);

  // Handle result click
  const handleResultClick = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Help Articles
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim().length === 0 && (
            <div className="px-6 py-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search help articles...</p>
            </div>
          )}

          {query.trim().length > 0 && results.length === 0 && (
            <div className="px-6 py-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No articles found for "{query}"</p>
              <p className="text-sm mt-2">Try searching with different keywords</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="px-6 pb-6">
              <div className="text-sm text-muted-foreground mb-4">
                Found {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
                                            <div className="divide-y divide-border">
                 {results.map((result, index) => {
                   const article = result.item;
                   const isSelected = index === selectedIndex;
                   return (
                     <Link
                       key={article.slug}
                       href={`/help/${article.slug}`}
                       onClick={handleResultClick}
                       className={`block p-4 transition-all duration-200 group outline-none ${
                         isSelected 
                           ? "bg-accent text-accent-foreground ring-2 ring-ring" 
                           : "hover:bg-accent hover:text-accent-foreground"
                       }`}
                     >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title */}
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                            {article.title}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.description}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(new Date(article.publishedAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.readingTime}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {article.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {article.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{article.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with shortcuts */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border rounded text-xs">Enter</kbd>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border rounded text-xs">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
            <div>
              Press <kbd className="px-2 py-1 bg-background border rounded text-xs">Ctrl H</kbd> to search
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}