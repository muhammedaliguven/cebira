# Cebira — veri modeli

Sürüm: 0.2  
Tarih: 14 Kasım 2026  
Durum: Faz 0 sözleşme taslağı, karar revizyonu. Tablo oluşturan migration bu fazda yazılmaz.

Bu belge mobil SQLite ve sunucu PostgreSQL için ortak anlamı tanımlar. Fiziksel adlar fazında birebir kopya olmak zorunda değildir. Kimlik, birim, enum ve bütünlük kuralları değişirse önce bu belge ve `docs/TEST_PLAN.md` güncellenir.

## Kurallar ve varsayımlar

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

- KARAR-01: Borç vermek gider sayılmaz. Borç tahsilatı gelir sayılmaz. Borç almak gelir sayılmaz. Anapara hareketleri gelir-gider raporunu etkilemez.
- KARAR-02: İlk sürümde nakit ve banka hesapları TRY, USD veya EUR olabilir. Her hesabın tek para birimi vardır. Altın hesap para birimi değildir.
- KARAR-03: İlk sürümde faiz hesaplaması yoktur.
- KARAR-04: Aynı para biriminde transfer yapılır. Farklı para birimlerinde döviz dönüşümü yapılır. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır.
- KARAR-05: Yeni cihaz onayı eski oturumu düşürür ve bulut verisinin indirilmesine izin verir. Çevrimdışı çatışma çözümü sonraki aşamadadır. Senkronize edilmemiş veri otomatik silinmez veya üzerine yazılmaz.

## Kimlik, zaman, para

Finansal satır kimliği istemcide üretilen UUID v7’dir. Sunucu yeni bir kimlik dayatmaz. Böylece üyeliksiz kayıt sonra aynı kimlikle bağlanır.

Anlar UTC `timestamptz` veya ISO-8601 metnidir. İşlem günü ve vade `YYYY-MM-DD` sivil tarihtir. Gün sınırı Europe/Istanbul’dur.

| Birim | Saklama | Ölçek | Örnek |
| --- | --- | --- | --- |
| TRY, USD, EUR | `amount_minor` BIGINT | 2. 1 birim = 100 küçük birim | 500 TL = 50000 |
| Altın | `amount_mg` BIGINT | 1 gram = 1000 miligram | 5 gram = 5000, kalan 3 gram = 3000 |

Kayan nokta (`float`, `double`, `number` ile bölme) domain hesabına girmez. Ekranda biçimlenen metin geri parse edilip yeniden hesaplanmaz. Toplama ve çıkarma tam sayıdır.

Değerleme formülü, gösterim içindir ve anaparaya yazılmaz:

- Girdi: miktar küçük birimi, 1 birim için TRY kuruş fiyatı.
- TRY kuruş = miktar × fiyat / ölçek.
- Bölme kalıntısında yarım yukarı (half up) uygulanır.
- 5 gram × gram fiyatı, borcu 5 gram olmaktan çıkarmaz.

Bakiye, açılış bakiyesi artı defter bacaklarının türevidir. Ayrı bir bakiye alanı önbellek olarak tutulursa aynı transaction içinde güncellenir. Önbellek defterle çelişirse defter kazanır ve önbellek yeniden kurulur.

## Ortak senkron kolonları

Sunucuya gidebilen finansal satırlarda:

| Kolon | Anlam |
| --- | --- |
| `id` | UUID v7, birincil anahtar |
| `owner_user_id` | Üyeliksizken boş. Aktarımda dolar |
| `created_at`, `updated_at` | UTC |
| `deleted_at` | Tombstone. Boşsa canlı |
| `sync_state` | `PENDING`, `SYNCED`, `FAILED` |
| `server_revision` | Sunucunun artan sürümü. İstemci üretirken 0 |

Üyeliksiz satır sunucuya gönderilmez. `owner_user_id` boş kayıt PostgreSQL’de yoktur.

## ENTITY-USER

Sunucu. Finansal defterin parçası değildir.

| Kolon | Kural |
| --- | --- |
| `id` | UUID |
| `email` | Benzersiz, küçük harf |
| `password_hash` | bcrypt |
| `status` | `ACTIVE` veya `DISABLED` |
| `created_at` | UTC |

