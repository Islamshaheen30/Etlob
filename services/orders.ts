import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentMethodId } from '@/constants/config';
import { VehicleType } from '@/constants/adminSettings';
import { MenuItem, Restaurant } from '@/constants/mockData';

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
  paymentProof?: { uri?: string; verified: boolean; sender?: string; amount?: number };
  status: OrderStatus;
  createdAt: number;
  address: string;
  notes?: string;
  rider?: { name: string; phone: string; rating: number };
  riderPosition?: { lat: number; lng: number };
  customerPosition: { lat: number; lng: number };
  restaurantPosition: { lat: number; lng: number };
  estimatedMinutes: number;
  vehicleType: VehicleType;
}

const KEY = 'etlob.orders.v1';

export async function loadOrders(): Promise<Order[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Order[];
    return list.map((o) => ({ ...o, vehicleType: o.vehicleType ?? 'bicycle' }));
  } catch {
    return [];
  }
}

export async function saveOrders(list: Order[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
}

export function buildOrder(params: {
  userId: string;
  restaurant: Restaurant;
  items: { item: MenuItem; qty: number }[];
  paymentMethod: PaymentMethodId;
  address: string;
  notes?: string;
  customerPosition: { lat: number; lng: number };
  freeDelivery?: boolean;
  vehicleType: VehicleType;
  vehicleFee: number;
  estimatedMinutes?: number;
}): Order {
  const subtotal = params.items.reduce((s, i) => s + i.item.price * i.qty, 0);
  const deliveryFee = params.freeDelivery ? 0 : params.vehicleFee;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;
  return {
    id: `ord_${Date.now()}`,
    userId: params.userId,
    restaurant: { id: params.restaurant.id, name: params.restaurant.name, image: params.restaurant.image },
    items: params.items.map((i) => ({ id: i.item.id, name: i.item.name, qty: i.qty, price: i.item.price, image: i.item.image })),
    subtotal,
    deliveryFee,
    discount,
    total,
    paymentMethod: params.paymentMethod,
    paymentProof: params.paymentMethod === 'cash' ? undefined : { verified: false },
    status: params.paymentMethod === 'cash' ? 'confirmed' : 'pending_payment',
    createdAt: Date.now(),
    address: params.address,
    notes: params.notes,
    customerPosition: params.customerPosition,
    restaurantPosition: params.restaurant.location,
    riderPosition: params.restaurant.location,
    estimatedMinutes: params.estimatedMinutes ?? params.restaurant.etaMin,
    vehicleType: params.vehicleType,
    rider: {
      name: 'أحمد حسن',
      phone: '+20 100 555 1212',
      rating: 4.9,
    },
  };
}

export function progressOrderStatus(current: OrderStatus): OrderStatus {
  const flow: OrderStatus[] = ['confirmed', 'preparing', 'rider_pickup', 'on_the_way', 'delivered'];
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
