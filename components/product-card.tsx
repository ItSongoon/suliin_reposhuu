"use client";

import { useState } from "react";
import { Plus, Minus, MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useOrders } from "@/lib/order-context";
import { useReviews } from "@/lib/review-context";
import type { Product, Store } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  store: Store;
}

export function ProductCard({ product, store }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const { getProductReviews, addProductReview } = useReviews();
  
  const [commentText, setCommentText] = useState("");
  
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const reviews = getProductReviews(product.id);

  // Check if user has bought this product and order is completed
  const hasBought = () => {
    if (!user) return false;
    const userOrders = getUserOrders(user.id);
    return userOrders.some(order => 
      order.status === "completed" && 
      order.items.some(item => item.product.id === product.id)
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("mn-MN").format(price) + "₮";
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    
    addProductReview(
      product.id,
      user.id,
      `${user.firstName} ${user.lastName}`,
      commentText.trim()
    );
    setCommentText("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("mn-MN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <Card className="overflow-hidden">
      <Dialog>
        <DialogTrigger asChild>
          <div className="relative h-32 bg-secondary cursor-pointer hover:opacity-90 transition-opacity">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-secondary-foreground/20">
                {product.name.charAt(0)}
              </span>
            </div>
            {reviews.length > 0 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur px-2 py-1 rounded-md text-xs font-medium">
                <MessageSquare className="h-3 w-3" />
                {reviews.length}
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <div className="font-semibold text-primary text-lg">
              {formatPrice(product.price)}
            </div>
            
            <div className="border-t border-border pt-4 mt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> 
                Сэтгэгдэл ({reviews.length})
              </h4>
              
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Сэтгэгдэл байхгүй байна.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="bg-muted/50 p-3 rounded-lg text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {hasBought() ? (
                <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                  <Input 
                    placeholder="Сэтгэгдэл үлдээх..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!commentText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="mt-4 text-xs text-center text-muted-foreground bg-muted p-2 rounded-md">
                  Энэ барааг худалдан авсан хэрэглэгч сэтгэгдэл бичих боломжтой.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <CardContent className="p-4">
        <h4 className="font-medium text-foreground line-clamp-1">
          {product.name}
        </h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={() => addItem(product, store)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Нэмэх
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => addItem(product, store)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
