# Cebira — ürün gereksinimleri

Sürüm: 0.2  
Tarih: 14 Kasım 2026  
Durum: Faz 0, karar revizyonu. Bu belge uygulama kodu yazma yetkisi vermez.

## Amaç

Cebira, kişinin gelirini, giderini, hesaplarını, kart borcunu, kişisel borç ve alacağını, bütçesini ve düzenli ödemelerini tek yerde tutan bir iOS ve Android uygulamasıdır. İlk sürüm Türkçe ve Türkiye odaklıdır. Kayıtlar önce telefonda durur. Kullanıcı isterse sonra hesap açar ve aynı telefondaki veriyi buluta aktarır.

Ürün sözü: tutarlar şaşmaz, transfer harcama gibi görünmez, kart ve borç ödemesi ikinci kez gider yazılmaz, kategori düzenlemek geçmişi silmez, aktarım doğrulanmadan yerel kayıt silinmez.

## Hedef kullanıcılar

- Gelir ve giderini kategoriyle izlemek isteyen bireysel kullanıcı.
- Nakit, banka ve kredi kartını birlikte görmek isteyen kullanıcı.
- TL, USD veya EUR nakit ve banka hesabı tutan kullanıcı.
- TL, USD, EUR veya gram altın cinsinden kişisel borç/alacak tutan kullanıcı.
- Kira, fatura ve aboneliği her ay yeniden yazmak istemeyen kullanıcı.
- Hesap açmadan uygulamayı denemek isteyen kullanıcı.
- Verisini bu telefonda tutup daha sonra hesabına bağlamak isteyen kullanıcı.

İlk sürüm tek kişiliktir. Aile bütçesi ve ortak hesap yoktur.

## Özellikler

İlk ürün kapsamı:

- Gelir ve gider kaydı.
- TRY, USD ve EUR nakit ve banka hesabı. Her hesabın tek para birimi vardır.
- Kredi kartı ve kart borcu. Kart ilk sürümde TRY’dir.
- Aynı para biriminde transfer.
- Farklı para birimleri arasında döviz dönüşümü. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır. Komisyon ayrı gider olabilir.
- Gelir/gider kategorisi ve tek seviye alt kategori.
- TL, USD, EUR ve altın cinsinden borç/alacak ve kısmi ödeme. Bu hareketler gelir-gider raporuna girmez.
- Aylık genel bütçe ve kategori limitleri. Bütçe TRY giderleri ölçer.
- Abonelik, kira ve fatura için tek tanım; dönemsel ödeme planı.
- Yaklaşan ve gecikmiş planlar.
- Gelir-gider özeti ve temel grafikler.
- Hesapların ve altın borçlarının yaklaşık TL karşılığı. Değerleme bakiyeyi değiştirmez.
- Son bilinen veya kullanıcının girdiği döviz ve yaklaşık gram altın değerlemesi. Kur, Cebira backend API’sinden gelir.
- Üyeliksiz çevrimdışı kullanım.
- Hesap açınca bu cihazdaki verinin buluta bağlanması.
- Onaylı cihaz değişimi: eski sunucu oturumu düşer, yeni cihaz buluttaki veriyi indirir. Senkronize edilmemiş satırlar otomatik silinmez ve üzerine yazılmaz.

## Değişmez iş kuralları

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

Kuralların birlikte okunuşu:

- 10.000 TL borç alınırsa kasa 10.000 TL artar, borç bakiyesi 10.000 TL olur, aylık gelir ve gider değişmez. Net durum (kasa − borç) bu alışta değişmez.
- Bu borcun 4.000 TL anaparası ödenince kasa 4.000 TL azalır, kalan borç 6.000 TL olur, aylık gelir ve gider değişmez.
- 3.000 TL kart alışverişi giderdir. Kartın bankadan ödenmesi gideri 3.000 TL’de bırakır.
- 5 gram altın borcu 5000 miligramdır. 2 gram ödenince kalan 3 gramdır. TL karşılığı bu miktarı değiştirmez.
- 100,00 USD, 34,50 kuruyla TL’ye dönünce kaynak USD hesabı 100,00 USD azalır, hedef TL hesabı 3.450,00 TL artar. Gelir ve gider değişmez. 1,00 USD komisyon varsa gider yalnızca 1,00 USD artar.

## Kilitlenen kararlar

14 Kasım 2026 tarihinde kullanıcı onayladı. Beş belgede aynı metin durur.

