# Cebira — mimari

Sürüm: 0.2  
Tarih: 14 Kasım 2026  
Durum: Faz 0, karar revizyonu. Klasörler planlanmıştır. `cebira-mobile`, `cebira-backend` ve `infra` bu fazda oluşturulmaz.

## Kararlar

Cebira tek workspace’te iki uygulamadır. Mobil offline-first çalışır. Finansal kayıtların ilk kopyası SQLite’tadır. Backend hesap, aktarım, geri yükleme kapısı, tek cihaz ve kur verisinden sorumludur. İş kuralları UI bileşenine yazılmaz.

Sunucu, istemciden gelen finansal paketi kör bir dosya gibi saklamaz. Senkron fazında aynı bütünlük kurallarını yeniden doğrular. TypeScript ve Java kodu paylaşılmaz. Sözleşme `docs/DATA_MODEL.md` ve o faza ait testlerdir.

- KURAL-01: Aynı para birimindeki transfer gelir veya gider değildir. Döviz dönüşümü de gelir veya gider değildir. Komisyon varsa ayrı gider olarak yazılır.
- KURAL-02: Kredi kartıyla alışveriş gider kaydeder ve kart borcunu artırır. Kart borcu ödendiğinde ikinci bir gider oluşmaz.
- KURAL-03: Borç almak gelir sayılmaz. Borç vermek gider sayılmaz. Anapara ödemesi ve anapara tahsilatı gelir-gider raporuna girmez. Kişisel borç ve alacak ayrı takip edilir.
- KURAL-04: Hesap bakiyeleri ve borçlar kendi para biriminde veya altın miktarında saklanır. Güncel TL karşılığı yalnızca değerlemedir.
- KURAL-05: Planlanan ödeme gider değildir. Ödendi onayı gerçekleşen gideri tam bir kez oluşturur. Aynı plan ikinci kez onaylanırsa yeni gider oluşmaz.
- KURAL-06: Kategori arşivlemek veya silmek geçmiş finansal işlemleri silmez.
- KURAL-07: Parasal hesaplarda kontrolsüz kayan nokta kullanılmaz. TL ve döviz tam sayı küçük birimdir. Altın sabit hassasiyetle tutulur.
- KURAL-08: İlişkili finansal hareketler tek transaction içinde tamamlanır. Başarısız işlem yarım kayıt bırakmaz.
- KURAL-09: Uygulama, backend çalışmadan üyeliksiz modda temel finansal işlemleri yapabilir.
- KURAL-10: Hesap açıldığında bütün yerel finansal veriler kullanıcıya bağlanarak buluta aktarılır. Başarılı aktarım doğrulanmadan yerel kayıt silinmez.
- KURAL-11: Tek aktif cihaz vardır. Yeni cihaz kullanıcı onayıyla etkinleşir, eski sunucu oturumu düşer ve bulut verisi inebilir. Senkronize edilmemiş veri otomatik silinmez veya üzerine yazılmaz.

Kilitlenen kararlar:

- KARAR-01: Borç vermek gider sayılmaz. Borç tahsilatı gelir sayılmaz. Borç almak gelir sayılmaz. Anapara hareketleri gelir-gider raporunu etkilemez.
- KARAR-02: İlk sürümde nakit ve banka hesapları TRY, USD veya EUR olabilir. Her hesabın tek para birimi vardır. Altın hesap para birimi değildir.
- KARAR-03: İlk sürümde faiz hesaplaması yoktur.
- KARAR-04: Aynı para biriminde transfer yapılır. Farklı para birimlerinde döviz dönüşümü yapılır. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır.
- KARAR-05: Yeni cihaz onayı eski oturumu düşürür ve bulut verisinin indirilmesine izin verir. Çevrimdışı çatışma çözümü sonraki aşamadadır. Senkronize edilmemiş veri otomatik silinmez veya üzerine yazılmaz.

## Teknoloji ve sürümler

Seçimler 14 Kasım 2026 tarihinde resmi sürüm sayfaları ve paket kayıtlarından yapıldı. Yama numarası Faz 1 kurulumunda aynı ana sürümde yeniden kontrol edilir. Ana sürüm, kullanıcı onayı olmadan değiştirilmez.

