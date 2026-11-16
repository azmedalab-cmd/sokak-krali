// build-www.js — Capacitor için web dosyalarını www/ klasörüne kopyalar (node build-www.js)
const fs=require('fs'), path=require('path');
const root=__dirname, out=path.join(root,'www');
fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
for(const f of ['index.html','manifest.json','sw.js','icon-192.png','icon-512.png']) fs.copyFileSync(path.join(root,f),path.join(out,f));
fs.cpSync(path.join(root,'js'),path.join(out,'js'),{recursive:true});
console.log('www/ hazır:',fs.readdirSync(out).join(', '));
