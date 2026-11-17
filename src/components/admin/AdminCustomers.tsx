import React, { useState } from 'react';
import { Users, Search, Download, ShieldCheck, Phone, MapPin } from 'lucide-react';
import { useStore } from '../../services/store';
import { formatZAR } from '../../utils/pricing';

export const AdminCustomers: React.FC = () => {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Group unique customers by cell number
  const customerMap: Record<
    string,
    {
      name: string;
      cell: string;
      email?: string;
      area: string;
      orderCount: number;
      totalSpend: number;
      lastOrderDate: string;
      marketingOptIn: boolean;
    }
  > = {};

  orders.forEach(o => {
    const key = o.customerCell.replace(/[^0-9]/g, '');
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customerName,
        cell: o.customerCell,
        email: o.customerEmail,
        area: o.area,
        orderCount: 0,
        totalSpend: 0,
        lastOrderDate: o.createdAt,
        marketingOptIn: o.marketingOptIn
      };
    }
    customerMap[key].orderCount += 1;
    customerMap[key].totalSpend += o.total;
    if (new Date(o.createdAt) > new Date(customerMap[key].lastOrderDate)) {
      customerMap[key].lastOrderDate = o.createdAt;
      customerMap[key].area = o.area;
      customerMap[key].marketingOptIn = o.marketingOptIn;
    }
  });

  const customerList = Object.values(customerMap).filter(c => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return c.name.toLowerCase().includes(term) || c.cell.includes(term) || c.area.toLowerCase().includes(term);
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Cell', 'Email', 'Area', 'OrdersCount', 'TotalSpendZAR', 'LastOrder', 'POPIA_MarketingOptIn'];
    const rows = customerList.map(c => [
      `"${c.name}"`,
      `"${c.cell}"`,
      `"${c.email || ''}"`,
      `"${c.area}"`,
      c.orderCount,
      c.totalSpend.toFixed(2),
      `"${c.lastOrderDate}"`,
      c.marketingOptIn ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `powermeat_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="display text-3xl">
            Customer Directory (POPIA Compliant)
          </h2>
          <p className="text-sm text-ink-soft mt-0.5">
            Customer purchasing history, order frequencies, areas, and verified promotional marketing consent.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn btn-sm btn-outline"
        >
          <Download size={15} />
          <span>Export Customer CSV</span>
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
        <input
          type="text"
          placeholder="Search by customer name, phone number or town..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="field w-full pl-11"
        />
      </div>

      <div className="overflow-hidden panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-ink-soft font-bold text-sm border-b border-ink/10">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cell Phone</th>
                <th className="py-3 px-4">Primary Area</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4">Total Spend</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4 text-right">POPIA Marketing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-ink-soft">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customerList.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-sand/40 transition">
                    <td className="py-3 px-4 font-bold text-ink text-sm">
                      {cust.name}
                    </td>
                    <td className="py-3 px-4 num text-ink-soft">
                      {cust.cell}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {cust.area}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-ink">
                      {cust.orderCount}
                    </td>
                    <td className="py-3 px-4 font-bold text-brand-yellow-deep">
                      {formatZAR(cust.totalSpend)}
                    </td>
                    <td className="py-3 px-4 text-ink-soft">
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block text-sm font-bold px-2 py-0.5 rounded ${
                          cust.marketingOptIn
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-sand text-ink-soft'
                        }`}
                      >
                        {cust.marketingOptIn ? 'OPTED IN' : 'NO CONSENT'}
                      </span>
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
