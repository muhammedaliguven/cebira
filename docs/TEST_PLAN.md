# Cebira — test planı

Sürüm: 0.2  
Tarih: 14 Kasım 2026  
Durum: Faz 0, karar revizyonu. Bu fazda Jest, JUnit veya E2E çalıştırılmaz. Senaryolar ilgili fazda, uygulamadan önce kırmızı test olarak yazılır.

Türler:

- Birim: domain değer nesnesi ve kural, veritabanı yok.
- Veri: SQLite transaction ve bütünlük.
- Bileşen: React Native Testing Library.
- Entegrasyon: Spring + Testcontainers PostgreSQL. Docker yoksa BLOCKED.
- Sözleşme: mobil paket ile sunucu doğrulaması aynı sayıları üretir.
- Uçtan uca: emülatör veya cihaz. iOS bu Windows makinesinde BLOCKED kalır.

Tutarlar küçük birimden hesaplanır. 1 TL = 100 kuruş. 1 gram = 1000 miligram.

## Kurallar

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

Fazlar: Faz 0 belgeler. Faz 1 iskelet. Faz 2 para çekirdeği. Faz 3 hesap, transfer ve döviz dönüşümü. Faz 4 kart. Faz 5 borç ve alacak. Faz 6 kategori. Faz 7 bütçe. Faz 8 tekrarlayan ödemeler. Faz 9 ekranlar ve grafikler. Faz 10 kur. Faz 11 hesap ve ilk aktarım. Faz 12 onaylı cihaz değişimi ve bulut indirme. Faz 13 ayarlar. Faz 14 çevrimdışı çatışma birleştirme. Bu faz, ayrı çözüm tasarımı onaylanmadan açılmaz. Otomatik silme ve üzerine yazma bu fazda da yazılmaz.

## SENARYO-01 — 500 TL gider bakiyeyi düşürür

**Kural:** KURAL-07, KURAL-08  
**Test adı:** Gider kaydı seçilen hesabı tutar kadar azaltır  
**Ön koşul:** TRY kasa bakiyesi 1.000,00 TL (100000 kuruş). Ayın başka gideri yok.  
**Test adımları:**

1. Market kategorili 500,00 TL gideri bu kasaya işle.
2. Kasa bakiyesini ve aylık gideri oku.

**Beklenen sonuç:** Kasa 500,00 TL (50000 kuruş). Aylık gider 500,00 TL. Aylık gelir değişmez. İşlem ve bacaklar birlikte durur.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-02 — Transfer toplam parayı değiştirmez

**Kural:** KURAL-01, KARAR-04  
**Test adı:** Bankadan nakde transfer gelir ve gider yaratmaz  
**Ön koşul:** Banka 5.000,00 TL, nakit 1.000,00 TL. Toplam 6.000,00 TL.  
**Test adımları:**

1. Bankadan nakde 2.000,00 TL transfer kaydet.
2. İki bakiyeyi, toplamı, aylık geliri ve gideri oku.

**Beklenen sonuç:** Banka 3.000,00 TL, nakit 3.000,00 TL, toplam 6.000,00 TL. Gelir ve gider aynı. İşlem türü transfer.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-03 — Kart alışverişi ve kart ödemesi tek gider bırakır

**Kural:** KURAL-02  
**Test adı:** Kartla 3.000 TL alışveriş ve sonraki ödeme ikinci gider açmaz  
**Ön koşul:** Kart borcu 0. Banka 5.000,00 TL. Aylık gider 0.  
**Test adımları:**

1. 3.000,00 TL gideri kredi kartına işle.
2. Gideri, kart borcunu ve bankayı oku.
3. Kart borcunun 3.000,00 TL’sini bankadan öde.
4. Gideri, kart borcunu ve bankayı yeniden oku.

**Beklenen sonuç:** Alışverişten sonra gider 3.000,00 TL, kart borcu 3.000,00 TL, banka 5.000,00 TL. Ödemeden sonra gider hâlâ 3.000,00 TL, kart borcu 0, banka 2.000,00 TL. Ödeme işleminin gider bayrağı kapalı.  
**Test türü:** Birim ve veri  
**Faz:** Faz 4

