import { DataTable } from "@/components/data-table";

import data from "./data.json";
import CardSection from "@/components/dashboard/card-section";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <CardSection />
      </div>
      <DataTable data={data} />
    </div>
  );
}
