"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingCart, User, MapPin, Calendar, Package, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const navLinks = [
    { href: "/stores", label: "Дэлгүүрүүд", icon: MapPin },
    { href: "/planner", label: "Төлөвлөгөө", icon: Calendar },
    { href: "/orders", label: "Захиалгууд", icon: Package },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-xl font-bold text-foreground">ZamZuur</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <Link href="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.firstName.charAt(0)}
                </div>
                {user.firstName}
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button size="sm">
                <User className="mr-2 h-4 w-4" />
                Нэвтрэх
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container mx-auto space-y-3 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-3">
              {user ? (
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    Профайл ({user.firstName} {user.lastName})
                  </Link>
                  <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                    Гарах
                  </Button>
                </div>
              ) : (
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Нэвтрэх / Бүртгүүлэх
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
