import React, { useState, useEffect } from 'react';
import { History, Search, ShieldAlert, FileText, User } from 'lucide-react';
import { AuditLog } from '../../types';
import { getAuditLogs } from '../../services/db';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const list = await getAuditLogs();
      setLogs(list);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(s) ||
      l.action.toLowerCase().includes(s) ||
      l.details.toLowerCase().includes(s) ||
      l.targetId.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Tizim Audit Loglari
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tizimda amalga oshirilgan barcha xavfsiz audit harakatlari ro'yxati
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Audit izlash..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Vaqti</th>
                <th className="p-4">Bajaruvchi</th>
                <th className="p-4">Amal (Action)</th>
                <th className="p-4">Tafsilotlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    {loading ? 'Audit yuklanmoqda...' : 'Audit yozuvlari topilmadi'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('uz-UZ')}
                    </td>
                    <td className="p-4 text-slate-900 dark:text-white font-semibold whitespace-nowrap">
                      {l.userName}
                      <span className="block text-[10px] text-slate-400 uppercase font-sans font-normal">{l.userRole}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        l.action === 'DELETE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                        l.action === 'TRANSFER' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-sans text-xs">
                      {l.details}
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
