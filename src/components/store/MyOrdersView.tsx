import React, { useMemo, useState } from 'react';
import { RotateCcw, MessageCircle, LogIn } from 'lucide-react';
import { useStore, DEMO_MODE } from '../../services/store';
import { Order } from '../../types';
import { getMyOrders } from '../../utils/myOrders';
import { whatsappLink } from '../../utils/contact';
import { ORDER_STATUS_LABEL, statusBadgeClass, formatDate } from '../../utils/labels';
import { PageHero, HERO_PHOTOS } from '../ui/PageHero';
import { OrderSummary } from './OrderSummary';

interface MyOrdersViewProps {
  onReorder: (order: Order) => void;
  onNavigateHome: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ onReorder, onNavigateHome }) => {
  const { orders, settings, account, currentUser, signInWithGoogle, logout } = useStore();
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Orders from this device, with the live version (status, weighed totals) when it
  // can be read: for a signed-in customer, the orders placed with their own email.
  const visible = useMemo(() => {
    const live = new Map(orders.map(o => [o.id, o]));
    const mine = getMyOrders().map(o => ({ order: live.get(o.id) ?? o, isLive: live.has(o.id) }));
    const signedInCustomer = !DEMO_MODE && account && !currentUser;
    if (signedInCustomer) {
      for (const o of orders) if (!mine.some(m => m.order.id === o.id)) mine.push({ order: o, isLive: true });
    }
    return mine.sort((a, b) => b.order.createdAt.localeCompare(a.order.createdAt));
  }, [orders, account, currentUser]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setSignInError(await signInWithGoogle());
    setSigningIn(false);
  };

  const askOnWhatsApp = (id: string) =>
    whatsappLink(settings.whatsapp, `Hello Powermeat! Please give me an update on order ${id}.`);

  return (
    <>
      <PageHero title="Track my order" image={HERO_PHOTOS[1]} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {!DEMO_MODE && (
          <div className="panel p-5 sm:p-8">
            {account && !currentUser ? (
              <>
                <h2 className="display text-3xl">Signed in as {account.email}</h2>
                <p className="mt-2 text-ink-soft">
                  You see the live status of every order placed with this email address.
                </p>
                <button type="button" onClick={logout} className="btn btn-outline mt-5">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <h2 className="display text-3xl">See the live status of your orders</h2>
                <p className="mt-2 text-ink-soft">
                  Sign in with the Google account for the email you gave at checkout.
                </p>
                <button type="button" onClick={handleSignIn} disabled={signingIn} className="btn btn-primary mt-5">
                  <LogIn size={18} />
                  <span>{signingIn ? 'Opening Google' : 'Sign in with Google'}</span>
                </button>
                {signInError && (
                  <p className="field-error" role="alert">
                    {signInError}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="mt-10">
            <h2 className="display text-3xl">No orders yet</h2>
            <p className="text-ink-soft mt-2">
              Orders you place on this phone or computer appear here.
              {!DEMO_MODE && ' Orders placed with your email also appear once you sign in.'}
            </p>
            <button type="button" onClick={onNavigateHome} className="btn btn-accent mt-5">
              Browse the catalogue
            </button>
          </div>
        ) : (
          <ul className="mt-10 space-y-6">
            {visible.map(({ order, isLive }) => (
              <li key={order.id} className="panel p-5 sm:p-8">
                <div className="flex items-center flex-wrap gap-3 mb-5">
                  <h2 className="num display text-3xl">{order.id}</h2>
                  {isLive || DEMO_MODE ? (
                    <span className={`badge ${statusBadgeClass(order.orderStatus)}`}>
                      {ORDER_STATUS_LABEL[order.orderStatus]}
                    </span>
                  ) : (
                    <span className="badge bg-sand text-ink">Sent to the butchery</span>
                  )}
                  <span className="num text-sm text-ink-soft sm:ml-auto">Placed {formatDate(order.createdAt)}</span>
                </div>
                <OrderSummary order={order} />
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => onReorder(order)} className="btn btn-outline">
                    <RotateCcw size={18} />
                    <span>Order these again</span>
                  </button>
                  {!isLive && !DEMO_MODE && (
                    <a href={askOnWhatsApp(order.id)} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                      <MessageCircle size={18} />
                      <span>Ask for an update</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};
