// components/layout/AppShell.tsx
// Decides whether to render the sidebar based on the current route.
// The home page ("/") gets no chrome — the sidebar appears the moment
// the user enters the workflow (Start Demo / Run Full Demo).
"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="h-screen flex-1 min-w-0 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          <main className="flex-1 pt-14 lg:pt-0">{children}</main>
          <Footer className="mt-0 flex h-16 shrink-0 items-center py-0" />
        </div>
      </div>
    </div>
  );
}
