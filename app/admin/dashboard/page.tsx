"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, LogOut, Users, Store, Package, Building2, ShoppingBag,
  Trash2, Plus, MapPin, Phone, Clock, Star, Tag, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { User, Store as StoreType, Product, Order } from "@/lib/types";

interface Business {
  id: string; name: string; registerNumber: string; category: string;
  phone: string; email: string; address: string; openTime: string; closeTime: string; createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Хүлээгдэж байна", confirmed: "Баталгаажсан", preparing: "Бэлтгэж байна",
  ready: "Бэлэн", completed: "Дууссан", cancelled: "Цуцлагдсан", penalty: "Торгууль",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "secondary", confirmed: "default", preparing: "default",
  ready: "default", completed: "outline", cancelled: "destructive", penalty: "destructive",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<Partial<User>[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // New store form
  const [newStore, setNewStore] = useState({
    name: "", category: "supermarket", address: "", phone: "",
    openTime: "09:00", closeTime: "22:00", rating: 5, image: "", lat: 47.9, lng: 106.9,
  });
  // New product form
  const [newProduct, setNewProduct] = useState({
    name: "", price: 0, category: "", description: "", image: "", storeId: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem("zamzuur_admin_session");
      if (!session) { router.replace("/admin/auth"); return; }
      loadData();
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s, p] = await Promise.all([
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/stores").then(r => r.json()),
        fetch("/api/admin/products").then(r => r.json()),
      ]);
      setUsers(u);
      setStores(s);
      setProducts(p);

      const bizDb = localStorage.getItem("zamzuur_business_db");
      if (bizDb) setBusinesses(JSON.parse(bizDb));

      const ordersDb = localStorage.getItem("zamzuur_orders");
      if (ordersDb) setOrders(JSON.parse(ordersDb));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = async (id: string) => {
    await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const deleteStore = async (id: string) => {
    await fetch(`/api/admin/stores?id=${id}`, { method: "DELETE" });
    setStores(prev => prev.filter(s => s.id !== id));
  };

  const deleteProduct = async (id: string) => {
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const deleteBusiness = (id: string) => {
    const updated = businesses.filter(b => b.id !== id);
    setBusinesses(updated);
    localStorage.setItem("zamzuur_business_db", JSON.stringify(updated));
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/stores", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newStore),
    });
    const created = await res.json();
    setStores(prev => [...prev, created]);
    setNewStore({ name: "", category: "supermarket", address: "", phone: "", openTime: "09:00", closeTime: "22:00", rating: 5, image: "", lat: 47.9, lng: 106.9 });
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newProduct),
    });
    const created = await res.json();
    setProducts(prev => [...prev, created]);
    setNewProduct({ name: "", price: 0, category: "", description: "", image: "", storeId: "" });
  };

  const handleLogout = () => {
    localStorage.removeItem("zamzuur_admin_session");
    router.push("/admin/auth");
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("mn-MN").format(p) + "₮";
  const formatDate = (d: string) => new Date(d).toLocaleDateString("mn-MN");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Уншиж байна...</div>
      </div>
    );
  }

  const totalOrderValue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            <span className="font-semibold">ZamZuur Admin</span>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Гарах
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5"><Shield className="h-3.5 w-3.5" />Тоймлол</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />Хэрэглэгчид
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{users.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-1.5">
              <Store className="h-3.5 w-3.5" />Дэлгүүрүүд
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{stores.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />Бүтээгдэхүүн
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{products.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="businesses" className="gap-1.5">
              <Building2 className="h-3.5 w-3.5" />Байгууллагууд
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{businesses.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" />Захиалгууд
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">{orders.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard icon={<Users className="h-5 w-5 text-blue-500" />} label="Хэрэглэгч" value={users.length} color="bg-blue-500/10" />
              <StatCard icon={<Store className="h-5 w-5 text-green-500" />} label="Дэлгүүр" value={stores.length} color="bg-green-500/10" />
              <StatCard icon={<Package className="h-5 w-5 text-orange-500" />} label="Бүтээгдэхүүн" value={products.length} color="bg-orange-500/10" />
              <StatCard icon={<Building2 className="h-5 w-5 text-purple-500" />} label="Байгууллага" value={businesses.length} color="bg-purple-500/10" />
              <StatCard icon={<ShoppingBag className="h-5 w-5 text-red-500" />} label="Захиалга" value={orders.length} color="bg-red-500/10" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">Захиалгын нийт дүн</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{formatPrice(totalOrderValue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Захиалгын байдал</CardTitle></CardHeader>
                <CardContent className="space-y-1">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => {
                    const count = orders.filter(o => o.status === key).length;
                    if (!count) return null;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <Badge variant={(STATUS_COLORS[key] as any) ?? "secondary"}>{count}</Badge>
                      </div>
                    );
                  })}
                  {!orders.length && <p className="text-sm text-muted-foreground">Захиалга байхгүй</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle className="text-base">Бүртгэлтэй хэрэглэгчид</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {users.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Хэрэглэгч байхгүй</p>}
                  {users.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-sm text-primary">
                        {u.firstName?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.registerNumber} · {u.phone}</p>
                      </div>
                      <p className="hidden text-xs text-muted-foreground sm:block">{formatDate(u.createdAt)}</p>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteUser(u.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── STORES ── */}
          <TabsContent value="stores" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Шинэ дэлгүүр нэмэх</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddStore} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Нэр</Label>
                    <Input placeholder="Дэлгүүрийн нэр" value={newStore.name}
                      onChange={e => setNewStore({ ...newStore, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Ангилал</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={newStore.category} onChange={e => setNewStore({ ...newStore, category: e.target.value })}>
                      <option value="supermarket">Дэлгүүр</option>
                      <option value="coffee">Кофе шоп</option>
                      <option value="food">Хоол</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Хаяг</Label>
                    <Input placeholder="Дүүрэг, хороо..." value={newStore.address}
                      onChange={e => setNewStore({ ...newStore, address: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Утас</Label>
                    <Input placeholder="Утасны дугаар" value={newStore.phone}
                      onChange={e => setNewStore({ ...newStore, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Зургийн URL</Label>
                    <Input placeholder="https://..." value={newStore.image}
                      onChange={e => setNewStore({ ...newStore, image: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Нээх цаг</Label>
                    <Input type="time" value={newStore.openTime}
                      onChange={e => setNewStore({ ...newStore, openTime: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Хаах цаг</Label>
                    <Input type="time" value={newStore.closeTime}
                      onChange={e => setNewStore({ ...newStore, closeTime: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="gap-2"><Plus className="h-4 w-4" />Нэмэх</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Бүх дэлгүүрүүд</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {stores.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                      {s.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.image} alt={s.name} className="h-10 w-10 shrink-0 rounded-lg object-cover bg-muted" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{s.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{s.address}
                        </p>
                      </div>
                      <div className="hidden flex-col items-end gap-1 sm:flex">
                        <Badge variant="outline" className="text-xs">{s.category}</Badge>
                        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{s.rating}
                        </span>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteStore(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PRODUCTS ── */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Шинэ бүтээгдэхүүн нэмэх</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Нэр</Label>
                    <Input placeholder="Бүтээгдэхүүний нэр" value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Үнэ (₮)</Label>
                    <Input type="number" placeholder="0" value={newProduct.price || ""}
                      onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Ангилал</Label>
                    <Input placeholder="Жишээ: Кофе, Хоол" value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Дэлгүүр</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={newProduct.storeId} onChange={e => setNewProduct({ ...newProduct, storeId: e.target.value })} required>
                      <option value="">Дэлгүүр сонгох...</option>
                      {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Тайлбар</Label>
                    <Input placeholder="Товч тайлбар" value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Зургийн URL</Label>
                    <Input placeholder="https://..." value={newProduct.image}
                      onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="gap-2"><Plus className="h-4 w-4" />Нэмэх</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Бүх бүтээгдэхүүнүүд</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-10 w-10 shrink-0 rounded-lg object-contain bg-muted p-1" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category} · {stores.find(s => s.id === p.storeId)?.name ?? p.storeId}</p>
                      </div>
                      <p className="shrink-0 font-bold text-primary text-sm">{formatPrice(p.price)}</p>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteProduct(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── BUSINESSES ── */}
          <TabsContent value="businesses">
            <Card>
              <CardHeader><CardTitle className="text-base">Бүртгэлтэй байгууллагууд</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {businesses.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Байгууллага байхгүй</p>}
                  {businesses.map(b => (
                    <div key={b.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {b.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate font-medium text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.registerNumber} · {b.category}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{b.address}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{b.openTime} – {b.closeTime}
                        </p>
                      </div>
                      <div className="hidden flex-col items-end gap-1 text-xs text-muted-foreground sm:flex">
                        <span>{b.phone}</span>
                        <span>{formatDate(b.createdAt)}</span>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteBusiness(b.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ORDERS ── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader><CardTitle className="text-base">Бүх захиалгууд</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {orders.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Захиалга байхгүй</p>}
                  {orders.slice().reverse().map(o => (
                    <div key={o.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{o.storeName}</p>
                          <Badge variant={(STATUS_COLORS[o.status] as any) ?? "secondary"} className="text-xs">
                            {STATUS_LABELS[o.status] ?? o.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {o.items.length} бараа · {o.pickupDate} {o.pickupTime}
                        </p>
                        <p className="text-xs text-muted-foreground">{o.storeAddress}</p>
                      </div>
                      <p className="shrink-0 font-bold text-primary text-sm">{formatPrice(o.total)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