## SENARYO-04 — Kişisel borç ve kısmi anapara

**Kural:** KURAL-03, KURAL-07  
**Test adı:** 10.000 TL borç alınıp 4.000 TL ödenince kalan 6.000 TL olur  
**Ön koşul:** Kasa 0. Borç yok. Aylık gelir ve gider 0.  
**Test adımları:**

1. 10.000,00 TL kişisel borç alımını kasaya işle.
2. Geliri, kasayı ve borç bakiyesini oku.
3. Anaparanın 4.000,00 TL’sini aynı kasadan öde.
4. Gideri, kasayı ve kalan borcu oku.

**Beklenen sonuç:** Alımdan sonra gelir 0, gider 0, kasa 10.000,00 TL, borç 10.000,00 TL, net TRY 0. Ödemeden sonra gelir 0, gider 0, kasa 6.000,00 TL, kalan borç 6.000,00 TL, net TRY 0. Borç ve alacak listeleri ayrıdır.  
**Test türü:** Birim ve veri  
**Faz:** Faz 5

## SENARYO-05 — Altın borcunda kısmi ödeme

**Kural:** KURAL-04, KURAL-07  
**Test adı:** 5 gram altın borcundan 2 gram ödenince 3 gram kalır  
**Ön koşul:** Altın borcu 5000 miligram. TRY kasa 1.000,00 TL. Güncel gram fiyatı kayıtlı.  
**Test adımları:**

1. 2000 miligram anapara ödemesi kaydet.
2. Kalan miligramı, TRY kasayı ve gösterilen TL değerlemeyi oku.
3. Değerleme fiyatını değiştirip anaparayı yeniden oku.

**Beklenen sonuç:** Kalan 3000 miligram (3,000 gram). TRY kasa 1.000,00 TL kalır. Fiyat değişince yaklaşık TL değişir, miligram değişmez.  
**Test türü:** Birim ve veri  
**Faz:** Faz 5

## SENARYO-06 — Plan oluşan ayda gider değildir

**Kural:** KURAL-05  
**Test adı:** Aylık abonelik planı gerçek gider oluşturmaz  
**Ön koşul:** TRY hesap ve gider kategorisi var. Gerçekleşen gider 0.  
**Test adımları:**

1. Aylık abonelik tanımla: 100,00 TL, ayın 5’i, bir hesap ve kategori.
2. Üretilen planları, hesap bakiyesini ve gider toplamını oku.

**Beklenen sonuç:** İlgili ay için `SCHEDULED` plan var. Gider işlemi yok. Hesap bakiyesi aynı.  
**Test türü:** Birim ve veri  
**Faz:** Faz 8

## SENARYO-07 — Ödendi onayı gideri bir kez yazar

**Kural:** KURAL-05, KURAL-08  
**Test adı:** Planı ödemek tam bir gider ve bir bakiye hareketi yazar  
**Ön koşul:** SENARYO-06 planı duruyor. Hesap bakiyesi biliniyor.  
**Test adımları:**

1. Plan için Ödendi de.
2. Gider sayısını, işlem kimliğini, plan durumunu ve bakiyeyi oku.

**Beklenen sonuç:** Tam bir gider, tutar 100,00 TL. Plan `PAID` ve `expense_transaction_id` dolu. Hesap 100,00 TL azalmış.  
**Test türü:** Birim ve veri  
**Faz:** Faz 8

## SENARYO-08 — İkinci onay çift gider açmaz

**Kural:** KURAL-05  
**Test adı:** Aynı planın ikinci Ödendi çağrısı yeni gider yazmaz  
**Ön koşul:** SENARYO-07 tamam. Gider kimliği kayıtlı.  
**Test adımları:**

1. Aynı plan için Ödendi’yi yeniden çağır.
2. Gider sayısını, ilk gider kimliğini ve bakiyeyi oku.

**Beklenen sonuç:** Gider sayısı aynı. Kimlik değişmez. Bakiye ikinci kez azalmaz. Çağrı mevcut gideri döndürür.  
**Test türü:** Birim ve veri  
**Faz:** Faz 8

