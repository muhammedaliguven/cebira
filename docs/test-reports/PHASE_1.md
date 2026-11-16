# Faz 1 test raporu

Tarih: 14 Kasım 2026  
Faz: 1 — boş mobil kabuk, boş backend, PostgreSQL tanımı, derleme ve lint  
Sonuç: kabuk kapısı geçti. Finansal iş kuralı yazılmadı. Faz 2 başlamadı.

## Kapsam

- `cebira-mobile`: Expo SDK 58, TypeScript, beş boş sekme ve Ayarlar ile işlem detayı kabuğu.
- `cebira-backend`: Spring Boot 4.1.2, Gradle 9.8.2, `GET /api/v1/status`.
- `infra/docker-compose.yml`: PostgreSQL 18.7. Parola ortam değişkeninden okunur.
- JPA, Flyway, Security ve SQLite bu faza alınmadı. Veritabanı olmadan uygulama ayağa kalksın diye.

## Kurulan araçlar

| Araç | Sürüm | Yer |
| --- | --- | --- |
| Temurin JDK | 21.0.13+9 | `C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot` |
| Node.js | 22.23.5 | `C:\Users\Ali\AppData\Local\Programs\nodejs\node-v22.23.5-win-x64` |
| npm | 10.9.9 | Aynı Node klasörü |
| Docker Desktop | 4.99.0, istemci ve motor 29.9.3 | WSL 3.0.1.0 |

Node.js sistem PATH’ine yazılmadı. Yeni terminalde bu klasör PATH’te değilse `node` bulunmaz.

## Yazılan testler

- Mobil: kabuk ekranı “Ana Sayfa” ve “Bu ekran Faz 1 kabuğudur.” yazar. Sekmeler Ana Sayfa, İşlemler, Ekle, Bütçe, Hesaplar.
- Backend: Spring context açılır. `/api/v1/status` gövdesi `status=ok` ve `service=cebira-backend` döner.

Durum testi, controller yazılmadan çalıştırıldı ve kırmızı düştü. Controller eklenince yeşile döndü.

## Çalıştırılan komutlar

- `npm test -- --watchAll=false` (cebira-mobile)
- `npx tsc --noEmit`
- `npx expo lint`
- `gradlew.bat test --no-daemon` (cebira-backend)
- `docker compose up -d` ve kap içinde `pg_isready` ile `SELECT current_database()`

## Sonuç sayıları

| Kontrol | Başarılı | Başarısız |
| --- | --- | --- |
| Jest | 2 | 0 |
| JUnit Jupiter | 2 | 0 |
| `tsc --noEmit` | geçti | 0 |
| `expo lint` | geçti | 0 |
| Gradle `test` | geçti | 0 |
| `docker compose up` | geçti | 0 |

## Çalıştırılamayanlar

| Kontrol | Durum | Neden |
| --- | --- | --- |
| Testcontainers | çalıştırılmadı | Bu fazda Testcontainers testi yok. Docker motoru çalışıyor |
| Android derlemesi ve emülatör | BLOCKED | compileSdk 37 yüklü değil. Kabuk native derlenmedi |
| iOS | BLOCKED | Bu bilgisayar Windows |

## Riskler

- Node klasörü kullanıcı PATH’inde değil.
- PostgreSQL 18 imajı veriyi `/var/lib/postgresql` altında tutar. Eski `/var/lib/postgresql/data` bağlama noktası kabı kapatıyordu; bağlama noktası düzeltildi. Parola `infra/.env` içindedir ve kaynak dosyalara yazılmadı.
- Expo şablonundaki kullanılmayan demo bileşenleri silindi. Kalan tema dosyaları kabuğun web sekmesi için duruyor.

## Sonraki faz

Faz 2, kullanıcı **TAMAM** demeden başlamaz. Kapsam: para ve altın değer nesneleri ile SQLite migration iskeleti. Ekranlara iş kuralı yazılmaz.
