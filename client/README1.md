┌─────────────────────────────────────────────────────────────────┐
│                    SİSTEM SAHİBİ (SUPER_ADMIN)                 │
│                    Yalnız SƏN - Sistemin Tanrısı               │
│                    BÜTÜN SİSTEMƏ NƏZARƏT                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SUPER_ADMIN PANELİ (SƏN ÜÇÜN)              │   │
│  │                                                         │   │
│  │  📊 Bütün mağazaları görə bilərsən                     │   │
│  │  👑 Yeni ADMIN yarada bilərsən                         │   │
│  │  🏪 Mağaza əlavə edə / silə bilərsən                  │   │
│  │  ⚙️ Sistem parametrlərini dəyişə bilərsən              │   │
│  │  📈 Bütün mağazaların hesabatlarını görə bilərsən     │   │
│  │  👥 Bütün istifadəçiləri idarə edə bilərsən           │   │
│  │  🛡️ Təhlükəsizlik ayarlarını edə bilərsən             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                ADMIN PANELİ (Mağaza Sahibi)             │   │
│  │                                                         │   │
│  │  📊 Öz mağazasının məlumatlarını görə bilər            │   │
│  │  👔 Yeni MANAGER yarada bilər                          │   │
│  │  💰 Yeni CASHIER yarada bilər                          │   │
│  │  👁️ Yeni VIEWER yarada bilər                           │   │
│  │  📦 Öz məhsullarını idarə edə bilər                    │   │
│  │  📋 Öz sifarişlərini görə bilər                        │   │
│  │  📈 Öz hesabatlarını görə bilər                        │   │
│  │  ⚙️ Öz mağaza parametrlərini dəyişə bilər              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            İŞÇİ PANELİ (MANAGER / CASHIER / VIEWER)     │   │
│  │                                                         │   │
│  │  📊 Öz işinə aid məlumatları görə bilər                │   │
│  │  🛒 (CASHIER) Satış edə bilər                          │   │
│  │  📦 (MANAGER) Məhsulları idarə edə bilər               │   │
│  │  👁️ (VIEWER) Yalnız baxa bilər                         │   │
│  │  ❌ Heç bir istifadəçi yarada BİLMƏZ                   │   │
│  │  ❌ Heç bir parametri dəyişə BİLMƏZ                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘



🔐 4. SƏLAHİYYƏTLƏR (PERMISSION MATRIX)
A. SUPER_ADMIN - TAM SƏLAHİYYƏT

✅ Bütün mağazaları görə bilər
✅ Bütün istifadəçiləri görə bilər
✅ Yeni ADMIN yarada bilər
✅ İstənilən istifadəçini deaktiv edə bilər
✅ Bütün hesabatları görə bilər
✅ Sistem parametrlərini dəyişə bilər
✅ Sistem loglarını görə bilər
✅ Backup edə bilər
✅ Sistem yeniləmələri edə bilər



B. ADMIN - MAĞAZA SƏLAHİYYƏTİ

✅ Öz mağazasını görə bilər
✅ Öz işçilərini yarada bilər (MANAGER, CASHIER, VIEWER)
✅ Öz işçilərini deaktiv edə bilər
✅ Öz məhsullarını idarə edə bilər
✅ Öz sifarişlərini görə bilər
✅ Öz mağaza hesabatlarını görə bilər
✅ Öz mağaza parametrlərini dəyişə bilər
✅ Öz mağaza müştərilərini idarə edə bilər


C. MANAGER - RƏHBƏRLİK SƏLAHİYYƏTİ

✅ Öz mağazasının məlumatlarını görə bilər
✅ Məhsulları idarə edə bilər (yarat, redaktə et, sil)
✅ Sifarişləri görə bilər
✅ Sifarişləri emal edə bilər
✅ Endirim tətbiq edə bilər
✅ Müştəriləri görə bilər
✅ Hesabatları görə bilər
✅ İşçiləri görə bilər (AMMA YARADA BİLMƏZ)
❌ İstifadəçi yarada BİLMƏZ
❌ Parametrləri dəyişə BİLMƏZ


D. CASHIER - SATIŞ SƏLAHİYYƏTİ

