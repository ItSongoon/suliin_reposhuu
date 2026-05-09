"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, LogOut, Store, Package, GitBranch, Settings,
  Clock, CheckCircle, XCircle, Save, MapPin, Phone, Tag, ImageIcon,
  LayoutGrid, List, Upload, Camera, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from "@/lib/business-context";

interface BusinessProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}

const emptyProduct: Omit<BusinessProduct, "id"> = {
  name: "", price: 0, category: "", description: "", image: "",
};

const emptyBranch: Omit<Branch, "id"> = {
  name: "", address: "", phone: "", openTime: "09:00", closeTime: "22:00",
};

export default function PartnerDashboard() {
  const router = useRouter();
  const { business, logout, isLoading } = useBusiness();

  const [products, setProducts] = useState<BusinessProduct[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newProduct, setNewProduct] = useState({ ...emptyProduct });
  const [newBranch, setNewBranch] = useState({ ...emptyBranch });
  const [settings, setSettings] = useState({ openTime: "", closeTime: "" });
  const [savedSettings, setSavedSettings] = useState(false);
  const [productView, setProductView] = useState<"grid" | "list">("grid");

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewProduct(prev => ({ ...prev, image: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isLoading && !business) {
      router.replace("/partner/auth");
    }
  }, [business, isLoading, router]);

  useEffect(() => {
    if (!business) return;
    const key = `biz_products_${business.id}`;
    const branchKey = `biz_branches_${business.id}`;
    const stored = localStorage.getItem(key);
    const storedBranches = localStorage.getItem(branchKey);
    if (stored) setProducts(JSON.parse(stored));
    if (storedBranches) setBranches(JSON.parse(storedBranches));
    setSettings({ openTime: business.openTime, closeTime: business.closeTime });
  }, [business]);

  if (isLoading || !business) return null;

  const isOpen = () => {
    const now = new Date();
    const cur = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    return cur >= settings.openTime && cur <= settings.closeTime;
  };

  const saveProducts = (list: BusinessProduct[]) => {
    setProducts(list);
    localStorage.setItem(`biz_products_${business.id}`, JSON.stringify(list));
  };

  const saveBranches = (list: Branch[]) => {
    setBranches(list);
    localStorage.setItem(`biz_branches_${business.id}`, JSON.stringify(list));
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const item: BusinessProduct = { ...newProduct, id: `prod_${Date.now()}` };
    saveProducts([...products, item]);
    setNewProduct({ ...emptyProduct });
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name || !newBranch.address) return;
    const item: Branch = { ...newBranch, id: `branch_${Date.now()}` };
    saveBranches([...branches, item]);
    setNewBranch({ ...emptyBranch });
  };

  const handleSaveSettings = () => {
    const db = localStorage.getItem("zamzuur_business_db");
    if (db) {
      const businesses = JSON.parse(db);
      const updated = businesses.map((b: any) =>
        b.id === business.id ? { ...b, openTime: settings.openTime, closeTime: settings.closeTime } : b
      );
      localStorage.setItem("zamzuur_business_db", JSON.stringify(updated));
      const cur = localStorage.getItem("zamzuur_business");
      if (cur) {
        const parsed = JSON.parse(cur);
        localStorage.setItem("zamzuur_business", JSON.stringify({ ...parsed, ...settings }));
      }
    }
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("mn-MN").format(p) + "₮";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{business.name}</p>
              <p className="text-xs text-muted-foreground">{business.registerNumber}</p>
            </div>
            <Badge variant={isOpen() ? "default" : "secondary"} className="ml-1 gap-1 text-xs">
              {isOpen() ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {isOpen() ? "Нээлттэй" : "Хаалттай"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => { logout(); router.push("/partner/auth"); }}
          >
            <LogOut className="h-4 w-4" />
            Гарах
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Store className="h-4 w-4" />
              Тоймлол
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Бараа
              {products.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{products.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="branches" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Салбар
              {branches.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{branches.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Тохиргоо
            </TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Package className="h-5 w-5 text-primary" />} label="Бараа бүтээгдэхүүн" value={products.length} />
              <StatCard icon={<GitBranch className="h-5 w-5 text-primary" />} label="Салбар" value={branches.length} />
              <StatCard icon={<Clock className="h-5 w-5 text-primary" />} label="Нээх цаг" value={settings.openTime || business.openTime} />
              <StatCard icon={<Clock className="h-5 w-5 text-primary" />} label="Хаах цаг" value={settings.closeTime || business.closeTime} />
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Байгууллагын мэдээлэл</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row icon={<Store className="h-4 w-4" />} label="Нэр" value={business.name} />
                <Row icon={<Tag className="h-4 w-4" />} label="Ангилал" value={business.category} />
                <Row icon={<MapPin className="h-4 w-4" />} label="Хаяг" value={business.address} />
                <Row icon={<Phone className="h-4 w-4" />} label="Утас" value={business.phone} />
                <Row icon={<Clock className="h-4 w-4" />} label="Цагийн хуваарь" value={`${settings.openTime || business.openTime} – ${settings.closeTime || business.closeTime}`} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PRODUCTS ── */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Шинэ бараа нэмэх</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Барааны нэр</Label>
                    <Input placeholder="Жишээ: Капучино" value={newProduct.name}
                      onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Үнэ (₮)</Label>
                    <Input type="number" placeholder="5000" value={newProduct.price || ""}
                      onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Ангилал</Label>
                    <Input placeholder="Жишээ: Кофе, Амттан" value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Зураг (заавал биш)</Label>
                    {newProduct.image ? (
                      <div className="relative w-full rounded-xl border bg-muted overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={newProduct.image} alt="preview" className="mx-auto h-40 object-contain p-3" />
                        <button
                          type="button"
                          onClick={() => setNewProduct(prev => ({ ...prev, image: "" }))}
                          className="absolute right-2 top-2 rounded-full bg-background/80 p-1 backdrop-blur hover:bg-destructive hover:text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-4 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                          <Upload className="h-5 w-5" />
                          Файл
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                        </label>
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-4 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                          <Camera className="h-5 w-5" />
                          Камер
                          <input type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                        </label>
                        <div className="space-y-1">
                          <div className="relative flex h-full items-center rounded-xl border-2 border-dashed px-2">
                            <ImageIcon className="absolute left-2 h-4 w-4 shrink-0 text-muted-foreground" />
                            <input
                              placeholder="URL..."
                              className="w-full bg-transparent pl-6 text-xs outline-none placeholder:text-muted-foreground"
                              value={newProduct.image}
                              onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Тайлбар (заавал биш)</Label>
                    <Input placeholder="Барааны товч тайлбар" value={newProduct.description}
                      onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="gap-2">
                      <Plus className="h-4 w-4" /> Нэмэх
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {products.length === 0 ? (
              <EmptyState icon={<Package className="h-8 w-8" />} text="Бараа бүтээгдэхүүн байхгүй байна." />
            ) : (
              <>
                {/* View toggle */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Нийт {products.length} бараа</p>
                  <div className="flex items-center rounded-lg border p-0.5">
                    <button
                      onClick={() => setProductView("grid")}
                      className={`rounded-md p-1.5 transition-colors ${productView === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setProductView("list")}
                      className={`rounded-md p-1.5 transition-colors ${productView === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Grid view */}
                {productView === "grid" && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map(p => (
                      <Card key={p.id} className="p-0 gap-0 overflow-hidden">
                        {p.image && (
                          <div className="h-36 bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.image} alt={p.name} className="h-full w-full object-contain p-3" />
                          </div>
                        )}
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-sm">{p.name}</p>
                              {p.category && <Badge variant="outline" className="mt-1 text-xs">{p.category}</Badge>}
                              <p className="mt-1 font-bold text-primary">{formatPrice(p.price)}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                              onClick={() => saveProducts(products.filter(x => x.id !== p.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* List view */}
                {productView === "list" && (
                  <div className="divide-y rounded-xl border overflow-hidden">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-background px-4 py-3 hover:bg-muted/40 transition-colors">
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={p.name} className="h-12 w-12 shrink-0 rounded-lg object-contain bg-muted p-1" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-sm">{p.name}</p>
                          {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                        </div>
                        <p className="shrink-0 font-bold text-primary text-sm">{formatPrice(p.price)}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={() => saveProducts(products.filter(x => x.id !== p.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ── BRANCHES ── */}
          <TabsContent value="branches" className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Шинэ салбар нэмэх</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddBranch} className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Салбарын нэр</Label>
                    <Input placeholder="Жишээ: 1-р салбар, Хан-Уул" value={newBranch.name}
                      onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Утас</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Утасны дугаар" className="pl-9" value={newBranch.phone}
                        onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Хаяг</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Дүүрэг, хороо, байшин..." className="pl-9" value={newBranch.address}
                        onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Нээх цаг</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="time" className="pl-9" value={newBranch.openTime}
                        onChange={e => setNewBranch({ ...newBranch, openTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Хаах цаг</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="time" className="pl-9" value={newBranch.closeTime}
                        onChange={e => setNewBranch({ ...newBranch, closeTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" className="gap-2">
                      <Plus className="h-4 w-4" /> Нэмэх
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {branches.length === 0 ? (
              <EmptyState icon={<GitBranch className="h-8 w-8" />} text="Салбар байхгүй байна." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {branches.map(b => (
                  <Card key={b.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold text-sm">{b.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />{b.address}
                          </p>
                          {b.phone && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 shrink-0" />{b.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />{b.openTime} – {b.closeTime}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={() => saveBranches(branches.filter(x => x.id !== b.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── SETTINGS ── */}
          <TabsContent value="settings">
            <Card className="max-w-lg">
              <CardHeader><CardTitle className="text-base">Цагийн тохиргоо</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Нээх цаг</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="time" className="pl-9" value={settings.openTime}
                        onChange={e => setSettings({ ...settings, openTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Хаах цаг</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="time" className="pl-9" value={settings.closeTime}
                        onChange={e => setSettings({ ...settings, closeTime: e.target.value })} />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveSettings} className="gap-2">
                  <Save className="h-4 w-4" />
                  {savedSettings ? "Хадгалагдлаа!" : "Хадгалах"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      {icon}
      <span className="w-24 shrink-0 text-xs">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-muted-foreground">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}