### Mobil

| Parça | Seçim | Gerekçe |
| --- | --- | --- |
| Node.js | 22.13 veya daha yeni 22 LTS | Expo SDK 58 alt sınırı 22.13.x |
| Expo SDK | 58 | Güncel kararlı SDK. 15 Ekim 2026 sürümü. Gözlenen paket: `expo` 58.0.25 (12 Kasım 2026) |
| React Native | 0.88.1 | SDK 58’in hedefi. 15 Ekim 2026, current |
| React | 19.3.0 | SDK 58 matrisi |
| TypeScript | 6.0.3 | SDK 58 için `expo install` önerisi olarak gözlendi. Strict açık olacak |
| Expo Router | 58.0.31 | SDK 58 ile aynı ana sürüm. Dosya tabanlı yönlendirme |
| expo-sqlite | 58.0.17 | SDK 58 SQLite. Sürüm `expo install` ile hizalanır |
| Zustand | 5.1.0 | Güncel kararlı istemci durumu. 6 Kasım 2026 |
| React Hook Form | 7.92.0 | Güncel 7.x. 11 Kasım 2026 |
| Zod | 4.6.7 | Güncel şema doğrulama. Çözücü sürümü Faz 1’de Zod 4 ile uyumlu paketten kilitlenir |
| Jest | 30.x (`jest-expo` 58, gözlenen Jest 30.5.2) | SDK 58 `jest-expo` Jest 30 ister |
| React Native Testing Library | 14.1.0 | SDK 58 router testleri 14 veya üstünü ister |
| Dil / bölge | `expo-localization`, sözlük katmanı | İlk metin Türkçe. Şema metne kilitlenmez |
| Token saklama | `expo-secure-store` | Oturum tokeni SQLite’a düz yazılmaz |
| Ağ durumu | `@react-native-community/netinfo` | Çevrimdışı davranış için |

SDK 58 platform tabanı: Android compileSdk 37, targetSdk 36, minimum Android 7 (API 24), iOS 16.4, Xcode 26.4. Bu Windows makinesinde iOS derlemesi yoktur.

### Backend

| Parça | Seçim | Gerekçe |
| --- | --- | --- |
| Java | 21 LTS | Proje kararı. Boot 4.1.2, Java 17–27 kabul eder. JDK, Android Studio JBR’den ayrı kurulur |
| Spring Boot | 4.1.2 | 22 Ekim 2026 kararlı hat. 4.2.0-RC2 ön sürüm olduğu için seçilmedi |
| Spring Framework | 7.0.10 | Boot 4.1.2 BOM |
| Spring Security | 7.1.2 | Boot 4.1.2 BOM |
| Spring Data | BOM 2026.0.2 | Boot 4.1.2 BOM |
| Hibernate | 7.4.13.Final | Boot 4.1.2 BOM |
| PostgreSQL sunucu | 18.7 | Desteklenen güncel 18 minor |
| PostgreSQL JDBC | 42.7.14 | Boot 4.1.2 BOM |
| Flyway | 12.4.0 ve `flyway-database-postgresql` | Boot’un yönettiği Flyway. PG 18 için veritabanı modülü şart |
| JUnit Jupiter | 6.0.3 | Boot 4.1.2 `spring-boot-starter-test`. Aşağıdaki sapma |
| Mockito | 5.23.0 | Aynı BOM |
| Testcontainers | 2.0.5 | Aynı BOM. PostgreSQL 18 imajı |
| Gömülü sunucu | Tomcat 11.0.27 | Boot varsayılanı |
| Derleme | Gradle 9.x, Kotlin DSL, wrapper | Boot 4.1 Gradle 8.14+ ve 9.x destekler. Wrapper Faz 1’de kilitlenir |

JUnit sapması: İstenen ad JUnit 5 idi. Boot 4.1.2 test starter’ı JUnit Jupiter 6.0.3 getirir. Testler `org.junit.jupiter` API’siyle yazılır. JUnit 5’i zorlamak için Boot sürümü düşürülmez. Spring Boot 3.5 OSS desteği 30 Haziran 2026’da bittiği için yeni işe alınmaz.

