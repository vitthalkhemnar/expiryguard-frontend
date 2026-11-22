import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { AnalyticsSummary } from '../types';
import {
  BarChart3,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Package,
  Layers,
  Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading analytics dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <span>Executive Expiry Risk & Waste Analytics</span>
        </h1>
        <p className="text-sm text-slate-500">
          Financial impact metrics: Inventory value at risk, clearance savings, and waste write-offs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Total Inventory Value</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            ₹{data.totalInventoryValue.toFixed(2)}
          </div>
          <div className="text-xs text-slate-500">
            Across {data.totalProductsCount} products & {data.totalActiveBatchesCount} active lots
          </div>
        </div>

        {/* At-Risk Stock Value */}
        <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-amber-700 text-xs font-semibold uppercase tracking-wider">
            <span>Stock at Risk (30 Days)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900">
            ₹{data.atRiskInventoryValue.toFixed(2)}
          </div>
          <div className="text-xs text-amber-700">
            Eligible for automated clearance markdown
          </div>
        </div>

        {/* Waste Averted / Clearance Savings */}
        <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <span>Discounts Given (Clearance)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">
            ₹{data.totalDiscountsGiven.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-700">
            From total sales of ₹{data.totalSalesRevenue.toFixed(2)}
          </div>
        </div>

        {/* Disposal Loss */}
        <div className="bg-white p-5 rounded-xl border border-red-200 bg-red-50/20 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-red-700 text-xs font-semibold uppercase tracking-wider">
            <span>Expired Waste Loss</span>
            <Trash2 className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-800">
            ₹{data.totalDisposalLoss.toFixed(2)}
          </div>
          <div className="text-xs text-red-700">
            Total cost written off in disposals
          </div>
        </div>
      </div>

      {/* Lot Status Distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Inventory Lot Health Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <div className="text-xs font-semibold text-emerald-800">ACTIVE</div>
            <div className="text-xl font-bold text-emerald-900 mt-1">
              {data.batchStatusBreakdown?.['ACTIVE'] || 0}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">&gt; 30 days</div>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <div className="text-xs font-semibold text-yellow-800">NEAR EXPIRY</div>
            <div className="text-xl font-bold text-yellow-900 mt-1">
              {data.batchStatusBreakdown?.['NEAR_EXPIRY'] || 0}
            </div>
            <div className="text-[11px] text-yellow-700 mt-0.5">15 - 30 days</div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <div className="text-xs font-semibold text-amber-800">CRITICAL</div>
            <div className="text-xl font-bold text-amber-900 mt-1">
              {data.batchStatusBreakdown?.['CRITICAL'] || 0}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">&le; 7 days</div>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <div className="text-xs font-semibold text-red-800">EXPIRED</div>
            <div className="text-xl font-bold text-red-900 mt-1">
              {data.batchStatusBreakdown?.['EXPIRED'] || 0}
            </div>
            <div className="text-[11px] text-red-700 mt-0.5">Locked from sale</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="text-xs font-semibold text-slate-600">DISPOSED</div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {data.batchStatusBreakdown?.['DISPOSED'] || 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Written off</div>
          </div>
        </div>
      </div>

      {/* Top 5 Urgent Lots */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Top Urgent Lots Nearing Expiration</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Batch Number</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Available Units</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Days Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topUrgentBatches && data.topUrgentBatches.length > 0 ? (
                data.topUrgentBatches.map((b) => (
                  <tr key={b.batchId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{b.batchNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{b.productName}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{b.availableQuantity}</td>
                    <td className="px-4 py-3 font-mono">
                      ₹{b.currentSellingPrice.toFixed(2)}
                      {b.discountPercentage > 0 && (
                        <span className="ml-1 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
                          {b.discountPercentage}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.expiryDate}</td>
                    <td className="px-4 py-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] ${
                          b.daysUntilExpiry <= 7
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-yellow-100 text-yellow-900'
                        }`}
                      >
                        {b.daysUntilExpiry} days left
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No urgent lots nearing expiry at this time. All inventory is in healthy status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