## SENARYO-09 — Üyeliksiz kullanım internetsiz çalışır

**Kural:** KURAL-09  
**Test adı:** Backend kapalıyken üyeliksiz finansal kayıtlar yerel dosyada tamamlanır  
**Ön koşul:** Oturum yok. Ağ kapalı veya sunucu erişilemez. Boş yerel veritabanı.  
**Test adımları:**

1. Ağ isteği atmadan nakit hesap, 500,00 TL gider, bir transfer, bir kart gideri, bir TRY borç ve bir aylık plan kaydet.
2. Uygulamayı yeniden açıp aynı dosyadan kayıtları oku.
3. Giden istek olup olmadığına bak.

**Beklenen sonuç:** Kayıtlar SQLite’ta durur. Gider bakiyeyi düşürür. Finansal kayıt için HTTP isteği yoktur.  
**Test türü:** Veri. Uçtan uca kabul aynı fazda, emülatör yoksa BLOCKED  
**Faz:** Faz 11. Çekirdek veri testi Faz 3’te başlar.

## SENARYO-10 — İlk aktarım bütün kayıtları bağlar

**Kural:** KURAL-10  
**Test adı:** Hesap açılışı yerel finansal kayıtların tamamını kullanıcıya bağlar  
**Ön koşul:** Üyeliksiz veritabanında hesap, gider, transfer, kart, borç, kategori, bütçe ve plan var. Sunucu testi için Docker gerekir.  
**Test adımları:**

1. Kayıt türlerinin yerel sayılarını çıkar.
2. Hesap oluştur ve ilk aktarımı başlat.
3. Aktarım cevabından önce yerel sayıları tekrar oku.
4. Başarılı cevapta sunucu sayılarını ve `owner_user_id` doluluğunu oku.
5. Ayrı bir denemede cevabı kopar.

**Beklenen sonuç:** Başarıda her türün sunucu sayısı yerel sayıya eşittir, kimlikler aynıdır, yerel satırlar durur. Kopan denemede yerel sayılar ve üyeliksiz kullanılabilirlik aynı kalır, `snapshot_ack_at` boştur.  
**Test türü:** Sözleşme ve entegrasyon. Docker yoksa BLOCKED  
**Faz:** Faz 11

## SENARYO-11 — Kur hatasında son fiyat veya manuel değer

**Kural:** KURAL-04  
**Test adı:** Kur API hatası borç miktarını değiştirmeden değerleme gösterir  
**Ön koşul:** USD ve gram altın için son resmi fiyat ve zamanı önbellekte. 5000 miligram altın borcu var.  
**Test adımları:**

1. Kur isteğini hata ile sonuçlandır.
2. Gösterilen fiyatı, zamanı ve miligramı oku.
3. Manuel gram fiyatı gir.
4. Miligramı ve gösterilen fiyatın kaynağını oku.

**Beklenen sonuç:** Hata sonrası son resmi fiyat ve kaynak zamanı durur. Manuel girişten sonra gösterim manuel kaynaktır. Anapara 5000 miligram kalır. Resmi satır silinmez.  
**Test türü:** Birim ve veri  
**Faz:** Faz 10

## SENARYO-12 — Arşivlenen kategori geçmişi korur

**Kural:** KURAL-06  
**Test adı:** Kullanılmış kategori arşivlenince işlemler silinmez  
**Ön koşul:** Market kategorili 500,00 TL gider var.  
**Test adımları:**

1. Market kategorisini arşivle.
2. Gideri, snapshot adını ve tutarı oku.
3. Yeni gider için kategori seçicisini aç.
4. Kategoriyi fiziksel silmeyi dene.

**Beklenen sonuç:** Gider 500,00 TL ve snapshot “Market” olarak durur. Seçicide Market yoktur. Fiziksel silme reddedilir.  
**Test türü:** Birim, veri ve bileşen  
**Faz:** Faz 6

## SENARYO-13 — Kısmi kart ödemesi gider açmaz

