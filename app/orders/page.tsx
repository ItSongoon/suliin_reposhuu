"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  ChevronRight,
  Copy,
  Check,
  Calendar,
  QrCode,
  CreditCard,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/order-context";
import type { Order } from "@/lib/types";

function OrderCancelTimer({ orderId }: { orderId: string }) {
  const { getCancelTimeRemaining, cancelOrder, canCancelOrder } = useOrders();
  const [timeLeft, setTimeLeft] = useState(getCancelTimeRemaining(orderId));

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

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const progress = (timeLeft / (5 * 60 * 1000)) * 100;

  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <Timer className="h-4 w-4 shrink-0" />
          <span>
            Цуцлах боломж:{" "}
            <span className="font-mono font-bold">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-amber-200 sm:block">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 text-xs"
            onClick={() => cancelOrder(orderId)}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Цуцлах
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrdersContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { getUserOrders, markMissedPickup, payPenalty, updateOrderStatus, canCancelOrder } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  // Force re-render every second for countdown timers
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const orders = user ? getUserOrders(user.id) : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("mn-MN").format(price) + "₮";
  };

  const getStatusBadge = (status: Order["status"], missedPickups: number) => {
    const statusConfig = {
      pending: { label: "Хүлээгдэж байна", variant: "secondary" as const },
      confirmed: { label: "Баталгаажсан", variant: "default" as const },
      preparing: { label: "Бэлтгэж байна", variant: "secondary" as const },
      ready: { label: "Бэлэн", variant: "default" as const },
      completed: { label: "Авсан", variant: "outline" as const },
      cancelled: { label: "Цуцлагдсан", variant: "destructive" as const },
      penalty: { label: "Торгууль", variant: "destructive" as const },
    };

    const config = statusConfig[status];

    return (
      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>{config.label}</Badge>
        {missedPickups > 0 && missedPickups < 3 && status !== "completed" && (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            {missedPickups}/3 удаа алгассан
          </Badge>
        )}
      </div>
    );
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case "cancelled":
      case "penalty":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "ready":
        return <Package className="h-5 w-5 text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const copyQRCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkComplete = (orderId: string) => {
    updateOrderStatus(orderId, "completed");
    setShowQR(false);
    setSelectedOrder(null);
  };

  const handleMarkMissed = (orderId: string) => {
    markMissedPickup(orderId);
  };

  const handlePayPenalty = (orderId: string) => {
    payPenalty(orderId);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8">
              <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Нэвтрэх шаардлагатай
              </h2>
              <p className="mt-2 text-muted-foreground">
                Захиалгуудаа харахын тулд нэвтэрнэ үү
              </p>
              <Link href="/auth" className="mt-6 inline-block">
                <Button>Нэвтрэх</Button>
              </Link>
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
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Нүүр хуудас руу буцах
            </Link>
            <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              Миний захиалгууд
            </h1>
            <p className="mt-1 text-primary-foreground/80">
              {orders.length} захиалга
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="mx-auto h-20 w-20 text-muted-foreground/50" />
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Захиалга байхгүй байна
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Та одоогоор захиалга хийгээгүй байна
                </p>
                <Link href="/stores" className="mt-6 inline-block">
                  <Button>Дэлгүүрүүд үзэх</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((order) => (
                    <Card
                      key={order.id}
                      className={`overflow-hidden ${order.status === "penalty" ? "border-destructive" : ""}`}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                          {/* Order Info */}
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                              {getStatusIcon(order.status)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {order.storeName}
                                </h3>
                                {getStatusBadge(order.status, order.missedPickups)}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {order.storeAddress}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(order.pickupDate).toLocaleDateString("mn-MN")}
                                </span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  {order.pickupTime}
                                </span>
                                <span className="font-semibold text-primary">
                                  {formatPrice(order.total)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap items-center gap-2">
                            {order.status === "penalty" && !order.isPenaltyPaid && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handlePayPenalty(order.id)}
                              >
                                <CreditCard className="mr-1 h-4 w-4" />
                                Торгууль төлөх ({formatPrice(order.penaltyAmount)})
                              </Button>
                            )}

                            {order.status !== "completed" &&
                              order.status !== "cancelled" &&
                              order.status !== "penalty" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowQR(true);
                                    }}
                                  >
                                    <QrCode className="mr-1 h-4 w-4" />
                                    QR үзэх
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkMissed(order.id)}
                                    className="text-amber-600 hover:text-amber-700"
                                  >
                                    <AlertTriangle className="mr-1 h-4 w-4" />
                                    Авч чадаагүй
                                  </Button>
                                </>
                              )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              Дэлгэрэнгүй
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Cancel Timer - show if within 5 min window */}
                        {canCancelOrder(order.id) && (
                          <OrderCancelTimer orderId={order.id} />
                        )}

                        {/* Penalty Warning */}
                        {order.status === "penalty" && (
                          <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <span>
                                3 удаа авахгүй байсан тул {formatPrice(order.penaltyAmount)}{" "}
                                (50%) торгууль төлөх шаардлагатай
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR код</DialogTitle>
            <DialogDescription>
              Дэлгүүрт очиж энэ QR кодыг уншуулна уу
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="flex flex-col items-center py-4">
              <div className="rounded-2xl border-4 border-primary/20 bg-white p-4">
                <QRCodeSVG
                  value={JSON.stringify({
                    orderId: selectedOrder.id,
                    qrCode: selectedOrder.qrCode,
                    store: selectedOrder.storeName,
                    total: selectedOrder.total,
                    pickupDate: selectedOrder.pickupDate,
                    pickupTime: selectedOrder.pickupTime,
                  })}
                  size={200}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#3D4127"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-lg bg-secondary px-4 py-2 font-mono text-lg font-bold tracking-wider text-secondary-foreground">
                  {selectedOrder.qrCode}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyQRCode(selectedOrder.qrCode)}
                  className="h-10 w-10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="mt-6 w-full space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleMarkComplete(selectedOrder.id)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Авсан гэж тэмдэглэх
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog
        open={selectedOrder !== null && !showQR}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Захиалгын дэлгэрэнгүй</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Төлөв</span>
                {getStatusBadge(selectedOrder.status, selectedOrder.missedPickups)}
              </div>

              {/* Store */}
              <div className="rounded-xl bg-secondary/30 p-4">
                <h4 className="font-semibold text-foreground">
                  {selectedOrder.storeName}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedOrder.storeAddress}
                </p>
              </div>

              {/* Pickup Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Авах огноо</span>
                  <p className="font-medium text-foreground">
                    {new Date(selectedOrder.pickupDate).toLocaleDateString("mn-MN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Авах цаг</span>
                  <p className="font-medium text-foreground">{selectedOrder.pickupTime}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Захиалсан бүтээгдэхүүнүүд
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground/50">
                          {item.product.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} ширхэг
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-foreground">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-lg font-semibold text-foreground">Нийт дүн</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>

              {/* Penalty Info */}
              {selectedOrder.status === "penalty" && (
                <div className="rounded-xl border border-destructive bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Торгуулийн мэдээлэл</span>
                  </div>
                  <p className="mt-2 text-sm text-destructive/80">
                    3 удаа авахгүй байсан тул {formatPrice(selectedOrder.penaltyAmount)}{" "}
                    (нийт дүнгийн 50%) торгууль төлөх шаардлагатай.
                  </p>
                  {!selectedOrder.isPenaltyPaid && (
                    <Button
                      variant="destructive"
                      className="mt-4 w-full"
                      onClick={() => {
                        handlePayPenalty(selectedOrder.id);
                        setSelectedOrder(null);
                      }}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Торгууль төлөх
                    </Button>
                  )}
                </div>
              )}

              {/* Actions */}
              {selectedOrder.status !== "completed" &&
                selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "penalty" && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowQR(true);
                    }}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    QR код үзэх
                  </Button>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
