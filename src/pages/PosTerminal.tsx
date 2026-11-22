import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Product, CartPreviewResponse, PaymentMethod, Order, CartPreviewItem } from '../types';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Tag,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  AlertTriangle,
  Receipt,
  Sparkles,
  Check,
  User as UserIcon,
  Phone
} from 'lucide-react';

interface CartItemState {
  productId: number;
  quantity: number;
  preferExpiringDiscount: boolean;
  selectedBatchId?: number | null;
}

export const PosTerminal: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [cart, setCart] = useState<CartItemState[]>([]);
  const [cartPreview, setCartPreview] = useState<CartPreviewResponse | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [selectingDiscountProduct, setSelectingDiscountProduct] = useState<CartPreviewItem | null>(null);

  // Fetch catalog products and categories
  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', {
        params: { search: searchTerm, categoryId: selectedCategory, size: 50 },
      });
      setProducts(res.data?.content || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  // Recalculate FEFO cart preview whenever cart changes
  useEffect(() => {
    const updatePreview = async () => {
      if (cart.length === 0) {
        setCartPreview(null);
        return;
      }
      try {
        setCheckoutError(null);
        const res = await api.post<CartPreviewResponse>('/pos/preview-cart', {
          items: cart,
        });
        setCartPreview(res.data);
      } catch (err: any) {
        setCheckoutError(err.response?.data?.message || 'Error updating cart preview');
      }
    };

    updatePreview();
  }, [cart]);

  const addToCart = (productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1, preferExpiringDiscount: false, selectedBatchId: null }];
    });
  };

  const applyClearanceDiscount = (productId: number, batchId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selectedBatchId: batchId, preferExpiringDiscount: true }
          : item
      )
    );
    setSelectingDiscountProduct(null);
  };

  const removeClearanceDiscount = (productId: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, selectedBatchId: null, preferExpiringDiscount: false }
          : item
      )
    );
    setSelectingDiscountProduct(null);
  };

  const handleClearanceButtonClick = (item: CartPreviewItem) => {
    if (!item.availableDiscounts || item.availableDiscounts.length === 0) return;
    if (item.availableDiscounts.length === 1 && !item.selectedBatchId) {
      applyClearanceDiscount(item.productId, item.availableDiscounts[0].batchId);
    } else {
      setSelectingDiscountProduct(item);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItemState[];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartPreview(null);
    setCheckoutError(null);
    setCustomerName('');
    setCustomerPhone('');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setCheckoutError(null);
    try {
      const res = await api.post<Order>('/pos/checkout', {
        items: cart,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      setCompletedOrder(res.data);
      clearCart();
      fetchProducts(); // Refresh stock counts in UI
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Point of Sale (POS) Terminal</h1>
          <p className="text-sm text-slate-500">
            Intelligent FEFO (First-Expired, First-Out) automated lot dispensing with real-time clearance markdowns
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Search & Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar & Category Filter */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Scan barcode or search by product name / SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
            {products.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No products found matching your search.
              </div>
            ) : (
              products.map((product) => {
                const inStock = product.totalAvailableStock > 0;
                const cartItem = cart.find((i) => i.productId === product.id);

                return (
                  <div
                    key={product.id}
                  className={`p-4 rounded-xl border transition-all ${
                    inStock
                      ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {product.sku}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        inStock
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {inStock ? `${product.totalAvailableStock} in stock` : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 mt-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.description}</p>

                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-400 font-mono">
                      Barcode: {product.barcode}
                    </div>

                    {inStock && (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{cartItem ? `Add (${cartItem.quantity})` : 'Add to Cart'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Right Column: Active Cart & FEFO Allocation Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[700px]">
            {/* Cart Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Current Cart</h2>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List with FEFO breakdown */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {checkoutError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-slate-400 text-center max-w-[200px]">
                    Scan a barcode or click "Add to Cart" to start billing
                  </p>
                </div>
              ) : (
                cartPreview?.items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{item.productName}</h4>
                        <span className="text-[11px] font-mono text-slate-400">{item.sku}</span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Clearance Discount Action / Selector */}
                    {item.availableDiscounts && item.availableDiscounts.length > 0 ? (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        {item.selectedBatchId ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-semibold">
                              <span className="p-1 bg-emerald-100 rounded text-emerald-700">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </span>
                              <span>
                                {(() => {
                                  const applied = item.availableDiscounts.find((d) => d.batchId === item.selectedBatchId);
                                  return applied
                                    ? `${applied.discountPercentage}% Clearance Applied (₹${applied.discountedPrice.toFixed(2)})`
                                    : 'Clearance Applied';
                                })()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {item.availableDiscounts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectingDiscountProduct(item)}
                                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors"
                                >
                                  Change Tier ({item.availableDiscounts.length})
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeClearanceDiscount(item.productId)}
                                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Clearance available:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleClearanceButtonClick(item)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-bold shadow-xs transition-all"
                            >
                              <Tag className="w-3.5 h-3.5" />
                              <span>Apply Clearance Discount</span>
                              {item.availableDiscounts.length > 1 && (
                                <span className="bg-amber-700/60 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                                  {item.availableDiscounts.length} tiers
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1 font-medium">
                          <Sparkles className="w-3 h-3 text-slate-400" />
                          <span>Regular Fresh Stock</span>
                        </span>
                        <span className="text-[10px] italic">No clearance discount applicable</span>
                      </div>
                    )}

                    {/* FEFO Allocated Batch Breakdown Chips */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>FEFO Auto-Allocated Batches</span>
                      </div>

                      {item.allocatedBatches.map((batch) => (
                        <div
                          key={batch.batchId}
                          className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200"
                        >
                          <div>
                            <span className="font-mono font-medium text-slate-800">
                              {batch.batchNumber}
                            </span>
                            <span className="text-slate-400 text-[11px] ml-1.5">
                              (Exp: {batch.expiryDate} &bull; {batch.daysUntilExpiry}d left)
                            </span>
                            {batch.discountPercentage > 0 && (
                              <span className="ml-2 inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                                <Tag className="w-2.5 h-2.5 mr-0.5" />
                                {batch.discountPercentage}% CLEARANCE
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-900">
                              {batch.allocatedQuantity} &times; ₹{batch.currentPrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quantity Adjustment Steppers & Line Total */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-2">
                          {item.requestedQuantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.itemDiscount > 0 && (
                          <span className="text-[11px] text-slate-400 line-through mr-1.5">
                            ₹{item.itemSubtotal.toFixed(2)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          ₹{item.itemTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer: Summary & Checkout */}
            {cartPreview && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Subtotal:</span>
                    <span className="font-medium text-slate-800">
                      ₹{cartPreview.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {cartPreview.totalDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span className="flex items-center">
                        <Tag className="w-3.5 h-3.5 mr-1" />
                        Expiry Clearance Savings:
                      </span>
                      <span>-₹{cartPreview.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-700 font-mono">
                      ₹{cartPreview.totalPayable.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center">
                      <UserIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Customer Details
                    </span>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Banknote className="w-3.5 h-3.5" />
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        paymentMethod === 'CARD'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        paymentMethod === 'UPI'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>UPI</span>
                    </button>
                  </div>
                </div>

                {/* Atomic Checkout Action Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{loading ? 'Processing Sale...' : 'Complete Sale & Dispense'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clearance Discount Selection Modal */}
      {selectingDiscountProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Clearance Discount Options
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectingDiscountProduct.productName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which clearance discount tier to apply to this line item:
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectingDiscountProduct(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {selectingDiscountProduct.availableDiscounts?.map((disc) => {
                const isSelected = selectingDiscountProduct.selectedBatchId === disc.batchId;
                return (
                  <div
                    key={disc.batchId}
                    onClick={() => applyClearanceDiscount(selectingDiscountProduct.productId, disc.batchId)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            disc.discountPercentage >= 50
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {disc.discountPercentage}% OFF
                        </span>
                        <span className="text-xs font-mono font-medium text-slate-600">
                          {disc.batchNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
                        <span className="flex items-center text-slate-600">
                          <Clock className="w-3 h-3 text-amber-600 mr-1" />
                          Exp: {disc.expiryDate} ({disc.daysUntilExpiry}d left)
                        </span>
                        <span>&bull;</span>
                        <span className="font-medium text-slate-700">{disc.availableQuantity} in stock</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-emerald-700">
                        ₹{disc.discountedPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        ₹{disc.originalPrice.toFixed(2)}
                      </div>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          Applied
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-600">
                          Click to Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Option to clear/revert to standard regular price */}
              <div
                onClick={() => removeClearanceDiscount(selectingDiscountProduct.productId)}
                className="p-3 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium cursor-pointer flex justify-between items-center transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Standard Fresh Stock (No Clearance Discount)</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">Full Price</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectingDiscountProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Order Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex p-2 bg-emerald-100 text-emerald-700 rounded-full mb-1">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Transaction Successful</h3>
              <p className="text-xs text-slate-500 font-mono">Invoice #{completedOrder.orderNumber}</p>
            </div>

            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Customer:</span>
                <span className="font-medium text-slate-800">
                  {completedOrder.customerName || 'Walk-in Customer'}
                  {completedOrder.customerPhone ? ` (${completedOrder.customerPhone})` : ''}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cashier:</span>
                <span className="font-medium text-slate-800">{completedOrder.cashierName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment:</span>
                <span className="font-semibold text-slate-800">
                  {completedOrder.paymentMethod} &bull; {completedOrder.paymentStatus}
                </span>
              </div>

              {/* Items Table */}
              <div className="pt-2">
                <div className="font-semibold text-slate-700 mb-1">Dispensed Lots:</div>
                <div className="space-y-1">
                  {completedOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded">
                      <div>
                        <div className="font-medium text-slate-800">{it.productName}</div>
                        <div className="font-mono text-slate-400">Batch: {it.batchNumber}</div>
                      </div>
                      <div className="text-right">
                        <div>{it.quantity} &times; ₹{it.unitPrice.toFixed(2)}</div>
                        <div className="font-bold text-slate-900">₹{it.totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{completedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Clearance Discounts Saved:</span>
                <span>-₹{completedOrder.totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-700">
                  ₹{completedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Done & Next Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
