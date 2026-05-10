"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Store } from "@/lib/types";

interface StoreCardProps {
  store: Store;
}

const categoryLabels: Record<string, string> = {
  supermarket: "Дэлгүүр",
  coffee: "Кофе шоп",
  food: "Хоол",
};

export function StoreCard({ store }: StoreCardProps) {
  const isOpen = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return currentTime >= store.openTime && currentTime <= store.closeTime;
  };

  return (
    <Link href={`/stores/${store.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:border-primary p-0 gap-0">
        <div className="relative h-40 bg-secondary overflow-hidden">
          {store.image ? (
            <Image
              src={store.image}
              alt={store.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-secondary-foreground/20">
                {store.name.charAt(0)}
              </span>
            </div>
          )}
          <Badge
            variant={isOpen() ? "default" : "secondary"}
            className="absolute right-2 top-2 z-10"
          >
            {isOpen() ? "Нээлттэй" : "Хаалттай"}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-1">
              {store.name}
            </h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-muted-foreground">{store.rating}</span>
            </div>
          </div>
          
          <Badge variant="outline" className="mb-3">
            {categoryLabels[store.category] || store.category}
          </Badge>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{store.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {store.openTime} - {store.closeTime}
              </span>
            </div>
            {store.distance !== undefined && (
              <div className="mt-2 font-medium text-primary">
                {store.distance < 1
                  ? `${Math.round(store.distance * 1000)} м`
                  : `${store.distance.toFixed(1)} км`}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-4 w-full rounded-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
          >
            Зочлох
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
