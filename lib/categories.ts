import { Bus, Clapperboard, type LucideIcon, ShoppingBag, ShoppingCart, Sparkles, Utensils, Wallet } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Yemek: Utensils,
  Market: ShoppingCart,
  Ulaşım: Bus,
  Eğlence: Clapperboard,
  Alışveriş: ShoppingBag,
  Diğer: Sparkles,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Wallet;
}