## ENTITY-DEVICE

Sunucu oturumu ve tek aktif cihaz.

| Kolon | Kural |
| --- | --- |
| `id` | UUID |
| `user_id` | ENTITY-USER |
| `client_device_id` | Kurulumda üretilen kalıcı kimlik |
| `platform` | `IOS` veya `ANDROID` |
| `refresh_token_hash` | Düz token saklanmaz |
| `revoked_at` | Doluysa oturum kapalı |
| `created_at`, `last_seen_at` | UTC |

Aktif cihaz tablosu: `user_id` birincil anahtar, `client_device_id`, `activated_at`. Kullanıcı başına en fazla bir satır. Onaysız ikinci cihaz bu satırı değiştirmez. İlk deneme 409 `DEVICE_SWITCH_REQUIRED` döner. Onaylı `device-switch` satırı yeni cihaza alır ve eski refresh token’ı düşürür. Yeni cihazda gönderilmemiş finansal satır varsa çağrı `LOCAL_UNSYNCED` olur. Satır, bulut ve yerel dosya değişmez. Çıkış, refresh token’ı düşürür. Aktif cihaz satırını silmez. Aynı `client_device_id` yeniden giriş yapar.

## ENTITY-ACCOUNT

Nakit veya banka.

| Kolon | Kural |
| --- | --- |
| `name` | Zorunlu |
| `kind` | `CASH` veya `BANK` |
| `currency` | `TRY`, `USD` veya `EUR`. Hesap oluşturulunca sabitlenir (KARAR-02) |
| `opening_balance_minor` | BIGINT. Eksi açılış kabul edilmez |
| `archived_at` | Doluysa yeni işleme kapalı |

Arşiv, geçmiş bacakları silmez. Bakiyesi sıfır olmayan hesap arşivlenebilir. Kullanıcı bakiyeyi arşivden önce görür. Fiziksel silme, hesaba bağlı canlı bacak varken reddedilir.

Türetilmiş bakiye = açılış + hesaba yazılan işaretli bacaklar.

## ENTITY-CARD

Kredi kartı yükümlülüğü. ENTITY-ACCOUNT değildir.

| Kolon | Kural |
| --- | --- |
| `name` | Zorunlu |
| `currency` | `TRY` |
| `limit_minor` | Boş olabilir |
| `statement_day`, `payment_due_day` | 1–28 |
| `archived_at` | Yeni alışverişe kapalı |

Kart borcu, kart bacaklarının türevidir. Limit alanı borcu kendiliğinden değiştirmez. Limit aşımı ilk sürümde uyarıdır, kaydı reddetmez.

## ENTITY-CATEGORY

| Kolon | Kural |
| --- | --- |
| `parent_id` | Boşsa kök. Doluysa alt kategori. Derinlik en fazla 2 |
| `kind` | `INCOME` veya `EXPENSE` |
| `name` | Zorunlu |
| `archived_at` | Doluysa yeni işlem seçicisinde yok |
| `owner_user_id` | Boşsa ürünün gömülü kategorisi |

Gömülü kategorilerin UUID listesi Faz 6’da tek kaynakta sabitlenir ve bir daha değişmez. Bu fazda UUID uydurulmaz.

İşlem, `category_id` yanında `category_name_snapshot` ve varsa `subcategory_name_snapshot` tutar. Arşiv ve yeniden adlandırma eski snapshot’ı değiştirmez (KURAL-06).

Canlı işlemi olan kategori fiziksel silinemez. Arşiv her zaman geçerlidir. Hiç kullanılmamış kategori fiziksel silinebilir. Silme, işlem satırına `ON DELETE CASCADE` uygulamaz.

Aynı sahip, aynı ebeveyn ve aynı türde arşivlenmemiş ad tekrarı yasaktır.

İlk gömülü gider adları: Market, Ulaşım, Faturalar, Kira, Sağlık, Eğlence, Diğer. Gelir adları: Maaş, Ek gelir, Diğer. Kullanıcı her iki türde kendi kök ve alt kategorisini ekler.

## ENTITY-TRANSACTION

Kullanıcının gördüğü finansal olay.

