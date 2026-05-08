"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, Mail, IdCard, Package, Calendar, Clock,
  MapPin, CheckCircle, XCircle, AlertTriangle, ShoppingBag, LogOut,
  Edit3, Save, X, TrendingUp, CreditCard, Star, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/order-context";
import { usePlans } from "@/lib/plan-context";
import type { Order } from "@/lib/types";

function ProfileContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getUserOrders } = useOrders();
  const { getUserPlans } = usePlans();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  const orders = user ? getUserOrders(user.id) : [];
  const plans = user ? getUserPlans(user.id) : [];

  // Stats
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");
  const missedOrders = orders.filter((o) => o.missedPickups > 0 && o.status !== "completed");
  const penaltyOrders = orders.filter((o) => o.status === "penalty");
  const activeOrders = orders.filter((o) => !["completed", "cancelled", "penalty"].includes(o.status));
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalPenalty = penaltyOrders.reduce((sum, o) => sum + o.penaltyAmount, 0);

  useEffect(() => {
    if (user) {
      setEditData({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email || "" });
    }
  }, [user]);

  const formatPrice = (price: number) => new Intl.NumberFormat("mn-MN").format(price) + "₮";
  const formatDate = (date: string) => new Date(date).toLocaleDateString("mn-MN", { year: "numeric", month: "short", day: "numeric" });

  const getStatusBadge = (status: Order["status"]) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      pending: { label: "Хүлээгдэж байна", variant: "secondary" },
      confirmed: { label: "Баталгаажсан", variant: "default" },
      preparing: { label: "Бэлтгэж байна", variant: "secondary" },
      ready: { label: "Бэлэн", variant: "default" },
      completed: { label: "Авсан", variant: "outline" },
      cancelled: { label: "Цуцлагдсан", variant: "destructive" },
      penalty: { label: "Торгууль", variant: "destructive" },
    };
    const c = map[status];
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const handleLogout = () => { logout(); router.push("/"); };

  const handleSave = async () => {
    // Save to localStorage by updating user
    if (user) {
      const updatedUser = { ...user, ...editData };
      localStorage.setItem("zamzuur_user", JSON.stringify(updatedUser));
      window.location.reload();
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8">
              <User className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-4 text-xl font-semibold">Нэвтрэх шаардлагатай</h2>
              <p className="mt-2 text-muted-foreground">Профайл харахын тулд нэвтэрнэ үү</p>
              <Link href="/auth" className="mt-6 inline-block"><Button>Нэвтрэх</Button></Link>
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
        {/* Profile Header */}
        <section className="bg-primary py-10">
          <div className="container mx-auto px-4">
            <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground">
              <ArrowLeft className="h-4 w-4" />Нүүр хуудас
            </Link>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/20 text-3xl font-bold text-primary-foreground">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="mt-1 text-primary-foreground/70">{user.registerNumber}</p>
                <p className="text-sm text-primary-foreground/60">
                  Бүртгүүлсэн: {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="border-b border-border bg-card py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-secondary/50 p-4 text-center">
                <Package className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Нийт захиалга</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4 text-center">
                <CheckCircle className="mx-auto h-6 w-6 text-green-600" />
                <p className="mt-2 text-2xl font-bold text-foreground">{completedOrders.length}</p>
                <p className="text-xs text-muted-foreground">Амжилттай</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4 text-center">
                <TrendingUp className="mx-auto h-6 w-6 text-primary" />
                <p className="mt-2 text-2xl font-bold text-foreground">{formatPrice(totalSpent)}</p>
                <p className="text-xs text-muted-foreground">Нийт зарцуулсан</p>
              </div>
              <div className="rounded-xl bg-secondary/50 p-4 text-center">
                <AlertTriangle className="mx-auto h-6 w-6 text-amber-500" />
                <p className="mt-2 text-2xl font-bold text-foreground">{missedOrders.length + penaltyOrders.length}</p>
                <p className="text-xs text-muted-foreground">Авч чадаагүй</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-5">
                <TabsTrigger value="info">Мэдээлэл</TabsTrigger>
                <TabsTrigger value="orders">Захиалга</TabsTrigger>
                <TabsTrigger value="plans">Төлөвлөгөө</TabsTrigger>
                <TabsTrigger value="missed">Алгассан</TabsTrigger>
                <TabsTrigger value="stats">Тоон мэдээ</TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="info">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Хувийн мэдээлэл</CardTitle>
                        {!isEditing ? (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit3 className="mr-1 h-4 w-4" />Засах</Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" />Хадгалах</Button>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><IdCard className="h-4 w-4" />Регистрийн дугаар</Label>
                        <p className="font-medium">{user.registerNumber}</p>
                      </div>
                      {isEditing ? (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Овог</Label>
                              <Input value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Нэр</Label>
                              <Input value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Утас</Label>
                            <Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>И-мэйл</Label>
                            <Input value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" />Овог</Label>
                              <p className="font-medium">{user.firstName}</p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-muted-foreground">Нэр</Label>
                              <p className="font-medium">{user.lastName}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />Утас</Label>
                            <p className="font-medium">{user.phone}</p>
                          </div>
                          <div className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />И-мэйл</Label>
                            <p className="font-medium">{user.email || "—"}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />Идэвхтэй захиалгууд</CardTitle></CardHeader>
                      <CardContent>
                        {activeOrders.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Идэвхтэй захиалга байхгүй</p>
                        ) : (
                          <div className="space-y-3">
                            {activeOrders.slice(0, 3).map((order) => (
                              <div key={order.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <div>
                                  <p className="font-medium text-sm">{order.storeName}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(order.pickupDate)} • {order.pickupTime}</p>
                                </div>
                                <div className="text-right">
                                  {getStatusBadge(order.status)}
                                  <p className="mt-1 text-sm font-semibold text-primary">{formatPrice(order.total)}</p>
                                </div>
                              </div>
                            ))}
                            {activeOrders.length > 3 && (
                              <Link href="/orders"><Button variant="outline" size="sm" className="w-full">Бүгдийг харах ({activeOrders.length})</Button></Link>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-destructive/30">
                      <CardContent className="pt-6">
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />Системээс гарах
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Захиалгын түүх</CardTitle>
                    <CardDescription>{orders.length} захиалга</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="py-8 text-center">
                        <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-3 text-muted-foreground">Захиалга байхгүй</p>
                        <Link href="/stores" className="mt-4 inline-block"><Button size="sm">Дэлгүүр үзэх</Button></Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {orders
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((order) => (
                          <div key={order.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                                {order.status === "completed" ? <CheckCircle className="h-5 w-5 text-green-600" /> :
                                 order.status === "cancelled" ? <XCircle className="h-5 w-5 text-destructive" /> :
                                 order.status === "penalty" ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                                 <Clock className="h-5 w-5 text-muted-foreground" />}
                              </div>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold">{order.storeName}</p>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.storeAddress}</span>
                                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(order.pickupDate)}</span>
                                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                  {order.items.map((item) => `${item.product.name} x${item.quantity}`).join(", ")}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
                              {order.missedPickups > 0 && (
                                <p className="text-xs text-amber-600">{order.missedPickups}/3 алгассан</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Plans Tab */}
              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Таны төлөвлөгөөнүүд</CardTitle>
                    <CardDescription>{plans.length} төлөвлөгөө</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {plans.length === 0 ? (
                      <div className="py-8 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <p className="mt-3 text-muted-foreground">Хадгалсан төлөвлөгөө байхгүй байна</p>
                        <Link href="/planner" className="mt-4 inline-block"><Button size="sm">Төлөвлөгөө гаргах</Button></Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {plans.map((plan) => (
                          <div key={plan.id} className="rounded-lg border border-border p-4">
                            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {formatDate(plan.createdAt)} -ийн төлөвлөгөө
                                </p>
                                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{plan.totalTime} мин</span>
                                  <span className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" />{formatPrice(plan.totalCost)}</span>
                                  <span className="flex items-center gap-1">Төсөв: {formatPrice(plan.budget)}</span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/planner">
                                  Үзэх
                                </Link>
                              </Button>
                            </div>
                            
                            <div className="space-y-2 rounded-lg bg-secondary/30 p-3">
                              {plan.schedule.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span>{item.from} <span className="text-muted-foreground">({item.departureTime})</span></span>
                                    <ArrowLeft className="h-3 w-3 rotate-180 text-muted-foreground mx-1" />
                                    <span>{item.to} <span className="text-muted-foreground">({item.arrivalTime})</span></span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Missed Orders Tab */}
              <TabsContent value="missed">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Авч чадаагүй захиалгууд</CardTitle>
                    <CardDescription>Хугацаандаа ирж аваагүй буюу торгуультай захиалгууд</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {missedOrders.length === 0 && penaltyOrders.length === 0 ? (
                      <div className="py-8 text-center">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500/50" />
                        <p className="mt-3 font-medium text-foreground">Маш сайн!</p>
                        <p className="mt-1 text-sm text-muted-foreground">Авч чадаагүй захиалга байхгүй байна</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Penalty Orders */}
                        {penaltyOrders.length > 0 && (
                          <div className="rounded-xl border border-destructive bg-destructive/5 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-destructive"><CreditCard className="h-4 w-4" />Торгууль ({penaltyOrders.length})</h4>
                            <div className="mt-3 space-y-2">
                              {penaltyOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                                  <div>
                                    <p className="font-medium text-sm">{order.storeName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(order.pickupDate)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-destructive">{formatPrice(order.penaltyAmount)}</p>
                                    <Badge variant={order.isPenaltyPaid ? "outline" : "destructive"} className="text-xs">
                                      {order.isPenaltyPaid ? "Төлсөн" : "Төлөөгүй"}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {totalPenalty > 0 && (
                              <div className="mt-3 flex justify-between border-t border-destructive/20 pt-3 text-sm">
                                <span className="text-destructive">Нийт торгууль:</span>
                                <span className="font-bold text-destructive">{formatPrice(totalPenalty)}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Missed but not penalty yet */}
                        {missedOrders.filter((o) => o.status !== "penalty").length > 0 && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-amber-800"><AlertTriangle className="h-4 w-4" />Анхааруулга</h4>
                            <div className="mt-3 space-y-2">
                              {missedOrders.filter((o) => o.status !== "penalty").map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                                  <div>
                                    <p className="font-medium text-sm">{order.storeName}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(order.pickupDate)} • {order.pickupTime}</p>
                                  </div>
                                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                                    {order.missedPickups}/3 алгассан
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            <p className="mt-3 text-xs text-amber-700">3 удаа авахгүй бол нийт дүнгийн 50% торгууль ногдуулна.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats Tab */}
              <TabsContent value="stats">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Захиалгын тойм</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { label: "Нийт захиалга", value: orders.length, color: "text-foreground" },
                        { label: "Амжилттай авсан", value: completedOrders.length, color: "text-green-600" },
                        { label: "Цуцлагдсан", value: cancelledOrders.length, color: "text-destructive" },
                        { label: "Идэвхтэй", value: activeOrders.length, color: "text-primary" },
                        { label: "Торгууль", value: penaltyOrders.length, color: "text-destructive" },
                      ].map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                          <span className={`text-lg font-bold ${stat.color}`}>{stat.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Санхүүгийн мэдээлэл</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-xl bg-primary/10 p-4 text-center">
                        <p className="text-sm text-muted-foreground">Нийт зарцуулсан</p>
                        <p className="mt-1 text-3xl font-bold text-primary">{formatPrice(totalSpent)}</p>
                      </div>
                      {totalPenalty > 0 && (
                        <div className="rounded-xl bg-destructive/10 p-4 text-center">
                          <p className="text-sm text-destructive/70">Нийт торгууль</p>
                          <p className="mt-1 text-2xl font-bold text-destructive">{formatPrice(totalPenalty)}</p>
                        </div>
                      )}
                      <div className="rounded-xl bg-secondary p-4 text-center">
                        <p className="text-sm text-muted-foreground">Дундаж захиалга</p>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                          {completedOrders.length > 0 ? formatPrice(Math.round(totalSpent / completedOrders.length)) : "—"}
                        </p>
                      </div>
                      {/* Favorite stores */}
                      {completedOrders.length > 0 && (() => {
                        const storeCounts: Record<string, { name: string; count: number }> = {};
                        completedOrders.forEach((o) => {
                          if (!storeCounts[o.storeId]) storeCounts[o.storeId] = { name: o.storeName, count: 0 };
                          storeCounts[o.storeId].count++;
                        });
                        const topStore = Object.values(storeCounts).sort((a, b) => b.count - a.count)[0];
                        return (
                          <div className="rounded-xl bg-secondary p-4 text-center">
                            <Star className="mx-auto h-5 w-5 text-amber-500" />
                            <p className="mt-1 text-sm text-muted-foreground">Дуртай дэлгүүр</p>
                            <p className="mt-1 font-bold text-foreground">{topStore.name}</p>
                            <p className="text-xs text-muted-foreground">{topStore.count} удаа захиалсан</p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
