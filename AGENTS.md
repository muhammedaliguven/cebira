# Cebira — geliştirme kuralları

Bu dosya sonraki Cursor oturumları için bağlayıcıdır. Ayrıntılı ürün, mimari, veri ve test metinleri `docs/` altındadır. Bu dosya ile `docs/` çelişirse kod yazmayı durdur ve belgeleri aynı değişiklikte hizala.

Durum: Faz 1 kabuğu hazır. Kullanıcı açıkça **TAMAM** demeden Faz 2 başlatılmaz.

## Proje sınırı

Cebira, Türkiye odaklı, offline-first bir kişisel bütçe uygulamasıdır. Tek workspace içinde iki uygulama vardır:

- `cebira-mobile` — React Native, Expo, TypeScript
- `cebira-backend` — Java 21, Spring Boot, modüler monolith

Başlangıç yığını: SQLite, Zustand, React Hook Form, Zod, Spring Security, Spring Data JPA, PostgreSQL, Flyway, REST. Mikroservis, Kafka, Kubernetes ve ayrı kur servisi açılmaz. Kur işi backend içinde `rates` modülüdür.

Finansal iş kuralları ekran bileşenlerine yazılmaz. Mobilde `domain` ve `services`, backend’de modülün domain katmanı kullanılır. İki tarafın sözleşmesi `docs/DATA_MODEL.md` ve ilerideki API şemasıdır.

## Faz kapısı

1. Yalnızca kullanıcının açtığı faz üzerinde çalış.
2. Fazı küçük adımlara böl. Her adımda: mevcut dosyaları incele, kapsamı ve kabulü yaz, uygunsa başarısız testi önce yaz, yalnızca o adımı uygula, testleri gerçekten çalıştır, derleme ve lint çalıştır, hatayı düzeltip testleri yeniden çalıştır.
3. Aynı fazın sonraki adımına ancak o adımın testleri gerçekten geçince geç.
4. Faz bitince dur ve raporla. Kullanıcı **TAMAM** demeden sonraki faza geçme.
5. Başka fazın özelliğini “hazır olsun” diye yazma.
6. Çalışan kodu gerekçesiz yeniden yazma.

Önerilen faz sırası `docs/ARCHITECTURE.md` içindedir. Sıra, kullanıcı onayı olmadan atlanmaz.

## Finansal güvenilirlik

Aşağıdaki kurallar her fazda geçerlidir. Tam metin ve örnekler `docs/PRODUCT_REQUIREMENTS.md` ve `docs/DATA_MODEL.md` içindedir.

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

Kilitlenen kararlar (14 Kasım 2026). Kod bu metinden ayrılmaz:

- KARAR-01: Borç vermek gider sayılmaz. Borç tahsilatı gelir sayılmaz. Borç almak gelir sayılmaz. Anapara hareketleri gelir-gider raporunu etkilemez.
- KARAR-02: İlk sürümde nakit ve banka hesapları TRY, USD veya EUR olabilir. Her hesabın tek para birimi vardır. Altın hesap para birimi değildir.
- KARAR-03: İlk sürümde faiz hesaplaması yoktur.
- KARAR-04: Aynı para biriminde transfer yapılır. Farklı para birimlerinde döviz dönüşümü yapılır. Kaynak tutar, hedef tutar, kur ve varsa komisyon saklanır.
- KARAR-05: Yeni cihaz onayı eski oturumu düşürür ve bulut verisinin indirilmesine izin verir. Çevrimdışı çatışma çözümü sonraki aşamadadır. Senkronize edilmemiş veri otomatik silinmez veya üzerine yazılmaz.

Gerçek kullanıcı verisini silme. Yarım finansal kayıt bırakma. Senkronize edilmemiş veriyi otomatik silen veya üzerine yazan kod yazma.

## Test zorunluluğu

Finansal işlem mantığı, o davranışı kilitleyen test yazılmadan geliştirilmez.

Her adımda:

1. İlgili testi çalıştır ve çıktıyı oku.
2. TypeScript veya Java derlemesini, lint ve o adıma ait entegrasyon kontrolünü çalıştır.
3. Kırmızı testi yok sayma, atlama, silme veya yalnızca yeşil görünsün diye gevşetme.
4. Test edilmeyen davranışı test edilmiş diye yazma.
5. Ortam yoksa (Docker, veritabanı, emülatör, iOS derlemesi, eksik JDK/Node) sonucu **BLOCKED** yaz. Geçti diye gösterme.
6. Engeli güvenli biçimde kaldırabiliyorsan kaldır. Kaldıramıyorsan neyin eksik olduğunu bildir ve dur.

Faz sonu raporu `docs/test-reports/` altına yazılır ve şunları içerir: tamamlanan adımlar, değişen dosyalar, test senaryoları, çalıştırılan komutlar, başarılı ve başarısız sayıları, çalıştırılamayan testler ve nedenleri, riskler, sonraki fazın kapsamı.

Jest, JUnit veya E2E çalışmadan bu araçların adı başarı hanesine yazılmaz.

## Güvenlik

- Şifre, API anahtarı ve token kaynak koda veya belgeye yazılmaz.
- Gizli değer ortam değişkenindedir ve örneği gerçek sır içermez.
- Sunucu, isteği yalnızca oturumdaki kullanıcı ve aktif cihaz ile sınırlar.
- Üyeliksiz veriyi hesap oluşmadan buluta gönderme.

## Bilinçli sürüm sapması

İstenen test çerçevesi JUnit 5 idi. Spring Boot 4.1.2 BOM, JUnit Jupiter 6.0.3 yönetir. Backend testleri bu Jupiter sürümüyle yazılır. Ayrıntı `docs/ARCHITECTURE.md` içindedir.

## İlk sürümde yazılmayacaklar

Fiş OCR, sesli işlem, yapay zekâ analizi, banka bağlantısı, ortak bütçe, yatırım portföyü, ayrı kur mikroservisi, gereksiz anlık fiyat akışı.
