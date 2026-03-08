"use client";

import { ReactNode } from "react";
import BottomNav from "./BottomNav";

interface Props {
  children: ReactNode;
  hideNav?: boolean;
}

export default function AppShell({ children, hideNav }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className={hideNav ? "" : "pb-nav"}>
        {children}
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
