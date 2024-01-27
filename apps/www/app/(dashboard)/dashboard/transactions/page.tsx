import { cookies } from "next/headers";

import { isValidJSONString } from "@/lib/utils";
import { TransactionsDashboard } from "@/components/transactions/components/transactions-dashboard";
import { accounts, mails } from "@/components/transactions/data";

export const metadata = {
  title: "Transactions",
  description: "Transactions description",
};

export default async function DashboardPage() {
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;
  return (
    <>
      <div className="flex flex-col">
        <TransactionsDashboard
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
        />
      </div>
    </>
  );
}
