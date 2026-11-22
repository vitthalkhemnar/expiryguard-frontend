import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Batch, BatchStatus, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Plus,
  RefreshCw,
  Trash2,
  Tag,
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';

export const BatchesView: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [batches, setBatches] = useState<Batch[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [sweepMessage, setSweepMessage] = useState<string | null>(null);

  // New batch modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const emptyBatchState = {
    productId: '',
    batchNumber: '',
    initialQuantity: '',
    costPrice: '',
    baseSellingPrice: '',
    manufacturingDate: '',
    expiryDate: '',
  };
  const [newBatch, setNewBatch] = useState(emptyBatchState);

  // Disposal modal state
  const [disposingBatch, setDisposingBatch] = useState<Batch | null>(null);
  const [disposalQuantity, setDisposalQuantity] = useState(1);
  const [disposalReason, setDisposalReason] = useState<'EXPIRED' | 'DAMAGED' | 'RECALLED'>('EXPIRED');
  const [disposalNotes, setDisposalNotes] = useState('');

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/batches');
      setBatches(res.data || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?size=100');
      setProducts(res.data?.content || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchBatches();
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const handleTriggerSweep = async () => {
    try {
      const res = await api.post('/markdown-rules/trigger-sweep');
      setSweepMessage(
        `Sweep executed! Evaluated: ${res.data.totalEvaluated}, Discounted: ${res.data.discounted}, Expired: ${res.data.expired}`
      );
      fetchBatches();
      setTimeout(() => setSweepMessage(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Sweep execution failed');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/batches', {
        ...newBatch,
        productId: Number(newBatch.productId),
        initialQuantity: Number(newBatch.initialQuantity),
        costPrice: Number(newBatch.costPrice),
        baseSellingPrice: Number(newBatch.baseSellingPrice),
      });
      setNewBatch(emptyBatchState);
      setShowAddModal(false);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleConfirmDisposal = async () => {
    if (!disposingBatch) return;
    try {
      await api.post('/disposals', {
        batchId: disposingBatch.id,
        quantity: Number(disposalQuantity),
        reason: disposalReason,
        notes: disposalNotes,
      });
      setDisposingBatch(null);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Disposal failed');
    }
  };

  const getStatusBadge = (status: BatchStatus, days: number) => {
    switch (status) {
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            EXPIRED (Locked)
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            CRITICAL ({days}d left)
          </span>
        );
      case 'NEAR_EXPIRY':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
            NEAR EXPIRY ({days}d left)
          </span>
        );
      case 'DISPOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
            DISPOSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            ACTIVE ({days}d left)
          </span>
        );
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Inventory Batch Lots & Expiry Tracking</span>
          </h1>
          <p className="text-sm text-slate-500">
            Monitor lot lifecycles, inspect dynamic clearance pricing markdowns, and write off expired inventory
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerSweep}
              title="Runs the scheduled markdown engine right now"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors border border-slate-300 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Markdown Sweep Now</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Receive New Lot / Batch</span>
            </button>
          </div>
        )}
      </div>

      {sweepMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <Tag className="w-4 h-4 text-emerald-600" />
          <span>{sweepMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['ALL', 'CRITICAL', 'NEAR_EXPIRY', 'EXPIRED', 'ACTIVE', 'DISPOSED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterStatus === status
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Batch Number</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Available Stock</th>
                <th className="px-4 py-3">Base Price</th>
                <th className="px-4 py-3">Current Price / Discount</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">
                    {batch.batchNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{batch.productName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{batch.productSku}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900">{batch.availableQuantity}</span>
                    <span className="text-slate-400 text-[11px] ml-1">/ {batch.initialQuantity}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">
                    ₹{batch.baseSellingPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900">
                      ₹{batch.currentSellingPrice.toFixed(2)}
                    </div>
                    {batch.discountPercentage > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded inline-block">
                        {batch.discountPercentage}% OFF
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.expiryDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(batch.status, batch.daysUntilExpiry)}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {batch.status !== 'DISPOSED' && batch.availableQuantity > 0 && (
                        <button
                          onClick={() => {
                            setDisposingBatch(batch);
                            setDisposalQuantity(batch.availableQuantity);
                          }}
                          className="inline-flex items-center space-x-1 text-red-600 hover:text-red-800 text-[11px] font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Write Off</span>
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">Receive New Lot / Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product</label>
                <select
                  required
                  value={newBatch.productId}
                  onChange={(e) => setNewBatch({ ...newBatch, productId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LOT-2026-X1"
                    value={newBatch.batchNumber}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50"
                    value={newBatch.initialQuantity}
                    onChange={(e) => setNewBatch({ ...newBatch, initialQuantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 40.00"
                    value={newBatch.costPrice}
                    onChange={(e) => setNewBatch({ ...newBatch, costPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Base Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 100.00"
                    value={newBatch.baseSellingPrice}
                    onChange={(e) => setNewBatch({ ...newBatch, baseSellingPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={newBatch.manufacturingDate}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturingDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date (Future)</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disposal Write-Off Modal */}
      {disposingBatch && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base text-red-600 flex items-center space-x-1">
                <Trash2 className="w-5 h-5" />
                <span>Write Off / Dispose Inventory</span>
              </h3>
              <button onClick={() => setDisposingBatch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <div className="font-semibold text-slate-900">{disposingBatch.productName}</div>
              <div className="text-slate-500 font-mono">Batch: {disposingBatch.batchNumber}</div>
              <div className="text-red-700 font-bold">
                Financial Loss per unit: ₹{disposingBatch.costPrice.toFixed(2)}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity to Dispose</label>
                <input
                  type="number"
                  min="1"
                  max={disposingBatch.availableQuantity}
                  value={disposalQuantity}
                  onChange={(e) => setDisposalQuantity(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Disposal</label>
                <select
                  value={disposalReason}
                  onChange={(e: any) => setDisposalReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="EXPIRED">Expired Past Expiry Date</option>
                  <option value="DAMAGED">Damaged in Handling</option>
                  <option value="RECALLED">Manufacturer Recall</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Notes / Audit Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Document disposal method or reason..."
                  value={disposalNotes}
                  onChange={(e) => setDisposalNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDisposingBatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisposal}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Confirm Write-Off
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
