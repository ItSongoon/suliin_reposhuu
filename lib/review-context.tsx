"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ProductReview, StoreRating } from "./types";

interface ReviewContextType {
  reviews: ProductReview[];
  ratings: StoreRating[];
  addProductReview: (productId: string, userId: string, userName: string, comment: string) => void;
  getProductReviews: (productId: string) => ProductReview[];
  addStoreRating: (storeId: string, userId: string, rating: number) => void;
  getStoreRating: (storeId: string) => { average: number; count: number; userRating?: number };
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// Dummy initial data for reviews
const initialReviews: ProductReview[] = [
  {
    id: "rev-1",
    productId: "p1", // Сүү
    userId: "u1",
    userName: "Бат",
    comment: "Хугацаа нь дуусах дөхсөн байсан ч дажгүй.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rev-2",
    productId: "p1",
    userId: "u2",
    userName: "Дорж",
    comment: "Их сайн сүү.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [ratings, setRatings] = useState<StoreRating[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem("zamzuur_reviews");
    const savedRatings = localStorage.getItem("zamzuur_ratings");
    
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews(initialReviews);
    }

    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
    
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("zamzuur_reviews", JSON.stringify(reviews));
      localStorage.setItem("zamzuur_ratings", JSON.stringify(ratings));
    }
  }, [reviews, ratings, isLoaded]);

  const addProductReview = (productId: string, userId: string, userName: string, comment: string) => {
    const newReview: ProductReview = {
      id: `REV-${Date.now()}`,
      productId,
      userId,
      userName,
      comment,
      createdAt: new Date().toISOString(),
    };
    
    setReviews((prev) => [newReview, ...prev]);
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const addStoreRating = (storeId: string, userId: string, rating: number) => {
    setRatings((prev) => {
      // Check if user already rated this store
      const existingIndex = prev.findIndex((r) => r.storeId === storeId && r.userId === userId);
      
      const newRating: StoreRating = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `RAT-${Date.now()}`,
        storeId,
        userId,
        rating,
        createdAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const newRatings = [...prev];
        newRatings[existingIndex] = newRating;
        return newRatings;
      }
      
      return [...prev, newRating];
    });
  };

  const getStoreRating = (storeId: string) => {
    const storeRatings = ratings.filter((r) => r.storeId === storeId);
    
    if (storeRatings.length === 0) return { average: 0, count: 0 };
    
    const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const average = sum / storeRatings.length;
    
    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: storeRatings.length,
    };
  };

  return (
    <ReviewContext.Provider value={{ reviews, ratings, addProductReview, getProductReviews, addStoreRating, getStoreRating }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return context;
}
