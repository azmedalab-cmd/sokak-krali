# Sokak Kralı — Yayınlama Rehberi

Oyun saf HTML + JavaScript (Three.js r128). Bu klasörde üç şekilde "uygulama" olur:

| Yol | Ne çıkar | Gerekenler | Süre |
|---|---|---|---|
| **A. Web (itch.io / GitHub Pages / Netlify)** | Tarayıcıda oynanan sayfa, "Uygulama olarak yükle" düğmesiyle PWA | Ücretsiz hesap | 10 dk |
| **B. Windows uygulaması (Electron)** | `Sokak Kralı Setup.exe` kurulum + taşınabilir `.exe` | Node.js (var), `npm install` | 15 dk |
| **C. Android / iOS** | Mağaza uygulaması | Dokunmatik kontrol eklenmeli (oyun klavye + fare ister) | Önce kontrol tasarımı gerekir |

Önce bu klasörü kalıcı bir yere al (oturum silinince bu klasör de silinir).

---

## A. Web yayını

### itch.io (en kolay, oyun siteleri için)
1. https://itch.io → hesap aç → **Upload new project**.
2. *Kind of project*: **HTML**. *Pricing*: ücretsiz ya da "No payments".
3. `SokakKrali-web.zip` dosyasını yükle (bu klasördeki `index.html`, `js/`, `manifest.json`, `sw.js`, `icon-*.png`; `node_modules` ve `dist` hariç). "**This file will be played in the browser**" kutusunu işaretle.
4. *Embed options*: **Fullscreen button** aç, boyut 1280×720, "**Mobile friendly**" kapalı, **SharedArrayBuffer** gerekmez.
5. Kapak görseli olarak `build/icon.png` ya da oyundan bir ekran görüntüsü koy. **Save & view page** → yayınla.

### GitHub Pages (kendi adresin: kullanici.github.io/sokak-krali)
```bash
git init
```
```bash
git add .
```
```bash
git commit -m "Sokak Krali"
```
GitHub'da boş bir repo aç (ör. `sokak-krali`), sonra:
```bash
git remote add origin https://github.com/KULLANICI/sokak-krali.git
```
```bash
git push -u origin main
```
Repo → **Settings → Pages → Source: Deploy from a branch → main / (root)** → birkaç dakika sonra adres hazır. HTTPS olduğu için "Uygulama olarak yükle" (PWA) ve çevrimdışı oynama çalışır.

