import React from "react";
import Link from "next/link";
import ClientProvider from "@/components/ClientProvider";
import StockDashboard from "@/components/StockDashboard";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Bypass authentication for now - directly show stock dashboard
  const mockUser = {
    name: "Demo User",
    email: "demo@example.com"
  };

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ClientProvider>
        {/* Full-width Trading Dashboard */}
        <div className="h-full w-full">
          <StockDashboard user={mockUser} />
        </div>
      </ClientProvider>
    </div>
  );
}
