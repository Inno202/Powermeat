import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  SpecialCampaign,
  Order,
  UserProfile,
  DeliveryArea,
  SiteSettings,
  ActivityLog,
  OrderItem,
  Role,
  OrderStatus,
  PaymentStatus
} from '../types';
import {
  SEED_PRODUCTS,
  SEED_SPECIALS,
  SEED_ORDERS,
  SEED_USERS,
  SEED_DELIVERY_AREAS,
  SEED_SETTINGS
} from '../data/seedData';
import {
  calculateDeliveryFee,
  checkCartFreeDelivery,
  calculateLineTotal,
  applyBulkPriceUpdate
} from '../utils/pricing';
import { generateOrderNumber } from '../utils/delivery';

export interface CartItem {
  product: Product;
  quantity: number; // units or kg
  selectedOption?: string;
  notes?: string;
}

interface StoreContextType {
  // Store Data
  products: Product[];
  specials: SpecialCampaign[];
  orders: Order[];
  users: UserProfile[];
  deliveryAreas: DeliveryArea[];
  settings: SiteSettings;
  activityLogs: ActivityLog[];

  // Auth / Current User
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  loginAsDemoRole: (role: Role) => void;
  loginWithEmail: (email: string) => boolean;
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

  // Navigation Drawer
  isNavDrawerOpen: boolean;
  setIsNavDrawerOpen: (open: boolean) => void;

  // Product CRUD & Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  duplicateProduct: (id: string) => Product | null;
  deleteProduct: (id: string) => void; // soft or hard
  bulkUpdatePrices: (category: string, percentage: number) => void;

  // Specials Actions
  createSpecial: (special: Omit<SpecialCampaign, 'id'>) => SpecialCampaign;
  updateSpecial: (id: string, updates: Partial<SpecialCampaign>) => void;
  rerunSpecial: (id: string, newStartDate: string, newEndDate?: string) => void;

