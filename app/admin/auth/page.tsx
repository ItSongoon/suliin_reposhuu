"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAuthPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 400));
    if (username === "ADMIN" && password === "Admin123") {
      localStorage.setItem("zamzuur_admin_session", "true");
      router.push("/admin/dashboard");
    } else {
      setError("Нэр эсвэл нууц үг буруу байна.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Админ панел</CardTitle>
            <CardDescription>Зөвшөөрөлтэй хэрэглэгчид л нэвтрэх боломжтой</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label>Нэр</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Admin" value={username}
                    onChange={e => setUsername(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Нууц үг</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" type="password" placeholder="••••••••" value={password}
                    onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Шалгаж байна..." : "Нэвтрэх"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
