"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  CheckCircle,
  Calendar,
  AlertTriangle,
  Copy,
  Check,
  XCircle,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useOrders } from "@/lib/order-context";
import type { Order } from "@/lib/types";

function CancelCountdown({ orderId }: { orderId: string }) {
  const { getCancelTimeRemaining, cancelOrder, canCancelOrder } = useOrders();
  const [timeLeft, setTimeLeft] = useState(getCancelTimeRemaining(orderId));
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getCancelTimeRemaining(orderId);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderId, getCancelTimeRemaining]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const progress = (timeLeft / (5 * 60 * 1000)) * 100;

  const handleCancel = () => {
    setIsCancelling(true);
    const success = cancelOrder(orderId);
    if (success) {
      // Will be handled by parent
    }
    setIsCancelling(false);
  };

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span>Цуцлах хугацаа дууссан</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
          <Timer className="h-4 w-4" />
          <span>Цуцлах боломжтой хугацаа</span>
        </div>
        <span className="font-mono text-lg font-bold text-amber-700">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={handleCancel}
        disabled={isCancelling || !canCancelOrder(orderId)}
      >
        <XCircle className="mr-2 h-4 w-4" />
        {isCancelling ? "Цуцлаж байна..." : "Захиалга цуцлах"}
      </Button>
    </div>
  );
}

function CartContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { addOrder } = useOrders();
  const [pickupTime, setPickupTime] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("mn-MN").format(price) + "₮";
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleOrder = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }

    if (!pickupTime || !pickupDate) {
      alert("Авах огноо болон цагаа сонгоно уу");
      return;
    }

    setIsOrdering(true);

    // Group items by store - only take the first store for this order
    const firstStore = items[0]?.store;
    if (!firstStore) {
      setIsOrdering(false);
      return;
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const order = addOrder({
      userId: user.id,
      storeId: firstStore.id,
      storeName: firstStore.name,
      storeAddress: firstStore.address,
      items: items.filter((item) => item.store.id === firstStore.id),
      total,
      status: "confirmed",
      pickupTime,
      pickupDate,
    });

    setCompletedOrder(order);
    clearCart();
    setIsOrdering(false);
  };

  const copyQRCode = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Group items by store
  const itemsByStore = items.reduce(
    (acc, item) => {
      const storeId = item.store.id;
      if (!acc[storeId]) {
        acc[storeId] = {
          store: item.store,
          items: [],
        };
      }
      acc[storeId].items.push(item);
      return acc;
    },
    {} as Record<string, { store: (typeof items)[0]["store"]; items: typeof items }>
  );

  // Order success with QR code + cancel countdown
  if (completedOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4 py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Захиалга амжилттай!
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Доорх QR кодыг дэлгүүрт очиж уншуулна уу
                </p>
              </div>

              {/* QR Code */}
              <div className="mt-8 flex flex-col items-center">
                <div className="rounded-2xl border-4 border-primary/20 bg-white p-4">
                  <QRCodeSVG
                    value={JSON.stringify({
                      orderId: completedOrder.id,
                      qrCode: completedOrder.qrCode,
                      store: completedOrder.storeName,
                      total: completedOrder.total,
                      pickupDate: completedOrder.pickupDate,
                      pickupTime: completedOrder.pickupTime,
                    })}
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#ffffff"
                    fgColor="#3D4127"
                  />
                </div>

                {/* QR Code Text */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-lg bg-secondary px-4 py-2 font-mono text-lg font-bold tracking-wider text-secondary-foreground">
                    {completedOrder.qrCode}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyQRCode}
                    className="h-10 w-10"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Order Details */}
              <div className="mt-8 space-y-3 rounded-xl bg-secondary/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Дэлгүүр</span>
                  <span className="font-medium text-foreground">
                    {completedOrder.storeName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Хаяг</span>
                  <span className="text-right font-medium text-foreground">
                    {completedOrder.storeAddress}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Авах огноо</span>
                  <span className="font-medium text-foreground">
                    {new Date(completedOrder.pickupDate).toLocaleDateString("mn-MN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Авах цаг</span>
                  <span className="font-medium text-foreground">
                    {completedOrder.pickupTime}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-medium text-foreground">Нийт дүн</span>
                  <span className="font-bold text-primary">
                    {formatPrice(completedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Cancel Countdown */}
              <div className="mt-6">
                <CancelCountdown orderId={completedOrder.id} />
              </div>

              {/* Warning */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Анхааруулга</p>
                  <p className="mt-1">
                    3 удаа авахгүй бол нийт дүнгийн 50%-ийн торгууль төлнө.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-3">
                <Link href="/orders">
                  <Button className="w-full">Захиалгууд үзэх</Button>
                </Link>
                <Link href="/stores">
                  <Button variant="outline" className="w-full">
                    Үргэлжлүүлэн худалдаа хийх
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary py-8">
          <div className="container mx-auto px-4">
            <Link
              href="/stores"
              className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Дэлгүүрүүд руу буцах
            </Link>
            <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              Миний сагс
            </h1>
            <p className="mt-1 text-primary-foreground/80">{itemCount} бараа</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground/50" />
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Сагс хоосон байна
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Дэлгүүрүүдээс бараа нэмнэ үү
                </p>
                <Link href="/stores" className="mt-6 inline-block">
                  <Button>Дэлгүүрүүд үзэх</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="space-y-6 lg:col-span-2">
                  {Object.values(itemsByStore).map(({ store, items: storeItems }) => (
                    <Card key={store.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-sm font-bold">
                            {store.name.charAt(0)}
                          </span>
                          {store.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{store.address}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {storeItems.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center gap-4 rounded-lg border border-border p-3"
                          >
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                              <span className="text-lg font-bold text-secondary-foreground/30">
                                {item.product.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate font-medium text-foreground">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.product.price)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1)
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-1 h-auto p-0 text-xs text-destructive hover:text-destructive"
                                onClick={() => removeItem(item.product.id)}
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Устгах
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Захиалгын мэдээлэл</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Pickup Date */}
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Авах огноо
                        </Label>
                        <Input
                          id="pickup-date"
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          min={getTodayDate()}
                        />
                      </div>

                      {/* Pickup Time */}
                      <div className="space-y-2">
                        <Label htmlFor="pickup-time" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Авах цаг
                        </Label>
                        <Input
                          id="pickup-time"
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          min="08:00"
                          max="22:00"
                        />
                        <p className="text-xs text-muted-foreground">
                          08:00 - 22:00 цагийн хооронд сонгоно уу
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-3 border-t border-border pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Барааны үнэ</span>
                          <span className="text-foreground">{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Үйлчилгээний хураамж
                          </span>
                          <span className="text-foreground">Үнэгүй</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                          <span className="text-foreground">Нийт</span>
                          <span className="text-primary">{formatPrice(total)}</span>
                        </div>
                      </div>

                      {/* Warning */}
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>
                          3 удаа авахгүй бол нийт дүнгийн 50%-ийн торгууль төлнө
                        </span>
                      </div>

                      {/* Order Button */}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleOrder}
                        disabled={isOrdering || !pickupTime || !pickupDate}
                      >
                        {isOrdering
                          ? "Захиалж байна..."
                          : user
                            ? "Урьдчилан захиалах"
                            : "Нэвтэрч захиалах"}
                      </Button>

                      {!user && (
                        <p className="text-center text-xs text-muted-foreground">
                          Захиалга хийхийн тулд{" "}
                          <Link href="/auth" className="text-primary hover:underline">
                            нэвтрэх
                          </Link>{" "}
                          шаардлагатай
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CartPage() {
  return <CartContent />;
}
