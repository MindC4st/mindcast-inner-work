// CommerceSection — the admin Commerce area with its own sub-navigation:
// Dashboard · Orders · Products · Inventory · Fulfilment · Customers ·
// Discounts · Reports · Settings.
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import CommerceDashboard from "./CommerceDashboard";
import CommerceOrders from "./CommerceOrders";
import CommerceProducts from "./CommerceProducts";
import CommerceInventory from "./CommerceInventory";
import CommerceFulfilment from "./CommerceFulfilment";
import CommerceCustomers from "./CommerceCustomers";
import CommerceDiscounts from "./CommerceDiscounts";
import CommerceReports from "./CommerceReports";
import CommerceSettings from "./CommerceSettings";

const SUBTABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "inventory", label: "Inventory" },
  { id: "fulfilment", label: "Fulfilment" },
  { id: "customers", label: "Customers" },
  { id: "discounts", label: "Discounts" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
] as const;

type SubId = (typeof SUBTABS)[number]["id"];

const CommerceSection = () => {
  const [search, setSearch] = useSearchParams();
  const subParam = search.get("commerce") as SubId | null;
  const [sub, setSub] = useState<SubId>(
    subParam && SUBTABS.some((t) => t.id === subParam) ? subParam : "dashboard",
  );

  const change = (id: SubId) => {
    setSub(id);
    const next = new URLSearchParams(search);
    next.set("commerce", id);
    setSearch(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SUBTABS.map((t) => (
          <button
            key={t.id}
            onClick={() => change(t.id)}
            className={`px-3 py-1.5 text-[11px] font-body tracking-widest uppercase rounded-sm whitespace-nowrap transition-colors ${
              sub === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "dashboard" && <CommerceDashboard />}
      {sub === "orders" && <CommerceOrders />}
      {sub === "products" && <CommerceProducts />}
      {sub === "inventory" && <CommerceInventory />}
      {sub === "fulfilment" && <CommerceFulfilment />}
      {sub === "customers" && <CommerceCustomers />}
      {sub === "discounts" && <CommerceDiscounts />}
      {sub === "reports" && <CommerceReports />}
      {sub === "settings" && <CommerceSettings />}
    </div>
  );
};

export default CommerceSection;
