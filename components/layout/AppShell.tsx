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
  const isPublicPage =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/about/" ||
    pathname === "/methods" ||
    pathname === "/methods/" ||
    pathname === "/methods/4gram" ||
    pathname === "/methods/4gram/";

  if (isPublicPage) {
    return (
      <>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="h-screen flex-1 min-w-0 overflow-y-auto print:h-auto print:overflow-visible">
        <div className="flex min-h-full flex-col print:block print:min-h-0">
          <main className="flex-1 pt-14 lg:pt-0 print:block print:p-0">{children}</main>
          <Footer className="mt-0 flex h-16 shrink-0 items-center py-0 print:hidden" />
        </div>
      </div>
    </div>
  );
}
