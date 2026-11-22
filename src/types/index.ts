export type Role = 'ROLE_ADMIN' | 'ROLE_CASHIER';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  description?: string;
  category: Category;
  minReorderLevel: number;
  active: boolean;
  totalAvailableStock: number;
}

export type BatchStatus = 'ACTIVE' | 'NEAR_EXPIRY' | 'CRITICAL' | 'EXPIRED' | 'DISPOSED';

export interface Batch {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  batchNumber: string;
  initialQuantity: number;
  availableQuantity: number;
  costPrice: number;
  baseSellingPrice: number;
  currentSellingPrice: number;
  discountPercentage: number;
  manufacturingDate?: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: BatchStatus;
}

export interface AllocatedBatchItem {
  batchId: number;
  batchNumber: string;
  expiryDate: string;
  daysUntilExpiry: number;
  allocatedQuantity: number;
  basePrice: number;
  currentPrice: number;
  discountPercentage: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface ClearanceOption {
  batchId: number;
  batchNumber: string;
  discountPercentage: number;
  discountedPrice: number;
  originalPrice: number;
  expiryDate: string;
  daysUntilExpiry: number;
  availableQuantity: number;
}

export interface CartPreviewItem {
  productId: number;
  productName: string;
  barcode: string;
  sku: string;
  requestedQuantity: number;
  selectedBatchId?: number | null;
  preferExpiringDiscount: boolean;
  availableDiscounts?: ClearanceOption[];
  allocatedBatches: AllocatedBatchItem[];
  itemSubtotal: number;
  itemDiscount: number;
  itemTotal: number;
}

export interface CartPreviewResponse {
  items: CartPreviewItem[];
  subtotal: number;
  totalDiscount: number;
  totalPayable: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';

export interface OrderItem {
  id: number;
  productName: string;
  productSku: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  totalDiscount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  items: OrderItem[];
  createdAt: string;
}

export interface MarkdownRule {
  id: number;
  ruleName: string;
  daysBeforeExpiry: number;
  discountPercentage: number;
  active: boolean;
}

export interface DisposalLog {
  id: number;
  batchId: number;
  batchNumber: string;
  productName: string;
  approvedByName: string;
  quantityDisposed: number;
  financialLossAmount: number;
  reason: 'EXPIRED' | 'DAMAGED' | 'RECALLED';
  notes?: string;
  disposedAt: string;
}

export interface UrgentBatch {
  batchId: number;
  batchNumber: string;
  productName: string;
  availableQuantity: number;
  currentSellingPrice: number;
  discountPercentage: number;
  expiryDate: string;
  daysUntilExpiry: number;
  status: BatchStatus;
}

export interface AnalyticsSummary {
  totalInventoryValue: number;
  atRiskInventoryValue: number;
  totalSalesRevenue: number;
  totalDiscountsGiven: number;
  totalDisposalLoss: number;
  totalProductsCount: number;
  totalActiveBatchesCount: number;
  batchStatusBreakdown: Record<string, number>;
  topUrgentBatches: UrgentBatch[];
}
