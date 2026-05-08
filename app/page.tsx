"use client";

import Link from "next/link";
import { MapPin, Clock, Calendar, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";


function HomePage() {
  const features = [
    {
      icon: MapPin,
      title: "Ойр дэлгүүр хайх",
      description: "Таны байршилд хамгийн ойр байрлах дэлгүүр, кофе шоп, хоолны газруудыг харуулна.",
    },
    {
      icon: ShoppingBag,
      title: "Урьдчилан захиалах",
      description: "Бараагаа урьдчилан захиалж, дэлгүүрт очоод шууд авах боломжтой.",
    },
    {
      icon: Calendar,
      title: "Өдрийн төлөвлөгөө",
      description: "Өдрийн явах газруудаа оруулж, тээврийн хэрэгсэл, төсвөө тооцоолно.",
    },
  ];

  const benefits = [
    "Цаг хэмнэнэ",
    "Мөнгө хэмнэнэ",
    "Хялбар төлөвлөлт",
    "Хурдан захиалга",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,222,149,0.3),transparent_50%)]" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
                Таны цагийг хэмнэх ухаалаг туслах
              </h1>
              <p className="mt-6 text-pretty text-lg text-primary-foreground/80 md:text-xl">
                ZamZuur нь таны өдөр тутмын худалдан авалт, захиалга, 
                маршрут төлөвлөлтийг хялбарчилж, цагийг үр дүнтэй ашиглахад тусална.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/stores">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <MapPin className="mr-2 h-5 w-5" />
                    Дэлгүүр хайх
                  </Button>
                </Link>
                <Link href="/planner">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Calendar className="mr-2 h-5 w-5" />
                    Төлөвлөгөө гаргах
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Гурван үндсэн боломж
              </h2>
              <p className="mt-4 text-muted-foreground">
                ZamZuur нь таны өдөр тутмын амьдралыг хялбарчлах гурван гол боломжийг санал болгоно.
              </p>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-4">
                      <Link 
                        href={index === 2 ? "/planner" : "/stores"}
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        Дэлгэрэнгүй
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-secondary/30 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Хэрхэн ажилладаг вэ?
              </h2>
            </div>
            
            <div className="mt-16 grid gap-8 md:grid-cols-4">
              {[
                { step: "01", title: "Бүртгүүлэх", desc: "Регистрийн дугаараар бүртгүүлнэ" },
                { step: "02", title: "Байршил сонгох", desc: "Өөрийн байршлаа оруулна" },
                { step: "03", title: "Дэлгүүр хайх", desc: "Ойр дэлгүүрүүдээс сонгоно" },
                { step: "04", title: "Захиалах", desc: "Бараагаа урьдчилан захиална" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  Яагаад ZamZuur-ийг сонгох вэ?
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Бид таны өдөр тутмын амьдралыг илүү хялбар, үр дүнтэй болгохыг зорьдог.
                </p>
                <ul className="mt-8 space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link href="/auth">
                    <Button size="lg">
                      Одоо бүртгүүлэх
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-secondary p-8">
                  <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-xl bg-card p-6 shadow-lg">
                    <Clock className="h-16 w-16 text-primary" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">30%</div>
                      <p className="mt-1 text-muted-foreground">Цаг хэмнэлт</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
              Өнөөдрөөс эхэлж цагаа хэмнээрэй
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              ZamZuur-т бүртгүүлж, өдөр тутмын худалдан авалт, төлөвлөгөөгөө хялбарчлаарай.
            </p>
            <div className="mt-8">
              <Link href="/auth">
                <Button size="lg" variant="secondary">
                  Үнэгүй бүртгүүлэх
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return <HomePage />;
}