- KARAR-01: Borç vermek gider sayılmaz. Borç tahsilatı gelir sayılmaz. Borç almak gelir sayılmaz. Anapara hareketleri gelir-gider raporunu etkilemez.
- KARAR-02: İlk sürümde nakit ve banka hesapları TRY, USD veya EUR olabilir. Her hesabın tek para birimi vardır. Altın hesap para birimi değildir.
- KARAR-03: İlk sürümde faiz hesaplaması yoktur.
- KARAR-04: Aynı para biriminde transfer yapılır. Farklı para birimlerinde döviz dönüşümü yapılır. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır.
- KARAR-05: Yeni cihaz onayı eski oturumu düşürür ve bulut verisinin indirilmesine izin verir. Çevrimdışı çatışma çözümü sonraki aşamadadır. Senkronize edilmemiş veri otomatik silinmez veya üzerine yazılmaz.

## Ekranlar

Alt menü:

1. Ana Sayfa
2. İşlemler
3. Ekle
4. Bütçe
5. Hesaplar

Ayarlar alt menüde değildir. Ana Sayfa üzerinden açılır.

### Ana Sayfa

- Her para birimi için nakit ve banka bakiyesi. TRY, USD ve EUR ayrı ayrı kesindir.
- Bu bakiyelerin yaklaşık TL karşılığı. Etiket değerlemedir. Saklanan bakiyeyi değiştirmez.
- Seçili ayın geliri ve gideri. Transfer, döviz dönüşümü, borç alımı, borç verme ve anapara hareketleri bu toplamlara girmez. Komisyon gideri girer.
- Para birimi başına net durum: o birimdeki hesaplar − o birimdeki kişisel borç + o birimdeki alacak. TRY netinden TRY kart borcu da düşülür.
- Yaklaşık toplam TL, her para biriminin kesin netinin ve altın pozisyonunun kurla çarpılmış toplamıdır. Etiket yaklaşıktır. Saklanan bakiyeye yazılmaz.
- Kalan bütçe: TRY aylık limit − gerçekleşen TRY gider. USD ve EUR giderler bu limite kurla yazılmaz. Ödenmemiş plan kalan bütçeden düşülmez.
- Yaklaşan ödemeler.
- Son işlemler.
- Ayarlar girişi.

### İşlemler

- Gelir, gider, transfer ve döviz dönüşümü geçmişi. Bunlar listede görünebilir. Gelir/gider toplamına KURAL-01, KURAL-02 ve KURAL-03’e göre girer.
- Filtre ve arama.
- İşlem detayı, düzenleme ve silme. Silme bakiyeyi aynı kayıt bütünlüğünde geri alır.

### Ekle

- Gelir, gider, aynı para biriminde transfer veya döviz dönüşümü seçimi.
- Tutar, kategori, ödeme hesabı, tarih. Dönüşümde kaynak hesap, hedef hesap, hedef tutar, kur ve isteğe bağlı komisyon.
- Aynı ekranda açılan Diğer Seçenekler: not, alt kategori, tekrarlama.
- Kategori seçiciden yeni kategori oluşturulabilir.

### Bütçe

- Aylık genel limit.
- Kategori limitleri.
- Gerçekleşen giderler.
- Bekleyen planlı ödemeler.
- Raporlar ve grafikler.

### Hesaplar

- Banka ve nakit hesapları. Para birimi TRY, USD veya EUR seçilir.
- Kredi kartlarım. Kart TRY’dir.
- Borç ve alacaklarım. Birim TRY, USD, EUR veya altın.
- Hesap, kart ve borç/alacak oluşturma ve düzenleme.
- Kısmi ödeme bu bölümden başlar.

### Ayarlar

- Hesap oluşturma ve giriş.
- Bulut senkronizasyonu.
- Kategorilerim. Buradan da kategori ve alt kategori oluşturulur.
- Bildirimler.
- Güvenlik.
- Tema ve veri yönetimi.

## Ekranlar arası geçişler

Hedef rotalar (Expo Router). Faz 1 yalnızca boş kabuk açabilir; davranış sonraki fazlardadır.

| Nereden | Nereye | Tetik |
| --- | --- | --- |
| Alt menü | `/` Ana Sayfa, `/transactions`, `/add`, `/budget`, `/accounts` | Sekme |
| Ana Sayfa | `/settings` | Ayarlar |
| Ana Sayfa | İşlem detayı | Son işlem |
| Ana Sayfa | İlgili plan | Yaklaşan ödeme |
| İşlemler | `/transactions/[id]` | Satır |
| İşlem detayı | Düzenleme veya silme onayı | Eylem |
| Ekle | Kategori oluşturma | Kategori seçici |
| Ekle | Hesap oluşturma | Hesap yoksa |
| Bütçe | Kategori limiti | Limit satırı |
| Hesaplar | Hesap, kart veya borç formu | Ekle / düzenle |
| Ayarlar | Giriş, senkron, kategoriler, bildirim, güvenlik, görünüm ve veri | Menü satırı |
| Ayarlar > Kategorilerim | Kategori formu | Yeni kategori |

