import React from 'react';
import { Printer, X } from 'lucide-react';
import { Order } from '../../types';
import { formatZAR } from '../../utils/pricing';
import { useStore } from '../../services/store';

interface AdminOrderSlipProps {
  order: Order | null;
  mode: 'invoice_a4' | 'thermal_80mm' | 'run_sheet';
  runSheetOrders?: Order[];
  areaName?: string;
  onClose: () => void;
}

export const AdminOrderSlip: React.FC<AdminOrderSlipProps> = ({
  order,
  mode,
  runSheetOrders = [],
  areaName,
  onClose
}) => {
  const { settings } = useStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-3xl bg-neutral-900 text-neutral-100 rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden my-6">
        {/* Modal Controls (Not printed) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-[#D7141A]" />
            <span className="font-heading font-bold text-sm uppercase text-white tracking-wide">
              {mode === 'thermal_80mm'
                ? '80mm Thermal Receipt Preview'
                : mode === 'invoice_a4'
                ? 'A4 Tax Invoice / Packing Slip'
                : `Delivery Run Sheet (${areaName || 'All Areas'})`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#D7141A] hover:bg-[#ba0f14] text-white font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 bg-neutral-900 text-neutral-900 overflow-y-auto max-h-[80vh]">
          {/* Printable Container targeted by CSS @media print */}
          <div id="printable-slip" className="bg-white text-black p-6 rounded-lg font-sans shadow-sm mx-auto">
            {/* 1. THERMAL 80MM RECEIPT */}
            {mode === 'thermal_80mm' && order && (
              <div className="w-[80mm] max-w-full mx-auto font-mono text-[11px] leading-tight text-black">
                <div className="text-center pb-2 border-b border-dashed border-black">
                  <h2 className="font-extrabold text-base uppercase tracking-wider">POWERMEAT</h2>
                  <p className="text-[10px]">145 Power Road, Welkom</p>
                  <p className="text-[10px]">Tel: 057 396 3189 | 072 477 9314</p>
                  <p className="text-[10px] mt-1 font-bold">SLIP: {order.id}</p>
                  <p className="text-[9px]">{new Date(order.createdAt).toLocaleString('en-ZA')}</p>
                </div>

                <div className="py-2 border-b border-dashed border-black">
                  <p><span className="font-bold">CUSTOMER:</span> {order.customerName}</p>
                  <p><span className="font-bold">CELL:</span> {order.customerCell}</p>
                  <p><span className="font-bold">TYPE:</span> {order.deliveryType.toUpperCase()} ({order.area})</p>
                  {order.deliveryAddress && (
                    <p><span className="font-bold">ADDR:</span> {order.deliveryAddress}</p>
                  )}
                  <p><span className="font-bold">DATE:</span> {order.deliveryDate}</p>
                  {order.notes && <p><span className="font-bold">NOTE:</span> {order.notes}</p>}
                </div>

                <div className="py-2 border-b border-dashed border-black">
                  <table className="w-full text-left text-[10px]">
                    <thead>
                      <tr className="border-b border-black">
                        <th>ITEM</th>
                        <th className="text-center">QTY</th>
                        <th className="text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((it, idx) => (
                        <tr key={idx} className="align-top">
                          <td className="py-0.5">
                            {it.name}
                            {it.selectedOption && ` (${it.selectedOption})`}
                            {it.actualWeightKg && ` [${it.actualWeightKg}kg weighed]`}
                          </td>
                          <td className="py-0.5 text-center">{it.actualWeightKg || it.quantity}</td>
                          <td className="py-0.5 text-right font-bold">{formatZAR(it.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="py-2 border-b border-dashed border-black text-right space-y-0.5">
                  <p>SUBTOTAL: {formatZAR(order.subtotal)}</p>
                  <p>DELIVERY: {order.deliveryFee === 0 ? 'FREE' : formatZAR(order.deliveryFee)}</p>
                  <p className="font-extrabold text-sm">TOTAL: {formatZAR(order.total)}</p>
                  <p className="text-[10px]">PAYMENT: {order.paymentMethod.toUpperCase()} ({order.paymentStatus.toUpperCase()})</p>
                </div>

                <div className="text-center pt-3 text-[10px]">
                  <p className="font-bold">MEAT SO GOOD, IT HITS DIFFERENT!</p>
                  <p>Thank you for choosing Powermeat.</p>
                </div>
              </div>
            )}

            {/* 2. A4 TAX INVOICE & PACKING SLIP */}
            {mode === 'invoice_a4' && order && (
              <div className="max-w-2xl mx-auto text-xs leading-relaxed space-y-6">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                  <div>
                    <h1 className="font-black text-2xl tracking-wider text-[#D7141A]">POWERMEAT WELKOM</h1>
                    <p className="font-bold text-neutral-800">Quality Butchery & Meat Wholesaler</p>
                    <p className="text-neutral-600">145 Power Road, Welkom, Free State, 9460</p>
                    <p className="text-neutral-600">Phone: 057 396 3189 / 057 396 1805 | WhatsApp: 072 477 9314</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-neutral-900 text-white font-black text-lg px-3 py-1 rounded">
                      TAX INVOICE
                    </span>
                    <p className="font-extrabold text-base mt-1">Invoice #: {order.id}</p>
                    <p className="text-neutral-500">Date: {new Date(order.createdAt).toLocaleDateString('en-ZA')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-neutral-100 p-4 rounded-lg">
                  <div>
                    <h3 className="font-bold uppercase text-neutral-700 mb-1 border-b border-neutral-300 pb-1">
                      Customer Details
                    </h3>
                    <p><strong className="text-neutral-800">Name:</strong> {order.customerName}</p>
                    <p><strong className="text-neutral-800">Cell:</strong> {order.customerCell}</p>
                    {order.customerEmail && <p><strong className="text-neutral-800">Email:</strong> {order.customerEmail}</p>}
                    <p><strong className="text-neutral-800">Source:</strong> {order.source.toUpperCase()}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-neutral-700 mb-1 border-b border-neutral-300 pb-1">
                      Fulfillment & Schedule
                    </h3>
                    <p><strong className="text-neutral-800">Method:</strong> {order.deliveryType === 'delivery' ? 'Delivery to Address' : 'Collection in Store'}</p>
                    <p><strong className="text-neutral-800">Area:</strong> {order.area}</p>
                    {order.deliveryAddress && <p><strong className="text-neutral-800">Address:</strong> {order.deliveryAddress}</p>}
                    <p><strong className="text-neutral-800">Scheduled Date:</strong> {order.deliveryDate}</p>
                    {order.notes && <p><strong className="text-neutral-800">Instructions:</strong> {order.notes}</p>}
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-neutral-300">
                  <thead className="bg-neutral-200 uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-2 border border-neutral-300">#</th>
                      <th className="p-2 border border-neutral-300">Item Description</th>
                      <th className="p-2 border border-neutral-300 text-center">Unit Price</th>
                      <th className="p-2 border border-neutral-300 text-center">Quantity / Weight</th>
                      <th className="p-2 border border-neutral-300 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it, idx) => (
                      <tr key={idx} className="border-b border-neutral-300">
                        <td className="p-2 border border-neutral-300 text-neutral-500">{idx + 1}</td>
                        <td className="p-2 border border-neutral-300">
                          <span className="font-bold text-black">{it.name}</span>
                          {it.selectedOption && <span className="text-neutral-600 block text-[10px]">Option: {it.selectedOption}</span>}
                          {it.actualWeightKg && <span className="text-emerald-700 block text-[10px]">Actual scale weight: {it.actualWeightKg}kg</span>}
                        </td>
                        <td className="p-2 border border-neutral-300 text-center">{formatZAR(it.unitPrice)}</td>
                        <td className="p-2 border border-neutral-300 text-center font-semibold">
                          {it.actualWeightKg ? `${it.actualWeightKg}kg` : `${it.quantity}${it.pricingType === 'per_kg' ? 'kg' : ''}`}
                        </td>
                        <td className="p-2 border border-neutral-300 text-right font-bold">{formatZAR(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="p-2 text-right font-bold border border-neutral-300">Subtotal:</td>
                      <td className="p-2 text-right font-bold border border-neutral-300">{formatZAR(order.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-2 text-right font-bold border border-neutral-300">Delivery Fee:</td>
                      <td className="p-2 text-right font-bold border border-neutral-300">{order.deliveryFee === 0 ? 'FREE' : formatZAR(order.deliveryFee)}</td>
                    </tr>
                    <tr className="bg-neutral-100 text-sm font-black">
                      <td colSpan={4} className="p-2 text-right border border-neutral-300">TOTAL DUE (ZAR):</td>
                      <td className="p-2 text-right border border-neutral-300 text-[#D7141A]">{formatZAR(order.total)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="flex justify-between items-end pt-4 border-t border-neutral-300 text-neutral-600 text-[10px]">
                  <div>
                    <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()} | <strong>Payment Status:</strong> {order.paymentStatus.toUpperCase()}</p>
                    <p>FNB Account: 62891234567 | Branch: 250655 | Ref: {order.id}</p>
                  </div>
                  <div className="text-right">
                    <p>Butcher Packed by: ____________________</p>
                    <p className="mt-2">Customer Signature: ____________________</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DELIVERY RUN SHEET */}
            {mode === 'run_sheet' && (
              <div className="text-xs space-y-4">
                <div className="flex justify-between items-center border-b-2 border-black pb-3">
                  <div>
                    <h2 className="font-black text-xl text-[#D7141A]">POWERMEAT DELIVERY RUN SHEET</h2>
                    <p className="font-semibold text-neutral-800">
                      Area: {areaName || 'All Areas'} | Run Date: {new Date().toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">Total Stops: {runSheetOrders.length}</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-neutral-300">
                  <thead className="bg-neutral-200 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-1.5 border border-neutral-300">Stop #</th>
                      <th className="p-1.5 border border-neutral-300">Order ID</th>
                      <th className="p-1.5 border border-neutral-300">Customer & Cell</th>
                      <th className="p-1.5 border border-neutral-300">Delivery Address</th>
                      <th className="p-1.5 border border-neutral-300">Order Value</th>
                      <th className="p-1.5 border border-neutral-300">Cash to Collect</th>
                      <th className="p-1.5 border border-neutral-300 text-center">Status / Sign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runSheetOrders.map((ord, idx) => (
                      <tr key={ord.id} className="border-b border-neutral-300">
                        <td className="p-2 border border-neutral-300 font-bold text-center">{idx + 1}</td>
                        <td className="p-2 border border-neutral-300 font-mono font-bold">{ord.id}</td>
                        <td className="p-2 border border-neutral-300">
                          <strong>{ord.customerName}</strong>
                          <span className="block text-neutral-600">{ord.customerCell}</span>
                        </td>
                        <td className="p-2 border border-neutral-300">
                          {ord.deliveryAddress || ord.area}
                        </td>
                        <td className="p-2 border border-neutral-300 font-bold">{formatZAR(ord.total)}</td>
                        <td className="p-2 border border-neutral-300 font-black text-red-700">
                          {ord.paymentMethod === 'cod' && ord.paymentStatus !== 'paid'
                            ? formatZAR(ord.total)
                            : 'PAID (EFT/CARD)'}
                        </td>
                        <td className="p-2 border border-neutral-300 text-center text-neutral-400">
                          [ ] Delivered
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-4 flex justify-between text-neutral-600 text-[10px]">
                  <span>Driver Name: __________________________</span>
                  <span>Vehicle Reg: __________________________</span>
                  <span>Total Cash Handed In: R_________________</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
