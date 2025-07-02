"use client";

import { useEffect } from "react";

interface UseSearchShortcutProps {
  onOpenSearch: () => void;
}

export function useSearchShortcut({ onOpenSearch }: UseSearchShortcutProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        onOpenSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onOpenSearch]);
}