"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { TransportType } from "./types";

export interface Destination {
  id: string;
  name: string;
  time: string;
}

export interface PlanSchedule {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: number;
  cost: number;
}

export interface PlanResult {
  id: string;
  userId?: string; // If null, means guest plan
  createdAt: string;
  destinations: Destination[];
  transport: TransportType;
  budget: number;
  totalTime: number;
  totalCost: number;
  schedule: PlanSchedule[];
}

interface PlanContextType {
  plans: PlanResult[];
  savePlan: (plan: Omit<PlanResult, "id" | "createdAt">) => void;
  deletePlan: (id: string) => void;
  getUserPlans: (userId: string) => PlanResult[];
  getLatestPlan: () => PlanResult | null;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<PlanResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load plans from localStorage
  useEffect(() => {
    const savedPlans = localStorage.getItem("zamzuur_plans");
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (e) {
        console.error("Failed to parse plans", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save plans to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("zamzuur_plans", JSON.stringify(plans));
    }
  }, [plans, isLoaded]);

  const savePlan = (planData: Omit<PlanResult, "id" | "createdAt">) => {
    const newPlan: PlanResult = {
      ...planData,
      id: `PLAN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setPlans((prev) => {
      // Keep only last 10 plans to avoid localStorage bloat
      const newPlans = [newPlan, ...prev];
      return newPlans.slice(0, 10);
    });
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const getUserPlans = (userId: string) => {
    return plans.filter((p) => p.userId === userId);
  };

  const getLatestPlan = () => {
    return plans.length > 0 ? plans[0] : null;
  };

  return (
    <PlanContext.Provider value={{ plans, savePlan, deletePlan, getUserPlans, getLatestPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlans() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlans must be used within a PlanProvider");
  }
  return context;
}