**Kural:** KURAL-02  
**Test adı:** Kart borcunun bir kısmını ödemek gider toplamını değiştirmez  
**Ön koşul:** Kart borcu 3.000,00 TL, bağlı gider 3.000,00 TL, banka 5.000,00 TL.  
**Test adımları:**

1. Bankadan karta 1.000,00 TL ödeme yap.
2. Gideri, kart borcunu ve bankayı oku.

**Beklenen sonuç:** Gider 3.000,00 TL. Kart borcu 2.000,00 TL. Banka 4.000,00 TL.  
**Test türü:** Veri  
**Faz:** Faz 4

## SENARYO-14 — Fazla anapara ödemesi reddedilir

**Kural:** KURAL-08  
**Test adı:** Kalan borçtan büyük ödeme yarım kayıt bırakmaz  
**Ön koşul:** Kalan TRY borç 6.000,00 TL. Kasa 10.000,00 TL.  
**Test adımları:**

1. 6.000,01 TL anapara ödemesi dene.
2. Borcu, kasayı ve işlem sayısını oku.

**Beklenen sonuç:** İşlem reddedilir. Borç 6.000,00 TL, kasa 10.000,00 TL, yeni satır yok.  
**Test türü:** Birim ve veri  
**Faz:** Faz 5

## SENARYO-15 — Küçük birim toplamı

**Kural:** KURAL-07  
**Test adı:** 0,10 TL ile 0,20 TL toplamı 0,30 TL olur  
**Ön koşul:** Para değer nesnesi var. Kayan nokta API’si domain dışında.  
**Test adımları:**

1. 10 kuruş ile 20 kuruşu topla.
2. 5 gramı miligrama çevir.
3. Domain katmanında float parametresi arayan bir hesap olup olmadığına bak.

**Beklenen sonuç:** Toplam 30 kuruş. 5 gram 5000 miligram. Domain toplama fonksiyonu yalnız tam sayı alır.  
**Test türü:** Birim  
**Faz:** Faz 2

## SENARYO-16 — Yarım transfer geri alınır

**Kural:** KURAL-08  
**Test adı:** İkinci bacak yazılamazsa iki hesap da eski bakiyede kalır  
**Ön koşul:** Banka 2.000,00 TL, nakit 0. İkinci bacak yazımı testte hata fırlatacak şekilde bozulur.  
**Test adımları:**

1. 2.000,00 TL transferi başlat.
2. Hata sonrası iki bakiyeyi ve işlem sayısını oku.

**Beklenen sonuç:** Banka 2.000,00 TL, nakit 0, işlem sayısı artmaz.  
**Test türü:** Veri  
**Faz:** Faz 3

## SENARYO-17 — Alacak vermek gider değildir

**Kural:** KARAR-01, KURAL-03  
**Test adı:** Borç verme ve anapara tahsili gelir-gider toplamını bozmaz  
**Ön koşul:** Kasa 5.000,00 TL. Gelir ve gider 0.  
**Test adımları:**

1. 1.000,00 TL alacak aç.
2. Geliri, gideri, kasayı ve alacak bakiyesini oku.
3. 400,00 TL tahsil et.
4. Aynı alanları oku.

**Beklenen sonuç:** Açılışta gider 0, gelir 0, kasa 4.000,00 TL, alacak 1.000,00 TL. Tahsilattan sonra gelir 0, gider 0, kasa 4.400,00 TL, kalan alacak 600,00 TL.  
**Test türü:** Birim ve veri  
**Faz:** Faz 5

## SENARYO-18 — Onaysız cihaz değişimi veriye dokunmaz

**Kural:** KURAL-11, KARAR-05  
**Test adı:** Onay verilmeden aktif cihaz ve defter aynı kalır  
**Ön koşul:** Kullanıcının A cihazı aktif. Sunucuda ve A cihazında kayıt var. Docker gerekir.  
**Test adımları:**

1. B cihazından doğru parola ile giriş dene ve onay verme.
2. Sunucu kayıt sayısını, A cihazının yerel sayısını ve aktif cihaz kimliğini oku.

