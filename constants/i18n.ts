// Arabic-first string repository. The customer app is Arabic-only.
// All UI copy lives here for centralized admin-managed translation.

export type Locale = 'ar';

export const STRINGS = {
  // Greetings & navigation
  hello: 'أهلاً',
  home: 'الرئيسية',
  orders: 'طلباتي',
  profile: 'الحساب',
  searchHint: 'ابحث عن مطعم أو مطبخ',
  featured: 'الأبرز في السادات',
  cuisines: 'تصفح حسب المطبخ',
  allRestaurants: 'كل المطاعم',
  specialOffers: 'عروض خاصة',
  specialOffersSub: 'وفّر أكثر مع مطاعم مختارة',

  // Restaurant states
  busy: 'مزدحم',
  busyDesc: 'لا يقبل الطلبات حالياً',
  busyBannerTitle: 'المطعم مزدحم حالياً',
  busyBannerBody: 'تم إيقاف الطلب مؤقتاً. يمكنك تصفح القائمة والعودة لاحقاً.',
  totalTime: 'دقيقة إجمالاً',
  prepLabel: 'تحضير',
  rideLabel: 'توصيل',
  off: 'خصم',
  viewOffer: 'عرض التفاصيل',
  yourOffer: 'عرضك',

  // Cart & add-ons
  addOnsTitle: 'أكمل وجبتك',
  addOnsSub: 'إضافات مقترحة من نفس المطعم',
  noAddOns: 'لا توجد إضافات متاحة',
  total: 'الإجمالي',
  skip: 'لا، شكراً',
  addToCart: 'أضف إلى السلة',
  yourCart: 'سلة طلباتك',
  clear: 'إفراغ',
  emptyCart: 'سلة طلباتك فارغة',
  emptyCartDesc: 'أضف عناصر من مطعم لتتمكن من المتابعة.',
  checkout: 'إتمام الطلب',
  viewCart: 'عرض السلة',
  menu: 'القائمة',
  popular: 'الأكثر طلباً',
  add: 'أضف',

  // Geofence
  simulateOutside: 'محاكاة موقع خارج نطاق التوصيل',
  simulateOutsideHint: 'مفيد لاختبار تدفق التحقق الجغرافي.',
  outsideArea: 'خارج منطقة الخدمة',

  // Vehicle selection
  chooseVehicle: 'اختر مركبة التوصيل',
  chooseVehicleSub: 'تختلف الأسعار حسب نوع المركبة والمسافة',
  vehicleBicycle: 'دراجة',
  vehicleMotorcycle: 'دراجة نارية',
  vehicleScooter: 'سكوتر',
  fastestTag: 'الأسرع',
  ecoTag: 'صديقة للبيئة',
  balancedTag: 'متوازن',
  flatRate: 'سعر ثابت',
  perKmShort: '/كم',
  minShort: 'د',
  deliveryVia: 'التوصيل بـ',
  yourVehicle: 'مركبتك',
  change: 'تغيير',

  // Receipt
  subtotal: 'الإجمالي الفرعي',
  deliveryFeeLabel: 'رسوم التوصيل',
  receipt: 'الفاتورة',
  orderSummary: 'ملخص الطلب',
  deliveryFree: 'مجاناً',

  // Profile
  signOut: 'تسجيل الخروج',
  signOutPrompt: 'تسجيل الخروج؟',
  signOutBody: 'يمكنك تسجيل الدخول مرة أخرى في أي وقت.',
  cancel: 'إلغاء',
  myAddress: 'عنواني',
  changeAddress: 'تغيير العنوان',
  pickAddress: 'اختر عنوانك',
  searchAddress: 'ابحث عن عنوان أو حي',
  selectAddress: 'تحديد',
  searchingAddress: 'جاري البحث...',
  noAddressResults: 'لا توجد نتائج',
  addressHint: 'يعمل البحث عبر OpenStreetMap',
  freeDeliveriesAvail: 'كوبونات توصيل مجاني متاحة',
  referAndEarn: 'ادعُ واربح',
  yourReferralCode: 'كود الإحالة الخاص بك',
  shareCode: 'مشاركة الكود',
  simulateInvite: 'محاكاة دعوة',
  paymentMethodsRow: 'طرق الدفع',
  helpSupport: 'المساعدة والدعم',
  about: 'عن التطبيق',

  // Orders
  myOrders: 'طلباتي',
  orderInProgress: 'طلب قيد التنفيذ',
  noOrders: 'لا توجد طلبات بعد',
  noOrdersDesc: 'تصفح المطاعم وضع أول طلب لك.',
  browseRestaurants: 'تصفح المطاعم',
  itemsCount: 'عناصر',
  itemCount: 'عنصر',

  // Tracking
  trackOrder: 'تتبع الطلب',
  callRider: 'الاتصال بالسائق',
  close: 'إغلاق',
  call: 'اتصال',
  orderNotFound: 'الطلب غير موجود.',
  deliveredLabel: 'تم التسليم',
  minAway: 'دقيقة متبقية',
  bicycleRider: 'سائق دراجة',
  items: 'عناصر الطلب',
  awaitingPayment: 'في انتظار التحقق...',
  paymentVerification: 'التحقق من الدفع',
  backToRestaurants: 'العودة للمطاعم',

  // Login
  welcomeBack: 'مرحباً بعودتك',
  loginTitle: 'تسجيل الدخول',
  signInAction: 'تسجيل الدخول إلى',
  signInSub: 'دخول سريع لسكان مدينة السادات.',
  fullName: 'الاسم الكامل',
  mobileNumber: 'رقم الجوال',
  email: 'البريد الإلكتروني',
  phoneTab: 'هاتف',
  emailTab: 'بريد إلكتروني',
  continue: 'متابعة',
  invalidName: 'الرجاء إدخال اسمك الكامل',
  invalidPhone: 'الرجاء إدخال رقم جوال صحيح',
  invalidEmail: 'الرجاء إدخال بريد إلكتروني صحيح',
  loginFailed: 'تعذر تسجيل الدخول',
  serviceVerified: 'منطقة الخدمة محققة',

  // Welcome screen
  welcomeTitle: 'طعام شهي يصلك إلى باب منزلك بالدراجات',
  welcomeSub: 'اطلب من أفضل مطاعم مدينة السادات. تابع سائقك مباشرة وادفع كما يحلو لك.',
  getStarted: 'ابدأ الآن',
  haveAccount: 'لدي حساب بالفعل',
  legalNote: 'بالمتابعة فإنك توافق على الشروط. الخدمة متاحة في مدينة السادات فقط.',
  localRestaurants: 'مطاعم محلية',
  liveTracking: 'تتبع مباشر',
  freeDeliveries: 'توصيلات مجانية',

  // Checkout
  deliveryTo: 'التوصيل إلى',
  addressLabel: 'الشارع والمبنى والدور',
  riderNotes: 'ملاحظات للسائق (اختياري)',
  callOnArrival: 'اتصل عند الوصول',
  insideGeofence: 'داخل نطاق التوصيل',
  paymentMethod: 'طريقة الدفع',
  uploadProofTitle: 'تحميل صورة التحويل',
  uploadProofSub: 'سيقوم نظام الذكاء الاصطناعي بمطابقة المبلغ والمرسل تلقائياً.',
  proofAttached: 'تم إرفاق الصورة · جاهزة للتحقق',
  tapToUpload: 'اضغط لتحميل الصورة',
  useFreeVoucher: 'استخدام كوبون توصيل مجاني',
  vouchersAvailable: 'متوفر لديك',
  placeOrder: 'تأكيد الطلب',
  verifying: 'جاري التحقق...',
  addressNeeded: 'العنوان مطلوب',
  enterAddress: 'الرجاء إدخال عنوان التوصيل بالتفصيل.',
  uploadRequired: 'الصورة مطلوبة',
  uploadRequiredBody: 'الرجاء تحميل صورة التحويل البنكي للتحقق.',
  orderPlaced: 'تم تأكيد الطلب!',
  trackNow: 'تابع الآن',
  trackLive: 'تابع سائق الدراجة لحظة بلحظة.',
  permissionNeeded: 'إذن مطلوب',
  permissionPhotos: 'الرجاء السماح بالوصول للصور لتحميل صورة التحويل.',
  verificationFailed: 'فشل التحقق',
  addressEmpty: 'لم يتم تحديد عنوان',
  addressEmptyHint: 'اضغط على تغيير العنوان لاختيار موقعك على الخريطة.',
};

export type StringKey = keyof typeof STRINGS;

export function getString(key: StringKey): string {
  return (STRINGS as any)[key] || '';
}
