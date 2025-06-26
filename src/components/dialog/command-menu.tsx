"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { AddAssetDialog } from "./add-asset-dialog";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command" />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setShowAddAsset(true);
                setOpen(false);
              }}
            >
              Add Investment Asset
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <AddAssetDialog open={showAddAsset} onOpenChange={setShowAddAsset} />
    </>
  );
}