**Beklenen sonuç:** HTTP 409 `DEVICE_SWITCH_REQUIRED`. Sayılar aynı. Aktif cihaz A olarak kalır. İndirme başlamaz. Silme ve üzerine yazma yoktur.  
**Test türü:** Entegrasyon. Docker yoksa BLOCKED  
**Faz:** Faz 12

## SENARYO-19 — Ödenmemiş plan bütçeyi harcama saymaz

**Kural:** KURAL-05  
**Test adı:** Bekleyen plan kalan bütçeden düşülmez  
**Ön koşul:** Aylık limit 1.000,00 TL. Gerçekleşen gider 200,00 TL. 100,00 TL’lik plan `SCHEDULED`.  
**Test adımları:**

1. Kalan bütçeyi ve bekleyen plan tutarını ayrı oku.
2. Planı öde.
3. Kalan bütçeyi yeniden oku.

**Beklenen sonuç:** Ödeme öncesi kalan 800,00 TL, bekleyen 100,00 TL ayrıca görünür. Ödeme sonrası gerçekleşen 300,00 TL, kalan 700,00 TL.  
**Test türü:** Birim ve veri  
**Faz:** Faz 8

## SENARYO-20 — Başarısız aktarım yerel veriyi bırakır

**Kural:** KURAL-10  
**Test adı:** Sunucu yarıda kalırsa üyeliksiz kayıtlar kullanılabilir kalır  
**Ön koşul:** Üyeliksiz 3 işlem var. Sunucu snapshot transaction’ı testte geri alınıyor.  
**Test adımları:**

1. Aktarımı başlat.
2. Sunucu geri aldığında yerel işlem sayısını, `owner_user_id` boşluğunu ve bakiye okumasını dene.

**Beklenen sonuç:** Yerelde 3 işlem durur. Kullanıcı bu kayıtlarla işlem yapabilir. Sunucuda bu kullanıcıya ait finansal satır kalmaz.  
**Test türü:** Sözleşme. Docker yoksa sunucu yarısı BLOCKED, yerel yarı veri testi çalışır  
**Faz:** Faz 11

## SENARYO-21 — Kategori iki yerden oluşturulur

**Kural:** KURAL-06  
**Test adı:** Ekle ve Ayarlar aynı kategori kaydını üretir  
**Ön koşul:** Uygulama kabuğu ve kategori servisi var.  
**Test adımları:**

1. Ekle ekranındaki kategori seçiciden “Okul” gider kategorisi oluştur.
2. Ayarlar > Kategorilerim üzerinden buna “Kitap” alt kategorisini ekle.
3. Yeni giderde ikisini seç.
4. “Okul”u arşivle ve eski gideri aç.

**Beklenen sonuç:** Tek “Okul” kaydı vardır, çift oluşmaz. Alt kategori bağlıdır. Arşivden sonra eski gider snapshot ile durur.  
**Test türü:** Bileşen ve veri  
**Faz:** Faz 9. Domain kaydı Faz 6’da test edilir.

## SENARYO-22 — Ana sayfa özeti

**Test adı:** Ana sayfa türetilmiş TRY özetini gösterir  
**Ön koşul:** Kasa 6.000,00 TL, kart borcu 2.000,00 TL, kişisel TRY borç 6.000,00 TL, ay gideri 3.000,00 TL, limit 5.000,00 TL.  
**Test adımları:**

1. Ana Sayfa modelini üret.
2. Bakiye, gider, net ve kalan bütçeyi oku.

**Beklenen sonuç:** Bakiye 6.000,00 TL. Gider 3.000,00 TL. Net 6.000 − 2.000 − 6.000 = −2.000,00 TL. Kalan bütçe 2.000,00 TL.  
**Test türü:** Birim ve bileşen  
**Faz:** Faz 9

## SENARYO-23 — Düzenleme ve silme bakiyeyi geri sarar

**Kural:** KURAL-08  
**Test adı:** Gider silinince hesap eski bakiyeye döner  
**Ön koşul:** 1.000,00 TL kasadan 500,00 TL gider işlendi. Bakiye 500,00 TL.  
**Test adımları:**

