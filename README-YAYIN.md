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

Oyun klavye ve fare ister; mağazaya koymadan önce sanal joystick + ateş/nişan düğmeleri eklenmeli. O eklendikten sonra:
- **Android**: Capacitor (`npm i @capacitor/core @capacitor/cli`, `npx cap init`, `npx cap add android`, Android Studio ile APK/AAB) → Google Play Console (tek seferlik 25 $).
- **iOS**: aynı Capacitor projesi, Mac + Xcode + Apple Developer (yıllık 99 $).

---

## Sürüm çıkarırken kontrol listesi
1. `sw.js` içindeki `CACHE='sokakkrali-vXX'` numarasını artır (eski önbellek temizlensin).
2. `package.json` → `version`.
3. Web zip'ini yeniden oluştur, itch.io'da "Upload" ile eski dosyanın yerine koy.
4. Windows için `npm run dist`, `dist/` içindeki yeni exe'leri yükle.

## Önemli
- Parti modu (aynı kodla arkadaş) ve Claude'lu Rıza yalnız claude.ai artifact sayfasında çalışır; kendi sitende/uygulamada Rıza kural tabanlı cevap verir, parti kodu yalnız aynı haritayı üretir. Bunları kendi sunucunla (ör. WebSocket) çalıştırmak ayrı bir iş.
- Three.js yerel kopyası `js/vendor/three.min.js` (MIT lisanslı); internet yoksa bile oyun açılır.