Ekle sekmesi formdur. Kayıt başarıyla bitince İşlemler veya Ana Sayfa güncel bakiyeyi gösterir. Başarısız kayıtta form verisi durur, deftere hiçbir satır yazılmaz.

## Kullanıcı akışları

### Üyeliksiz gider

1. Kullanıcı uygulamayı açar, hesap oluşturmaz.
2. Ekle > Gider, tutar, kategori, hesap ve tarih girer.
3. Kayıt telefonda saklanır.
4. İlgili hesap bakiyesi ve aylık gider güncellenir.

### Transfer

1. Aynı para biriminde kaynak ve hedef hesap seçilir.
2. Tutar girilir.
3. İki hesabın bakiyesi birlikte güncellenir. O para biriminin toplamı değişmez.
4. Aylık gelir ve gider aynı kalır.

### Döviz dönüşümü

1. Kaynak ve hedef hesapların para birimleri farklıdır.
2. Kullanıcı kaynak tutarı, hedef tutarı ve kuru girer. Kur, son bilinen Cebira kuruyla doldurulabilir. Kullanıcı değiştirebilir.
3. İsteğe bağlı komisyon tutarı girilir.
4. Kayıt tek işte yazılır. Dönüşüm gelir veya gider olmaz.
5. Komisyon varsa ayrı bir gider satırı oluşur ve seçilen hesaptan düşer.
6. Kur ile tutarlar 1 küçük birimden fazla uyuşmuyorsa kayıt yazılmaz.

### Kart alışverişi ve kart ödemesi

1. Gider, ödeme kaynağı olarak kredi kartına yazılır.
2. Gider artar, kart borcu artar, banka bakiyesi değişmez.
3. Kullanıcı kart borcunu bankadan öder.
4. Banka azalır, kart borcu azalır, gider toplamı aynı kalır.

### Borç ve kısmi ödeme

1. Kullanıcı TRY, USD veya EUR borç alındığını aynı birimdeki hesaba işler. Hesap artar, borç bakiyesi oluşur, gelir ve gider değişmez.
2. Anaparanın bir kısmını aynı birimdeki hesaptan öder. Hesap azalır, kalan borç düşer, gelir ve gider değişmez.
3. Altın borcu gram olarak durur. Kısmi ödeme gramdan düşer. Hiçbir kasa bu yüzden değişmez.
4. Borç vermek gider değildir. Tahsilat gelir değildir.

### Düzenli ödeme

1. Kullanıcı abonelik, kira veya faturayı bir kez tanımlar.
2. Uygulama ilgili aylar için plan üretir. Bu plan gider değildir.
3. Kullanıcı Ödendi der. Tek gider oluşur ve seçilen hesap güncellenir.
4. Aynı plan yeniden Ödendi denirse yeni gider oluşmaz.

### Kategori

1. Kategori, Ekle ekranından veya Ayarlar > Kategorilerim yolundan oluşturulur.
2. Kullanılmış kategori arşivlenince geçmiş işlem durur, yeni işlem listesinde görünmez.

### Hesap açma ve aktarım

1. Üyeliksiz kullanıcı Ayarlar’dan hesap oluşturur.
2. Telefondaki bütün finansal kayıtlar bu kullanıcıya bağlanır ve buluta gönderilir.
3. Sunucu kabul sayılarını döner. Sayılar tutarsa kayıtlar senkronlandı işaretlenir.
4. Doğrulama tamamlanmadan yerel satırlar silinmez. Başarılı aktarımdan sonra da telefon kopyayı tutar.
5. Aktarım yarıda kalırsa kullanıcı üyeliksiz verisiyle çalışmaya devam eder.

### Cihaz değişimi

1. Yeni cihazdan giriş, aktif cihaz varken hemen veri indirmez.
2. Kullanıcıya eski oturumun kapanacağı, buluttaki verinin ineceği ve gönderilmemiş kayıtların silinmeyeceği söylenir.
3. Onay yoksa aktif cihaz, sunucu kopyası ve telefonlardaki dosyalar aynı kalır.
4. Onay varsa eski sunucu oturumu geçersiz olur, yeni cihaz aktif olur.
5. Yeni cihazın yereli boşsa bulut kopyası iner.
6. Yeni cihazda gönderilmemiş finansal kayıt varsa indirme ve etkinleştirme durur. Ne yerel dosya ne bulut kopyası silinir veya üzerine yazılır.
7. Eski telefonda kalmış gönderilmemiş kayıtlar o telefonda durur. Sunucuya kendiliğinden yazılmaz ve yeni telefona kendiliğinden gelmez. Bu çatışmanın birleştirme çözümü yazılmamıştır.

### Kur yokken değerleme

