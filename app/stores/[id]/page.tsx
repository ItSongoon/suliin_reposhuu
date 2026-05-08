"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Clock, Phone, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-context";
import type { Store, Product } from "@/lib/types";
import storesData from "@/data/stores.json";

const categoryLabels: Record<string, string> = {
  supermarket: "Дэлгүүр",
  coffee: "Кофе шоп",
  food: "Хоол",
};

function StoreDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { itemCount, total } = useCart();

  useEffect(() => {
    // Find store from local data
    const foundStore = storesData.stores.find((s) => s.id === resolvedParams.id);
    setStore(foundStore || null);

    // Fetch products for this store
    const fetchProducts = async () => {
      try {
        const response = await fetch(`/api/products?storeId=${resolvedParams.id}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [resolvedParams.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("mn-MN").format(price) + "₮";
  };

  const isOpen = () => {
    if (!store) return false;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return currentTime >= store.openTime && currentTime <= store.closeTime;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Дэлгүүр олдсонгүй</h1>
            <Link href="/stores" className="mt-4 inline-block text-primary hover:underline">
              Дэлгүүрүүд руу буцах
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Store Header */}
        <section className="bg-primary py-8">
          <div className="container mx-auto px-4">
            <Link
              href="/stores"
              className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Дэлгүүрүүд руу буцах
            </Link>

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                    {store.name}
                  </h1>
                  <Badge variant={isOpen() ? "secondary" : "outline"} className="text-xs">
                    {isOpen() ? "Нээлттэй" : "Хаалттай"}
                  </Badge>
                </div>

                <Badge variant="outline" className="mt-3 border-primary-foreground/30 text-primary-foreground">
                  {categoryLabels[store.category] || store.category}
                </Badge>

                <div className="mt-4 space-y-2 text-sm text-primary-foreground/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {store.address}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {store.openTime} - {store.closeTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {store.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {store.rating} үнэлгээ
                  </div>
                </div>
              </div>

              {/* Store Image Placeholder */}
              <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-primary-foreground/10">
                <span className="text-5xl font-bold text-primary-foreground/30">
                  {store.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Бүтээгдэхүүн ({products.length})
            </h2>

            {products.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Бүтээгдэхүүн байхгүй байна
                </h3>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} store={store} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Cart Summary Bar */}
      {itemCount > 0 && (
        <div className="sticky bottom-0 border-t border-border bg-card shadow-lg">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div>
              <p className="font-semibold text-foreground">
                {itemCount} бараа
              </p>
              <p className="text-sm text-muted-foreground">
                Нийт: {formatPrice(total)}
              </p>
            </div>
            <Link href="/cart">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Сагс харах
              </Button>
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <StoreDetailContent params={params} />;
}
