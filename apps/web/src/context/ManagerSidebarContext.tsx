'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ManagerSidebarContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const ManagerSidebarContext = createContext<ManagerSidebarContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobile: () => {},
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export function ManagerSidebarProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile drawer when navigating between pages
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <ManagerLayoutProviderInner
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      toggleMobile={toggleMobile}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      toggleCollapsed={toggleCollapsed}
    >
      {children}
    </ManagerLayoutProviderInner>
  );
}

function ManagerLayoutProviderInner({
  children,
  mobileOpen,
  setMobileOpen,
  toggleMobile,
  collapsed,
  setCollapsed,
  toggleCollapsed,
}: {
  children: React.ReactNode;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}) {
  return (
    <ManagerSidebarContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        toggleMobile,
        collapsed,
        setCollapsed,
        toggleCollapsed,
      }}
    >
      {children}
    </ManagerSidebarContext.Provider>
  );
}

export function useManagerSidebar() {
  return useContext(ManagerSidebarContext);
}