✅ Satış edə bilər
✅ Ödəniş qəbul edə bilər
✅ Müştəri əlavə edə bilər
✅ Öz sifarişlərini görə bilər
✅ Məhsullara baxa bilər
✅ Müştərilərə baxa bilər
❌ Məhsul yarada BİLMƏZ
❌ Sifariş ləğv edə BİLMƏZ
❌ Endirim tətbiq edə BİLMƏZ
❌ Hesabatları görə BİLMƏZ


E. VIEWER - MÜŞAHİDƏ SƏLAHİYYƏTİ

✅ Bütün məlumatlara baxa bilər
✅ Hesabatları görə bilər
✅ Məhsullara baxa bilər
✅ Sifarişlərə baxa bilər
✅ Müştərilərə baxa bilər
✅ PDF/Excel ixrac edə bilər
❌ HEÇ BİR ƏMƏLİYYAT EDƏ BİLMƏZ
❌ HEÇ BİR DƏYİŞİKLİK EDƏ BİLMƏZ



🎨 6. PANELLƏRİN DİZAYN FƏRQLƏRİ
SUPER_ADMIN PANELİ

🎨 Rəng: Qırmızı/Qızıl (Sistem Sahibi)
🔝 Ən yüksək səlahiyyət
📊 Bütün mağazaların məlumatları
⚙️ Sistem səviyyəli parametrlər
🛡️ Təhlükəsizlik və backup



ADMIN PANELİ

🎨 Rəng: İndigo/Mavi (Mağaza Sahibi)
📊 Öz mağazasının məlumatları
👔 İşçi idarəsi
📦 Məhsul idarəsi
📋 Sifariş idarəsi


✅ NƏTİCƏ
3 PANEL SİSTEMİ İLƏ:

1. SUPER_ADMIN (SƏN)
   └── Bütün sistemə nəzarət
   └── Mağazaları idarə et
   └── ADMIN-ləri yarat

2. ADMIN (Mağaza Sahibi)
   └── Öz mağazasını idarə et
   └── İşçiləri yarat
   └── Gündəlik işləri gör

3. İŞÇİLƏR (Manager, Cashier, Viewer)
   └── Öz işlərini gör
   └── Məhdud səlahiyyət
   └── ADMIN-in nəzarəti altında



frontend/src/app/(super-admin)/
│
├── layout.tsx
├── page.tsx                              # Dashboard
│
├── stores/
│   ├── page.tsx                          # Bütün mağazalar
│   ├── new/
│   │   └── page.tsx                      # Yeni mağaza yarat
│   └── [id]/
│       ├── page.tsx                      # Mağaza detalları
│       ├── edit/
│       │   └── page.tsx                  # Mağaza redaktə et
│       └── users/
│           └── page.tsx                  # Mağazanın işçiləri
│
├── users/
│   ├── page.tsx                          # Bütün istifadəçilər
│   ├── new/
│   │   └── page.tsx                      # Yeni istifadəçi (ADMIN) yarat
│   └── [id]/
│       ├── page.tsx                      # İstifadəçi detalları
│       ├── edit/
│       │   └── page.tsx                  # İstifadəçi redaktə et
│       └── permissions/
│           └── page.tsx                  # İstifadəçi icazələri
│
├── admins/
│   ├── page.tsx                          # Bütün ADMIN-lər
│   └── [id]/
│       └── page.tsx                      # ADMIN detalları
│
├── reports/
│   ├── page.tsx                          # Bütün hesabatlar
│   ├── system/
│   │   └── page.tsx                      # Sistem hesabatları
│   ├── stores/
│   │   └── page.tsx                      # Mağaza hesabatları
│   └── users/
│       └── page.tsx                      # İstifadəçi hesabatları
│
├── logs/
│   ├── page.tsx                          # Bütün loglar
│   ├── users/
│   │   └── page.tsx                      # İstifadəçi logları
│   ├── system/
│   │   └── page.tsx                      # Sistem logları
│   └── security/
│       └── page.tsx                      # Təhlükəsizlik logları
│
└── settings/
    ├── page.tsx                          # Sistem parametrləri
    ├── general/
    │   └── page.tsx                      # Ümumi parametrlər
    ├── security/
    │   └── page.tsx                      # Təhlükəsizlik parametrləri
    ├── backup/
    │   └── page.tsx                      # Backup parametrləri
    └── maintenance/
        └── page.tsx                      # Baxım parametrləri



    
    frontend/src/app/(admin)/