`kind`:

| Kind | Gelire girer | Gidere girer |
| --- | --- | --- |
| `INCOME` | evet | hayır |
| `EXPENSE` | hayır | evet |
| `TRANSFER` | hayır | hayır |
| `FX_CONVERSION` | hayır | hayır |
| `CARD_PAYMENT` | hayır | hayır |
| `OBLIGATION_INTAKE` | hayır | hayır |
| `OBLIGATION_PRINCIPAL` | hayır | hayır |

`counts_as_income` ve `counts_as_expense` bu tabloyla aynı transaction içinde set edilir. Bayrak ile kind çelişirse kayıt reddedilir. Komisyon, dönüşüm kaydının kendisi değil, ona bağlı ayrı bir `EXPENSE` satırıdır.

Diğer kolonlar: `occurred_on`, `note`, kategori alanları, `card_id`, `obligation_id`, `planned_payment_id`.

`planned_payment_id` doluysa benzersizdir. Bir plan en fazla bir gerçekleşen gidere bağlanır (KURAL-05).

Kart alışverişi `EXPENSE` ve dolu `card_id` ile yazılır (KURAL-02).

## ENTITY-POSTING

İşlemin bacakları. Ayrı bir kullanıcı kavramı değildir. Her canlı işlem en az iki bacak üretir. Bacaklar işlemle aynı transaction’da yazılır (KURAL-08).

| Kolon | Kural |
| --- | --- |
| `transaction_id` | ENTITY-TRANSACTION |
| `bucket` | `ACCOUNT`, `CARD`, `OBLIGATION`, `INCOME`, `EXPENSE`, `SETTLEMENT` |
| `bucket_id` | Gelir/gider bacağı için boş olabilir |
| `unit` | `TRY`, `USD`, `EUR`, `XAU` |
| `amount_scaled` | BIGINT, sıfırdan büyük |
| `side` | `DEBIT` veya `CREDIT` |

Aynı işlem ve aynı birim içinde debit toplamı credit toplamına eşittir. Değilse transaction geri alınır. `SETTLEMENT` bacağı kasa, kart veya gelir hesabı değildir. Altın borç hareketi ve döviz dönüşümünün her para birimi bu bacakla kendi içinde denkleşir. `SETTLEMENT` bakiyesi kullanıcıya gösterilen hesap bakiyesi değildir.

Örnekler, küçük birim:

| Olay | Bacaklar | Gelir / gider |
| --- | --- | --- |
| 500 TL market gideri | DEBIT EXPENSE 50000, CREDIT ACCOUNT 50000 | gider +500 TL |
| 2.000 TL bankadan nakde | DEBIT hedef ACCOUNT 200000, CREDIT kaynak ACCOUNT 200000 | değişmez |
| 3.000 TL kart alışverişi | DEBIT EXPENSE 300000, CREDIT CARD 300000 | gider +3000 TL, kart borcu +3000 TL |
| 3.000 TL kart ödemesi | DEBIT CARD 300000, CREDIT ACCOUNT 300000 | gider aynı, kart borcu düşer |
| 100,00 USD aynı birimde transfer | DEBIT hedef ACCOUNT 10000, CREDIT kaynak ACCOUNT 10000, birim USD | değişmez, toplam USD aynı |
| 100,00 USD → 3.450,00 TL | USD: CREDIT ACCOUNT 10000, DEBIT SETTLEMENT 10000. TRY: CREDIT SETTLEMENT 345000, DEBIT ACCOUNT 345000 | gelir ve gider değişmez |
| 1,00 USD komisyon | Ayrı EXPENSE: DEBIT EXPENSE 100, CREDIT kaynak ACCOUNT 100, birim USD | gider +1,00 USD |
| 10.000 TL borç alma | DEBIT ACCOUNT 1000000, CREDIT OBLIGATION 1000000 | gelir değişmez, net TRY değişmez |
| 4.000 TL anapara | DEBIT OBLIGATION 400000, CREDIT ACCOUNT 400000 | gelir ve gider değişmez, kalan borç 6000 TL |
| 2 gram altın anapara | DEBIT OBLIGATION 2000 mg, CREDIT SETTLEMENT 2000 mg | kasa değişmez |