1. Uygulama günde bir veya iki kez kur kontrol eder.
2. Sunucu veya ağ cevap vermezse son kayıtlı fiyat ve zamanı gösterilir.
3. Kullanıcı manuel kur girebilir. Manuel değer, kullanıcı kaldırana kadar o cihazda gösterime esas olur.
4. Gram altın etiketi yaklaşık değerdir. Kuyumcu alış/satış fiyatı olduğu söylenmez.

## İlk sürüm kapsamı

Dahil:

- Yukarıdaki ekranlar, Türkçe arayüz, TRY, USD ve EUR kasa ve banka.
- Aynı para biriminde transfer ve kuru kayıtlı döviz dönüşümü.
- TRY kredi kartı, TRY bütçe, tekrarlayan plan, çok birimli borç/alacak.
- Üyeliksiz SQLite kullanımı ve aynı cihazdan ilk bulut aktarımı.
- Merkezi kur modülü, yerel kur önbelleği, manuel kur.
- Onaylı tek cihaz değişimi ve boş cihaza bulut indirme.

İlk sürümde olup çözümü sonraki aşamaya bırakılan risk:

- Eski cihazda kalmış, sunucuya hiç yazılmamış kayıtlar ile yeni cihazın indirdiği bulut kopyası birleştirilmez. Otomatik silme ve üzerine yazma yoktur. Ayrı çatışma tasarımı onaylanmadan Faz 14 açılmaz.

## Sonraki sürüm özellikleri

Bunların kodu şimdiden yazılmaz. Mimari yolu kapatılmaz.

- Fiş OCR.
- Sesli işlem.
- Yapay zekâ ile harcama analizi.
- Banka hesabına doğrudan bağlantı.
- Aile veya ortak bütçe.
- Yatırım portföyü.
- Anlık fiyat akışı ve ayrı kur mikroservisi.
- Çoklu dil.
- Faiz.
- Altın cinsinden nakit hesap.
- USD veya EUR kredi kartı.
- Çevrimdışı kayıtların otomatik birleştirilmesi.

## Kabul kriterleri

- 500 TL gider, seçilen hesabı 500 TL azaltır.
- 2.000 TL transferden sonra iki hesabın toplamı değişmez; gelir ve gider değişmez.
- 3.000 TL kart alışverişi ve sonraki kart ödemesinden sonra gider yalnızca 3.000 TL’dir.
- 10.000 TL borç alınıp 4.000 TL anapara ödenince kalan borç 6.000 TL’dir. Gelir ve gider değişmez.
- 5 gram altın borcundan 2 gram ödenince kalan 3 gramdır.
- 100,00 USD aynı para biriminde transfer edilince toplam USD değişmez.
- 100,00 USD, kayıtlı kurla TL’ye dönünce iki tutar ve kur saklanır. Gelir ve gider değişmez. Komisyon varsa gider yalnızca komisyon tutarıdır.
- Aylık abonelik planı oluşunca gider oluşmaz. Ödendi denince gider tam bir kez oluşur. İkinci onay yeni gider açmaz.
- İnternet ve backend yokken üyeliksiz gelir, gider, transfer, kart, borç ve plan kaydı çalışır.
- Hesap açılışındaki aktarım bütün yerel finansal kayıtları bağlar. Doğrulama bitmeden yerel silme yoktur.
- Kur servisi hata verirse son fiyat veya manuel değer gösterilir. Asıl borç miktarı değişmez.
- Kullanılmış kategori arşivlenince geçmiş işlemler durur.
- Onay olmadan cihaz değişmez. Onaydan sonra eski oturum düşer, boş yeni cihaz bulut verisini indirir. Gönderilmemiş veri silinmez ve üzerine yazılmaz.
- 0,10 TL + 0,20 TL = 0,30 TL sonucu küçük birim toplamıyla birebir çıkar.

Ayrıntılı adımlar `docs/TEST_PLAN.md` içindedir.

## Önerilen faz haritası

Kod sırası `docs/ARCHITECTURE.md` ile aynıdır: Faz 0 belgeler, Faz 1 iskelet, Faz 2 para çekirdeği, Faz 3 hesap, transfer ve döviz dönüşümü, Faz 4 kart, Faz 5 borç/alacak, Faz 6 kategori, Faz 7 bütçe, Faz 8 tekrarlayan ödemeler, Faz 9 ekranlar ve grafikler, Faz 10 kur, Faz 11 hesap ve ilk aktarım, Faz 12 onaylı cihaz değişimi, Faz 13 ayarlar ayrıntısı, Faz 14 çevrimdışı çatışma birleştirme. Faz 14, ayrı çözüm tasarımı onaylanmadan açılmaz.

Kullanıcı **TAMAM** demeden bir sonraki faza geçilmez.