1. Gideri sil.
2. Bakiyeyi ve tombstone’u oku.

**Beklenen sonuç:** Bakiye 1.000,00 TL. İşlem tombstone olarak durur, toplamda gider sayılmaz.  
**Test türü:** Veri  
**Faz:** Faz 3

## SENARYO-24 — Grafik gelir ve gideri transferden ayırır

**Kural:** KURAL-01, KURAL-02  
**Test adı:** Aylık grafik transferi ve kart ödemesini gidere katmaz  
**Ön koşul:** 500 TL gider, 2.000 TL transfer, 3.000 TL kart gideri ve 3.000 TL kart ödemesi.  
**Test adımları:**

1. Ay özetini üret.

**Beklenen sonuç:** Gider 3.500 TL. Gelir 0. Transfer ve kart ödemesi gider diliminde yoktur.  
**Test türü:** Birim  
**Faz:** Faz 9

## SENARYO-25 — Bildirim ve tema finansal veriyi değiştirmez

**Test adı:** Ayarlar görünümü deftere yazmaz  
**Ön koşul:** Bilinen bakiye ve tema değeri.  
**Test adımları:**

1. Temayı değiştir.
2. Bildirim iznini kapalı kaydet.
3. Bakiyeyi oku.

**Beklenen sonuç:** Bakiye aynı. Tema ve bildirim tercihi ayrı ayar kaydındadır.  
**Test türü:** Bileşen  
**Faz:** Faz 13

## SENARYO-26 — USD transferi USD toplamını korur

**Kural:** KURAL-01, KARAR-02, KARAR-04  
**Test adı:** Aynı para birimindeki dolar transferi gelir ve gider yaratmaz  
**Ön koşul:** USD banka 200,00 USD, USD nakit 0. TRY kasa 1.000,00 TL. Gelir ve gider 0.  
**Test adımları:**

1. Bankadan nakde 100,00 USD transfer kaydet.
2. USD toplamını, TRY kasayı, geliri ve gideri oku.

**Beklenen sonuç:** USD banka 100,00 USD, USD nakit 100,00 USD, USD toplam 200,00 USD. TRY kasa 1.000,00 TL. Gelir 0, gider 0.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-27 — Döviz dönüşümü tutarları ve kuru saklar

**Kural:** KURAL-01, KURAL-07, KARAR-04  
**Test adı:** 100 USD, 34,50 kuruyla 3.450 TL olur ve gelir-gider değişmez  
**Ön koşul:** USD hesap 100,00 USD. TRY hesap 0. `rate_scaled` 34500000, ölçek 1000000.  
**Test adımları:**

1. 100,00 USD kaynağı 3.450,00 TL hedefe dönüştür.
2. İki bakiyeyi, saklanan kuru, kaynak tutarı, hedef tutarı, geliri ve gideri oku.

**Beklenen sonuç:** USD hesap 0. TRY hesap 3.450,00 TL. Üç alan da kayıtta durur. Gelir 0, gider 0. İşlem türü `FX_CONVERSION`.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-28 — Komisyon ayrı ve tek giderdir

**Kural:** KURAL-01, KARAR-04  
**Test adı:** Dönüşüm komisyonu gider olur, dönüşümün kendisi olmaz  
**Ön koşul:** SENARYO-27 ön koşulu ve 1,00 USD komisyon. USD hesap 101,00 USD.  
**Test adımları:**

1. 100,00 USD dönüşümünü 1,00 USD komisyonla kaydet.
2. Gider sayısını, gider tutarını, USD bakiyeyi ve TRY bakiyeyi oku.

**Beklenen sonuç:** Tam bir gider, 1,00 USD. Dönüşüm satırının gider bayrağı kapalı. USD hesap 0. TRY hesap 3.450,00 TL.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-29 — Kur sapması ve yarım dönüşüm reddedilir

**Kural:** KURAL-07, KURAL-08  
**Test adı:** Kurla açıklanamayan hedef tutar iki hesabı da değiştirmez  
**Ön koşul:** USD hesap 100,00 USD. TRY hesap 0. Kur 34,50.  
**Test adımları:**