Fiat anapara, yükümlülükle aynı para birimindeki hesaptan geçer. Altın anaparası hesap bakiyesini değiştirmez. Farklı para birimindeki hesaptan doğrudan borç kapatılmaz. Kullanıcı önce döviz dönüşümü yapar, sonra aynı birimden öder.

Kesin net, her para birimi için ayrıdır: o birimdeki hesaplar − o birimdeki kişisel borç + o birimdeki alacak. TRY netinden TRY kart borcu da düşülür. Yaklaşık TL toplamı değerlemedir ve saklanan bakiyeye yazılmaz (KURAL-04).

## ENTITY-TRANSFER

Ayrı tablo yoktur. `kind = TRANSFER` iki `ACCOUNT` bacağıdır. Para birimleri eşittir. Tutarlar eşittir. İki hesap farklıdır. Gelir ve gider bayrakları kapalıdır (KURAL-01). O para biriminin hesaplar toplamı değişmez.

## ENTITY-FX-CONVERSION

Ayrı tablo yoktur. `kind = FX_CONVERSION` olan ENTITY-TRANSACTION’tır. Kaynak ve hedef hesapların para birimleri farklıdır.

| Kolon | Kural |
| --- | --- |
| `source_account_id` | ENTITY-ACCOUNT |
| `target_account_id` | Farklı hesap, farklı para birimi |
| `source_amount_minor` | BIGINT, sıfırdan büyük |
| `target_amount_minor` | BIGINT, sıfırdan büyük |
| `rate_scaled` | BIGINT. 1 kaynak ana birim için hedef ana birim × 1.000.000 |
| `rate_scale` | Sabit 1000000 |
| `commission_expense_id` | Boş veya bağlı `EXPENSE` kimliği |

Kur kontrolü tamsayıdır. Hedef küçük birim = yarım yukarı (`source_amount_minor × rate_scaled / 1000000`). Fiat ölçekleri 100 olduğu için sadeleşir. Kullanıcının hedef tutarı bu sonuçtan en fazla 1 küçük birim sapabilir. Fazlası kaydı reddeder. Örnek: 10000 USD küçük birim × 34500000 / 1000000 = 345000 TRY küçük birim = 3.450,00 TL.

Bacaklar her para biriminde ayrı denk olur. USD tarafı kaynak hesabı ve `SETTLEMENT` ile, TRY tarafı `SETTLEMENT` ve hedef hesapla kapanır. Dönüşümün gelir ve gider bayrağı kapalıdır.

Komisyon varsa aynı veritabanı transaction’ında ayrı `EXPENSE` yazılır. Komisyonun para birimi, düşülecek hesabın para birimiyle aynıdır. Bu gider sayılır. Dönüşüm satırı sayılmaz. Komisyon yazılamazsa dönüşüm de geri alınır (KURAL-08).

Aynı para birimi `FX_CONVERSION` olamaz. Farklı para birimi `TRANSFER` olamaz.

## ENTITY-OBLIGATION

Kişisel borç veya alacak.

| Kolon | Kural |
| --- | --- |
| `direction` | `PAYABLE` borç, `RECEIVABLE` alacak |
| `counterparty_name` | Zorunlu |
| `unit` | `TRY`, `USD`, `EUR`, `XAU` |
| `principal_scaled` | Açılış anaparası, sıfırdan büyük |
| `opened_on` | Sivil tarih |
| `closed_at` | Kalan sıfır olunca |
| `archived_at` | Geçmişi silmez |

Kalan = `principal_scaled` − başarılı anapara ödemelerinin toplamı. Kalan sıfırın altına inen ödeme reddedilir ve hiçbir bacak yazılmaz.

TRY, USD veya EUR `PAYABLE` açılışı `OBLIGATION_INTAKE` işlemidir. Aynı birimdeki hesabı artırır. Gelire girmez (KURAL-03).

`RECEIVABLE` açılışı da `OBLIGATION_INTAKE` türündedir. Bayraklar kapalıdır. Bacaklar CREDIT ACCOUNT ve DEBIT OBLIGATION olur. Aynı birimdeki hesabı azaltır. Gidere girmez (KARAR-01). Tahsilat `OBLIGATION_PRINCIPAL` türündedir. Bacaklar DEBIT ACCOUNT ve CREDIT OBLIGATION olur. Gelire girmez.

