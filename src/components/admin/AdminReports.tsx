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
          <h2 className="display text-3xl">
            Sales & Operational Butchery Reports
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Breakdowns by category, top 10 bestselling butcher cuts, and delivery distributions.
          </p>
        </div>

        <button
          onClick={handleExportReportCSV}
          className="btn btn-sm btn-outline"
        >
          <Download size={15} />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Grid: Category Sales + Fulfillment Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Sales Breakdown */}
        <div className="lg:col-span-2 p-5 space-y-4 panel">
          <h3 className="display flex items-center gap-2 text-2xl">
            <span>Revenue by Butchery Category</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(categorySales).map(([cat, data]) => (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-ink">{cat}</span>
                  <span className="text-brand-yellow-deep font-bold">{formatZAR(data.total)} ({data.count} units/kg)</span>
                </div>
                <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-ink/10">
                  <div
                    className="bg-brand-accent h-full rounded-full transition-all duration-500"
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
        <div className="p-5 space-y-5 panel">
          <h3 className="display flex items-center gap-2 text-2xl">
            <span>Fulfillment Split</span>
          </h3>

          <div className="space-y-3 text-sm">
            <div className="p-3 flex justify-between items-center panel rounded-2xl">
              <div>
                <span className="font-bold text-ink block">Deliveries</span>
                <span className="text-ink-soft text-sm">Free State distribution</span>
              </div>
              <span className="text-base font-bold text-brand-accent-deep num">
                {deliveryCount} ({orders.length > 0 ? Math.round((deliveryCount / orders.length) * 100) : 0}%)
              </span>
            </div>

            <div className="p-3 flex justify-between items-center panel rounded-2xl">
              <div>
                <span className="font-bold text-ink block">Collections</span>
                <span className="text-ink-soft text-sm">In-store counter pickups</span>
              </div>
              <span className="text-base font-bold text-brand-yellow-deep num">
                {collectionCount} ({orders.length > 0 ? Math.round((collectionCount / orders.length) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Best Sellers Table */}
      <div className="overflow-hidden panel">
        <div className="p-4 bg-paper border-b border-ink/10">
          <h3 className="display text-2xl">
            Top 10 Bestselling Products
          </h3>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Volume Sold</th>
              <th className="py-3 px-4 text-right">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {top10Products.map((p, idx) => (
              <tr key={idx} className="hover:bg-sand/40 transition">
                <td className="py-3 px-4 num font-bold text-ink-soft">#{idx + 1}</td>
                <td className="py-3 px-4 font-bold text-ink">{p.name}</td>
                <td className="py-3 px-4 text-ink-soft">{p.category}</td>
                <td className="py-3 px-4 text-center font-bold text-ink">{p.qty}</td>
                <td className="py-3 px-4 text-right font-bold text-brand-yellow-deep">
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
