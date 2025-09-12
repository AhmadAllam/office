(function(){
function n(t){return typeof t==="string"?parseInt(t,10):typeof t==="number"?t:null}
function a(t){return Math.max(0,Math.ceil((t-Date.now())/86400000))}
function b(t){try{return new Date(t).toLocaleString('ar-EG')}catch(e){return String(t)}}
function g(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(h){const r=crypto.getRandomValues(new Uint8Array(1))[0]&15;const v=h==='x'?r:(r&3|8);return v.toString(16)})}
async function r(){try{await initDB()}catch(e){}
const d=Date.now();let s=await getSetting("licensed");s=s===true||s==="true";let i=n(await getSetting("trialStartMs"));let l=n(await getSetting("trialEndMs"));let c=n(await getSetting("lastSeenMs"));let k=await getSetting("installId");if(!k){k=g();try{await setSetting("installId",k)}catch(e){}}let w=await getSetting("licenseKeyHash");if(!i||!l){i=d;l=d+14*86400000;c=d;try{await setSetting("trialStartMs",i)}catch(e){}
try{await setSetting("trialEndMs",l)}catch(e){}
try{await setSetting("lastSeenMs",c)}catch(e){}
}
let o=false;if(!s){if(c&&d+3600000<c){o=true}else if(d>=l){o=true}else{try{await setSetting("lastSeenMs",d)}catch(e){}}}
function u(){if(!/settings\.html$/.test(window.location.pathname))return;const e=document.querySelector('#modal-content .grid');if(!e){setTimeout(u,50);return}let y=document.getElementById('trial-settings-card');if(!y){y=document.createElement('div');y.id='trial-settings-card';y.className='bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit';e.appendChild(y)}
const now=Date.now();const rem=a(l);const total=Math.max(0,Math.ceil((l-(i||now))/86400000));const start=i?b(i):'-';const end=l?b(l):'-';const last=b(c||now);const rollback=!!(c&&now+3600000<c);const expired=!s&&(now>=l);const status=s?'مرخّص':(rollback?'محاولة تغيير الوقت':(expired?'منتهي':'تجريبي'));const color=s?'green':((expired||rollback)?'red':'blue');const icon=s?'ri-shield-check-line':((expired||rollback)?'ri-time-line':'ri-key-line');let html='';html+='<div class="text-center mb-4">';html+='<div class="w-10 h-10 bg-'+color+'-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">';html+='<i class="'+icon+' text-white text-lg"></i>';html+='</div>';html+='<h3 class="text-base font-bold text-'+(s?'green':((expired||rollback)?'red':'blue'))+'-700 mb-1">الترخيص</h3>';html+='<p class="text-sm text-gray-600">'+status+'</p>';html+='</div>';if(!s){
html+='<div class="grid grid-cols-2 gap-2 text-sm">';
html+='<div class="text-gray-600">المتبقي</div><div class="text-gray-800 font-semibold text-left">'+rem+' يوم</div>';
html+='<div class="text-gray-600">مرخّص</div><div class="text-gray-800 font-semibold text-left">لا</div>';
html+='</div>';
html+='<div class="mt-3"><button id="trial-activate-settings" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md"><i class="ri-check-line text-lg"></i>تفعيل</button><div id="activation-status" class="text-xs text-center mt-2 text-gray-600"></div></div>';
} else {
html+='<div class="grid grid-cols-2 gap-2 text-sm">';
html+='<div class="text-gray-600">مرخّص</div><div class="text-gray-800 font-semibold text-left">نعم</div>';
html+='</div>';
}
y.innerHTML=html;const btn=document.getElementById('trial-activate-settings');if(btn)btn.addEventListener('click',p)
}
function f(){let e=document.getElementById("trial-expired-overlay");if(e)return;e=document.createElement("div");e.id="trial-expired-overlay";e.className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90";e.innerHTML='<div class="w-[95vw] max-w-sm bg-white rounded-lg p-6 flex flex-col items-center gap-4"><div class="text-gray-800 text-base">انتهت الفترة التجريبية</div><button id="trial-activate-overlay" class="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-base">تفعيل</button></div>';
try{document.body.appendChild(e);document.body.style.overflow="hidden"}catch(h){}
const y=document.getElementById("trial-activate-overlay");if(y)y.addEventListener("click",p)
}
async function p(){
  try{
    let statusEl=document.getElementById("activation-status");
    if(!statusEl){
      const btn0=document.getElementById("trial-activate-settings")||document.getElementById("trial-activate-overlay");
      if(btn0){ btn0.insertAdjacentHTML("afterend", '<div id="activation-status" class="text-xs text-center mt-2 text-gray-600"></div>'); statusEl=document.getElementById("activation-status"); }
    }
    const setStatus=(t,cls)=>{ if(!statusEl) return; statusEl.textContent=t; statusEl.className="text-xs text-center mt-2 "+(cls||"text-gray-600"); };
    const btn=document.getElementById("trial-activate-settings")||document.getElementById("trial-activate-overlay");
    if(btn){ 
      btn.disabled=true; 
      btn.style.opacity="0.7"; 
      btn.innerHTML='<i class="ri-loader-4-line text-lg animate-spin"></i>جاري التفعيل...';
    }
    
    setStatus("جاري التفعيل...","text-blue-600");

    const now = new Date();
    const timestamp = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0') + 
                     now.getHours().toString().padStart(2, '0') + 
                     now.getMinutes().toString().padStart(2, '0') + 
                     now.getSeconds().toString().padStart(2, '0');

    let content1, content2;
    
    const fetchWithMultipleProxies = async (url) => {
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ];
      
      for (let i = 0; i < proxies.length; i++) {
        try {
          setStatus("جاري التفعيل...", "text-blue-600");
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(proxies[i], {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const data = await response.text();
          
          if (i === 0) {
            const json = JSON.parse(data);
            return json.contents;
          } else if (i === 1) {
            return data;
          } else if (i === 2) {
            return data;
          } else if (i === 3) {
            const json = JSON.parse(data);
            return json.data;
          }
          
        } catch (e) {
          setStatus("جاري التفعيل...", "text-blue-600");
          if (i === proxies.length - 1) {
            throw new Error("فشل في التفعيل");
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    
    if (typeof require !== 'undefined') {
      const https = require('https');
      
      const fetchUrl = (url) => {
        return new Promise((resolve, reject) => {
          https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
      };
      
      try {
        setStatus("جاري التفعيل...", "text-blue-600");
        content1 = await fetchUrl("https://pastebin.com/raw/T56CDsSQ?" + timestamp);
      } catch(e) {
        throw new Error("فشل في التفعيل");
      }
      
      try {
        setStatus("جاري التفعيل...", "text-blue-600");
        content2 = await fetchUrl("https://pastebin.com/raw/VHYibtS8?" + timestamp);
      } catch(e) {
        throw new Error("فشل في التفعيل");
      }
    } else {
      try {
        content1 = await fetchWithMultipleProxies("https://pastebin.com/raw/T56CDsSQ?" + timestamp);
      } catch(e) {
        throw new Error("فشل في التفعيل");
      }
      
      try {
        content2 = await fetchWithMultipleProxies("https://pastebin.com/raw/VHYibtS8?" + timestamp);
      } catch(e) {
        throw new Error("فشل في التفعيل");
      }
    }

    if(content1 === content2 && content1.length > 0) {
      setStatus("تم التفعيل بنجاح! ✅","text-green-600");
      if(btn){ btn.innerHTML='<i class="ri-check-line text-lg"></i>تم التفعيل'; }
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try{ await setSetting("licensed",true);}catch(_){ }
      try{ await setSetting("licenseKeyHash","activated");}catch(_){ }
      s=true; w="activated";
      const y=document.getElementById("trial-expired-overlay"); if(y){ try{ y.remove(); document.body.style.overflow=""; }catch(_){ } }
      if(typeof showToast==="function") try{ showToast("تم التفعيل بنجاح!","success"); }catch(_){}
      u();
    } else {
      setStatus("فشل في التفعيل ❌","text-red-600");
      if(btn){ btn.innerHTML='<i class="ri-check-line text-lg"></i>تفعيل'; }
      if(typeof showToast==="function") try{ showToast("فشل في التفعيل","error"); }catch(_){}
    }
    
    if(btn){ btn.disabled=false; btn.style.opacity=""; }
  }catch(err){
    const statusEl2=document.getElementById("activation-status");
    if(statusEl2){ statusEl2.textContent="فشل في التفعيل ❌"; statusEl2.className="text-xs text-center mt-2 text-red-600"; }
    if(typeof showToast==="function") try{ showToast("فشل في التفعيل","error"); }catch(_){}
    const btn=document.getElementById("trial-activate-settings")||document.getElementById("trial-activate-overlay");
    if(btn){ 
      btn.innerHTML='<i class="ri-check-line text-lg"></i>تفعيل';
      btn.disabled=false; 
      btn.style.opacity=""; 
    }
  }
}
if(!s)u();if(o&&!s)f();if(s)u()}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",r)}else{r()}
})();