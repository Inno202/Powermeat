import React, { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useStore } from '../../services/store';
import { Order } from '../../types';
import { getMyOrderIds } from '../../utils/myOrders';
import { ORDER_STATUS_LABEL, statusBadgeClass, formatDate } from '../../utils/labels';
import { PageHero, HERO_PHOTOS } from '../ui/PageHero';
import { OrderSummary } from './OrderSummary';

interface MyOrdersViewProps {
  onReorder: (order: Order) => void;
  onNavigateHome: () => void;
}

const digits = (s: string) => s.replace(/[^0-9]/g, '').replace(/^27/, '0');

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onReorder, onNavigateHome }) => {
  const { orders } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [cell, setCell] = useState('');
  const [lookup, setLookup] = useState<{ id: string; cell: string } | null>(null);

  // A customer sees the orders placed from this browser, plus any order they can
  // identify with both its number and the cell number it was placed with.
  const mine = new Set(getMyOrderIds());
  const visible = orders.filter(
    o =>
      mine.has(o.id) ||
      (lookup !== null && o.id.toUpperCase() === lookup.id && digits(o.customerCell) === lookup.cell)
  );
  const lookupMissed = lookup !== null && !visible.some(o => o.id.toUpperCase() === lookup.id);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookup({ id: orderNumber.trim().toUpperCase(), cell: digits(cell) });
  };

  return (
    <>
      <PageHero title="Track my order" image={HERO_PHOTOS[1]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <form onSubmit={handleLookup} className="panel p-5 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="track-number" className="field-label">
                Order number
              </label>
              <input
                id="track-number"
                type="text"
                required
                maxLength={12}
                placeholder="PM-000101"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                className="field num"
              />
            </div>
            <div>
              <label htmlFor="track-cell" className="field-label">
                Cell number used on the order
              </label>
              <input
                id="track-cell"
                type="tel"
                inputMode="tel"
                required
                maxLength={30}
                placeholder="082 123 4567"
                value={cell}
                onChange={e => setCell(e.target.value)}
                className="field num"
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-5">
            <Search size={18} />
            <span>Find my order</span>
          </button>
          {lookupMissed && (
            <p className="field-error" role="alert">
              We could not find an order with that number and cell number. Check both and try again.
            </p>
          )}
        </form>

        {visible.length === 0 ? (
          !lookupMissed && (
            <div className="mt-10">
              <h2 className="display text-3xl">No orders from this device yet</h2>
              <p className="text-ink-soft mt-2">
                Orders you place here appear on this page. To find an earlier order, enter its number and your cell
                number above.
              </p>
              <button type="button" onClick={onNavigateHome} className="btn btn-accent mt-5">
                Browse the catalogue
              </button>
            </div>
          )
        ) : (
          <ul className="mt-10 space-y-6">
            {visible.map(order => (
              <li key={order.id} className="panel p-5 sm:p-8">
                <div className="flex items-center flex-wrap gap-3 mb-5">
                  <h2 className="num display text-3xl">{order.id}</h2>
                  <span className={`badge ${statusBadgeClass(order.orderStatus)}`}>
                    {ORDER_STATUS_LABEL[order.orderStatus]}
                  </span>
                  <span className="num text-sm text-ink-soft sm:ml-auto">Placed {formatDate(order.createdAt)}</span>
                </div>
                <OrderSummary order={order} />
                <button type="button" onClick={() => onReorder(order)} className="btn btn-outline mt-5">
                  <RotateCcw size={18} />
                  <span>Order these again</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
