import type { ReactNode } from "react";
import { Navbar } from "./Navbar.js";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
