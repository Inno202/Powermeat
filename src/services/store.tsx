import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  User
} from 'firebase/auth';
import {
  Product,
  SpecialCampaign,
  Order,
  UserProfile,
  DeliveryArea,
  SiteSettings,
  ActivityLog,
  Role,
  OrderStatus,
  PaymentStatus,
  StaffInvite
} from '../types';
import {
  SEED_PRODUCTS,
  SEED_SPECIALS,
  SEED_ORDERS,
  SEED_USERS,
  SEED_DELIVERY_AREAS,
  SEED_SETTINGS
} from '../data/seedData';
import { checkCartFreeDelivery, calculateLineTotal, applyBulkPriceUpdate } from '../utils/pricing';
import { generateOrderNumber } from '../utils/delivery';
import { db, auth } from './firebase';
import { toast } from '../components/ui/feedback';

/** Demo mode keeps everything in this browser with password-free role buttons. It is
 *  only on when a build is made with VITE_DEMO_MODE=true. Otherwise the site uses the
 *  live Firebase project. */
export const DEMO_MODE: boolean = import.meta.env.VITE_DEMO_MODE === 'true';

export interface CartItem {
  product: Product;
  quantity: number; // units or kg
  selectedOption?: string;
  notes?: string;
}

/** Where the signed-in person stands with the staff area. */
export type AuthStatus = 'loading' | 'signed_out' | 'not_staff' | 'inactive' | 'staff' | 'needs_fix';

const VALID_ROLES: Role[] = ['owner', 'manager', 'counter', 'driver'];

/** What is wrong with a staff record typed in by hand, in plain words (empty if fine). */
export function staffRecordProblems(record: Record<string, unknown>): string[] {
  const problems: string[] = [];
  if (!VALID_ROLES.includes(record.role as Role)) {
    problems.push(
      `role is ${JSON.stringify(record.role ?? null)}. It must be exactly one of: owner, manager, counter, driver (lower case, no spaces).`
    );
  }
  if (typeof record.active !== 'boolean') {
    problems.push(
      `active is ${JSON.stringify(record.active ?? null)} saved as ${record.active === undefined ? 'missing' : typeof record.active}. Set its type to boolean and its value to true.`
    );
  }
  if (typeof record.name !== 'string' || !record.name.trim()) problems.push('name is missing. Add a name field of type string.');
  return problems;
}

export interface SignedInAccount {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  usesPassword: boolean;
}

interface StoreContextType {
  products: Product[];
  specials: SpecialCampaign[];
  orders: Order[];
  users: UserProfile[];
  staffInvites: StaffInvite[];
  /** When the signed-in account's staff record is set up wrongly: what to fix. */
  staffProblems: string[];
  deliveryAreas: DeliveryArea[];
  settings: SiteSettings;
  activityLogs: ActivityLog[];
  /** False until the live catalogue has loaded the first time. */
  catalogueReady: boolean;

  // Who is signed in
  currentUser: UserProfile | null;
  account: SignedInAccount | null;
  authStatus: AuthStatus;
  loginAsDemoRole: (role: Role) => void;
  loginWithEmail: (email: string) => 'ok' | 'inactive' | 'failed';
  signInWithGoogle: () => Promise<string | null>;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  createPasswordAccount: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  resendVerification: () => Promise<string | null>;
  refreshAccount: () => Promise<void>;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedOption?: string, notes?: string) => void;
  removeFromCart: (productId: string, selectedOption?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, selectedOption?: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;
  isCartFreeDelivery: boolean;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  isNavDrawerOpen: boolean;
  setIsNavDrawerOpen: (open: boolean) => void;

  // Catalogue
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  duplicateProduct: (id: string) => Product | null;
  deleteProduct: (id: string) => void;
  bulkUpdatePrices: (category: string, percentage: number) => void;
  /** Saves the shop's own photo for a product (already shrunk), or removes it with null. */
  setProductPhoto: (productId: string, photo: string | null) => Promise<boolean>;

  // Specials
  createSpecial: (special: Omit<SpecialCampaign, 'id'>) => SpecialCampaign;
  updateSpecial: (id: string, updates: Partial<SpecialCampaign>) => void;
  rerunSpecial: (id: string, newStartDate: string, newEndDate?: string) => void;

  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus, method?: string) => void;
  adjustOrderLineWeight: (orderId: string, productId: string, actualWeightKg: number, reason: string) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  recordDriverDelivery: (
    orderId: string,
    status: 'completed' | 'cancelled',
    cashCollected?: number,
    driverNotes?: string
  ) => void;

  // Staff and settings
  addStaff: (user: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  cancelInvite: (inviteId: string) => void;
  updateStaffRole: (userId: string, role: Role) => void;
  toggleStaffStatus: (userId: string) => void;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  updateDeliveryArea: (id: string, updates: Partial<DeliveryArea>) => void;

  /** Owner: write the starting products, specials, areas and settings to the database. */
  loadStartingCatalogue: () => Promise<boolean>;
  /** Demo only: put the browser's data back to the starting examples. */
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'pm_products_v1',
  SPECIALS: 'pm_specials_v1',
  ORDERS: 'pm_orders_v1',
  USERS: 'pm_users_v1',
  AREAS: 'pm_areas_v1',
  SETTINGS: 'pm_settings_v1',
  LOGS: 'pm_logs_v1',
  AUTH: 'pm_auth_user_v2',
  CART: 'pm_cart_v1'
};