Altın açılışı ve altın anaparası hesap bakiyesini değiştirmez. `SETTLEMENT` ile denkleşir (KURAL-04).

## ENTITY-OBLIGATION-PAYMENT

| Kolon | Kural |
| --- | --- |
| `obligation_id` | ENTITY-OBLIGATION |
| `transaction_id` | Benzersiz. ENTITY-TRANSACTION `OBLIGATION_PRINCIPAL` |
| `amount_scaled` | Aynı birim, sıfırdan büyük |
| `paid_on` | Sivil tarih |

Kısmi ödeme serbesttir. 10000 TL anaparadan 4000 TL ödeme kalanda 6000 TL bırakır. 5000 mg altından 2000 mg ödeme kalanda 3000 mg bırakır.

## ENTITY-BUDGET

| Kolon | Kural |
| --- | --- |
| `year_month` | `YYYY-MM`. Sahip başına bir |
| `total_limit_minor` | TRY, sıfır veya pozitif |

Satır tablosu: `budget_id`, `category_id`, `limit_minor`. Aynı bütçede kategori tekrarı yasaktır. Limit yalnızca gider kategorisine yazılır.

Gerçekleşen = o ayın TRY `counts_as_expense` işlemleri. USD ve EUR giderler bu limite yazılmaz. Planlı ödeme gerçekleşene kadar bu toplama girmez. Kalan = toplam limit − gerçekleşen TRY gider. Kalan eksi olabilir. Eksi değer kaydı bozmaz.

## ENTITY-SCHEDULE

Tekrarlayan tanım. Kendisi gider değildir.

| Kolon | Kural |
| --- | --- |
| `title` | Zorunlu |
| `purpose` | `SUBSCRIPTION`, `RENT`, `BILL`, `OTHER` |
| `amount_minor` | TRY |
| `category_id` | Gider kategorisi |
| `account_id` | Ödenecek TRY hesap |
| `day_of_month` | 1–28 |
| `start_month`, `end_month` | `YYYY-MM`. Bitiş boş olabilir |
| `archived_at` | Yeni plan üretmez. Ödenmiş geçmişi silmez |

## ENTITY-PLANNED-PAYMENT

| Kolon | Kural |
| --- | --- |
| `schedule_id` | ENTITY-SCHEDULE |
| `period` | `YYYY-MM`. Aynı tanımda benzersiz |
| `due_date` | Sivil tarih |
| `amount_minor` | Üretim anının kopyası |
| `status` | `SCHEDULED`, `PAID`, `SKIPPED` |
| `expense_transaction_id` | Boş veya benzersiz |

Tanım kaydedilince başlangıç ayından içinde bulunulan aydan bir sonraki aya kadar örnekler üretilir. Uygulama açılışı ufku ilerletir. Üretim ENTITY-TRANSACTION oluşturmaz (KURAL-05).

Vadesi geçmiş ve `SCHEDULED` olan satır gecikmiştir.

Ödendi:

1. `expense_transaction_id` doluysa mevcut gider döner, yeni satır yazılmaz.
2. Değilse aynı transaction’da bir `EXPENSE`, hesap bacağı ve plan bağlantısı yazılır.
3. Plan `PAID` olur.
4. İkinci onay 1. adıma düşer.

Atlanan plan gider oluşturmaz.

## ENTITY-RATE

| Kolon | Kural |
| --- | --- |
| `instrument` | `USD`, `EUR`, `XAU_GRAM` |
| `price_try_minor` | 1 USD, 1 EUR veya 1 gram için kuruş |
| `observed_at` | Kaynağın gördüğü zaman |
| `fetched_at` | Sunucunun veya cihazın yazdığı zaman |
| `source` | Sağlayıcı adı veya `MANUAL` |
| `origin` | `OFFICIAL` veya `MANUAL` |

