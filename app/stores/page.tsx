"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Search, Grid3x3, Coffee, ShoppingCart, UtensilsCrossed, Locate, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { StoreCard } from "@/components/store-card";

import type { Store, Category } from "@/lib/types";

// Dynamic import map component to avoid SSR issues
const StoreMap = dynamic(
  () => import("@/components/store-map").then((mod) => mod.StoreMap),
  { ssr: false }
);

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Grid3x3,
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
};

function StoresContent() {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>();

  const fetchStores = async (lat?: number, lng?: number) => {
    setIsLoading(true);
    try {
      let url = `/api/stores?category=${selectedCategory}`;
      if (lat && lng) {
        url += `&lat=${lat}&lng=${lng}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setStores(data.stores);
      setCategories(data.categories);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStores(userLocation?.lat, userLocation?.lng);
  }, [selectedCategory, userLocation]);

  const handleLocate = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          // Default to Ulaanbaatar center
          setUserLocation({ lat: 47.9184, lng: 106.9177 });
          setIsLocating(false);
        }
      );
    } else {
      setUserLocation({ lat: 47.9184, lng: 106.9177 });
      setIsLocating(false);
    }
  };

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStoreSelect = (store: Store) => {
    setSelectedStoreId(store.id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Link href="/" className="hover:text-primary-foreground">
                Нүүр
              </Link>
              <span>/</span>
              <span className="text-primary-foreground">Дэлгүүрүүд</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-primary-foreground md:text-4xl">
              Ойролцоох дэлгүүрүүд
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              Таны байршилд хамгийн ойр дэлгүүрүүдийг олоорой
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search */}
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Дэлгүүр хайх..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex rounded-lg border border-border">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("map")}
                    className="rounded-l-none"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>

                {/* Location Button */}
                <Button
                  variant="outline"
                  onClick={handleLocate}
                  disabled={isLocating}
                  className="gap-2"
                >
                  <Locate className="h-4 w-4" />
                  {isLocating ? "Хайж байна..." : userLocation ? "Байршил тохируулсан" : "Байршил олох"}
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.icon] || Grid3x3;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {viewMode === "map" ? (
              /* Map View */
              <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
                <Suspense
                  fallback={
                    <div className="flex h-[500px] items-center justify-center rounded-lg bg-secondary">
                      <div className="text-muted-foreground">Газрын зураг ачаалж байна...</div>
                    </div>
                  }
                >
                  <StoreMap
                    stores={filteredStores}
                    userLocation={userLocation}
                    onStoreSelect={handleStoreSelect}
                    selectedStoreId={selectedStoreId}
                    showRoute={!!selectedStoreId}
                    height="500px"
                  />
                </Suspense>

                {/* Store List Sidebar */}
                <div className="h-[500px] overflow-y-auto rounded-lg border border-border bg-card">
                  <div className="sticky top-0 border-b border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">
                      {filteredStores.length} дэлгүүр олдлоо
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStoreId(store.id)}
                        className={`w-full p-4 text-left transition-colors hover:bg-secondary/50 ${
                          selectedStoreId === store.id ? "bg-secondary" : ""
                        }`}
                      >
                        <h4 className="font-semibold text-foreground">{store.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{store.address}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            {store.rating}
                          </span>
                          {store.distance && (
                            <span className="font-medium text-primary">
                              {store.distance.toFixed(1)} км
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* List View */
              <>
                {isLoading ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="h-72 animate-pulse rounded-lg bg-secondary"
                      />
                    ))}
                  </div>
                ) : filteredStores.length === 0 ? (
                  <div className="py-16 text-center">
                    <MapPin className="mx-auto h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      Дэлгүүр олдсонгүй
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      Хайлтын утгаа өөрчлөх эсвэл категори сонгоно уу
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-6 text-muted-foreground">
                      {filteredStores.length} дэлгүүр олдлоо
                    </p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredStores.map((store) => (
                        <StoreCard key={store.id} store={store} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function StoresPage() {
  return <StoresContent />;
}

