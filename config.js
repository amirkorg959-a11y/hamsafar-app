/* تنظیمات اتصال به Supabase (پایگاه داده‌ی مشترک هم‌سفر)
   فقط «کلید عمومی» (Publishable یا anon) مجاز است. کلید secret یا service_role را هرگز اینجا نگذارید:
   این فایل برای همه‌ی بازدیدکنندگان دیده می‌شود و سایت خودش چنین کلیدی را رد می‌کند.
   smsLogin: فقط اگر تابع پیامک را در Supabase ساخته‌اید true کنید (راهنما در README، بخش اختیاری). */
window.HAMSAFAR_CONFIG = {
  supabaseUrl: "https://mssjgdsfswyloytldthr.supabase.co",
  supabaseKey: "sb_publishable_0VtIaerJLR7j0EB0ONf_1w_MxLtsXAT",
  smsLogin: false
};
