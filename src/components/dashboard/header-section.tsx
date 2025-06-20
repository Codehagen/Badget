import { Badge } from "@/components/ui/badge";
import { SeedDataButton } from "./seed-data-button";

export function HeaderSection() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <SeedDataButton />
          <span className="text-sm text-muted-foreground">Overview</span>
          <Badge
            variant="outline"
            className="bg-black text-white hover:bg-black/90"
          >
            Upgrade
          </Badge>
        </div>
      </div>
    </div>
  );
}
