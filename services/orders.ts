// Supabase-backed order service.
// Orders live in the `orders` table; this module owns the row <-> Order
// mapping and exposes thin CRUD helpers for the OrdersContext to use.

import { supabase } from './supabaseClient';
import { PaymentMethodId, SADAT_CENTER } from '@/constants/config';
import { VehicleType } from '@/constants/adminSettings';
import { MenuItem, Restaurant } from '@/constants/mockData';
import { LatLng } from './tracking';

export type OrderStatus =
  | 'pending_payment'
  | 'verifying'
  | 'confirmed'
  | 'preparing'
  | 'rider_pickup'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurant: { id: string; name: string; image: string };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodId;
  paymentProof?: {
    uri?: string;
    verified: boolean;
    sender?: string;
    amount?: number;
  };
  status: OrderStatus;
  createdAt: number;
  address: string;
  notes?: string;
  rider?: { name: string; phone: string; rating: number };
  riderPosition?: LatLng;
  customerPosition: LatLng;
  restaurantPosition: LatLng;
  estimatedMinutes: number;
  vehicleType: VehicleType;
}

export interface BuildOrderParams {
  userId: string;
  restaurant: Restaurant;
  items: { item: MenuItem; qty: number }[];
  paymentMethod: PaymentMethodId;
  address: string;
  notes?: string;
  customerPosition: LatLng;
  customerName?: string;
  customerPhone?: string;
  freeDelivery?: boolean;
  vehicleType: VehicleType;
  vehicleFee: number;
  estimatedMinutes?: number;
}

// Build the row that gets inserted into Supabase. Server generates `id`
// and `created_at`; we only send business data.
export function buildOrderRow(params: BuildOrderParams) {
  const subtotal = params.items.reduce(
    (s, i) => s + i.item.price * i.qty,
    0
  );
  const deliveryFee = params.freeDelivery ? 0 : params.vehicleFee;
  const total = subtotal + deliveryFee;
  return {
    customer_id: params.userId,
    restaurant_id: params.restaurant.id,
    restaurant_name: params.restaurant.name,
    restaurant_name_ar: params.restaurant.nameAr,
    items: params.items.map((i) => ({
      id: i.item.id,
      name: i.item.nameAr || i.item.name,
      qty: i.qty,
      price: i.item.price,
      image: i.item.image,
    })),
    subtotal,
    delivery_fee: deliveryFee,
    total_price: total,
    status: params.paymentMethod === 'cash' ? 'confirmed' : 'pending_payment',
    payment_method: params.paymentMethod,
    vehicle_type: params.vehicleType,
    required_vehicle_type: params.vehicleType, // New field for driver filtering
    customer_location: params.customerPosition,
    customer_address: params.address,
    customer_name: params.customerName,
    customer_phone: params.customerPhone,
    rider_notes: params.notes,
    free_delivery: !!params.freeDelivery,
  };
}

// Map a row from Supabase to the in-memory Order shape used by the UI.
export function mapOrderRow(
  row: any,
  restaurantLookup?: (id: string) => Restaurant | undefined
): Order {
  const items: OrderItem[] = Array.isArray(row.items) ? row.items : [];
  const subtotal = Number(row.subtotal) || 0;
  const deliveryFee = Number(row.delivery_fee) || 0;
  const total = Number(row.total_price) || subtotal + deliveryFee;
  const rest = restaurantLookup ? restaurantLookup(row.restaurant_id) : undefined;
  const restaurantPosition: LatLng =
    rest?.location || row.customer_location || SADAT_CENTER;
  const customerPosition: LatLng = row.customer_location || SADAT_CENTER;

  return {
    id: row.id,
    userId: row.customer_id,
    restaurant: {
      id: row.restaurant_id,
      name: row.restaurant_name_ar || row.restaurant_name || '',
      image: rest?.image || '',
    },
    items,
    subtotal,
    deliveryFee,
    discount: 0,
    total,
    paymentMethod: (row.payment_method as PaymentMethodId) || 'cash',
    paymentProof: row.payment_proof_url
      ? {
          uri: row.payment_proof_url,
          verified:
            row.status !== 'verifying' && row.status !== 'pending_payment',
        }
      : row.payment_method !== 'cash'
      ? { verified: false }
      : undefined,
    status: (row.status as OrderStatus) || 'pending_payment',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    address: row.customer_address || '',
    notes: row.rider_notes || undefined,
    rider: { name: 'أحمد حسن', phone: '+20 100 555 1212', rating: 4.9 },
    riderPosition: row.rider_location || restaurantPosition,
    customerPosition,
    restaurantPosition,
    estimatedMinutes: 25,
    vehicleType: (row.vehicle_type as VehicleType) || 'bicycle',
  };
}

// Insert order and return the mapped Order with server-assigned id.
export async function createOrderInDb(
  row: ReturnType<typeof buildOrderRow>
): Promise<{ data: Order | null; error: string | null }> {
  const { data, error } = await supabase
    .from('orders')
    .insert(row)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: mapOrderRow(data), error: null };
}

// Fetch all orders belonging to a customer, newest first.
export async function fetchOrdersForCustomer(
  customerId: string
): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((r: any) => mapOrderRow(r));
}

// Patch an order row by id.
export async function updateOrderInDb(
  id: string,
  patch: Record<string, any>
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('orders').update(patch).eq('id', id);
  return { error: error ? error.message : null };
}

// Convert a partial Order patch (camelCase) into a DB row patch.
export function orderPatchToRow(patch: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.riderPosition !== undefined) row.rider_location = patch.riderPosition;
  if (patch.paymentProof !== undefined) {
    if (patch.paymentProof.uri) row.payment_proof_url = patch.paymentProof.uri;
  }
  if (patch.notes !== undefined) row.rider_notes = patch.notes;
  if (patch.address !== undefined) row.customer_address = patch.address;
  return row;
}

export function progressOrderStatus(current: OrderStatus): OrderStatus {
  const flow: OrderStatus[] = [
    'confirmed',
    'preparing',
    'rider_pickup',
    'on_the_way',
    'delivered',
  ];
  const idx = flow.indexOf(current);
  if (idx < 0) return 'preparing';
  if (idx === flow.length - 1) return 'delivered';
  return flow[idx + 1];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'بانتظار الدفع',
  verifying: 'جاري التحقق',
  confirmed: 'مؤكد',
  preparing: 'المطعم يحضّر',
  rider_pickup: 'السائق يستلم',
  on_the_way: 'في الطريق إليك',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};
