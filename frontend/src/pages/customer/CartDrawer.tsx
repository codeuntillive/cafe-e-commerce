/**
 * Cart Drawer Component
 * Enhanced floating cart drawer with order summary and polished styling
 */

import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ChefHat, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore.ts';
import { useSessionStore } from '../../stores/sessionStore.ts';
import api from '../../lib/api.ts';
import type { CartItem } from '../../types/index.ts';

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

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantSlug: string;
}

export default function CartDrawer({ isOpen, onClose, restaurantSlug }: CartDrawerProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useSessionStore();
  const { items, getCart, removeItem, updateQuantity, clearCart } = useCartStore();

  const cart = getCart();

  const handlePlaceOrder = async () => {
    if (!session?.tableId || !session?.restaurantId) {
      setError('Session expired. Please scan QR code again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        items: items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          modifiersApplied: item.modifiersApplied,
          notes: item.notes || undefined,
        })),
        notes: undefined,
      };

      const order = await api.createOrder(orderData);
      
      // Clear cart and navigate to success page
      clearCart();
      onClose();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Cart</h2>
                <p className="text-white/80 text-sm">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some delicious items from our menu
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(quantity) => {
                    if (quantity === 0) {
                      removeItem(item.id);
                    } else {
                      updateQuantity(item.id, quantity);
                    }
                  }}
                  onRemove={() => removeItem(item.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-4 space-y-4">
            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cart.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>{formatPrice(cart.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service Charge (10%)</span>
                <span>{formatPrice(cart.serviceCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-orange-600">{formatPrice(cart.grandTotal)}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-start gap-2">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3" />
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || items.length === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Place Order</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="w-full text-gray-500 py-2 text-sm hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Cart Item Card Component - Enhanced styling
 */
function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
  style,
}: {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm overflow-hidden flex gap-3 p-3 border border-gray-100 hover:border-orange-200 transition-all"
      style={style}
    >
      {/* Item Image */}
      {item.menuItem.imageUrl && (
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={item.menuItem.imageUrl}
            alt={item.menuItem.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 truncate text-sm">
            {item.menuItem.name}
          </h4>
          
          {/* Modifiers */}
          {item.modifiersApplied.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {item.modifiersApplied
                .map((m) => {
                  const modifier = item.menuItem.modifiers.find(
                    (mod) => mod.id === m.modifierId
                  );
                  const optionNames = m.optionIds
                    .map((oid) => modifier?.options.find((o) => o.id === oid)?.name)
                    .filter(Boolean)
                    .join(', ');
                  return optionNames;
                })
                .filter(Boolean)
                .join(' • ')}
            </p>
          )}

          {/* Notes */}
          {item.notes && (
            <p className="text-xs text-orange-500 mt-0.5 italic truncate">
              Note: {item.notes}
            </p>
          )}
        </div>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-orange-600 text-sm">
            {formatPrice(item.totalPrice)}
          </span>

          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center font-semibold text-gray-900 text-sm">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
