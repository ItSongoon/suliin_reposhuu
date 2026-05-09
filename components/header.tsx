"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, X, ShoppingCart, User, MapPin, Calendar, Package, UserCircle, Store, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const navLinks = [
    { href: "/stores", label: "Дэлгүүрүүд", icon: MapPin },
    { href: "/planner", label: "Төлөвлөгөө", icon: Calendar },
    { href: "/orders", label: "Захиалгууд", icon: Package },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 md:px-6">
      <header className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between rounded-full border border-border/50 bg-secondary/80 px-4 shadow-sm backdrop-blur-md md:px-6">
        {/* Logo */}
        <div className="flex w-auto items-center md:w-[200px]">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white border border-border/50">
              <Image src="/logo.png" alt="ZamZuur Logo" fill className="object-contain p-0.5" />
            </div>
            <span className="hidden text-lg font-bold text-foreground md:inline-block">ZamZuur</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden w-auto items-center justify-end gap-2 md:flex md:w-[200px]">
          <Link href="/cart" className="relative mr-2">
            <Button variant="ghost" size="icon" className="rounded-full">
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
              <Button variant="outline" size="sm" className="gap-2 rounded-full">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.firstName.charAt(0)}
                </div>
                <span className="hidden lg:inline-block">{user.firstName}</span>
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/partner/auth">
                <Button variant="ghost" size="sm" className="hidden rounded-full lg:flex">
                  <Store className="mr-2 h-4 w-4" />
                  Байгууллага
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm" className="rounded-full">
                  <User className="mr-2 h-4 w-4" />
                  Нэвтрэх
                </Button>
              </Link>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-full">
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
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute left-4 right-4 top-[72px] rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur md:hidden">
          <div className="space-y-3 p-4">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-border pt-3">
              {user ? (
                <div className="space-y-3">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    Профайл ({user.firstName} {user.lastName})
                  </Link>
                  <Button variant="outline" size="sm" className="w-full rounded-full" onClick={logout}>
                    Гарах
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 px-3">
                  <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full rounded-full" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Нэвтрэх / Бүртгүүлэх
                    </Button>
                  </Link>
                  <Link href="/partner/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full" size="sm">
                      <Store className="mr-2 h-4 w-4" />
                      Байгууллагын систем
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
