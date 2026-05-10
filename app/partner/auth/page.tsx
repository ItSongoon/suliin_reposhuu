"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, Store, Eye, EyeOff, Lock, Clock, MapPin, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/lib/business-context";

function BusinessAuthForm() {
  const router = useRouter();
  const { login, register } = useBusiness();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginRegister, setLoginRegister] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    registerNumber: "",
    name: "",
    category: "",
    phone: "",
    email: "",
    address: "",
    openTime: "09:00",
    closeTime: "22:00",
    password: "",
  });
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const success = await login(loginRegister, loginPassword);
    if (success) {
      router.push("/partner/dashboard");
    } else {
      setError("Регистрийн дугаар эсвэл нууц үг буруу байна.");
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate register number format (just require it to be not empty for now)
    if (!registerData.registerNumber) {
      setError("Байгууллагын регистрийн дугаар оруулна уу.");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.");
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerConfirmPassword) {
      setError("Нууц үг таарахгүй байна.");
      setIsLoading(false);
      return;
    }

    if (!registerData.name || !registerData.phone || !registerData.address) {
      setError("Шаардлагатай талбаруудыг бөглөнө үү.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await register(registerData);
      if (success) {
        router.push("/partner/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Бүртгүүлэхэд алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Нүүр хуудас руу буцах
        </Link>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Байгууллагын систем</CardTitle>
            <CardDescription>
              Та дэлгүүр, үйлчилгээний байгууллага бол энд нэвтрээрэй
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="login">Нэвтрэх</TabsTrigger>
                <TabsTrigger value="register">Бүртгүүлэх</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-register">Байгууллагын регистр</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-register"
                        placeholder="Регистрийн дугаар"
                        className="pl-9"
                        value={loginRegister}
                        onChange={(e) => setLoginRegister(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Нууц үг</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Уншиж байна..." : "Нэвтрэх"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="reg-name">Байгууллагын нэр</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-name"
                          placeholder="Жишээ: CU, Tom N Toms"
                          className="pl-9"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reg-register">Байгууллагын регистр</Label>
                      <Input
                        id="reg-register"
                        placeholder="Жишээ: 1234567"
                        value={registerData.registerNumber}
                        onChange={(e) => setRegisterData({ ...registerData, registerNumber: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-category">Ангилал</Label>
                      <Input
                        id="reg-category"
                        placeholder="Жишээ: Кофе шоп"
                        value={registerData.category}
                        onChange={(e) => setRegisterData({ ...registerData, category: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Утас</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          placeholder="Утасны дугаар"
                          className="pl-9"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">И-мэйл (заавал биш)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="И-мэйл хаяг"
                          className="pl-9"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="reg-address">Дэлгэрэнгүй хаяг</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-address"
                          placeholder="СБД, 1-р хороо..."
                          className="pl-9"
                          value={registerData.address}
                          onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-open">Нээх цаг</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-open"
                          type="time"
                          className="pl-9"
                          value={registerData.openTime}
                          onChange={(e) => setRegisterData({ ...registerData, openTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-close">Хаах цаг</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-close"
                          type="time"
                          className="pl-9"
                          value={registerData.closeTime}
                          onChange={(e) => setRegisterData({ ...registerData, closeTime: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Нууц үг</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm">Нууц үг давтах</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reg-confirm"
                          type={showRegisterConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-9 pr-10"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowRegisterConfirm(!showRegisterConfirm)}
                        >
                          {showRegisterConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Уншиж байна..." : "Бүртгүүлэх"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BusinessAuthPage() {
  return <BusinessAuthForm />;
}
