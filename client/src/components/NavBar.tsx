import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";

export default function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/coach", label: "AI Coach" },
        { href: "/training", label: "Training" },
        { href: "/wellness", label: "Wellness" },
        { href: "/community", label: "Community" },
        { href: "/analytics", label: "Analytics" },
        { href: "/content-library", label: "Resources" },
        { href: "/leaderboard", label: "Leaderboard" },
      ]
    : [
        { href: "/#features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"}>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-shadow">
              <Zap className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Clutch
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`text-sm font-medium transition-colors cursor-pointer ${
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-foreground">
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <a href={getLoginUrl()}>Sign in</a>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/20" asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`block py-2 text-sm font-medium cursor-pointer ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="pt-2 border-t border-border/50 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={() => logout()}>Sign out</Button>
              ) : (
                <>
              <Button variant="ghost" size="sm" asChild><a href={getLoginUrl()}>Sign in</a></Button>
              <Button size="sm" className="bg-primary text-primary-foreground" asChild>
                <a href={getLoginUrl()}>Get Started Free</a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
