import { ReactNode } from "react";
import { useLocation } from "wouter";
import { Header } from "./Header";
import Navigation from "./Navigation";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Don't show header and navigation on auth page
  const isAuthPage = location === "/auth";
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        {!isAuthPage && user && <Header />}
        {!isAuthPage && user && <Navigation />}
        <main className={`pb-8 ${isAuthPage ? "" : "mt-4"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
