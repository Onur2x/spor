# FitPro ELITE V11 PRO

V11 önceki paketteki giriş sorununu düzelten ve beslenme için fotoğraftan AI kalori/makro analizi ekleyen profesyonel sürümdür.

## 1) Supabase
Supabase SQL Editor'a `supabase_schema.sql` dosyasını komple çalıştır.

Bu migration eski V11'in `fullname/heightcm/...` isimlerini kullanan profil kolonlarıyla da uyumludur ve yeni snake_case kolonlarını doldurur.

## 2) Auth
Supabase Dashboard → Authentication → Providers → Email açık olmalı.
E-posta doğrulama açıksa kayıt sonrası gelen doğrulama linkine tıklamak gerekir. Test için Email Confirmations kapatılabilir.

## 3) OpenAI secret
Supabase Dashboard → Edge Functions → Secrets bölümüne:
`OPENAI_API_KEY=...`

API anahtarını asla `index.html` içine koyma.

## 4) Functions
CLI ile proje klasöründe:

`supabase functions deploy fitpro-coach`
`supabase functions deploy fitpro-food-analyzer`

veya Dashboard üzerinden iki function'ı ayrı ayrı deploy et.

## 5) AI yemek fotoğrafı
Beslenme → Yemek fotoğrafından kalori → fotoğraf çek/yükle → AI ile Analiz Et → sonucu kontrol et → Günlüğe Ekle.

AI görselden porsiyon ve besin değerlerini tahmin eder; bu tıbbi/klinik ölçüm veya laboratuvar doğruluğu değildir. Kullanıcı porsiyon gramını yazarsa sonuç daha iyi olur.

## 6) Güvenlik
Browser sadece Supabase publishable key kullanır. OpenAI secret yalnızca Edge Functions'tadır. Kullanıcı tabloları RLS ile `auth.uid()` üzerinden ayrılır.


## JavaScript yapısı
- `js/config.js`: Supabase istemci ayarları.
- `js/app.js`: ana uygulama, auth, profil, antrenman, recovery, ilerleme ve AI Coach.
- `js/food-ai.js`: yemek fotoğrafı önizleme, AI analiz çağrısı ve yemek günlüğü.