  // Orders Actions
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus, method?: string) => void;
  adjustOrderLineWeight: (
    orderId: string,
    productId: string,
    actualWeightKg: number,
    reason: string
  ) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  recordDriverDelivery: (
    orderId: string,
    status: 'completed' | 'cancelled',
    cashCollected?: number,
    driverNotes?: string
  ) => void;

  // Staff & Settings Actions
  addStaff: (user: Omit<UserProfile, 'id' | 'createdAt'>) => UserProfile;
  updateStaffRole: (userId: string, role: Role) => void;
  toggleStaffStatus: (userId: string) => void;
  updateSettings: (updates: Partial<SiteSettings>) => void;
  updateDeliveryArea: (id: string, updates: Partial<DeliveryArea>) => void;

  // Reset demo data
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
  AUTH: 'pm_auth_user_v1',
  CART: 'pm_cart_v1'
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with seed fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [specials, setSpecials] = useState<SpecialCampaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPECIALS);
    return saved ? JSON.parse(saved) : SEED_SPECIALS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : SEED_ORDERS;
  });

  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AREAS);
    return saved ? JSON.parse(saved) : SEED_DELIVERY_AREAS;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : SEED_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'log-seed-1',
        userId: 'user-owner',
        userName: 'Johan van der Merwe',
        userRole: 'owner',
        action: 'System Initialized',
        details: 'Loaded Powermeat seed catalog and standard delivery zones',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPECIALS, JSON.stringify(specials));
  }, [specials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(deliveryAreas));
  }, [deliveryAreas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Log activity helper
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.id || 'system',
      userName: currentUser?.name || 'Customer/Guest',
      userRole: currentUser?.role || 'counter',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Auth functions
  const loginAsDemoRole = (role: Role) => {
    const found = users.find(u => u.role === role && u.active);
    if (found) {
      setCurrentUser(found);
      logActivity('Staff Login', `${found.name} logged in as ${role.toUpperCase()}`);
    }
  };

  const loginWithEmail = (email: string): boolean => {
    const clean = email.toLowerCase().trim();
    const found = users.find(u => u.email.toLowerCase() === clean);
    if (found) {
      if (!found.active) {
        alert('This staff account has been deactivated. Please contact the Owner.');
        return false;
      }
      setCurrentUser(found);
      logActivity('Staff Login', `${found.name} logged in with ${email}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('Staff Logout', `${currentUser.name} signed out`);
    }
    setCurrentUser(null);
  };

  // Cart functions
  const addToCart = (product: Product, quantity = 1, selectedOption?: string, notes?: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedOption === selectedOption
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = (product.pricingType === 'per_kg')
          ? Math.round((updated[existingIndex].quantity + quantity) * 10) / 10
          : updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          notes: notes || updated[existingIndex].notes
        };
        return updated;
      } else {
        return [...prev, { product, quantity, selectedOption, notes }];
      }
    });
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (productId: string, selectedOption?: string) => {
    setCart(prev =>
      prev.filter(item => !(item.product.id === productId && item.selectedOption === selectedOption))
    );
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedOption?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedOption);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selectedOption === selectedOption) {
          return { ...item, quantity };
        }
        return item;
      })
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

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
    logActivity('Product Created', `Added "${newProduct.name}" (${newProduct.sku}) at R${newProduct.price}`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          logActivity(
            'Product Updated',
            `Updated "${updated.name}" (${p.price !== updated.price ? `Price: R${p.price} -> R${updated.price}` : 'details'})`
          );
          return updated;
        }
        return p;
      })
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
    setProducts(prev => [duplicated, ...prev]);
    logActivity('Product Duplicated', `Duplicated "${target.name}" to create "${duplicated.name}"`);
    return duplicated;
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (target) {
      setProducts(prev => prev.filter(p => p.id !== id));
      logActivity('Product Deleted', `Removed "${target.name}" (${target.sku})`);
    }
  };

  const bulkUpdatePrices = (category: string, percentage: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (category === 'All' || p.category === category || p.subCategory === category) {
          const updatedPrice = applyBulkPriceUpdate(p.price, percentage);
          return { ...p, price: updatedPrice };
        }
        return p;
      })
    );
    logActivity(
      'Bulk Price Update',
      `Adjusted all prices in "${category}" by ${percentage > 0 ? '+' : ''}${percentage}%`
    );
  };

  // Specials
  const createSpecial = (data: Omit<SpecialCampaign, 'id'>): SpecialCampaign => {
    const newSpecial: SpecialCampaign = {
      ...data,
      id: `special-${Date.now()}`
    };
    setSpecials(prev => [newSpecial, ...prev]);
    logActivity('Special Created', `Launched special campaign "${newSpecial.title}" (${newSpecial.label})`);
    return newSpecial;
  };

  const updateSpecial = (id: string, updates: Partial<SpecialCampaign>) => {
    setSpecials(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          logActivity('Special Updated', `Modified special "${updated.title}"`);
          return updated;
        }
        return s;
      })
    );
  };

  const rerunSpecial = (id: string, newStartDate: string, newEndDate?: string) => {
    setSpecials(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = {
            ...s,
            startDate: newStartDate,
            endDate: newEndDate,
            active: true
          };
          logActivity('Special Re-Run', `Re-activated archived special "${s.title}" with new dates`);
          return updated;
        }
        return s;
      })
    );
  };

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const nextSeq = orders.length + 105;
    const orderId = generateOrderNumber(nextSeq);
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: now,
      updatedAt: now
    };

    setOrders(prev => [newOrder, ...prev]);
    logActivity(
      'Order Placed',
      `New order ${orderId} by ${newOrder.customerName} (${newOrder.deliveryType}) - Total: R${newOrder.total}`
    );
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === id) {
          const updated = { ...o, orderStatus: status, updatedAt: new Date().toISOString() };
          logActivity('Order Status Changed', `Order ${id} moved from ${o.orderStatus} -> ${status}`);
          return updated;
        }
        return o;
      })
    );
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus, method?: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === id) {
          const updated = {
            ...o,
            paymentStatus: status,
            paymentMethod: method ? (method as any) : o.paymentMethod,
            updatedAt: new Date().toISOString()
          };
          logActivity('Payment Updated', `Order ${id} marked ${status.toUpperCase()} via ${updated.paymentMethod}`);
          return updated;
        }
        return o;
      })
    );
  };

  const adjustOrderLineWeight = (
    orderId: string,
    productId: string,
    actualWeightKg: number,
    reason: string
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedItems = o.items.map(item => {
            if (item.productId === productId) {
              const adjustedPrice = Math.round((item.unitPrice * actualWeightKg + 0.0001) * 100) / 100;
              return {
                ...item,
                actualWeightKg,
                adjustedPrice,
                lineTotal: adjustedPrice
              };
            }
            return item;
          });

          const newSubtotal = updatedItems.reduce((acc, it) => acc + it.lineTotal, 0);
          const newTotal = newSubtotal + o.deliveryFee;

          logActivity(
            'Weigh & Adjust',
            `Order ${orderId}: Weighed product ${productId} at ${actualWeightKg}kg. Reason: ${reason}`
          );

          return {
            ...o,
            items: updatedItems,
            subtotal: newSubtotal,
            total: newTotal,
            weighAdjustReason: reason,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );
  };

  const assignDriver = (orderId: string, driverId: string) => {
    const driver = users.find(u => u.id === driverId);
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logActivity('Driver Assigned', `Assigned order ${orderId} to driver ${driver ? driver.name : driverId}`);
          return {
            ...o,
            assignedDriverId: driverId,
            orderStatus: o.orderStatus === 'packing' || o.orderStatus === 'confirmed' ? 'out_for_delivery' : o.orderStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );
  };

  const recordDriverDelivery = (
    orderId: string,
    status: 'completed' | 'cancelled',
    cashCollected?: number,
    driverNotes?: string
  ) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          logActivity(
            'Delivery Result',
            `Driver updated ${orderId}: ${status}. Cash collected: R${cashCollected || 0}. Notes: ${driverNotes || 'None'}`
          );
          return {
            ...o,
            orderStatus: status,
            cashCollected: cashCollected !== undefined ? cashCollected : o.cashCollected,
            driverNotes: driverNotes || o.driverNotes,
            paymentStatus: cashCollected && cashCollected >= o.total ? 'paid' : o.paymentStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );
  };

  // Staff management
  const addStaff = (userData: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile => {
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
    logActivity('Staff Account Added', `Invited ${newUser.name} as ${newUser.role.toUpperCase()}`);
    return newUser;
  };

  const updateStaffRole = (userId: string, role: Role) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          logActivity('Staff Role Changed', `Changed ${u.name}'s role to ${role.toUpperCase()}`);
          return { ...u, role };
        }
        return u;
      })
    );
  };

  const toggleStaffStatus = (userId: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextActive = !u.active;
          logActivity(
            nextActive ? 'Staff Activated' : 'Staff Deactivated',
            `${nextActive ? 'Re-activated' : 'Deactivated'} ${u.name}'s account (Account preserved)`
          );
          return { ...u, active: nextActive };
        }
        return u;
      })
    );
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      logActivity('Settings Updated', 'Updated butchery store settings');
      return updated;
    });
  };

  const updateDeliveryArea = (id: string, updates: Partial<DeliveryArea>) => {
    setDeliveryAreas(prev =>
      prev.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates };
          logActivity('Delivery Area Updated', `Updated rules for area "${updated.name}"`);
          return updated;
        }
        return a;
      })
    );
  };

  const resetAllData = () => {
    localStorage.clear();
    setProducts(SEED_PRODUCTS);
    setSpecials(SEED_SPECIALS);
    setOrders(SEED_ORDERS);
    setUsers(SEED_USERS);
    setDeliveryAreas(SEED_DELIVERY_AREAS);
    setSettings(SEED_SETTINGS);
    setCart([]);
    logActivity('System Reset', 'Reset all test data back to factory seed defaults');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        specials,
        orders,
        users,
        deliveryAreas,
        settings,
        activityLogs,
        currentUser,
        setCurrentUser,
        loginAsDemoRole,
        loginWithEmail,
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
        updateStaffRole,
        toggleStaffStatus,
        updateSettings,
        updateDeliveryArea,
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
