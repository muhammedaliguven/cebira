# Faz 0 test raporu

Tarih: 14 Kasım 2026  
Faz: 0 — ortam analizi ve belgeler  
Sonuç: belge kapısı geçti. Karar revizyonu 0.2 de geçti. Uygulama kodu yok. Jest ve JUnit çalıştırılmadı. Faz 1 başlamadı.

## Revizyon 0.2 — kilitlenen kararlar

Kullanıcı varsayımları karara bağladı. Beş belge aynı metne çekildi.

| Karar | Sonuç |
| --- | --- |
| KARAR-01 | Borç almak, borç vermek, anapara ödemesi ve tahsilat gelir-gider raporuna girmez. KURAL-03 buna göre değişti. |
| KARAR-02 | Nakit ve banka hesapları TRY, USD veya EUR olabilir. Her hesabın tek para birimi vardır. Altın hesap birimi değildir. |
| KARAR-03 | İlk sürümde faiz yoktur. |
| KARAR-04 | Aynı para biriminde transfer korunur. Farklı para biriminde döviz dönüşümü eklenir. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır. Komisyon ayrı giderdir. |
| KARAR-05 | Yeni cihaz uyarılıp onay alınca eski sunucu oturumu düşer ve bulut verisi boş cihaza iner. Gönderilmemiş veri silinmez ve üzerine yazılmaz. Çatışma birleştirme çözülmemiştir. |

Eklenen senaryolar: SENARYO-26 … SENARYO-34. SENARYO-04 borç alımını artık gelir saymaz. SENARYO-18 onaysız geçişin veriyi değiştirmemesini kilitler.

Döviz dönüşümü bütünlüğü: `rate_scale` 1000000. Hedef küçük birim = yarım yukarı (`kaynak küçük birim × rate_scaled / 1000000`). 1 küçük birimden fazla sapma kaydı reddeder. İki para biriminin bacakları kendi içinde denktir. Komisyon aynı veritabanı transaction’ında ayrı giderdir. Biri yazılamazsa ikisi de geri alınır.

Açık risk, bilerek durur: eski telefonda kalmış gönderilmemiş kayıt, oturum düşünce buluta yazılmaz, silinmez ve yeni telefona gelmez. Faz 14 bu birleştirmeyi, ayrı tasarım onaylanmadan uygulamaz.

Kontrol, revizyon bittikten sonra iki kez çalıştı.

- Tam yapı kontrolü: 153 başarılı, 0 başarısız. Kural ve karar cümleleri beş belgede aynıydı. SENARYO-01 … SENARYO-34 alanları, varlıklar, Faz 0 … Faz 14 ve eski çelişen ifadelerin yokluğu doğrulandı.
- Son cümle hizasından sonra kapanış kontrolü: 100 başarılı, 0 başarısız.

Jest, JUnit, Testcontainers ve E2E bu revizyonda da çalıştırılmadı. Ortam eksikleri ilk ölçümdeki gibidir.

Aşağıdaki ilk ölçüm kaydı tarihseldir. VARS-01 … VARS-05 maddesi bu revizyonla kapanmıştır.

## Tamamlanan adımlar

1. Adım 0.1 — Workspace ve araç zinciri incelendi. Mevcut uygulama yoktu.
2. Adım 0.2 — `docs/PRODUCT_REQUIREMENTS.md` yazıldı.
3. Adım 0.3 — `docs/ARCHITECTURE.md` yazıldı. Sürümler 14 Kasım 2026 resmi kaynaklarından seçildi.
4. Adım 0.4 — `docs/DATA_MODEL.md` yazıldı.
5. Adım 0.5 — `docs/TEST_PLAN.md` yazıldı. 25 senaryo, zorunlu 12 senaryo dahil.
6. Adım 0.6 — `AGENTS.md` yazıldı.
7. Adım 0.7 — Belgeler arası kural metni, faz, ekran, varlık ve sürüm kontrolleri çalıştırıldı. Çelişen çıkış cümlesi hizalandı ve kontrol yeniden çalıştırıldı.

## Oluşturulan dosyalar

- `AGENTS.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/TEST_PLAN.md`
- `docs/test-reports/PHASE_0.md`

Uygulama kodu, `package.json`, Gradle, Java, TypeScript ve `infra` dosyası oluşturulmadı.

## Yazılan test senaryoları

Senaryolar plandır. Bu fazda otomatik teste dönüştürülmedi.

| Kimlik | Konu | Faz |
| --- | --- | --- |
| SENARYO-01 | 500 TL gider bakiyeyi düşürür | Faz 3 |
| SENARYO-02 | 2.000 TL transfer toplamı değiştirmez | Faz 3 |
| SENARYO-03 | 3.000 TL kart alışverişi ve ödemesi tek gider | Faz 4 |
| SENARYO-04 | 10.000 TL borç, 4.000 TL ödeme, kalan 6.000 TL | Faz 5 |
| SENARYO-05 | 5 gram altından 2 gram ödeme, kalan 3 gram | Faz 5 |
| SENARYO-06 | Abonelik planı henüz gider değildir | Faz 8 |
| SENARYO-07 | Ödendi onayı gideri bir kez yazar | Faz 8 |
| SENARYO-08 | İkinci onay çift gider açmaz | Faz 8 |
| SENARYO-09 | Üyeliksiz kayıt internetsiz çalışır | Faz 11, çekirdek Faz 3 |
| SENARYO-10 | İlk aktarım bütün kayıtları bağlar | Faz 11 |
| SENARYO-11 | Kur hatasında son fiyat veya manuel değer | Faz 10 |
| SENARYO-12 | Arşivlenen kategori geçmişi korur | Faz 6 |
| SENARYO-13 … 25 | Kart kısmi ödeme, fazla ödeme reddi, kuruş toplamı, geri alınan transfer, alacak, ikinci cihaz, bütçe, aktarım hatası, kategori girişleri, ana sayfa, silme, grafik, ayarlar | İlgili fazlar |