type CollectionName = 'products' | 'specials' | 'orders' | 'staff' | 'delivery_areas' | 'activity_logs';

/** Reads saved JSON without crashing the site if it has been damaged or tampered with. */
function loadSaved<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback) !== Array.isArray(parsed) || parsed === null || typeof parsed !== 'object') {
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked; the page keeps working for this visit.
  }
}

/** Short, hard-to-guess order numbers such as PM-7K3QX9 (no 0/O or 1/I mix-ups). */
function newOrderNumber(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return 'PM-' + Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  if (code.includes('popup-closed') || code.includes('cancelled-popup')) return 'Sign-in was closed before it finished.';
  if (code.includes('popup-blocked')) return 'Your browser blocked the sign-in window. Allow pop-ups for this site, then try again.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes, then try again.';
  if (code.includes('weak-password')) return 'Use a password of at least 8 characters.';
  if (code.includes('email-already-in-use')) return 'An account with that email already exists. Sign in instead.';
  if (code.includes('invalid-email')) return 'Check the email address.';
  if (code.includes('unauthorized-domain')) return 'This website address is not yet allowed to sign in. The Owner needs to add it in Firebase.';
  if (code.includes('network')) return 'No connection. Check your internet and try again.';
  // Wrong password and unknown email get the same message, so accounts cannot be guessed.
  return 'We could not sign you in with those details.';
}