### Netlify / Vercel
Klasörü sürükle-bırak ile yükle (Netlify Drop: https://app.netlify.com/drop). Bitti.

---

## B. Windows uygulaması (Electron)

Bu klasörde `package.json` ve `electron.js` hazır.

```bash
npm install
```
Denemek için:
```bash
npm start
```
Kurulum dosyası + taşınabilir exe üretmek için:
```bash
npm run dist
```
Çıktılar `dist/` klasörüne gelir: `Sokak Kralı Setup 1.0.0.exe` (kurulum) ve `Sokak Kralı 1.0.0.exe` (taşınabilir). Bunları itch.io'ya da "Windows executable" olarak yükleyebilirsin.

Notlar:
- İlk `npm install` Electron'u indirir (~100 MB). `npm run dist` ilk seferde NSIS araçlarını da indirir.
- **Klasör yolu kısa olsun** (ör. `C:\Oyunlar\sokak-krali`). Çok uzun yollarda NSIS "could not open file" hatası verir. Uzun yoldan derlemen gerekiyorsa üst klasörü bir sürücü harfine bağla: `subst S: C:\uzun\yol\ust-klasor`, sonra `S:\proje` içinde derle (`subst S: /D` ile kaldır).
- GitHub'dan indirme kopuyorsa (`wsarecv: connection forcibly closed`) komutu tekrar çalıştır; `package.json` içindeki `electronDist` ayarı Electron'u yeniden indirmeden kurulu kopyayı kullanır, `signAndEditExecutable: false` ise imza aracının indirilmesini atlar.
- Windows SmartScreen imzasız exe'lerde uyarı verir. Kaldırmak için kod imzalama sertifikası gerekir (ücretli); itch.io üzerinden dağıtımda çoğu oyuncu buna alışkındır.
- Sürüm numarasını `package.json` içindeki `version` alanından artır.
- Simgeler `build/icon.ico` ve `build/icon.png`; istersen değiştir (512×512 PNG + ICO).

---

## C. Mobil (Android / iOS)

Dokunmatik kontroller hazır (sol joystick, sağda bakış, ateş/nişan/zıpla/bin düğmeleri). Android projesi `android/` klasöründe (Capacitor); uygulama canlı siteyi yükler, yani site güncellenince uygulama da güncellenir.

- **APK'yı bilgisayarsız derlemek**: GitHub → Actions → "Android APK" → Run workflow. Bittiğinde Artifacts'tan `SokakKrali-android` indir. `v*` etiketiyle push edersen APK otomatik Release'e eklenir.
- **Bilgisayarda derlemek**: Android Studio kur, `node build-www.js && npx cap sync android && npx cap open android`, Build → APK.
- **Google Play**: imzalı AAB gerekir: Android Studio → Build → Generate Signed Bundle (kendi keystore'unu oluştur ve sakla) → Play Console (tek seferlik 25 $). Play ilkeleri gereği uygulamanın çevrimdışı da çalışması istenirse `capacitor.config.json` içindeki `server.url` satırını silip `www/` paketini gömebilirsin.
- **iOS**: `npx cap add ios` yalnız Mac'te; Xcode + Apple Developer (yıllık 99 $).

---

## D. Google Play ve App Store (hesaplar senin adına açılmalı)

Mağazalara yükleme hesap, kimlik doğrulama ve ücret istediği için senin yapman gereken adımlar şunlar; her şey hazır bekliyor:

### Google Play (tek seferlik 25 $)
1. https://play.google.com/console → Google hesabınla geliştirici hesabı aç (kimlik doğrulama 1-2 gün sürebilir).
2. Bilgisayarında bir kez imza anahtarı üret ve **yedekle** (kaybolursa güncelleme yapılamaz):
   ```
   keytool -genkeypair -v -keystore sokakkrali.keystore -alias sokakkrali -keyalg RSA -keysize 2048 -validity 10000
   ```
   (keytool Android Studio ya da JDK ile gelir.)
3. GitHub → depo → Settings → Secrets and variables → Actions → New secret: `KEYSTORE_BASE64` (dosyanın base64'ü: PowerShell `[Convert]::ToBase64String([IO.File]::ReadAllBytes("sokakkrali.keystore")) | Set-Clipboard`), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (sokakkrali), `KEY_PASSWORD`.
4. GitHub → Actions → **"Android Release (Play için imzalı AAB)"** → Run workflow → bitince Artifacts'tan `SokakKrali-play` indir (içinde `SokakKrali-play.aab`).
5. Play Console → Uygulama oluştur (ad: Sokak Kralı, oyun, ücretsiz) → **Üretim → Yeni sürüm → AAB'yi yükle**. İlk yüklemede "Play App Signing" kabul et.
6. Mağaza kaydı: `store/listeleme.md` içindeki metinler, `store/icon-512.png`, `store/feature-graphic.png`, `store/screenshots/` (en az 2 telefon ekran görüntüsü).
7. Uygulama içeriği: gizlilik politikası adresi `https://azmedalab-cmd.github.io/sokak-krali/privacy.html`, reklam yok, içerik derecelendirme anketi (şiddet: evet), veri güvenliği: veri toplanmıyor, hedef kitle 16+.
8. İncelemeye gönder; ilk inceleme genelde 1-7 gün.

### App Store (yıllık 99 $, Mac gerekir)
1. https://developer.apple.com → Apple Developer Program'a katıl.
2. Bir Mac'te (ya da GitHub'daki **"iOS (Xcode projesi ve arşiv)"** iş akışı projeyi üretir): `npm i @capacitor/ios && node build-www.js && npx cap add ios && npx cap sync ios && npx cap open ios`.
3. Xcode'da Signing & Capabilities → Team seç; Bundle ID `com.sokakkrali.game`; Product → Archive → Distribute App → App Store Connect.
4. https://appstoreconnect.apple.com → Yeni uygulama → ekran görüntüleri (6.7" iPhone ve 12.9" iPad), açıklama (`store/listeleme.md`), gizlilik politikası adresi, yaş derecesi 17+ → İncelemeye gönder (1-3 gün).
5. Apple, web içeriği gömen oyunlarda tam ekran ve dokunmatik kontrollerin düzgün çalışmasını ister; oyun bunları karşılıyor.

## Sürüm çıkarırken kontrol listesi
1. `sw.js` içindeki `CACHE='sokakkrali-vXX'` numarasını artır (eski önbellek temizlensin).
2. `package.json` → `version`.
3. Web zip'ini yeniden oluştur, itch.io'da "Upload" ile eski dosyanın yerine koy.
4. Windows için `npm run dist`, `dist/` içindeki yeni exe'leri yükle.

## Önemli
- Parti modu (aynı kodla arkadaş) ve Claude'lu Rıza yalnız claude.ai artifact sayfasında çalışır; kendi sitende/uygulamada Rıza kural tabanlı cevap verir, parti kodu yalnız aynı haritayı üretir. Bunları kendi sunucunla (ör. WebSocket) çalıştırmak ayrı bir iş.
- Three.js yerel kopyası `js/vendor/three.min.js` (MIT lisanslı); internet yoksa bile oyun açılır.
