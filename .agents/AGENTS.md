## Kodlaşdırma Standartları (Coding Standards)

- Bütün yeni yazılan kodlar, əlavələr və dəyişikliklər tam oxunaqlı, asan başa düşülən və təmiz (Clean Code) şəkildə yazılmalıdır.
- Mürəkkəb məntiqlər sadələşdirilməli, lazımsız kod təkrarlarından (DRY prinsipi) qaçınılmalıdır.

## Ümumi

- Bütün yeni yazılan kodlar tam oxunaqlı və sadə olmalıdır.
- Clean Code prinsiplərinə riayət edilməlidir.
- DRY (Don't Repeat Yourself) prinsipindən istifadə edilməlidir.
- KISS (Keep It Simple, Stupid) prinsipinə əməl edilməlidir.
- YAGNI (You Aren't Gonna Need It) prinsipinə əməl edilməlidir.
- Lazımsız komplekslikdən qaçınılmalıdır.

## Kod Stili

- Mənalı dəyişən, funksiya və komponent adları istifadə edilməlidir.
- Magic number və magic string istifadə edilməməlidir.
- Lazımsız kommentlər yazılmamalıdır.
- Kod özünü izah edəcək şəkildə yazılmalıdır.
- Böyük funksiyalar kiçik funksiyalara bölünməlidir.
- Təkrarlanan kod util/helper funksiyalara çıxarılmalıdır.

## Arxitektura

- Mövcud layihə strukturuna uyğun kod yazılmalıdır.
- Mövcud komponentlər təkrar yaradılmamalıdır.
- Lazım olduqda reusable komponentlər hazırlanmalıdır.
- Separation of Concerns prinsipinə əməl edilməlidir.
- Single Responsibility Principle tətbiq edilməlidir.

## Performans

- Lazımsız renderlərdən qaçınılmalıdır.
- Lazımsız sorğular göndərilməməlidir.
- Böyük hesablamalar optimallaşdırılmalıdır.
- Lazy Loading uyğun yerlərdə istifadə edilməlidir.

## Təhlükəsizlik

- Heç vaxt secret, API key və ya token kod daxilində saxlanılmamalıdır.
- Input məlumatları yoxlanılmalıdır.
- SQL Injection, XSS və CSRF riskləri nəzərə alınmalıdır.
- Authorization və Authentication yoxlanılmadan məlumat qaytarılmamalıdır.

## TypeScript

- any istifadə edilməməlidir.
- Güclü tiplərdən istifadə edilməlidir.
- Interface və type düzgün seçilməlidir.
- Nullable dəyərlər nəzərə alınmalıdır.

## Git

- Lazımsız fayllar yaradılmamalıdır.
- Mövcud fayllarda minimal dəyişiklik edilməlidir.
- Lazımsız dependency əlavə edilməməlidir.

## AI Agent Davranışı

- Mövcud kod bazasını əvvəlcə analiz et.
- Mövcud arxitekturaya uyğun kod yaz.
- Mövcud naming convention-u qoruyub saxla.
- Əgər eyni funksionallıq artıq mövcuddursa, onu təkrar yazma.
- Hər dəyişiklikdən əvvəl təsir edəcəyi hissələri analiz et.
- Dəyişiklikdən sonra mümkün səhvləri yoxla.
- Əgər daha yaxşı həll mövcuddursa, onu təklif et.