Kaynaklar: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [Expo birim test](https://docs.expo.dev/develop/unit-testing/), [Spring Boot 4.1.2 sistem gereksinimleri](https://docs.spring.io/spring-boot/system-requirements.html), Boot 4.1.2 `spring-boot-dependencies` POM, [PostgreSQL sürüm politikası](https://www.postgresql.org/support/versioning/).

## React Native katmanları

```text
cebira-mobile/
  app/                  Expo Router. Ekranlar ince kalır
    (tabs)/             Ana Sayfa, İşlemler, Ekle, Bütçe, Hesaplar
    settings/           Ayarlar
    transactions/[id]   İşlem detayı
  src/domain/           Para, altın, iş kuralları. React import etmez
  src/services/         Use-case. Domain + repository
  src/data/             SQLite, migration, outbox, kur önbelleği
  src/state/            Zustand. Sunucu cevabını domain gibi yorumlamaz
  src/ui/               Görünüm. Tutar hesaplamaz
  src/i18n/             Türkçe metinler
```

Ekran, servisi çağırır. Servis domain kuralını çalıştırır ve repository’ye tek birim iş verir. Zustand oturum, seçili ay ve ekran durumunu tutar. Bakiye kaynağı SQLite defteridir.

## Spring Boot modülleri

Tek süreç, `com.cebira` kökü:

```text
cebira-backend/
  identity/     kullanıcı, şifre, oturum, aktif cihaz
  sync/         ilk aktarım, push, pull kapısı, bütünlük doğrulaması
  rates/        dış kaynaktan kur alma, son başarılı fiyat
  shared/       hata, zaman, kimlik, para birimi değer nesneleri
```

Her modülde `domain`, `application`, `persistence`, `api` ayrılır. Controller iş kuralı uygulamaz. Flyway dosyaları `src/main/resources/db/migration` altındadır. Modüller ayrı deploy edilmez.

`identity` finansal tablo okumaz. `rates` kullanıcı defterine yazmaz. `sync` diğer modüllerin repository’lerini kullanır, HTTP istemcisini ekran gibi taklit etmez.

## SQLite ve PostgreSQL

| Konu | Telefonda SQLite | Sunucuda PostgreSQL |
| --- | --- | --- |
| Rol | Çalışan defter | Hesaba bağlı kopya ve kur geçmişi |
| Kimlik | İstemcinin ürettiği UUID v7 | Aynı UUID kabul edilir |
| Şema değişimi | Sıralı SQL, `user_version` | Flyway |
| İşlem | Tek SQLite transaction | Tek PostgreSQL transaction |
| Üyeliksiz satır | `owner_user_id` boş | Bulutta yoktur |
| Silme | Finansal satırda tombstone | Aynı tombstone |

İki şema birebir tablo kopyası olmak zorunda değildir. Alan adları, birimler, enum değerleri ve bütünlük kuralları ortaktır. Ayrılış varsa sözleşme belgesi kazanır, kod değil.

## Offline-first veri akışı

1. Kullanıcı işlemi doğrulanır (Zod formda, domain serviste).
2. SQLite transaction açılır. Üst kayıt, bacaklar ve bakiye etkisi birlikte yazılır.
3. Üyeliksiz kayıt yerelde kalır. Ağ çağrısı yapılmaz.
4. Hesaplı ve çevrimiçi kayıt outbox’a `PENDING` düşer.
5. Push, aktif cihazdan ve oturumla gider.
6. Sunucu kuralları tekrarlar, kendi transaction’ında yazar, sayıları döner.
7. Sayılar ve kimlikler tutarsa satır `SYNCED` olur.
8. Ağ yoksa outbox bekler. Defter kullanılmaya devam eder.

KURAL-09: temel finansal işlemler bu akışın 1–3. adımlarıyla biter.

## Kimlik doğrulama

- E-posta ve parola. E-posta küçük harfe normalize edilir.
- Parola `DelegatingPasswordEncoder` ile bcrypt, cost 12.
- Kısa ömürlü access token, yenilenen refresh token. Refresh token sunucuda yalnızca hash tutulur.
- Token telefonda Secure Store’dadır.
- Kimlikli istekte `Authorization` ve `X-Device-Id` vardır.
- `X-Device-Id`, kullanıcının aktif cihazı değilse sunucu veri yazmaz.
- Başka cihazın ilk giriş denemesi 409 `DEVICE_SWITCH_REQUIRED` döner. Aktif cihaz değişmez, indirme başlamaz.
- Kullanıcı uyarıyı onaylarsa `POST /api/v1/auth/device-switch` çalışır. Eski refresh token geçersiz olur. Yeni cihaz aktif olur.
- Yeni cihazda gönderilmemiş finansal satır varsa bu çağrı `LOCAL_UNSYNCED` ile durur. Yerel dosya ve bulut kopyası silinmez, üzerine yazılmaz.

## Bulut aktarımı ve senkronizasyon

İlk aktarım (KURAL-10):

1. Kayıt olan cihazın yerel finansal satırlarına aynı SQLite transaction içinde `owner_user_id` yazılır.
2. Varlık sayıları ve kimlik listesi çıkarılır.
3. Sunucu paketi tek transaction’da, istemci UUID’siyle kaydeder.
4. Cevaptaki sayılar yerel sayılarla karşılaştırılır.
5. Eşleşirse senkron durumu güncellenir. Yerel satırlar durur.
6. Eşleşmezse veya ağ koparsa yerel veri olduğu gibi kalır, kullanıcı uygulamayı kullanır.

Tek cihaz (KURAL-11, KARAR-05):

- İlk başarılı giriş o cihazı aktif yapar.
- Çıkış, oturumu kapatır. Aktif cihaz satırı yerinde kalır. Aynı cihaz yeniden girer.
- Başka cihaz onay vermeden aktif olamaz. Onaysız deneme sunucu ve telefon verisini değiştirmez.
- Onay metni şunları söyler: eski sunucu oturumu kapanır, buluttaki veri yeni cihaza iner, gönderilmemiş kayıtlar silinmez ve yeni cihaza kendiliğinden gelmez.
- Onaydan sonra eski oturum geçersizdir. Yeni cihazın yereli boşsa bulut kopyası iner.
- Yeni cihazda gönderilmemiş satır varsa etkinleştirme ve indirme durur.
- Eski telefonda kalmış gönderilmemiş kuyruk silinmez. Oturum düştüğü için sunucuya yazılamaz. Bu kayıtların birleştirilmesi yazılmamıştır. Otomatik silme ve üzerine yazma yoktur.

Çatışma birleştirme algoritması bu belgede uydurulmaz. Risk açıktır: cihaz değişiminden sonra eski telefonun gönderilmemiş kayıtları yalnızca o telefonda kalabilir.

## API sorumlulukları

Ön ek: `/api/v1`. JSON. Zamanlar UTC anıdır. Sivil tarihler `YYYY-MM-DD` ve Europe/Istanbul günüdür.

| Uç | Sorumluluk |
| --- | --- |
| `POST /api/v1/auth/register` | Hesap açar |
| `POST /api/v1/auth/login` | Aktif cihaz aynıysa oturum açar. Değilse geçiş onayı ister |
| `POST /api/v1/auth/refresh` | Token yeniler |
| `POST /api/v1/auth/logout` | Bu cihazın oturumunu kapatır. Aktif cihaz bağını ve finansal veriyi silmez |
| `POST /api/v1/auth/device-switch` | Onaylı geçiş. Eski oturumu düşürür. Yerelde gönderilmemiş satır varsa durur |
| `POST /api/v1/sync/snapshot` | İlk bağlama. Bütün yerel finansal kayıtlar |
| `POST /api/v1/sync/push` | Sonraki değişiklikler. Yalnızca aktif cihaz |
| `GET /api/v1/sync/pull` | Aktif cihazın yereli boşsa bulut kopyasını indirir. Dolu ve gönderilmemişse üzerine yazmaz |
| `GET /api/v1/rates/latest` | Son başarılı USD, EUR ve gram altın |

Hata gövdesi makine kodu taşır: `DEVICE_SWITCH_REQUIRED`, `LOCAL_UNSYNCED`, `VALIDATION`, `INVARIANT`, `UNAUTHENTICATED`.

Kur modülü monolith içindedir. Dış kaynağı 30–60 dakikada bir, kaynağın kendi yenileme aralığı daha uzunsa ona uyarak okur. Son başarılı fiyatı ve kaynak zamanını saklar. Sağlayıcı Faz 10’da seçilir. Anahtar repoya girmez. TCMB, TRY döviz için adaydır. Altın kaynağı ayrıca seçilir.

Mobil kuru günde bir veya iki kez sorar, SQLite önbelleğine yazar. Kullanıcı sayısı arttığında `GET /rates/latest` için HTTP önbelleği ve CDN ayrıca değerlendirilir. Bunun için ikinci servis açılmaz.

Gram altın yanıtı yaklaşık TL değeridir. Alış/satış fiyatı iddiası taşımaz.

## Güvenlik sınırları

- Bütün kimlikli sorgular `owner_user_id = oturum kullanıcısı` koşulunu repository’de taşır.
- Parola, refresh token ve sağlayıcı anahtarı loglanmaz.
- TLS olmadan üretim trafiği yoktur.
- Üyeliksiz veri, hesap oluşmadan sunucuya gitmez.
- Yerel SQLite ilk sürümde şifrelenmez. Bu bilinen risktir. Uygulama kilidi Faz 13’tedir. Dosya şifrelemesi ayrı karar ister.
- Uygulama silinince üyeliksiz SQLite dosyası işletim sisteminin normal silme davranışıyla gider. Ek bulut kopyası yoktur.
- Hesaplı kullanıcının bulut kopyası, uygulama silinse de hesap durduğu sürece durur.

## Klasör yapısı

```text
cebira/
  AGENTS.md
  docs/
    PRODUCT_REQUIREMENTS.md
    ARCHITECTURE.md
    DATA_MODEL.md
    TEST_PLAN.md
    test-reports/
      PHASE_0.md
  cebira-mobile/          Faz 1
  cebira-backend/         Faz 1
  infra/                  Faz 1: yalnızca PostgreSQL 18.7 compose
```

`infra` içinde Kubernetes manifesti, Kafka ve ayrı kur servisi bulunmaz.

## Faz haritası

- Faz 0 — Dokümantasyon ve ortam analizi.
- Faz 1 — Boş mobil kabuk, boş backend, Gradle wrapper, PostgreSQL compose, lint ve derleme. İş kuralı yok.
- Faz 2 — Para ve altın değer nesneleri, SQLite migration iskeleti.
- Faz 3 — Hesap, gelir, gider, aynı para biriminde transfer, döviz dönüşümü.
- Faz 4 — Kredi kartı.
- Faz 5 — Borç ve alacak.
- Faz 6 — Kategoriler.
- Faz 7 — Bütçe.
- Faz 8 — Tekrarlayan ödemeler.
- Faz 9 — Ekranların gerçek veriye bağlanması ve grafikler.
- Faz 10 — Kur ve altın değerlemesi.
- Faz 11 — Hesap, ilk bulut aktarımı, çevrimdışı üyeliksiz kabulü.
- Faz 12 — Onaylı cihaz değişimi, eski oturumun düşmesi, boş cihaza indirme.
- Faz 13 — Ayarlar, bildirim, tema, uygulama kilidi.
- Faz 14 — Çevrimdışı çatışma birleştirme. Ayrı tasarım onaylanmadan başlatılmaz. Otomatik silme ve üzerine yazma bu fazın konusu değildir.

Her faz kendi test raporuyla biter. Kullanıcı **TAMAM** demeden sonraki faza geçilmez.

## Ortam boşlukları

14 Kasım 2026 ölçümü `docs/test-reports/PHASE_0.md` içindedir. Özet: workspace boştu. Git var. Node.js, npm, JDK (`JAVA_HOME` / PATH) ve Docker yok. Android SDK ve bir emülatör var. Expo SDK 58’in compileSdk 37’si yüklü değil. iOS derlemesi bu bilgisayarda yoktur. Bu eksikler Faz 0 belge kontrollerini durdurmaz. İlgili testler sonraki fazlarda BLOCKED yazılır, geçti diye işaretlenmez.
