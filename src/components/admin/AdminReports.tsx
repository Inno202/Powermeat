import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Package, PieChart } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';

export const AdminReports: React.FC = () => {
  const { orders, products } = useStore();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  // Compute sales by category
  const categorySales: Record<string, { count: number; total: number }> = {};
  orders
    .filter(o => o.orderStatus !== 'cancelled')
    .forEach(o => {
      o.items.forEach(it => {
        const cat = it.category || 'General';
        if (!categorySales[cat]) {
          categorySales[cat] = { count: 0, total: 0 };
        }
        categorySales[cat].count += it.quantity;
        categorySales[cat].total += it.lineTotal;
      });
    });

  // Top products
  const productSales: Record<string, { name: string; category: string; qty: number; revenue: number }> = {};
  orders
    .filter(o => o.orderStatus !== 'cancelled')
    .forEach(o => {
      o.items.forEach(it => {
        if (!productSales[it.productId]) {
          productSales[it.productId] = {
            name: it.name,
            category: it.category,
            qty: 0,
            revenue: 0
          };
        }
        productSales[it.productId].qty += it.quantity;
        productSales[it.productId].revenue += it.lineTotal;
      });
    });

  const top10Products = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Fulfillment breakdown
  let deliveryCount = 0;
  let collectionCount = 0;
  orders.forEach(o => {
    if (o.deliveryType === 'delivery') deliveryCount++;
    else collectionCount++;
  });

  const handleExportReportCSV = () => {
    const headers = ['Category', 'ItemsSold', 'TotalRevenueZAR'];
    const rows = Object.entries(categorySales).map(([cat, val]) => [
      `"${cat}"`,
      val.count,
      val.total.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `powermeat_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Sales & Operational Butchery Reports
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Breakdowns by category, top 10 bestselling butcher cuts, and delivery distributions.
          </p>
        </div>

        <button
          onClick={handleExportReportCSV}
          className="bg-neutral-800 hover:bg-neutral-700 text-[#FFC400] border border-[#3E3E3E] text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download size={15} />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Grid: Category Sales + Fulfillment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Sales Breakdown */}
        <div className="lg:col-span-2 bg-[#1A1A1A] p-5 rounded-2xl border border-[#2D2D2D] space-y-4">
          <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart size={18} className="text-[#D7141A]" />
            <span>Revenue by Butchery Category</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(categorySales).map(([cat, data]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-white">{cat}</span>
                  <span className="text-[#FFC400] font-bold">{formatZAR(data.total)} ({data.count} units/kg)</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
                  <div
                    className="bg-[#D7141A] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(8, (data.total / 4000) * 100))}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment & Payment Breakdown */}
        <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2D2D2D] space-y-5">
          <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={18} className="text-[#FFC400]" />
            <span>Fulfillment Split</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">🚚 Deliveries</span>
                <span className="text-neutral-500 text-[11px]">Free State distribution</span>
              </div>
              <span className="text-base font-extrabold text-[#D7141A] font-mono">
                {deliveryCount} ({orders.length > 0 ? Math.round((deliveryCount / orders.length) * 100) : 0}%)
              </span>
            </div>

            <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">🏪 Collections</span>
                <span className="text-neutral-500 text-[11px]">In-store counter pickups</span>
              </div>
              <span className="text-base font-extrabold text-[#FFC400] font-mono">
                {collectionCount} ({orders.length > 0 ? Math.round((collectionCount / orders.length) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Best Sellers Table */}
      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <div className="p-4 bg-[#141414] border-b border-[#2D2D2D]">
          <h3 className="font-heading font-bold text-base uppercase text-white tracking-wider">
            Top 10 Bestselling Products
          </h3>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#111111] text-neutral-400 uppercase font-bold text-[10px] border-b border-[#2D2D2D]">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Volume Sold</th>
              <th className="py-3 px-4 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {top10Products.map((p, idx) => (
              <tr key={idx} className="hover:bg-neutral-800/40 transition">
                <td className="py-3 px-4 font-mono font-bold text-neutral-500">#{idx + 1}</td>
                <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                <td className="py-3 px-4 text-neutral-400">{p.category}</td>
                <td className="py-3 px-4 text-center font-bold text-neutral-200">{p.qty}</td>
                <td className="py-3 px-4 text-right font-extrabold text-[#FFC400]">
                  {formatZAR(p.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
