// electron.js — Sokak Kralı masaüstü uygulaması: tam ekran pencere, index.html'i yükler, fare kilidi ve ses izinleri açık
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 960, minHeight: 540, backgroundColor: '#0b0d10', fullscreen: true, autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false }
  });
  Menu.setApplicationMenu(null);
  // Önce canlı adres (her zaman son sürüm); internet yoksa paketteki yerel kopya
  const LIVE_URL='https://azmedalab-cmd.github.io/sokak-krali/'; let fellBack=false;
  const fallback=()=>{ if(fellBack) return; fellBack=true; win.loadFile('index.html'); };
  win.webContents.on('did-fail-load',(e,code,desc,url,isMainFrame)=>{ if(isMainFrame && !fellBack) fallback(); });
  win.loadURL(LIVE_URL).catch(fallback);
  // F11: tam ekran aç/kapat
  globalShortcut.register('F11', () => { win.setFullScreen(!win.isFullScreen()); });
  win.webContents.on('before-input-event', (e, input) => { if (input.key === 'F4' && input.alt) app.quit(); });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { app.quit(); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
