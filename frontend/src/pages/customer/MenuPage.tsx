/**
 * Customer Menu Page
 * Enhanced menu display with full cart functionality and polished styling
 */

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Plus, Minus, Utensils, Star, ChefHat, Sparkles, Check } from 'lucide-react';
import api from '../../lib/api.ts';
import { useCartStore } from '../../stores/cartStore.ts';
import { useSessionStore } from '../../stores/sessionStore.ts';
import type { MenuData, MenuItem, AppliedModifier } from '../../types/index.ts';
import CartDrawer from './CartDrawer.tsx';

/**
 * Format price in INR
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Menu Page Component
 */
export default function MenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const { session } = useSessionStore();
  const { items, addItem, setTaxSettings, getItemCount } = useCartStore();

  // Fetch menu data
  const { data: menuData, isLoading, error } = useQuery<MenuData>({
    queryKey: ['menu', restaurantSlug],
    queryFn: () => api.getMenu(restaurantSlug!),
    enabled: !!restaurantSlug,
  });

  // Set tax settings when menu loads
  useEffect(() => {
    if (menuData?.restaurant.settings) {
      setTaxSettings(
        menuData.restaurant.settings.taxRate,
        menuData.restaurant.settings.serviceChargePercent
      );
    }
  }, [menuData, setTaxSettings]);

  // Set first category as selected
  useEffect(() => {
    if (menuData?.categories.length && !selectedCategory) {
      setSelectedCategory(menuData.categories[0].id);
    }
  }, [menuData, selectedCategory]);

  // Scroll to selected category
  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle add to cart with visual feedback
  const handleAddToCart = (item: MenuItem, quantity: number = 1, modifiers: AppliedModifier[] = [], notes: string = '') => {
    addItem(item, quantity, modifiers, notes);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1500);
  };

  // Get quantity of item in cart
  const getItemQuantity = (menuItemId: string): number => {
    return items
      .filter((item) => item.menuItem.id === menuItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-6"></div>
            <ChefHat className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-600 font-medium">Preparing your menu...</p>
          <p className="text-gray-400 text-sm mt-1">Just a moment</p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load menu</h2>
          <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const itemCount = getItemCount();
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  {menuData.restaurant.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>4.8</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>Table {session?.tableNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:scale-105 active:scale-95"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-orange-500 text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div
          ref={categoryScrollRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {menuData.categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => scrollToCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 scale-105'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-100 hover:border-orange-200'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Categories */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {menuData.categories.map((category, catIndex) => (
          <div
            key={category.id}
            id={`category-${category.id}`}
            className="mb-10 scroll-mt-36"
            style={{ animationDelay: `${catIndex * 100}ms` }}
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  {category.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid gap-4">
              {category.items.map((item, itemIndex) => {
                const quantity = getItemQuantity(item.id);
                const isJustAdded = addedItemId === item.id;
                
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={quantity}
                    isJustAdded={isJustAdded}
                    onAddToCart={() => {
                      if (item.modifiers.length > 0) {
                        setSelectedItem(item);
                      } else {
                        handleAddToCart(item, 1, [], '');
                      }
                    }}
                    onIncrement={() => handleAddToCart(item, 1, [], '')}
                    style={{ animationDelay: `${itemIndex * 50}ms` }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-50 animate-slide-in">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl shadow-xl shadow-orange-300/50 flex items-center justify-between hover:from-orange-600 hover:to-amber-600 transition-all hover:shadow-2xl hover:shadow-orange-400/50 active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-orange-500 text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <span className="font-medium">View Cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        restaurantSlug={restaurantSlug!}
      />

      {/* Item Modifier Modal */}
      {selectedItem && (
        <ItemModifierModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={(quantity, modifiers, notes) => {
            handleAddToCart(selectedItem, quantity, modifiers, notes);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

// Import ChevronRight for the cart button
import { ChevronRight } from 'lucide-react';

/**
 * Menu Item Card Component - Enhanced with quantity controls
 */
function MenuItemCard({
  item,
  quantity,
  isJustAdded,
  onAddToCart,
  onIncrement,
  style,
}: {
  item: MenuItem;
  quantity: number;
  isJustAdded: boolean;
  onAddToCart: () => void;
  onIncrement: () => void;
  style?: React.CSSProperties;
}) {
  const { removeItem, updateQuantity, items } = useCartStore();
  
  // Get cart items for this menu item
  const cartItems = items.filter((i) => i.menuItem.id === item.id);
  
  const handleDecrement = () => {
    if (cartItems.length > 0) {
      const lastItem = cartItems[cartItems.length - 1];
      if (lastItem.quantity > 1) {
        updateQuantity(lastItem.id, lastItem.quantity - 1);
      } else {
        removeItem(lastItem.id);
      }
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm overflow-hidden flex transition-all duration-300 hover:shadow-lg hover:shadow-orange-100 border border-gray-100 hover:border-orange-200 ${isJustAdded ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
      style={style}
    >
      {/* Item Image */}
      <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
            <Utensils className="w-8 h-8 text-orange-300" />
          </div>
        )}
        
        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Unavailable</span>
          </div>
        )}
        
        {/* Just Added Indicator */}
        {isJustAdded && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full animate-scale-in">
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {item.name}
            </h3>
            {item.modifiers.length > 0 && (
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description || 'Delicious item from our kitchen'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(item.price)}
            </span>
            {item.modifiers.length > 0 && (
              <span className="text-xs text-gray-400">Customizable</span>
            )}
          </div>

          {/* Add/Quantity Controls */}
          {quantity === 0 ? (
            <button
              onClick={onAddToCart}
              disabled={!item.isAvailable}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                item.isAvailable
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-200 hover:shadow-lg hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-orange-50 rounded-xl p-1">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors shadow-sm active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={onIncrement}
                disabled={!item.isAvailable}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Item Modifier Modal Component - Enhanced styling
 */
function ItemModifierModal({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (quantity: number, modifiers: AppliedModifier[], notes: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Map<string, string[]>>(
    new Map()
  );
  const [notes, setNotes] = useState('');

  // Calculate total price
  let totalPrice = item.price * quantity;
  selectedModifiers.forEach((optionIds, modifierId) => {
    const modifier = item.modifiers.find((m) => m.id === modifierId);
    if (modifier) {
      optionIds.forEach((optionId) => {
        const option = modifier.options.find((o) => o.id === optionId);
        if (option) {
          totalPrice += option.price * quantity;
        }
      });
    }
  });

  const handleModifierChange = (
    modifierId: string,
    optionId: string,
    isMulti: boolean
  ) => {
    setSelectedModifiers((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(modifierId) || [];

      if (isMulti) {
        if (current.includes(optionId)) {
          newMap.set(
            modifierId,
            current.filter((id) => id !== optionId)
          );
        } else {
          newMap.set(modifierId, [...current, optionId]);
        }
      } else {
        newMap.set(modifierId, [optionId]);
      }

      return newMap;
    });
  };

  const handleAdd = () => {
    const modifiers: AppliedModifier[] = [];
    selectedModifiers.forEach((optionIds, modifierId) => {
      modifiers.push({ modifierId, optionIds });
    });
    onAdd(quantity, modifiers, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="text-white/80 text-sm mt-1">{item.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 text-2xl font-bold">
            {formatPrice(item.price)}
          </div>
        </div>

        {/* Modifiers */}
        <div className="p-6 space-y-6">
          {item.modifiers.map((modifier) => (
            <div key={modifier.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {modifier.name}
                  {modifier.required && (
                    <span className="text-orange-500 ml-1">*</span>
                  )}
                </h3>
                {modifier.required && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {modifier.options.map((option) => {
                  const isSelected =
                    selectedModifiers.get(modifier.id)?.includes(option.id) ||
                    false;

                  return (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-400 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-orange-500 border-orange-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {option.name}
                        </span>
                      </div>
                      {option.price > 0 && (
                        <span className="text-orange-600 font-semibold">
                          +{formatPrice(option.price)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Special Instructions
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests? (optional)"
              className="w-full p-4 bg-gray-50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quantity</span>
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900 text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="text-right">
              <span className="text-sm text-gray-500">Total</span>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </div>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl active:scale-[0.98]"
          >
            Add to Cart • {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Import X for modal close button
import { X } from 'lucide-react';
