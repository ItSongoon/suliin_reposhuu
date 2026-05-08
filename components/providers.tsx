"use client";

import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { OrderProvider } from "@/lib/order-context";
import { PlanProvider } from "@/lib/plan-context";
import { BusinessProvider } from "@/lib/business-context";
import { ReviewProvider } from "@/lib/review-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BusinessProvider>
        <ReviewProvider>
          <CartProvider>
            <OrderProvider>
              <PlanProvider>
                {children}
              </PlanProvider>
            </OrderProvider>
          </CartProvider>
        </ReviewProvider>
      </BusinessProvider>
    </AuthProvider>
  );
}