1. Hedef tutarı 3.500,00 TL olarak kaydetmeyi dene.
2. İkinci denemede hedef 3.450,00 TL olsun ve TRY bacağı yazılırken hata fırlat.

**Beklenen sonuç:** İlk deneme 1 küçük birimden fazla sapma nedeniyle reddedilir. İkinci deneme geri alınır. USD 100,00 USD, TRY 0, gider satırı yok.  
**Test türü:** Birim ve veri  
**Faz:** Faz 3

## SENARYO-30 — Onaylı geçiş bulut verisini boş cihaza indirir

**Kural:** KURAL-11, KARAR-05  
**Test adı:** Onay eski oturumu düşürür ve boş cihaz bulut kopyasını alır  
**Ön koşul:** A cihazı aktif. Sunucuda 4 finansal kayıt var. B cihazının yereli boş. Docker gerekir.  
**Test adımları:**

1. B girişinde uyarıyı onayla.
2. Aktif cihazı, A oturumunun refresh durumunu ve B’ye inen kayıt sayısını oku.
3. A cihazının yerel dosyasındaki kayıt sayısına bak.

**Beklenen sonuç:** Aktif cihaz B. A’nın sunucu oturumu geçersiz. B’de 4 kayıt var ve kimlikler sunucuyla aynı. A’nın yerel dosyası silinmemiş.  
**Test türü:** Entegrasyon. Docker yoksa BLOCKED  
**Faz:** Faz 12

## SENARYO-31 — Gönderilmemiş yerel veri üzerine yazılmaz

**Kural:** KURAL-11, KARAR-05  
**Test adı:** Yeni cihazda gönderilmemiş kayıt varken geçiş durur  
**Ön koşul:** Sunucuda kullanıcının bulut kopyası var. B cihazında henüz gönderilmemiş 2 yerel işlem var.  
**Test adımları:**

1. B cihazında cihaz değişimini onayla.
2. B’nin yerel işlem sayısını, sunucu kayıt sayısını ve aktif cihazı oku.

**Beklenen sonuç:** `LOCAL_UNSYNCED`. Aktif cihaz değişmez. B’de 2 işlem durur. Sunucu kopyası aynıdır. Silme ve üzerine yazma yoktur.  
**Test türü:** Entegrasyon. Docker yoksa sunucu yarısı BLOCKED  
**Faz:** Faz 12

## SENARYO-32 — Eski cihazın gönderilmemiş kuyruğu durur

**Kural:** KURAL-11, KARAR-05  
**Test adı:** Oturum düşünce eski cihazdaki gönderilmemiş satır silinmez ve buluta yazılmaz  
**Ön koşul:** A cihazında 1 gönderilmemiş işlem var. B yereli boş. Kullanıcı geçişi onaylar.  
**Test adımları:**

1. Geçişi tamamla.
2. A’nın yerel gönderilmemiş satırını ve sunucudaki işlem sayısını oku.
3. A’dan push dene.

**Beklenen sonuç:** A’nın satırı durur. Sunucu sayısı bu satırı içermez. Push, düşmüş oturumla yazmaz. Satır otomatik silinmez. Birleştirme yapılmaz. Bu boşluk çözülmemiş risk olarak kalır.  
**Test türü:** Entegrasyon. Docker yoksa BLOCKED  
**Faz:** Faz 12. Birleştirme Faz 14’e bırakılır ve bu senaryo onu uygulamaz.

## SENARYO-33 — Değerleme USD bakiyesini değiştirmez

**Kural:** KURAL-04, KARAR-02  
**Test adı:** Kur değişince yaklaşık TL değişir, USD bakiye aynı kalır  
**Ön koşul:** USD hesap 100,00 USD. Gram altın borcu 5000 miligram.  
**Test adımları:**

1. USD ve gram kurunu değiştir.
2. Saklanan USD bakiyeyi, miligramı ve gösterilen yaklaşık TL’yi oku.

**Beklenen sonuç:** USD 100,00 USD. Altın 5000 miligram. Yaklaşık TL değişir. Hesap satırındaki küçük birim değişmez.  
**Test türü:** Birim ve veri  
**Faz:** Faz 10

