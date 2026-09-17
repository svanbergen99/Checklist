(()=>{
'use strict';

const STORAGE_KEY='checklist-pause-timer-v1';
let pipWindow=null;
let popupWindow=null;
let ticker=null;

function todayKey(){
  const now=new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved||saved.date!==todayKey()) return null;
    return saved;
  }catch(_){
    return null;
  }
}

function liveRemaining(state){
  if(!state) return null;
  const running=state.runningSince?Math.max(0,(Date.now()-Number(state.runningSince))/1000):0;
  const used=(Number(state.usedSeconds)||0)+running;
  return Math.max(0,(Number(state.budgetSeconds)||0)-used);
}

function formatTime(seconds){
  const safe=Math.max(0,Math.floor(Number(seconds)||0));
  const minutes=Math.floor(safe/60);
  const secs=safe%60;
  return `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function updateButton(){
  const button=document.getElementById('pauseTimerButton');
  if(!button) return;
  const state=loadState();
  const running=Boolean(state&&state.runningSince);
  button.textContent=running?`⏱ Pauze ${formatTime(liveRemaining(state))}`:'⏱ Pauzetimer';
  button.classList.toggle('running',running);
}

function buildPipFrame(){
  if(!pipWindow||pipWindow.closed) return;
  const doc=pipWindow.document;
  doc.head.innerHTML='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pauzetimer</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fffaf0}iframe{width:100%;height:100%;border:0;display:block}</style>';
  doc.body.innerHTML='';
  const frame=doc.createElement('iframe');
  frame.title='Pauzetimer';
  frame.src=new URL('pause-timer-window.html?v=2',window.location.href).href;
  doc.body.append(frame);
}

function openFallbackPopup(){
  if(popupWindow&&!popupWindow.closed){
    popupWindow.focus();
    return;
  }
  popupWindow=window.open(
    new URL('pause-timer-window.html?v=2',window.location.href).href,
    'checklist-pause-timer',
    'popup=yes,width=430,height=700,resizable=yes,scrollbars=yes'
  );
  if(!popupWindow){
    alert('De pauzetimer-pop-up is geblokkeerd. Sta pop-ups toe voor deze pagina en probeer opnieuw.');
  }
}

async function open(){
  if(pipWindow&&!pipWindow.closed){
    pipWindow.focus();
    return;
  }
  if(popupWindow&&!popupWindow.closed){
    popupWindow.focus();
    return;
  }

  if('documentPictureInPicture' in window){
    try{
      pipWindow=await window.documentPictureInPicture.requestWindow({width:430,height:700});
      buildPipFrame();
      pipWindow.addEventListener('pagehide',()=>{pipWindow=null;},{once:true});
      return;
    }catch(_){
      pipWindow=null;
    }
  }

  openFallbackPopup();
}

function init(){
  const button=document.getElementById('pauseTimerButton');
  if(button) button.addEventListener('click',open);
  updateButton();
  ticker=setInterval(updateButton,500);
  window.addEventListener('storage',event=>{
    if(event.key===STORAGE_KEY) updateButton();
  });
  window.addEventListener('pagehide',()=>{
    if(ticker) clearInterval(ticker);
  },{once:true});
}

window.ChecklistPauseTimer={open};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