function writeFailed(e: unknown) {
  const code = (e as { code?: string })?.code || '';
  console.error(e);
  toast(
    code === 'permission-denied'
      ? 'That was not saved. Your account may not be allowed to do this, or you may need to sign in again.'
      : 'That was not saved. Check your connection and try again.',
    'error'
  );
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ---------- Data ----------
  const [products, setProducts] = useState<Product[]>(() =>
    DEMO_MODE ? loadSaved<Product[]>(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS) : []
  );
  const [specials, setSpecials] = useState<SpecialCampaign[]>(() =>
    DEMO_MODE ? loadSaved<SpecialCampaign[]>(STORAGE_KEYS.SPECIALS, SEED_SPECIALS) : []
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    DEMO_MODE ? loadSaved<Order[]>(STORAGE_KEYS.ORDERS, SEED_ORDERS) : []
  );
  const [users, setUsers] = useState<UserProfile[]>(() =>
    DEMO_MODE ? loadSaved<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS) : []
  );
  const [liveAreas, setDeliveryAreas] = useState<DeliveryArea[]>(() =>
    DEMO_MODE ? loadSaved<DeliveryArea[]>(STORAGE_KEYS.AREAS, SEED_DELIVERY_AREAS) : []
  );
  const [liveSettings, setSettings] = useState<SiteSettings | null>(() =>
    DEMO_MODE ? loadSaved<SiteSettings>(STORAGE_KEYS.SETTINGS, SEED_SETTINGS) : null
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    DEMO_MODE ? loadSaved<ActivityLog[]>(STORAGE_KEYS.LOGS, []) : []
  );
  const [staffInvites, setStaffInvites] = useState<StaffInvite[]>([]);
  const [catalogueReady, setCatalogueReady] = useState(DEMO_MODE);

  // Until the Owner has saved settings and areas, the shop's published details are used.
  const settings = liveSettings ?? SEED_SETTINGS;
  const deliveryAreas = liveAreas.length > 0 ? liveAreas : SEED_DELIVERY_AREAS;

  const [rawCart, setCart] = useState<CartItem[]>(() => loadSaved<CartItem[]>(STORAGE_KEYS.CART, []));
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // ---------- Who is signed in ----------
  const [account, setAccount] = useState<SignedInAccount | null>(null);
  const [authReady, setAuthReady] = useState(DEMO_MODE);
  const [staffDoc, setStaffDoc] = useState<UserProfile | null | undefined>(undefined);
  const staffProblems = staffDoc ? staffRecordProblems(staffDoc as unknown as Record<string, unknown>) : [];
  const claimTried = useRef<string | null>(null);

  // Demo: only the staff id is remembered, and the profile is looked up fresh, so a
  // role cannot be granted by editing saved data.
  const [demoUserId, setDemoUserId] = useState<string | null>(() => {
    if (!DEMO_MODE) return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      return saved && saved.length <= 128 ? saved : null;
    } catch {
      return null;
    }
  });

  const currentUser: UserProfile | null = DEMO_MODE
    ? users.find(u => u.id === demoUserId && u.active) || null
    : staffDoc && staffProblems.length === 0 && staffDoc.active === true
      ? staffDoc
      : null;

  const authStatus: AuthStatus = DEMO_MODE
    ? currentUser
      ? 'staff'
      : 'signed_out'
    : !authReady
      ? 'loading'
      : !account
        ? 'signed_out'
        : staffDoc === undefined
          ? 'loading'
          : staffDoc === null
            ? 'not_staff'
            : staffProblems.length > 0
              ? 'needs_fix'
              : staffDoc.active === true
                ? 'staff'
                : 'inactive';

  const role = currentUser?.role;
  const isCounterUp = role === 'owner' || role === 'manager' || role === 'counter';

  // ---------- Demo persistence ----------
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.PRODUCTS, products); }, [products]);
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.SPECIALS, specials); }, [specials]);
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.ORDERS, orders); }, [orders]);
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.USERS, users); }, [users]);
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.AREAS, liveAreas); }, [liveAreas]);
  useEffect(() => { if (DEMO_MODE && liveSettings) saveLocal(STORAGE_KEYS.SETTINGS, liveSettings); }, [liveSettings]);
  useEffect(() => { if (DEMO_MODE) saveLocal(STORAGE_KEYS.LOGS, activityLogs); }, [activityLogs]);
  useEffect(() => { saveLocal(STORAGE_KEYS.CART, rawCart); }, [rawCart]);
  useEffect(() => {
    if (!DEMO_MODE) return;
    try {
      if (demoUserId) localStorage.setItem(STORAGE_KEYS.AUTH, demoUserId);
      else localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch {
      /* ignore */
    }
  }, [demoUserId]);

  // ---------- Live data: the public catalogue ----------
  useEffect(() => {
    if (DEMO_MODE) return;
    const fail = (e: Error) => console.error('Catalogue', e);
    const unsubs = [
      onSnapshot(collection(db, 'products'), snap => {
        setProducts(snap.docs.map(d => ({ ...(d.data() as Product), id: d.id })).sort((a, b) => a.sortOrder - b.sortOrder));
        setCatalogueReady(true);
      }, e => { fail(e); setCatalogueReady(true); }),
      onSnapshot(collection(db, 'specials'), snap => setSpecials(snap.docs.map(d => ({ ...(d.data() as SpecialCampaign), id: d.id }))), fail),
      onSnapshot(collection(db, 'delivery_areas'), snap => setDeliveryAreas(snap.docs.map(d => ({ ...(d.data() as DeliveryArea), id: d.id }))), fail),
      onSnapshot(doc(db, 'settings', 'site'), snap => setSettings(snap.exists() ? ({ ...SEED_SETTINGS, ...(snap.data() as SiteSettings) }) : null), fail)
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ---------- Live data: sign-in ----------
  useEffect(() => {
    if (DEMO_MODE) return;
    return onAuthStateChanged(auth, (user: User | null) => {
      setAccount(
        user
          ? {
              uid: user.uid,
              email: user.email ? user.email.toLowerCase() : null,
              emailVerified: user.emailVerified,
              usesPassword: user.providerData.some(p => p.providerId === 'password')
            }
          : null
      );
      setAuthReady(true);
    });
  }, []);

  // The staff record for the signed-in account. If there is none but the Owner has
  // invited this email, the record is created from the invitation (the rules check it).
  useEffect(() => {
    if (DEMO_MODE) return;
    if (!account) {
      setStaffDoc(undefined);
      return;
    }
    setStaffDoc(undefined);
    const ref = doc(db, 'staff', account.uid);
    return onSnapshot(
      ref,
      { includeMetadataChanges: true },
      async snap => {
        // Wait until the record is really saved: the rules read it on the server.
        if (snap.metadata.hasPendingWrites) return;
        if (snap.exists()) {
          setStaffDoc({ ...(snap.data() as UserProfile), id: snap.id });
          return;
        }
        if (account.email && account.emailVerified && claimTried.current !== account.uid) {
          claimTried.current = account.uid;
          try {
            const inviteRef = doc(db, 'staff_invites', account.email);
            const invite = await getDoc(inviteRef);
            if (invite.exists()) {
              const data = invite.data() as StaffInvite;
              const batch = writeBatch(db);
              batch.set(ref, {
                id: account.uid,
                name: data.name,
                email: account.email,
                phone: data.phone,
                role: data.role,
                active: true,
                createdAt: new Date().toISOString()
              });
              batch.delete(inviteRef);
              await batch.commit();
              return; // the snapshot fires again with the new record
            }
          } catch (e) {
            console.error('Invite', e);
          }
        }
        setStaffDoc(null);
      },
      e => {
        console.error('Staff record', e);
        setStaffDoc(null);
      }
    );
  }, [account?.uid, account?.emailVerified]);

  // ---------- Live data: what this person may see ----------
  useEffect(() => {
    if (DEMO_MODE || !account) {
      if (!DEMO_MODE) {
        setOrders([]);
        setUsers([]);
        setActivityLogs([]);
        setStaffInvites([]);
      }
      return;
    }
    const fail = (what: string) => (e: Error) => console.error(what, e);
    const unsubs: Array<() => void> = [];
    const asOrders = (docs: { id: string; data: () => unknown }[]) =>
      docs.map(d => ({ ...(d.data() as Order), id: d.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (currentUser && isCounterUp) {
      unsubs.push(
        onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(500)), s => setOrders(asOrders(s.docs)), fail('Orders')),
        onSnapshot(query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(300)), s => setActivityLogs(s.docs.map(d => d.data() as ActivityLog)), fail('Activity')),
        onSnapshot(collection(db, 'staff'), s => setUsers(s.docs.map(d => ({ ...(d.data() as UserProfile), id: d.id }))), fail('Staff'))
      );
      if (role === 'owner') {
        unsubs.push(onSnapshot(collection(db, 'staff_invites'), s => setStaffInvites(s.docs.map(d => ({ ...(d.data() as StaffInvite), id: d.id }))), fail('Invites')));
      }
    } else if (currentUser && role === 'driver') {
      unsubs.push(
        onSnapshot(query(collection(db, 'orders'), where('assignedDriverId', '==', account.uid)), s => setOrders(asOrders(s.docs)), fail('Deliveries'))
      );
    } else if (authStatus !== 'loading' && account.email && account.emailVerified) {
      // A customer sees the live status of orders placed with their own email.
      unsubs.push(
        onSnapshot(query(collection(db, 'orders'), where('customerEmail', '==', account.email)), s => setOrders(asOrders(s.docs)), fail('My orders'))
      );
    }
    return () => unsubs.forEach(u => u());
  }, [account?.uid, account?.email, account?.emailVerified, currentUser?.id, role, authStatus === 'loading']);

  // ---------- Writing ----------
  const setterFor: Record<CollectionName, React.Dispatch<React.SetStateAction<any[]>>> = {
    products: setProducts as any,
    specials: setSpecials as any,
    orders: setOrders as any,
    staff: setUsers as any,
    delivery_areas: setDeliveryAreas as any,
    activity_logs: setActivityLogs as any
  };

  /** Creates or replaces a whole record. */
  const save = (name: CollectionName, record: { id: string }) => {
    if (DEMO_MODE) {
      setterFor[name](prev => {
        const i = prev.findIndex((x: { id: string }) => x.id === record.id);
        if (i === -1) return name === 'activity_logs' ? [record, ...prev] : [record, ...prev];
        const next = [...prev];
        next[i] = record;
        return next;
      });
      return Promise.resolve(true);
    }
    return setDoc(doc(db, name, record.id), record).then(() => true, e => { writeFailed(e); return false; });
  };

  /** Changes some fields of a record. A field set to undefined is removed. */
  const patch = (name: CollectionName, id: string, fields: Record<string, unknown>) => {
    if (DEMO_MODE) {
      setterFor[name](prev => prev.map((x: { id: string }) => (x.id === id ? { ...x, ...fields } : x)));
      return Promise.resolve(true);
    }
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) data[k] = v === undefined ? deleteField() : v;
    return updateDoc(doc(db, name, id), data).then(() => true, e => { writeFailed(e); return false; });
  };

  const remove = (name: CollectionName, id: string) => {
    if (DEMO_MODE) {
      setterFor[name](prev => prev.filter((x: { id: string }) => x.id !== id));
      return Promise.resolve(true);
    }
    return deleteDoc(doc(db, name, id)).then(() => true, e => { writeFailed(e); return false; });
  };

  const logActivity = (action: string, details: string, actor: UserProfile | null = currentUser) => {
    // Only staff keep the activity log; the rules require entries under their own name.
    if (!actor) return;
    const entry: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action: action.slice(0, 80),
      details: details.slice(0, 1000),
      timestamp: new Date().toISOString()
    };
    if (DEMO_MODE) setActivityLogs(prev => [entry, ...prev]);
    else setDoc(doc(db, 'activity_logs', entry.id), entry).catch(e => console.error('Activity log', e));
  };

  // ---------- Sign-in ----------
  const loginAsDemoRole = (r: Role) => {
    if (!DEMO_MODE) return;
    const found = users.find(u => u.role === r && u.active);
    if (found) {
      setDemoUserId(found.id);
      logActivity('Staff Login', `${found.name} logged in as ${r.toUpperCase()}`, found);
    }
  };

  const loginWithEmail = (email: string): 'ok' | 'inactive' | 'failed' => {
    if (!DEMO_MODE) return 'failed';
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) return 'failed';
    if (!found.active) return 'inactive';
    setDemoUserId(found.id);
    logActivity('Staff Login', `${found.name} logged in with ${found.email}`, found);
    return 'ok';
  };

  const attempt = async (fn: () => Promise<unknown>): Promise<string | null> => {
    try {
      await fn();
      return null;
    } catch (e) {
      return friendlyAuthError(e);
    }
  };

  const signInWithGoogle = () =>
    attempt(() => signInWithPopup(auth, new GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' })));
  const signInWithPassword = (email: string, password: string) =>
    attempt(() => signInWithEmailAndPassword(auth, email.trim(), password));
  const createPasswordAccount = (email: string, password: string) =>
    attempt(async () => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
    });
  // Always reports success, so the form cannot be used to find out which emails have accounts.
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e) {
      const code = (e as { code?: string })?.code || '';
      if (code.includes('invalid-email') || code.includes('too-many')) return friendlyAuthError(e);
    }
    return null;
  };
  const resendVerification = () =>
    attempt(async () => {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
    });
  const refreshAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await user.reload();
    await user.getIdToken(true);
    claimTried.current = null;
    setAccount({
      uid: user.uid,
      email: user.email ? user.email.toLowerCase() : null,
      emailVerified: user.emailVerified,
      usesPassword: user.providerData.some(p => p.providerId === 'password')
    });
  };

  const logout = () => {
    if (currentUser) logActivity('Staff Logout', `${currentUser.name} signed out`);
    // A shared phone should not hand the next person someone else's cart.
    setCart([]);
    setIsCartDrawerOpen(false);
    if (DEMO_MODE) setDemoUserId(null);
    else signOut(auth);
  };

  // ---------- Cart (always priced from the live catalogue) ----------
  const cart = useMemo(
    () => rawCart.map(item => ({ ...item, product: products.find(p => p.id === item.product.id) ?? item.product })),
    [rawCart, products]
  );

  const addToCart = (product: Product, quantity = 1, selectedOption?: string, notes?: string) => {
    setCart(prev => {
      const i = prev.findIndex(item => item.product.id === product.id && item.selectedOption === selectedOption);
      if (i > -1) {
        const updated = [...prev];
        const newQty =
          product.pricingType === 'per_kg'
            ? Math.round((updated[i].quantity + quantity) * 10) / 10
            : updated[i].quantity + quantity;
        updated[i] = { ...updated[i], quantity: newQty, notes: notes || updated[i].notes };
        return updated;
      }
      return [...prev, { product, quantity, selectedOption, notes }];
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, selectedOption?: string) =>
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedOption === selectedOption)));

  const updateCartQuantity = (productId: string, quantity: number, selectedOption?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedOption);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedOption === selectedOption ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((acc, item) => {
    const lineTotal = calculateLineTotal(item.product.pricingType, item.product.price, item.quantity);
    return Math.round((acc + lineTotal + 0.0001) * 100) / 100;
  }, 0);

  const cartItemCount = cart.reduce((acc, item) => acc + (item.product.pricingType === 'per_kg' ? 1 : item.quantity), 0);

  const isCartFreeDelivery = checkCartFreeDelivery(
    cart.map(c => ({ category: c.product.category, isFreeDelivery: c.product.isFreeDelivery }))
  );

  // ---------- Catalogue ----------
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = { ...prodData, id: `prod-${Date.now()}` };
    save('products', newProduct);
    logActivity('Product Created', `Added "${newProduct.name}" (${newProduct.sku}) at R${newProduct.price}`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const changes: Record<string, unknown> = { ...updates };
    delete changes.id;
    patch('products', id, changes);
    const newPrice = updates.price ?? p.price;
    logActivity(
      'Product Updated',
      `Updated "${updates.name ?? p.name}" (${p.price !== newPrice ? `Price: R${p.price} -> R${newPrice}` : 'details'})`
    );
  };

  const duplicateProduct = (id: string): Product | null => {
    const target = products.find(p => p.id === id);
    if (!target) return null;
    const duplicated: Product = {
      ...target,
      id: `prod-${Date.now()}`,
      name: `${target.name} (Copy)`,
      slug: `${target.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${target.sku}-CPY`,
      stockStatus: 'hidden',
      sortOrder: target.sortOrder + 1
    };
    save('products', duplicated);
    logActivity('Product Duplicated', `Duplicated "${target.name}" to create "${duplicated.name}"`);
    return duplicated;
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    remove('products', id);
    logActivity('Product Deleted', `Removed "${target.name}" (${target.sku})`);
  };

  const bulkUpdatePrices = (category: string, percentage: number) => {
    const affected = products.filter(p => category === 'All' || p.category === category || p.subCategory === category);
    if (DEMO_MODE) {
      setProducts(prev =>
        prev.map(p => (affected.some(a => a.id === p.id) ? { ...p, price: applyBulkPriceUpdate(p.price, percentage) } : p))
      );
    } else {
      const batch = writeBatch(db);
      affected.forEach(p => batch.update(doc(db, 'products', p.id), { price: applyBulkPriceUpdate(p.price, percentage) }));
      batch.commit().catch(writeFailed);
    }
    logActivity('Bulk Price Update', `Adjusted all prices in "${category}" by ${percentage > 0 ? '+' : ''}${percentage}%`);
  };

  const setProductPhoto = async (productId: string, photo: string | null): Promise<boolean> => {
    if (DEMO_MODE) {
      setProducts(prev => prev.map(p => (p.id === productId ? { ...p, imageUrl: photo ?? undefined } : p)));
      return true;
    }
    try {
      if (photo) {
        await setDoc(doc(db, 'product_photos', productId), {
          data: photo,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.id ?? ''
        });
        await updateDoc(doc(db, 'products', productId), { photoVersion: Date.now() });
      } else {
        await updateDoc(doc(db, 'products', productId), { photoVersion: deleteField() });
        await deleteDoc(doc(db, 'product_photos', productId));
      }
      const p = products.find(x => x.id === productId);
      logActivity(photo ? 'Product Photo Added' : 'Product Photo Removed', `${p?.name ?? productId}`);
      return true;
    } catch (e) {
      writeFailed(e);
      return false;
    }
  };

  // ---------- Specials ----------
  const createSpecial = (data: Omit<SpecialCampaign, 'id'>): SpecialCampaign => {
    const newSpecial: SpecialCampaign = { ...data, id: `special-${Date.now()}` };
    save('specials', newSpecial);
    logActivity('Special Created', `Launched special campaign "${newSpecial.title}" (${newSpecial.label})`);
    return newSpecial;
  };

  const updateSpecial = (id: string, updates: Partial<SpecialCampaign>) => {
    const s = specials.find(x => x.id === id);
    if (!s) return;
    const changes: Record<string, unknown> = { ...updates };
    delete changes.id;
    patch('specials', id, changes);
    logActivity('Special Updated', `Modified special "${updates.title ?? s.title}"`);
  };

  const rerunSpecial = (id: string, newStartDate: string, newEndDate?: string) => {
    const s = specials.find(x => x.id === id);
    if (!s) return;
    patch('specials', id, { startDate: newStartDate, endDate: newEndDate, active: true });
    logActivity('Special Re-Run', `Re-activated archived special "${s.title}" with new dates`);
  };

  // ---------- Orders ----------
  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const now = new Date().toISOString();
    const id = DEMO_MODE ? generateOrderNumber(orders.length + 105) : newOrderNumber();
    const newOrder: Order = { ...orderData, id, createdAt: now, updatedAt: now };
    if (DEMO_MODE) {
      setOrders(prev => [newOrder, ...prev]);
    } else {
      // Placed without waiting for staff: the rules check every field of a new order.
      await setDoc(doc(db, 'orders', id), newOrder);
    }
    logActivity('Order Placed', `New order ${id} by ${newOrder.customerName} (${newOrder.deliveryType}) - Total: R${newOrder.total}`);
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    patch('orders', id, { orderStatus: status, updatedAt: new Date().toISOString() });
    logActivity('Order Status Changed', `Order ${id} moved from ${o.orderStatus} -> ${status}`);
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus, method?: string) => {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const paymentMethod = (method as Order['paymentMethod']) || o.paymentMethod;
    patch('orders', id, { paymentStatus: status, paymentMethod, updatedAt: new Date().toISOString() });
    logActivity('Payment Updated', `Order ${id} marked ${status.toUpperCase()} via ${paymentMethod}`);
  };

  const adjustOrderLineWeight = (orderId: string, productId: string, actualWeightKg: number, reason: string) => {
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const items = o.items.map(item => {
      if (item.productId !== productId) return item;
      const adjustedPrice = Math.round((item.unitPrice * actualWeightKg + 0.0001) * 100) / 100;
      return { ...item, actualWeightKg, adjustedPrice, lineTotal: adjustedPrice };
    });
    const subtotal = Math.round((items.reduce((acc, it) => acc + it.lineTotal, 0) + 0.0001) * 100) / 100;
    patch('orders', orderId, {
      items,
      subtotal,
      total: Math.round((subtotal + o.deliveryFee + 0.0001) * 100) / 100,
      weighAdjustReason: reason.slice(0, 300),
      updatedAt: new Date().toISOString()
    });
    logActivity('Weigh & Adjust', `Order ${orderId}: Weighed product ${productId} at ${actualWeightKg}kg. Reason: ${reason}`);
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const driver = users.find(u => u.id === driverId);
    patch('orders', orderId, {
      assignedDriverId: driverId,
      orderStatus: o.orderStatus === 'packing' || o.orderStatus === 'confirmed' ? 'out_for_delivery' : o.orderStatus,
      updatedAt: new Date().toISOString()
    });
    logActivity('Driver Assigned', `Assigned order ${orderId} to driver ${driver ? driver.name : driverId}`);
  };

  const recordDriverDelivery = (
    orderId: string,
    status: 'completed' | 'cancelled',
    cashCollected?: number,
    driverNotes?: string
  ) => {
    const o = orders.find(x => x.id === orderId);
    if (!o) return;
    const fields: Record<string, unknown> = {
      orderStatus: status,
      paymentStatus: cashCollected && cashCollected >= o.total ? 'paid' : o.paymentStatus,
      updatedAt: new Date().toISOString()
    };
    if (cashCollected !== undefined) fields.cashCollected = cashCollected;
    if (driverNotes) fields.driverNotes = driverNotes.slice(0, 500);
    patch('orders', orderId, fields);
    logActivity(
      'Delivery Result',
      `Driver updated ${orderId}: ${status}. Cash collected: R${cashCollected || 0}. Notes: ${driverNotes || 'None'}`
    );
  };

  // ---------- Staff ----------
  const addStaff = (userData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const email = userData.email.trim().toLowerCase();
    if (DEMO_MODE) {
      const newUser: UserProfile = { ...userData, email, id: `user-${Date.now()}`, createdAt: new Date().toISOString() };
      save('staff', newUser);
      logActivity('Staff Account Added', `Added ${newUser.name} as ${newUser.role.toUpperCase()}`);
      return;
    }
    if (!currentUser) return;
    const invite: StaffInvite = {
      id: email,
      email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
      invitedBy: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'staff_invites', email), invite).then(
      () => toast(`Invitation saved. ${userData.name} can now sign in with ${email}.`),
      writeFailed
    );
    logActivity('Staff Invited', `Invited ${userData.name} (${email}) as ${userData.role.toUpperCase()}`);
  };

  const cancelInvite = (inviteId: string) => {
    if (DEMO_MODE) return;
    deleteDoc(doc(db, 'staff_invites', inviteId)).catch(writeFailed);
    logActivity('Staff Invite Cancelled', `Cancelled the invitation for ${inviteId}`);
  };

  const updateStaffRole = (userId: string, newRole: Role) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    patch('staff', userId, { role: newRole });
    logActivity('Staff Role Changed', `Changed ${u.name}'s role to ${newRole.toUpperCase()}`);
  };

  const toggleStaffStatus = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (!u) return;
    patch('staff', userId, { active: !u.active });
    logActivity(
      !u.active ? 'Staff Activated' : 'Staff Deactivated',
      `${!u.active ? 'Re-activated' : 'Deactivated'} ${u.name}'s account (Account preserved)`
    );
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    const next = { ...settings, ...updates };
    if (DEMO_MODE) setSettings(next);
    else setDoc(doc(db, 'settings', 'site'), next).catch(writeFailed);
    logActivity('Settings Updated', 'Updated butchery store settings');
  };

  const updateDeliveryArea = (id: string, updates: Partial<DeliveryArea>) => {
    const a = deliveryAreas.find(x => x.id === id);
    if (!a) return;
    // Saved whole, so an area that only existed in the starting details is created.
    save('delivery_areas', { ...a, ...updates, id });
    logActivity('Delivery Area Updated', `Updated rules for area "${updates.name ?? a.name}"`);
  };

  const loadStartingCatalogue = async () => {
    if (DEMO_MODE || role !== 'owner') return false;
    try {
      const batch = writeBatch(db);
      SEED_PRODUCTS.forEach(p => batch.set(doc(db, 'products', p.id), p));
      SEED_SPECIALS.forEach(s => batch.set(doc(db, 'specials', s.id), s));
      SEED_DELIVERY_AREAS.forEach(a => batch.set(doc(db, 'delivery_areas', a.id), a));
      batch.set(doc(db, 'settings', 'site'), liveSettings ?? SEED_SETTINGS);
      await batch.commit();
      logActivity('Catalogue Loaded', `Loaded ${SEED_PRODUCTS.length} starting products, specials and delivery areas`);
      return true;
    } catch (e) {
      writeFailed(e);
      return false;
    }
  };

  const resetAllData = () => {
    if (!DEMO_MODE) return;
    try {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    setProducts(SEED_PRODUCTS);
    setSpecials(SEED_SPECIALS);
    setOrders(SEED_ORDERS);
    setUsers(SEED_USERS);
    setDeliveryAreas(SEED_DELIVERY_AREAS);
    setSettings(SEED_SETTINGS);
    setActivityLogs([]);
    setCart([]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        specials,
        orders,
        users,
        staffInvites,
        staffProblems,
        deliveryAreas,
        settings,
        activityLogs,
        catalogueReady,
        currentUser,
        account,
        authStatus,
        loginAsDemoRole,
        loginWithEmail,
        signInWithGoogle,
        signInWithPassword,
        createPasswordAccount,
        resetPassword,
        resendVerification,
        refreshAccount,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        isCartFreeDelivery,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isNavDrawerOpen,
        setIsNavDrawerOpen,
        addProduct,
        updateProduct,
        duplicateProduct,
        deleteProduct,
        bulkUpdatePrices,
        setProductPhoto,
        createSpecial,
        updateSpecial,
        rerunSpecial,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        adjustOrderLineWeight,
        assignDriver,
        recordDriverDelivery,
        addStaff,
        cancelInvite,
        updateStaffRole,
        toggleStaffStatus,
        updateSettings,
        updateDeliveryArea,
        loadStartingCatalogue,
        resetAllData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