## SENARYO-34 — USD borç gelire girmez

**Kural:** KURAL-03, KARAR-01, KARAR-02  
**Test adı:** 100 USD borç alınıp 40 USD ödenince kalan 60 USD olur  
**Ön koşul:** USD hesap 0. Gelir ve gider 0.  
**Test adımları:**

1. 100,00 USD borç alımını USD hesaba işle.
2. 40,00 USD anapara öde.
3. Geliri, gideri, USD bakiyeyi ve kalan borcu oku.

**Beklenen sonuç:** Gelir 0, gider 0. USD hesap 60,00 USD. Kalan borç 60,00 USD.  
**Test türü:** Birim ve veri  
**Faz:** Faz 5

## İzlenebilirlik

| Senaryo | Kural | İlk zorunlu faz |
| --- | --- | --- |
| SENARYO-01 | KURAL-07, KURAL-08 | Faz 3 |
| SENARYO-02 | KURAL-01 | Faz 3 |
| SENARYO-03 | KURAL-02 | Faz 4 |
| SENARYO-04 | KURAL-03 | Faz 5 |
| SENARYO-05 | KURAL-04 | Faz 5 |
| SENARYO-06 | KURAL-05 | Faz 8 |
| SENARYO-07 | KURAL-05 | Faz 8 |
| SENARYO-08 | KURAL-05 | Faz 8 |
| SENARYO-09 | KURAL-09 | Faz 11 |
| SENARYO-10 | KURAL-10 | Faz 11 |
| SENARYO-11 | KURAL-04 | Faz 10 |
| SENARYO-12 | KURAL-06 | Faz 6 |
| SENARYO-13 | KURAL-02 | Faz 4 |
| SENARYO-14 | KURAL-08 | Faz 5 |
| SENARYO-15 | KURAL-07 | Faz 2 |
| SENARYO-16 | KURAL-08 | Faz 3 |
| SENARYO-17 | KARAR-01, KURAL-03 | Faz 5 |
| SENARYO-18 | KURAL-11, KARAR-05 | Faz 12 |
| SENARYO-19 | KURAL-05 | Faz 8 |
| SENARYO-20 | KURAL-10 | Faz 11 |
| SENARYO-21 | KURAL-06 | Faz 9 |
| SENARYO-22 | Ana sayfa | Faz 9 |
| SENARYO-23 | KURAL-08 | Faz 3 |
| SENARYO-24 | KURAL-01, KURAL-02 | Faz 9 |
| SENARYO-25 | Ayarlar | Faz 13 |
| SENARYO-26 | KURAL-01, KARAR-02 | Faz 3 |
| SENARYO-27 | KURAL-01, KARAR-04 | Faz 3 |
| SENARYO-28 | KURAL-01, KARAR-04 | Faz 3 |
| SENARYO-29 | KURAL-07, KURAL-08 | Faz 3 |
| SENARYO-30 | KURAL-11, KARAR-05 | Faz 12 |
| SENARYO-31 | KURAL-11, KARAR-05 | Faz 12 |
| SENARYO-32 | KURAL-11, KARAR-05 | Faz 12 |
| SENARYO-33 | KURAL-04, KARAR-02 | Faz 10 |
| SENARYO-34 | KURAL-03, KARAR-01 | Faz 5 |

KURAL-01’den KURAL-11’e kadar her kural en az bir senaryoda geçer. KARAR-01, KARAR-02, KARAR-04 ve KARAR-05 senaryoya bağlıdır. KARAR-03 faiz hesaplamasının yokluğudur. İlk sürümde faiz alanı açılırsa bu plan kırmızı test olmadan kabul edilmez.

Faz 1’in kabulü boş kabuğun derlenmesi ve lint’tir. Finansal senaryo Faz 1’e çekilmez.

Faz 14 birleştirme senaryosu bu belgede yoktur. Çatışma çözümü onaylanmadan otomatik silme veya üzerine yazma yazılmaz. SENARYO-32 bu boşluğu kilitler.