│
├── layout.tsx
├── page.tsx                              # Dashboard
│
├── users/
│   ├── page.tsx                          # Bütün işçilər
│   ├── invite/
│   │   └── page.tsx                      # Yeni işçi dəvət et
│   └── [id]/
│       ├── page.tsx                      # İşçi detalları
│       ├── edit/
│       │   └── page.tsx                  # İşçi redaktə et
│       └── deactivate/
│           └── page.tsx                  # İşçi deaktiv et
│
├── products/
│   ├── page.tsx                          # Bütün məhsullar
│   ├── new/
│   │   └── page.tsx                      # Yeni məhsul yarat
│   └── [id]/
│       ├── page.tsx                      # Məhsul detalları
│       ├── edit/
│       │   └── page.tsx                  # Məhsul redaktə et
│       └── stock/
│           └── page.tsx                  # Stok idarəsi
│
├── categories/
│   ├── page.tsx                          # Bütün kateqoriyalar
│   └── new/
│       └── page.tsx                      # Yeni kateqoriya yarat
│
├── orders/
│   ├── page.tsx                          # Bütün sifarişlər
│   └── [id]/
│       ├── page.tsx                      # Sifariş detalları
│       ├── edit/
│       │   └── page.tsx                  # Sifariş redaktə et
│       └── refund/
│           └── page.tsx                  # Geri qaytarma
│
├── customers/
│   ├── page.tsx                          # Bütün müştərilər
│   ├── new/
│   │   └── page.tsx                      # Yeni müştəri yarat
│   └── [id]/
│       ├── page.tsx                      # Müştəri detalları
│       ├── edit/
│       │   └── page.tsx                  # Müştəri redaktə et
│       └── orders/
│           └── page.tsx                  # Müştəri sifarişləri
│
├── reports/
│   ├── page.tsx                          # Bütün hesabatlar
│   ├── sales/
│   │   └── page.tsx                      # Satış hesabatları
│   ├── inventory/
│   │   └── page.tsx                      # Stok hesabatları
│   └── profit/
│       └── page.tsx                      # Mənfəət hesabatları
│
└── settings/
    ├── page.tsx                          # Mağaza parametrləri
    ├── store/
    │   └── page.tsx                      # Mağaza məlumatları
    ├── payment/
    │   └── page.tsx                      # Ödəniş parametrləri
    └── tax/
        └── page.tsx                      # Vergi parametrləri






frontend/src/app/(auth)/
│
├── layout.tsx
│
├── login/
│   └── page.tsx                          # Login səhifəsi
│
├── accept-invite/
│   └── page.tsx                          # Dəvəti qəbul et
│
├── force-password-change/
│   └── page.tsx                          # Şifrə dəyişmə məcburiyyəti
│
├── forgot-password/
│   └── page.tsx                          # Şifrə unutma
│
└── reset-password/
    └── page.tsx                          # Şifrə sıfırlama




frontend/src/types/
│
├── index.ts
├── auth.ts
├── user.ts
├── admin.ts
├── superAdmin.ts
├── product.ts
├── order.ts
├── customer.ts
├── store.ts
├── invitation.ts
├── report.ts
├── payment.ts
├── api.ts
└── common.ts


Admin "Yeni İşçi Əlavə Et" səhifəsinə keçir
↓
Formu doldurur (ad, email, rol)
↓
Sistem avtomatik RANDOM ŞİFRƏ yaradır (məs: "KfG8#mP2$qL4")
↓
Admin istəsə, şifrəni DƏYİŞƏ BİLƏR (manual edit)
↓
"Göndər" düyməsi ilə email göndərilir

Emaildə:
- Daxil olmaq üçün link
- İstifadəçi adı (email)
- Şifrə (random və ya adminin yazdığı)
- "İlk girişdə şifrəni dəyişin" xəbərdarlığı


İşçi email və şifrə ilə daxil olur
↓
Sistem "Şifrəni Dəyiş" səhifəsinə yönləndirir
↓
İşçi yeni şifrə təyin edir
↓
Hesab aktivləşir
