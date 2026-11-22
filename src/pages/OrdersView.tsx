import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Order } from '../types';
import {
  Receipt,
  Search,
  User as UserIcon,
  Phone,
  Tag,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Eye,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  X
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
      });
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      const res = await api.get(`/pos/orders?${params.toString()}`);
      setOrders(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(debounce);
  }, [fetchOrders]);

  // Aggregate KPI calculations from current dataset
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalDiscounts = orders.reduce((sum, o) => sum + (o.totalDiscount || 0), 0);

  const renderPaymentBadge = (method: string) => {
    switch (method) {
      case 'UPI':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <QrCode className="w-3 h-3" />
            <span>UPI</span>
          </span>
        );
      case 'CARD':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CreditCard className="w-3 h-3" />
            <span>CARD</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Banknote className="w-3 h-3" />
            <span>CASH</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Orders & Invoices</span>
          </h1>
          <p className="text-sm text-slate-500">
            Audit history of all POS transactions, customer contacts, clearance savings, and dispensed batch lots
          </p>
        </div>
        <button
          onClick={() => fetchOrders()}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Transactions
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalElements}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Sales Revenue (Page)
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-700">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Clearance Savings Given
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{totalDiscounts.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by invoice number (e.g. ORD-), customer name, or mobile number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPage(0);
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Customer Contact</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Savings</th>
                <th className="px-4 py-3 text-right">Total Paid</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>No orders found matching your search.</span>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <span className="flex items-center text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400 mr-1" />
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800 flex items-center">
                          <UserIcon className="w-3 h-3 text-slate-400 mr-1" />
                          {order.customerName || 'Walk-in Customer'}
                        </div>
                        {order.customerPhone ? (
                          <div className="text-[11px] font-mono text-slate-500 flex items-center">
                            <Phone className="w-2.5 h-2.5 text-slate-400 mr-1" />
                            {order.customerPhone}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">No phone provided</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.cashierName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-700">
                        {order.items?.length || 0} line{order.items?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderPaymentBadge(order.paymentMethod)}
                    </td>
                    <td className="px-4 py-3">
                      {order.totalDiscount > 0 ? (
                        <span className="text-emerald-700 font-semibold font-mono">
                          -₹{order.totalDiscount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">₹0.00</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ₹{order.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing page <span className="font-semibold">{page + 1}</span> of{' '}
              <span className="font-semibold">{totalPages}</span> ({totalElements} total orders)
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded bg-white border border-slate-200 font-medium disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded bg-white border border-slate-200 font-medium disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Itemized Order Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Tax Invoice & Receipt
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Customer & Cashier Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Customer Contact</span>
                <span className="font-bold text-slate-800 block">{selectedOrder.customerName || 'Walk-in Customer'}</span>
                {selectedOrder.customerPhone ? (
                  <span className="font-mono text-slate-600 block">{selectedOrder.customerPhone}</span>
                ) : (
                  <span className="text-slate-400 block text-[11px]">No mobile</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Billing Details</span>
                <span className="text-slate-700 block">Cashier: <strong>{selectedOrder.cashierName}</strong></span>
                <span className="text-slate-700 block">
                  Payment: <strong>{selectedOrder.paymentMethod}</strong> ({selectedOrder.paymentStatus})
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Dispensed Stock Batches
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex justify-between items-center text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        SKU: {item.productSku} &bull; Batch: <span className="font-bold text-slate-700">{item.batchNumber}</span>
                      </div>
                      {item.discountApplied > 0 && (
                        <div className="text-[10px] font-semibold text-emerald-600 flex items-center">
                          <Tag className="w-2.5 h-2.5 mr-0.5" />
                          Clearance Markdown: -₹{item.discountApplied.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">
                        {item.quantity} &times; ₹{item.unitPrice.toFixed(2)}
                      </div>
                      <div className="font-bold font-mono text-slate-900">
                        ₹{item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Gross Subtotal:</span>
                <span className="font-mono">₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrder.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Clearance Discounts Saved:</span>
                  <span className="font-mono">-₹{selectedOrder.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Net Total Paid:</span>
                <span className="font-mono text-emerald-700">₹{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
