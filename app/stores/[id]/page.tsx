"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Clock, Phone, ShoppingBag, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useReviews } from "@/lib/review-context";
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
  const { user } = useAuth();
  const { getStoreRating, addStoreRating } = useReviews();

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

  const currentRating = store ? getStoreRating(store.id) : { average: 0, count: 0 };
  const displayRating = currentRating.count > 0 ? currentRating.average : store?.rating || 0;

  const handleRate = (rating: number) => {
    if (user && store) {
      addStoreRating(store.id, user.id, rating);
    }
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
        <section className="relative bg-secondary/20 pb-12 pt-8">
          <div className="container mx-auto px-4">
            <Link
              href="/stores"
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Дэлгүүрүүд руу буцах
            </Link>

            <Card className="overflow-hidden border-border shadow-xl">
              <div className="grid md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_450px]">
                {/* Store Info */}
                <div className="flex flex-col justify-between p-6 sm:p-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-inner">
                        {store.name.charAt(0)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                          {store.name}
                        </h1>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {categoryLabels[store.category] || store.category}
                          </Badge>
                          <Badge variant={isOpen() ? "default" : "destructive"} className="text-xs">
                            {isOpen() ? "Одоогоор нээлттэй" : "Хаалттай"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-secondary p-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Байршил</p>
                          <p className="text-sm text-muted-foreground">{store.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-secondary p-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Цагийн хуваарь</p>
                          <p className="text-sm text-muted-foreground">Өдөр бүр {store.openTime} - {store.closeTime}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-secondary p-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Утас</p>
                          <p className="text-sm text-muted-foreground">{store.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-amber-500/10 p-2 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Үнэлгээ</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-bold text-foreground">{displayRating}</span>
                            <span>({currentRating.count > 0 ? `${currentRating.count} хүн` : "Анхны үнэлгээ"})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Button size="lg" className="gap-2 rounded-full font-semibold shadow-md">
                      <Navigation className="h-4 w-4" />
                      Маршрут авах
                    </Button>
                    <div className="flex items-center gap-1 rounded-full border border-border px-4 py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          disabled={!user}
                          className={`focus:outline-none transition-transform hover:scale-110 ${user ? "cursor-pointer" : "cursor-default opacity-50"
                            }`}
                          title={user ? `${star} одоор үнэлэх` : "Нэвтэрч байж үнэлгээ өгнө үү"}
                        >
                          <Star
                            className={`h-5 w-5 ${star <= Math.round(displayRating)
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30 hover:fill-amber-500/50 hover:text-amber-500/50"
                              }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs text-muted-foreground">Үнэлгээ өгөх</span>
                    </div>
                  </div>
                </div>

                {/* Map Area */}
                <div className="relative min-h-[300px] w-full bg-muted md:min-h-full border-t md:border-t-0 md:border-l border-border">
                  <iframe
                    title={`${store.name} map`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${store.lat},${store.lng}&z=15&output=embed`}
                    className="absolute inset-0 h-full w-full object-cover dark:invert-[90%] dark:hue-rotate-180"
                  />
                  {/* Overlay shadow for style */}
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_10px_20px_rgba(0,0,0,0.05)] md:shadow-[inset_10px_0_20px_rgba(0,0,0,0.05)]" />
                </div>
              </div>
            </Card>
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
