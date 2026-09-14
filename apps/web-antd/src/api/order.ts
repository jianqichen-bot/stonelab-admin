import { requestClient } from '#/api/request';

export type OrderStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PAID'
  | 'PENDING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED';

export type PaymentStatus = 'PAID' | 'REFUNDED' | 'UNPAID';

export interface OrderListItem {
  adminRemark: string;
  buyerRemark: string;
  cancelledAt: null | string;
  completedAt: null | string;
  createdAt: string;
  customerId: null | string;
  id: string;
  itemCount: number;
  orderNo: string;
  paidAt: null | string;
  paymentStatus: PaymentStatus;
  recipientAddress: string;
  recipientCity: string;
  recipientDistrict: string;
  recipientName: string;
  recipientPhone: string;
  recipientProvince: string;
  shippedAt: null | string;
  shippingFeeCents: number;
  status: OrderStatus;
  subtotalCents: number;
  totalAmountCents: number;
  trackingCompany: string;
  trackingNo: string;
  updatedAt: string;
}

export interface OrderItem {
  diameterMm: null | number;
  id: string;
  imageKey: null | string;
  imageUrl: null | string;
  position: number;
  productId: null | number;
  productName: string;
  quantity: number;
  totalPriceCents: number;
  unitPriceCents: number;
  variantId: null | number;
  variantName: string;
}

export interface OrderDetail extends OrderListItem {
  items: OrderItem[];
}

export interface OrderQuery {
  keyword?: string;
  page: number;
  pageSize: number;
  status?: OrderStatus;
}

export interface UpdateOrderStatusInput {
  adminRemark?: string;
  status: OrderStatus;
  trackingCompany?: string;
  trackingNo?: string;
}

export function listOrdersApi(params: OrderQuery) {
  return requestClient.get<{
    items: OrderListItem[];
    page: number;
    pageSize: number;
    total: number;
  }>('/admin/orders', { params });
}

export function getOrderApi(id: string) {
  return requestClient.get<OrderDetail>(`/admin/orders/${id}`);
}

export function updateOrderStatusApi(id: string, data: UpdateOrderStatusInput) {
  return requestClient.request<OrderDetail>(`/admin/orders/${id}/status`, {
    data,
    method: 'PATCH',
  });
}