Sunucu resmi fiyatları ekler, son başarılıyı silerek boşaltmaz. Cihaz son resmi fiyatı ve isteğe bağlı manuel fiyatı saklar. Manuel fiyat varken gösterim onu kullanır. Manuel fiyat yalnızca o cihazdır, sunucudaki herkese yazılmaz.

API hata verirse son `OFFICIAL` satır ve zamanı gösterilir. O da yoksa ve manuel varsa manuel gösterilir. İkisi de yoksa değerleme alanı boştur. Borç miktarı değişmez.

`XAU_GRAM` metni: yaklaşık gram altın değeri. Kuyumcu alış veya satış fiyatı değildir.

## ENTITY-SYNC

Yerel meta:

| Anahtar | Anlam |
| --- | --- |
| `install_device_id` | Bu kurulum |
| `bound_user_id` | Boş veya bağlı kullanıcı |
| `snapshot_ack_at` | İlk aktarım doğrulaması |
| `last_push_at` | Son başarılı push |

Outbox: `entity_type`, `entity_id`, `op` (`UPSERT` veya `TOMBSTONE`), `payload_hash`, `state`, `attempt_count`.

İlk aktarım kapsamı: hesap, kart, kategori (gömülü UUID’ler dahil), işlem, bacak, yükümlülük, yükümlülük ödemesi, bütçe, bütçe satırı, tekrar tanımı, plan. Kur önbelleği ve manuel kur kullanıcı defteri sayılmaz. Aktarım sayımı bu listeyle yapılır (KURAL-10).

Doğrulama: tür başına adet ve kimlik kümesi. Sunucu cevabı eşleşmeden `snapshot_ack_at` yazılmaz ve yerel satır silinmez.

Tombstone senkron kuyruğu boşalmadan fiziksel silinmez. Üyeliksiz uygulamada silme, bakiyeyi aynı SQLite transaction içinde geri alır.

## Silme ve arşiv

| Varlık | Arşiv | Fiziksel silme |
| --- | --- | --- |
| Hesap, kart | Yeni işleme kapanır, geçmiş kalır | Canlı bacak varsa reddedilir |
| Kategori | Seçiciden kalkar, snapshot kalır | Canlı işlem varsa reddedilir |
| İşlem | Yok | Tombstone + bakiye geri alma, tek transaction |
| Yükümlülük | Geçmiş kalır | Ödemesi varsa reddedilir |
| Plan tanımı | Yeni örnek üretilmez | Ödenmiş plan varsa reddedilir |
| Plan örneği | `SKIPPED` geleceği kapatır | `PAID` örnek silinirse bağlı gider de aynı transaction’da geri alınır |
| Kur | Manuel temizlenir | Son resmi fiyat hata anında silinmez |
| Kullanıcı | `DISABLED` | İlk sürümde self-servis hesap silme yok |

## Migration

SQLite: ileri yönlü numaralı SQL. `user_version` bir adım artar. Başarısız migration dosyayı geri alır, `user_version` ilerlemez. Veri taşıyan migration, o fazın testi olmadan yazılmaz.

PostgreSQL: Flyway `V{n}__aciklama.sql`. Düzenlenmiş eski migration yeniden yazılmaz. Yeni değişiklik yeni sürümdür.

İki şema aynı fazda, aynı sözleşme değişikliğiyle ilerler. Yalnızca biri değişirse senkron o sürümü reddeder.

## Bütünlük özeti

- Para ve altın BIGINT.
- İşlem bacakları birim içinde denk.
- Aynı para biriminde transfer o birimin toplamını değiştirmez ve gelir/gider yaratmaz.
- Döviz dönüşümü kaynak tutarı, hedef tutarı ve kuru saklar. Kendisi gelir/gider değildir. Komisyon ayrı giderdir ve dönüşümle aynı transaction’dadır.
- Kart ödemesi ve anapara gelir-gider yaratmaz. Borç almak gelir yaratmaz.
- Plan başına en fazla bir gider.
- Kategori silmek işlemi silmez.
- Değerleme hesap bakiyesini ve anaparayı güncellemez.
- Aktarım onayı olmadan yerel silme yoktur.
- Onaysız cihaz değişimi defteri değiştirmez. Onaylı değişim gönderilmemiş veriyi silmez ve üzerine yazmaz.
