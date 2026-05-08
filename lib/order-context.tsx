"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Order, CartItem } from "./types";

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "qrCode" | "missedPickups" | "penaltyAmount" | "isPenaltyPaid" | "createdAt">) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  cancelOrder: (orderId: string) => boolean;
  canCancelOrder: (orderId: string) => boolean;
  getCancelTimeRemaining: (orderId: string) => number;
  markMissedPickup: (orderId: string) => void;
  payPenalty: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getUserOrders: (userId: string) => Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const CANCEL_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function generateQRCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ZZ-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("zamzuur_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("zamzuur_orders", JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData: Omit<Order, "id" | "qrCode" | "missedPickups" | "penaltyAmount" | "isPenaltyPaid" | "createdAt">): Order => {
    const newOrder: Order = {
      ...orderData,
      id: generateOrderId(),
      qrCode: generateQRCode(),
      missedPickups: 0,
      penaltyAmount: 0,
      isPenaltyPaid: false,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  const canCancelOrder = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (order.status === "cancelled" || order.status === "completed" || order.status === "penalty") return false;

    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    return elapsed < CANCEL_WINDOW_MS;
  };

  const getCancelTimeRemaining = (orderId: string): number => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return 0;

    const elapsed = Date.now() - new Date(order.createdAt).getTime();
    const remaining = CANCEL_WINDOW_MS - elapsed;
    return Math.max(0, remaining);
  };

  const cancelOrder = (orderId: string): boolean => {
    if (!canCancelOrder(orderId)) return false;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" as const } : order
      )
    );
    return true;
  };

  const markMissedPickup = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const newMissedPickups = order.missedPickups + 1;

        // 3 удаа авахгүй бол 50% торгууль
        if (newMissedPickups >= 3) {
          return {
            ...order,
            missedPickups: newMissedPickups,
            status: "penalty" as const,
            penaltyAmount: order.total * 0.5,
          };
        }

        return {
          ...order,
          missedPickups: newMissedPickups,
        };
      })
    );
  };

  const payPenalty = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, isPenaltyPaid: true, status: "cancelled" as const }
          : order
      )
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        cancelOrder,
        canCancelOrder,
        getCancelTimeRemaining,
        markMissedPickup,
        payPenalty,
        getOrderById,
        getUserOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
