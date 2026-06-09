// Static seed data for Etlob V1.0

import { SADAT_CENTER } from './config';

export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  cuisine: string;
  rating: number;
  reviews: number;
  etaMin: number;
  deliveryFee: number;
  image: string;
  cover: string;
  description: string;
  location: { lat: number; lng: number };
  tags: string[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

const u = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Koshary El-Sadat',
    nameAr: 'كشري السادات',
    cuisine: 'Egyptian',
    rating: 4.8,
    reviews: 1240,
    etaMin: 25,
    deliveryFee: 12,
    image: u('photo-1565958011703-44f9829ba187'),
    cover: u('photo-1504674900247-0877df9cc836', 1200),
    description: 'Local favorite serving the best koshary, fool, and ta\u2019meya in town.',
    location: { lat: SADAT_CENTER.lat + 0.01, lng: SADAT_CENTER.lng - 0.012 },
    tags: ['Vegetarian', 'Halal', 'Family'],
  },
  {
    id: 'r2',
    name: 'Pizza Corner',
    nameAr: 'بيتزا كورنر',
    cuisine: 'Italian',
    rating: 4.6,
    reviews: 860,
    etaMin: 30,
    deliveryFee: 15,
    image: u('photo-1513104890138-7c749659a591'),
    cover: u('photo-1513104890138-7c749659a591', 1200),
    description: 'Wood-fired pizza, fresh ingredients, family recipes.',
    location: { lat: SADAT_CENTER.lat - 0.008, lng: SADAT_CENTER.lng + 0.014 },
    tags: ['Pizza', 'Pasta', 'Family'],
  },
  {
    id: 'r3',
    name: 'Burger House',
    nameAr: 'برجر هاوس',
    cuisine: 'Fast Food',
    rating: 4.5,
    reviews: 720,
    etaMin: 20,
    deliveryFee: 10,
    image: u('photo-1568901346375-23c9450c58cd'),
    cover: u('photo-1568901346375-23c9450c58cd', 1200),
    description: 'Juicy beef burgers, crispy fries, and milkshakes.',
    location: { lat: SADAT_CENTER.lat + 0.014, lng: SADAT_CENTER.lng + 0.006 },
    tags: ['Burgers', 'Fast'],
  },
  {
    id: 'r4',
    name: 'Shawarma El Reef',
    nameAr: 'شاورما الريف',
    cuisine: 'Middle Eastern',
    rating: 4.7,
    reviews: 980,
    etaMin: 22,
    deliveryFee: 12,
    image: u('photo-1561651823-34feb02250e4'),
    cover: u('photo-1561651823-34feb02250e4', 1200),
    description: 'Tender shawarma, fresh bread, signature garlic sauce.',
    location: { lat: SADAT_CENTER.lat - 0.012, lng: SADAT_CENTER.lng - 0.005 },
    tags: ['Halal', 'Grill'],
  },
  {
    id: 'r5',
    name: 'Sweet Spot',
    nameAr: 'سويت سبوت',
    cuisine: 'Desserts',
    rating: 4.9,
    reviews: 510,
    etaMin: 18,
    deliveryFee: 10,
    image: u('photo-1488477181946-6428a0291777'),
    cover: u('photo-1488477181946-6428a0291777', 1200),
    description: 'Cakes, basbousa, kunafa and cold drinks.',
    location: { lat: SADAT_CENTER.lat + 0.005, lng: SADAT_CENTER.lng + 0.018 },
    tags: ['Sweet', 'Cold'],
  },
  {
    id: 'r6',
    name: 'Cafe Sadat',
    nameAr: 'كافيه السادات',
    cuisine: 'Coffee',
    rating: 4.4,
    reviews: 320,
    etaMin: 15,
    deliveryFee: 8,
    image: u('photo-1554118811-1e0d58224f24'),
    cover: u('photo-1554118811-1e0d58224f24', 1200),
    description: 'Specialty coffee, fresh juices, light bites.',
    location: { lat: SADAT_CENTER.lat - 0.004, lng: SADAT_CENTER.lng - 0.018 },
    tags: ['Coffee', 'Breakfast'],
  },
];