KURAL-01 … KURAL-11 her biri en az bir senaryoya bağlıdır. Beş belgede kural cümleleri birebir aynıdır.

## Ortam ölçümü

Komutlar bu workspace’te çalıştı. Özet:

| Araç | Sonuç |
| --- | --- |
| İşletim sistemi | Windows 10.0.19045 |
| Git | 2.53.0.windows.2. Workspace git deposu değildi |
| Java / javac | PATH’te yok. `JAVA_HOME` boş |
| Android Studio JBR | OpenJDK 21.0.8 var. Proje JDK’si olarak kullanılmayacak |
| Android Studio | AI-252.28238.7.2523.14688667 |
| Node.js, npm, npx | Yok |
| Docker | Yok |
| Android SDK | `C:\Users\Ali\AppData\Local\Android\Sdk`. adb 36.0.2 SDK klasöründe, PATH’te değil |
| Platformlar | android-30, 31, 33, 34, 35, 36, 36.1 |
| Build-tools | 35.0.0, 36.0.0, 36.1.0 |
| Emülatör | Var. AVD: Pixel_9a |
| Expo SDK 58 ihtiyacı | compileSdk 37 yüklü değil |
| iOS / Xcode | Bu Windows makinesinde yok |

## Çalıştırılan komutlar

Ortam:

- `java -version`, `javac -version`, `node -v`, `npm -v`, `npx -v`, `docker --version`, `git --version`
- `Get-Command` ile java, node, npm, docker, git, adb, gradle, mvn
- Android Studio `product-info.json`, JBR `java -version`, SDK platform ve build-tools listesi, `adb version`

Belge kontrolü, düzeltmelerden sonra yeniden çalıştı. .NET `ReadAllText` ile beş belge okundu. Kontrol şunları saydı: dosya varlığı, 11 kuralın beş belgede aynı metin olması, 5 varsayım, SENARYO-01 … SENARYO-25 başlıkları, her senaryoda test adı / ön koşul / adımlar / beklenen sonuç / tür / faz alanları, 14 varlık kimliği, Faz 0 … Faz 14, sürüm pinleri, ürün başlıkları, altı ekran adı, güvenlik ve çıkış cümleleri, uygulama kaynak dosyasının olmaması.

## Sonuç sayıları

| Kontrol | Başarılı | Başarısız | Çalıştırılmayan |
| --- | --- | --- | --- |
| Belge tutarlılığı | 125 | 0 | 0 |
| Jest | 0 | 0 | Çalıştırılmadı |
| JUnit Jupiter | 0 | 0 | Çalıştırılmadı |
| Testcontainers | 0 | 0 | Çalıştırılmadı |
| Mobil E2E | 0 | 0 | Çalıştırılmadı |

Jest ve JUnit bu fazda yoktur. Başarılı diye yazılmadı.

Çalıştırılamayan sonraki testlerin bugünkü nedeni:

- Jest: Node.js yok, `cebira-mobile` yok.
- JUnit ve derleme: PATH’te JDK yok, `cebira-backend` yok.
- Testcontainers: Docker yok.
- Android derlemesi: compileSdk 37 yok.
- iOS: macOS ve Xcode yok.

## Tutarlılık sonucu

- Ekranlar (Ana Sayfa, İşlemler, Ekle, Bütçe, Hesaplar, Ayarlar) ürün belgesinde ve mimari rota planında duruyor. Veri modeli bu ekranların hesap, işlem, kart, borç, bütçe, plan, kategori ve kur ihtiyacını karşılıyor.
- 11 iş kuralı test planındaki senaryolarla kapalı.
- Faz 0’dan Faz 14’e kadar sıra mimaride ve test planında yazılı. Faz 1 iş kuralı içermiyor.
- Güvenlik sınırı ve veri kaybı davranışı mimaride yazılı: aktarım onayı olmadan yerel silme yok, ikinci cihaz üzerine yazmaz, çıkış aktif cihazı silmez.
- Başka telefona geri yükleme ürün hedefidir. Çatışma politikası onaylanmadan Faz 14 açılmaz.

## Teknik riskler ve açık kararlar

1. VARS-01 … VARS-05 kullanıcı onayı bekler. Özellikle alacak vermenin gider sayılmaması, TRY dışı kasanın ilk sürümde olmaması ve ikinci cihazın reddedilmesi.
2. İstenen JUnit 5 adı, Spring Boot 4.1.2 BOM yüzünden JUnit Jupiter 6.0.3 olarak bağlandı. Bu bilinçli sapmadır.
3. Yerel SQLite ilk sürümde şifresiz. Telefonun kilidi açılınca dosya okunabilir.
4. Kur sağlayıcısı seçilmedi. Anahtar repoya yazılmayacak. TCMB, döviz için aday.
5. Faz 1 için Node.js 22.13+, PATH’te Temurin 21, Docker ve Android compileSdk 37 gerekir.
6. iOS doğrulaması bu bilgisayarda yapılamaz.

## Sonraki faz

Faz 1, kullanıcı **TAMAM** demeden başlamaz.

Faz 1 kapsamı: boş Expo SDK 58 kabuğu, boş Spring Boot 4.1.2 kabuğu, PostgreSQL 18.7 compose, lint ve derleme. Finansal kural, ekran davranışı ve senkron kodu Faz 1’e ait değildir. Eksik araç kurulmadan ilgili kontrol BLOCKED yazılır.
