"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, Heart, Menu, X, User, ChevronRight, HelpCircle, Package, LogOut, LogIn } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useFavoritesStore } from "@/store/favorites";
import { authClient } from "@/lib/auth/client";

const NAV_LINKS = [
  { label: "Men", href: "/products?gender=men" },
  { label: "Women", href: "/products?gender=women" },
  { label: "Kids", href: "/products?gender=unisex" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
] as const;

const MENU_LINKS = [
  { label: "New & Featured", href: "/products" },
  ...NAV_LINKS,
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const favCount = useFavoritesStore((s) => s.items.length);

  const { data: session } = authClient.useSession();
  const user = session?.user;

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
    setSearchOpen(false);
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-light-300 bg-light-100">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Link href="/" aria-label="Nike Home" className="flex items-center">
          <Image src="/logo.svg" alt="Nike" width={28} height={28} priority className="invert" />
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-body text-dark-900 transition-colors hover:text-dark-700"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 md:flex">
          <form onSubmit={handleSearch} className="relative" role="search">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-700" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className="w-40 rounded-full border border-light-300 bg-light-200 py-2 pl-9 pr-3 text-body text-dark-900 transition focus:w-56 focus:border-dark-500 focus:outline-none"
            />
          </form>

          <Link
            href="/favorites"
            aria-label="Favorites"
            className="relative flex items-center gap-1 text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            <Heart className="h-5 w-5" />
            {mounted && favCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-dark-900 px-1 text-[10px] text-light-100">
                {favCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-1 text-body text-dark-900 transition-colors hover:text-dark-700"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>My Cart ({mounted ? cartCount : 0})</span>
          </Link>

          {mounted && user ? (
            <div className="flex items-center gap-3">
              <Link href="/orders" className="text-body text-dark-900 transition-colors hover:text-dark-700">
                Orders
              </Link>
              <span className="text-body text-dark-900">Hi, {user.name?.split(" ")[0] || "there"}</span>
              <button
                onClick={handleSignOut}
                className="rounded-full border border-light-300 px-4 py-1.5 text-caption text-dark-900 transition hover:border-dark-500"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full bg-dark-900 px-4 py-1.5 text-caption text-light-100 transition hover:opacity-90"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setOpen(false);
            }}
            className="inline-flex items-center justify-center rounded-md p-2 text-dark-900"
          >
            <Search className="h-6 w-6" />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative inline-flex items-center justify-center rounded-md p-2 text-dark-900"
          >
            <ShoppingBag className="h-6 w-6" />
            {mounted && cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] text-light-100">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-dark-900"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => {
              setOpen((v) => !v);
              setSearchOpen(false);
            }}
          >
            <span className="sr-only">Toggle navigation</span>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile search bar (toggled by the search icon) */}
      <div className={`border-t border-light-300 bg-light-100 md:hidden ${searchOpen ? "block" : "hidden"}`}>
        <form onSubmit={handleSearch} className="relative px-4 py-3" role="search">
          <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-700" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search products"
            autoFocus={searchOpen}
            className="w-full rounded-full border border-light-300 bg-light-200 py-2 pl-9 pr-3 text-body text-dark-900 focus:border-dark-500 focus:outline-none"
          />
        </form>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-dark-900/40 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer panel */}
        <div
          className={`absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-light-100 shadow-xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-1 text-dark-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 px-6 pb-6">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-light-200">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-dark-700" />
              )}
            </div>
            <div>
              <p className="text-body-medium text-dark-900">
                Hi, {mounted && user ? user.name?.split(" ")[0] || "there" : "there"}
              </p>
              {mounted && user?.email ? (
                <p className="max-w-[200px] truncate text-caption text-dark-700">{user.email}</p>
              ) : (
                <Link href="/sign-in" onClick={() => setOpen(false)} className="text-caption text-dark-700 underline">
                  Sign in / Join us
                </Link>
              )}
            </div>
          </div>

          {/* Primary nav */}
          <nav className="px-6">
            {MENU_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-light-200 py-3 text-heading-3 text-dark-900"
              >
                <span>{l.label}</span>
                <ChevronRight className="h-5 w-5 text-dark-700" />
              </Link>
            ))}
            <a
              href="#"
              onClick={() => setOpen(false)}
              className="block py-3 text-heading-3 text-dark-900"
            >
              Download Nike App
            </a>
          </nav>

          {/* Secondary links */}
          <div className="mt-2 space-y-1 border-t border-light-300 px-6 py-4">
            <a href="#" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-body text-dark-900">
              <HelpCircle className="h-5 w-5 text-dark-700" /> Help
            </a>
            <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-body text-dark-900">
              <ShoppingBag className="h-5 w-5 text-dark-700" /> Bag ({mounted ? cartCount : 0})
            </Link>
            <Link href="/favorites" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-body text-dark-900">
              <Heart className="h-5 w-5 text-dark-700" /> Favourites ({mounted ? favCount : 0})
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-body text-dark-900">
              <Package className="h-5 w-5 text-dark-700" /> Orders
            </Link>
            {mounted && user ? (
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 py-2 text-left text-body text-dark-900"
              >
                <LogOut className="h-5 w-5 text-dark-700" /> Logout
              </button>
            ) : (
              <Link href="/sign-in" onClick={() => setOpen(false)} className="flex items-center gap-3 py-2 text-body text-dark-900">
                <LogIn className="h-5 w-5 text-dark-700" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
