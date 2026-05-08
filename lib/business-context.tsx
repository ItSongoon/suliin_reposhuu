"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Business } from "./types";

interface BusinessContextType {
  business: Business | null;
  login: (registerNumber: string, password: string) => Promise<boolean>;
  register: (data: Omit<Business, "id" | "createdAt">) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBusiness = localStorage.getItem("zamzuur_business");
    if (savedBusiness) {
      try {
        setBusiness(JSON.parse(savedBusiness));
      } catch (e) {
        console.error("Failed to parse business from localStorage", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (registerNumber: string, password: string) => {
    // In a real app, this would be an API call
    // For demo, we check localStorage
    
    // Check local storage for all registered businesses (simulated DB)
    const db = localStorage.getItem("zamzuur_business_db");
    if (db) {
      const businesses: Business[] = JSON.parse(db);
      const found = businesses.find(
        (b) => b.registerNumber === registerNumber && b.password === password
      );
      
      if (found) {
        setBusiness(found);
        localStorage.setItem("zamzuur_business", JSON.stringify(found));
        return true;
      }
    }
    
    // Check currently saved single business as fallback
    if (business && business.registerNumber === registerNumber && business.password === password) {
      return true;
    }
    
    return false;
  };

  const register = async (data: Omit<Business, "id" | "createdAt">) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newBusiness: Business = {
      ...data,
      id: `BUS-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Save to our simulated DB
    const dbStr = localStorage.getItem("zamzuur_business_db");
    const businesses: Business[] = dbStr ? JSON.parse(dbStr) : [];
    
    // Check if exists
    if (businesses.some(b => b.registerNumber === data.registerNumber)) {
      throw new Error("Энэ байгууллагын регистртэй бүртгэл үүссэн байна");
    }
    
    businesses.push(newBusiness);
    localStorage.setItem("zamzuur_business_db", JSON.stringify(businesses));

    // Auto login
    setBusiness(newBusiness);
    localStorage.setItem("zamzuur_business", JSON.stringify(newBusiness));

    return true;
  };

  const logout = () => {
    setBusiness(null);
    localStorage.removeItem("zamzuur_business");
  };

  return (
    <BusinessContext.Provider value={{ business, login, register, logout, isLoading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
