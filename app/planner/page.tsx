"use client";

import { useState, lazy, Suspense } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Car,
  Bus,
  Bike,
  Footprints,
  MapPin,
  Clock,
  Wallet,
  Route,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

import type { TransportType } from "@/lib/types";

// Lazy load map component
const RouteMap = lazy(() => import("@/components/route-map").then(mod => ({ default: mod.RouteMap })));

interface Destination {
  id: string;
  name: string;
  time: string;
}

interface PlanResult {
  destinations: Destination[];
  transport: TransportType;
  budget: number;
  totalTime: number;
  totalCost: number;
  schedule: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    travelTime: number;
    cost: number;
  }[];
}

const transportOptions: {
  value: TransportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  costPerKm: number;
  speedKmh: number;
}[] = [
  { value: "walk", label: "Алхах", icon: Footprints, costPerKm: 0, speedKmh: 5 },
  { value: "bike", label: "Дугуй", icon: Bike, costPerKm: 0, speedKmh: 15 },
  { value: "bus", label: "Автобус", icon: Bus, costPerKm: 500, speedKmh: 20 },
  { value: "car", label: "Машин", icon: Car, costPerKm: 800, speedKmh: 35 },
];

function PlannerContent() {
  const [destinations, setDestinations] = useState<Destination[]>([
    { id: "1", name: "", time: "09:00" },
  ]);
  const [transport, setTransport] = useState<TransportType>("bus");
  const [budget, setBudget] = useState(50000);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const addDestination = () => {
    const lastTime = destinations[destinations.length - 1]?.time || "09:00";
    const [hours, minutes] = lastTime.split(":").map(Number);
    const newHours = (hours + 1) % 24;
    const newTime = `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    setDestinations([
      ...destinations,
      { id: Date.now().toString(), name: "", time: newTime },
    ]);
  };

  const removeDestination = (id: string) => {
    setDestinations(destinations.filter((d) => d.id !== id));
  };

  const updateDestination = (id: string, field: keyof Destination, value: string) => {
    setDestinations(
      destinations.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const calculatePlan = () => {
    const validDestinations = destinations.filter((d) => d.name.trim());
    if (validDestinations.length < 2) {
      alert("Хамгийн багадаа 2 газар оруулна уу");
      return;
    }

    setIsCalculating(true);

    // Simulate calculation
    setTimeout(() => {
      const selectedTransport = transportOptions.find((t) => t.value === transport)!;
      const schedule = [];
      let totalTime = 0;
      let totalCost = 0;

      for (let i = 0; i < validDestinations.length - 1; i++) {
        const from = validDestinations[i];
        const to = validDestinations[i + 1];
        
        // Simulate random distance between 2-8 km
        const distance = 2 + Math.random() * 6;
        const travelTime = Math.round((distance / selectedTransport.speedKmh) * 60);
        const cost = Math.round(distance * selectedTransport.costPerKm);

        const [departHours, departMinutes] = from.time.split(":").map(Number);
        const arrivalTotalMinutes = departHours * 60 + departMinutes + travelTime;
        const arrivalHours = Math.floor(arrivalTotalMinutes / 60) % 24;
        const arrivalMinutes = arrivalTotalMinutes % 60;
        const arrivalTime = `${arrivalHours.toString().padStart(2, "0")}:${arrivalMinutes.toString().padStart(2, "0")}`;

        schedule.push({
          from: from.name,
          to: to.name,
          departureTime: from.time,
          arrivalTime,
          travelTime,
          cost,
        });

        totalTime += travelTime;
        totalCost += cost;
      }

      setPlanResult({
        destinations: validDestinations,
        transport,
        budget,
        totalTime,
        totalCost,
        schedule,
      });
      setIsCalculating(false);
    }, 1000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("mn-MN").format(price) + "₮";
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
              <span className="text-primary-foreground">Төлөвлөгөө</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-primary-foreground md:text-4xl">
              Өдрийн төлөвлөгөө
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              Өдрийн явах газруудаа оруулж, оновчтой маршрут гаргаарай
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Input Form */}
              <div className="space-y-6">
                {/* Destinations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Явах газрууд
                    </CardTitle>
                    <CardDescription>
                      Өдрийн турш явах газруудаа дарааллаар оруулна уу
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {destinations.map((dest, index) => (
                      <div key={dest.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </div>
                        <div className="flex-1 grid gap-2 sm:grid-cols-[1fr,auto]">
                          <Input
                            placeholder="Газрын нэр (жишээ: Ажлын газар)"
                            value={dest.name}
                            onChange={(e) =>
                              updateDestination(dest.id, "name", e.target.value)
                            }
                          />
                          <Input
                            type="time"
                            value={dest.time}
                            onChange={(e) =>
                              updateDestination(dest.id, "time", e.target.value)
                            }
                            className="w-28"
                          />
                        </div>
                        {destinations.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeDestination(dest.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={addDestination}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Газар нэмэх
                    </Button>
                  </CardContent>
                </Card>

                {/* Transport Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="h-5 w-5" />
                      Тээврийн хэрэгсэл
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {transportOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTransport(option.value)}
                          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                            transport === option.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <option.icon
                            className={`h-6 w-6 ${
                              transport === option.value
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              transport === option.value
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Өдрийн төсөв
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Төсөв (₮)</Label>
                      <Input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        min={0}
                        step={5000}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Calculate Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={calculatePlan}
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    "Тооцоолж байна..."
                  ) : (
                    <>
                      <Calendar className="mr-2 h-5 w-5" />
                      Төлөвлөгөө гаргах
                    </>
                  )}
                </Button>
              </div>

              {/* Results & Map */}
              <div className="space-y-6">
                {/* Map */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Маршрут газрын зураг
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense
                      fallback={
                        <div className="flex h-[300px] items-center justify-center rounded-lg bg-secondary">
                          <div className="text-muted-foreground">Газрын зураг ачаалж байна...</div>
                        </div>
                      }
                    >
                      <RouteMap destinations={destinations} height="300px" />
                    </Suspense>
                  </CardContent>
                </Card>

                {/* Results */}
                {planResult ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Таны төлөвлөгөө
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-secondary p-4 text-center">
                          <Clock className="mx-auto h-6 w-6 text-primary" />
                          <p className="mt-2 text-2xl font-bold text-foreground">
                            {planResult.totalTime} мин
                          </p>
                          <p className="text-sm text-muted-foreground">Нийт хугацаа</p>
                        </div>
                        <div className="rounded-lg bg-secondary p-4 text-center">
                          <Wallet className="mx-auto h-6 w-6 text-primary" />
                          <p className="mt-2 text-2xl font-bold text-foreground">
                            {formatPrice(planResult.totalCost)}
                          </p>
                          <p className="text-sm text-muted-foreground">Нийт зардал</p>
                        </div>
                      </div>

                      {/* Budget Alert */}
                      {planResult.totalCost > planResult.budget && (
                        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                          Таны зардал төсвөөс {formatPrice(planResult.totalCost - planResult.budget)}-аар
                          хэтэрсэн байна. Тээврийн хэрэгслээ солих эсвэл төсвөө нэмэгдүүлнэ үү.
                        </div>
                      )}

                      {planResult.totalCost <= planResult.budget && (
                        <div className="rounded-lg bg-primary/10 p-4 text-sm text-primary">
                          Төсвөнд багтаж байна! Үлдэгдэл: {formatPrice(planResult.budget - planResult.totalCost)}
                        </div>
                      )}

                      {/* Schedule */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">Дэлгэрэнгүй хуваарь</h4>
                        {planResult.schedule.map((item, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-border p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-center">
                                <div className="h-3 w-3 rounded-full bg-primary" />
                                <div className="h-8 w-0.5 bg-border" />
                                <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">{item.from}</span>
                                  <span className="text-sm text-muted-foreground">{item.departureTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {transportOptions.find((t) => t.value === planResult.transport)?.icon && (
                                    <>
                                      {(() => {
                                        const TransportIcon = transportOptions.find((t) => t.value === planResult.transport)!.icon;
                                        return <TransportIcon className="h-3 w-3" />;
                                      })()}
                                    </>
                                  )}
                                  <span>{item.travelTime} мин</span>
                                  <span>•</span>
                                  <span>{formatPrice(item.cost)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-foreground">{item.to}</span>
                                  <span className="text-sm text-muted-foreground">{item.arrivalTime}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold text-foreground">
                        Төлөвлөгөө гаргах
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Газруудаа оруулж, тээврийн хэрэгслээ сонгоод
                        &ldquo;Төлөвлөгөө гаргах&rdquo; товчийг дарна уу
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function PlannerPage() {
  return <PlannerContent />;
}

