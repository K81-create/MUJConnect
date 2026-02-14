import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const path = location.pathname;

  // Define routes where Navbar should be hidden
  const hideNavbarRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
  ];

  const hideNavbarPrefixes = [
    "/admin",
    "/stakeholder",
  ];

  const shouldHideNavbar =
    hideNavbarRoutes.includes(path) ||
    hideNavbarPrefixes.some(prefix => path.startsWith(prefix));

  return (
    <div className="min-h-screen bg-slate-50">
      {!shouldHideNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
}
