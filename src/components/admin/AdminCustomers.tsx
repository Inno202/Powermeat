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
          <h2 className="text-2xl font-heading font-extrabold uppercase text-white tracking-wide">
            Customer Directory (POPIA Compliant)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customer purchasing history, order frequencies, areas, and verified promotional marketing consent.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-neutral-800 hover:bg-neutral-700 text-[#FFC400] border border-[#3E3E3E] text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download size={15} />
          <span>Export Customer CSV</span>
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by customer name, phone number or town..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D7141A]"
        />
      </div>

      <div className="bg-[#1A1A1A] rounded-2xl border border-[#2D2D2D] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-neutral-400 uppercase font-bold text-[10px] border-b border-[#2D2D2D]">
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
            <tbody className="divide-y divide-[#262626]">
              {customerList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customerList.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {cust.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">
                      {cust.cell}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {cust.area}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-white">
                      {cust.orderCount}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#FFC400]">
                      {formatZAR(cust.totalSpend)}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(cust.lastOrderDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          cust.marketingOptIn
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-neutral-800 text-neutral-500'
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
