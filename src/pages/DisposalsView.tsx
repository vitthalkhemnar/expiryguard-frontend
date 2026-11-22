import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { DisposalLog } from '../types';
import { Trash2, AlertCircle, FileText } from 'lucide-react';

export const DisposalsView: React.FC = () => {
  const [logs, setLogs] = useState<DisposalLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/disposals?size=50');
        setLogs(res.data?.content || []);
      } catch (err) {
        console.error('Error fetching disposal logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const totalLoss = (logs || []).reduce((sum, item) => sum + (item.financialLossAmount || 0), 0);
  const totalUnits = (logs || []).reduce((sum, item) => sum + (item.quantityDisposed || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          <span>Waste Disposal & Write-Off Audit Trail</span>
        </h1>
        <p className="text-sm text-slate-500">
          Official regulatory and financial loss records for expired, damaged, or recalled stock lots
        </p>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-red-200 bg-red-50/10 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Total Audited Financial Loss
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              ₹{totalLoss.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Units Disposed & Written Off
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {totalUnits} units
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Disposal Date</th>
                <th className="px-4 py-3">Batch Number</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Units Disposed</th>
                <th className="px-4 py-3">Financial Loss</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Authorized By</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No disposal records yet. Written off batches will be logged here.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {new Date(log.disposedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">
                      {log.batchNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{log.productName}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.quantityDisposed}</td>
                    <td className="px-4 py-3 font-mono font-bold text-red-600">
                      ₹{log.financialLossAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        {log.reason}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{log.approvedByName}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