export const MENU_ITEMS: MenuItem[] = [
  // Koshary
  { id: 'm1', restaurantId: 'r1', name: 'Classic Koshary', nameAr: 'كشري كلاسيك', description: 'Rice, lentils, pasta, chickpeas, fried onions, tomato sauce.', price: 35, image: u('photo-1565958011703-44f9829ba187'), category: 'Main', popular: true },
  { id: 'm2', restaurantId: 'r1', name: 'Foul Medames', nameAr: 'فول مدمس', description: 'Slow-cooked fava beans with olive oil, lemon, cumin.', price: 22, image: u('photo-1604908554007-1d6e3f01ea1c'), category: 'Main' },
  { id: 'm3', restaurantId: 'r1', name: 'Taameya Sandwich', nameAr: 'ساندويتش طعمية', description: 'Egyptian falafel with tahini, salad, in fresh bread.', price: 18, image: u('photo-1593504049359-74330189a345'), category: 'Sandwich', popular: true },
  // Pizza
  { id: 'm4', restaurantId: 'r2', name: 'Margherita Pizza', nameAr: 'بيتزا مارجريتا', description: 'Tomato, mozzarella, fresh basil, olive oil.', price: 95, image: u('photo-1574071318508-1cdbab80d002'), category: 'Pizza', popular: true },
  { id: 'm5', restaurantId: 'r2', name: 'Pepperoni Pizza', nameAr: 'بيتزا بيبروني', description: 'Generous pepperoni and melted cheese.', price: 120, image: u('photo-1565299624946-b28f40a0ae38'), category: 'Pizza' },
  { id: 'm6', restaurantId: 'r2', name: 'Penne Arrabiata', nameAr: 'بيني ارابياتا', description: 'Spicy tomato pasta with garlic and chili.', price: 85, image: u('photo-1473093295043-cdd812d0e601'), category: 'Pasta' },
  // Burger
  { id: 'm7', restaurantId: 'r3', name: 'Classic Cheeseburger', nameAr: 'تشيز برجر', description: 'Beef patty, cheddar, lettuce, tomato, special sauce.', price: 75, image: u('photo-1568901346375-23c9450c58cd'), category: 'Burger', popular: true },
  { id: 'm8', restaurantId: 'r3', name: 'Double Smash', nameAr: 'دبل سماش', description: 'Two smashed patties, double cheese, pickles.', price: 110, image: u('photo-1572802419224-296b0aeee0d9'), category: 'Burger' },
  { id: 'm9', restaurantId: 'r3', name: 'Crispy Fries', nameAr: 'بطاطس مقرمشة', description: 'Golden hand-cut fries with sea salt.', price: 25, image: u('photo-1573080496219-bb080dd4f877'), category: 'Sides' },
  // Shawarma
  { id: 'm10', restaurantId: 'r4', name: 'Chicken Shawarma', nameAr: 'شاورما فراخ', description: 'Marinated chicken, tahini, garlic, pickles.', price: 55, image: u('photo-1561651823-34feb02250e4'), category: 'Sandwich', popular: true },
  { id: 'm11', restaurantId: 'r4', name: 'Beef Shawarma', nameAr: 'شاورما لحمة', description: 'Slow-roasted beef with tahini sauce.', price: 65, image: u('photo-1633321702518-7feccafb94d5'), category: 'Sandwich' },
  { id: 'm12', restaurantId: 'r4', name: 'Mixed Grill Plate', nameAr: 'مشاوي مشكلة', description: 'Kofta, kebab, chicken, rice, salad.', price: 145, image: u('photo-1544025162-d76694265947'), category: 'Plate' },
  // Sweet Spot
  { id: 'm13', restaurantId: 'r5', name: 'Kunafa Plate', nameAr: 'كنافة', description: 'Crispy kunafa with cream and pistachios.', price: 60, image: u('photo-1567620905732-2d1ec7ab7445'), category: 'Dessert', popular: true },
  { id: 'm14', restaurantId: 'r5', name: 'Basbousa', nameAr: 'بسبوسة', description: 'Sweet semolina cake with syrup.', price: 30, image: u('photo-1571115177098-24ec42ed204d'), category: 'Dessert' },
  { id: 'm15', restaurantId: 'r5', name: 'Mango Smoothie', nameAr: 'مانجو سموثي', description: 'Fresh mango blended with milk and ice.', price: 35, image: u('photo-1546039907-7fa05f864c02'), category: 'Drinks' },
  // Cafe
  { id: 'm16', restaurantId: 'r6', name: 'Espresso', nameAr: 'اسبريسو', description: 'Single shot of specialty espresso.', price: 25, image: u('photo-1510707577719-ae7c14805e3a'), category: 'Coffee' },
  { id: 'm17', restaurantId: 'r6', name: 'Iced Latte', nameAr: 'ايس لاتيه', description: 'Cold espresso with milk over ice.', price: 40, image: u('photo-1517701550927-30cf4ba1dba5'), category: 'Coffee', popular: true },
  { id: 'm18', restaurantId: 'r6', name: 'Fresh OJ', nameAr: 'عصير برتقال', description: 'Freshly squeezed orange juice.', price: 28, image: u('photo-1600271886742-f049cd451bba'), category: 'Drinks' },
];

export const SADAT_AREAS = [
  'District 1', 'District 2', 'District 3', 'District 5', 'District 7', 'District 9', 'Central Market', 'University Area',
];
