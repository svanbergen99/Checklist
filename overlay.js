(()=>{
'use strict';

const data=window.ChecklistData;
const state=window.ChecklistState;
let overlayWindow=null;
let overlayFrame=null;
let openOnly=true;

function sectionFor(id){
  if(id.startsWith('check_1_')) return 'Stap 1 · Klant identificeren';
  if(id.startsWith('check_2_')) return 'Stap 2 · Contact en betalen';
  return 'Stap 3 · Aanvraag en afronding';
}

function sourceHtml(item){
  const source=document.querySelector(`[data-check-id="${item.id}"] > span`);
  if(source) return source.innerHTML;
  return item.html||item.text||item.id;
}

function strictTokens(id){
  if(!data.strictReadingTargets[id]) return [];
  return window.ChecklistSpeech.strictTokens(id);
}

function makeSnapshot(){
  const answer=state.getCriminalAnswer();
  const items=data.allItems.map(item=>{
    const checked=state.getChecked(item.id);
    let hidden=!state.isVisible(item.id)||(openOnly&&checked);
    if(item.id==='check_3_6'&&answer===null) hidden=false;
    return {
      id:item.id,
      section:sectionFor(item.id),
      html:sourceHtml(item),
      checked,
      hidden,
      answerButtons:Boolean(item.answerButtons),
      answerHidden:Boolean(item.answerButtons&&openOnly&&answer!==null),
      subcategories:item.subcategories||null,
      subcategoriesHidden:Boolean(item.subcategories&&(answer!=='yes'||(openOnly&&checked))),
      strictTokens:strictTokens(item.id),
      strictProgress:data.strictReadingTargets[item.id]?window.ChecklistSpeech.currentProgress(item.id):0
    };
  });

  return {
    completed:data.allItems.filter(item=>state.getChecked(item.id)).length,
    total:state.totalCount(),
    openOnly,
    criminalAnswer:answer,
    listening:window.ChecklistSpeech.isListening(),
    status:window.ChecklistSpeech.status(),
    items
  };
}

function sendSnapshot(){
  if(!overlayFrame||!overlayFrame.contentWindow) return;
  overlayFrame.contentWindow.postMessage({
    source:'checklist-overlay-host',
    type:'snapshot',
    data:makeSnapshot()
  },location.origin);
}

function handleAction(message){
  if(message?.source!=='checklist-overlay-frame') return;

  if(message.action==='ready'){
    sendSnapshot();
    return;
  }
  if(message.action==='setChecked'){
    state.setChecked(message.id,Boolean(message.checked),'overlay-iframe');
    return;
  }
  if(message.action==='criminalAnswer'){
    state.setCriminalAnswer(Boolean(message.answer),'overlay-iframe');
    return;
  }
  if(message.action==='setOpenOnly'){
    openOnly=Boolean(message.value);
    sendSnapshot();
    return;
  }
  if(message.action==='startListening'){
    window.ChecklistSpeech.start();
    return;
  }
  if(message.action==='endConversation'){
    window.ChecklistApp.endConversation();
  }
}

function handleFrameMessage(event){
  if(!overlayFrame||event.source!==overlayFrame.contentWindow||event.origin!==location.origin) return;
  handleAction(event.data);
}

function buildFrame(){
  if(!overlayWindow||overlayWindow.closed) return;
  const doc=overlayWindow.document;
  doc.head.innerHTML='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compliance overlay</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}iframe{width:100%;height:100%;border:0;display:block;background:transparent}</style>';
  doc.body.innerHTML='';
  overlayFrame=doc.createElement('iframe');
  overlayFrame.title='Compliance overlay';
  overlayFrame.allow='microphone';
  overlayFrame.src=new URL('overlay-frame.html?v=1',window.location.href).href;
  overlayFrame.addEventListener('load',()=>{
    try{
      overlayFrame.contentWindow.ChecklistOverlayBridge={action:handleAction};
      sendSnapshot();
    }catch(_){ }
  });
  doc.body.append(overlayFrame);
  overlayWindow.addEventListener('message',handleFrameMessage);
}

async function open(){
  const button=document.getElementById('overlayButton');
  if(!('documentPictureInPicture' in window)){
    alert('Deze Edge-versie ondersteunt het zwevende overlayvenster niet. Werk Edge bij en probeer het opnieuw.');
    return;
  }
  if(overlayWindow&&!overlayWindow.closed){
    overlayWindow.focus();
    return;
  }

  try{
    overlayWindow=await window.documentPictureInPicture.requestWindow({width:460,height:720});
    if(button) button.textContent='Overlay geopend';
    buildFrame();
    overlayWindow.addEventListener('pagehide',()=>{
      try{overlayWindow?.removeEventListener('message',handleFrameMessage);}catch(_){ }
      overlayFrame=null;
      overlayWindow=null;
      if(button) button.textContent='Open overlay';
    },{once:true});
  }catch(_){
    overlayFrame=null;
    overlayWindow=null;
    if(button) button.textContent='Open overlay';
    alert('De overlay kon niet worden geopend. Controleer of Edge dit bestand toestemming geeft voor Picture-in-Picture.');
  }
}

state.bus.addEventListener('change',sendSnapshot);
state.bus.addEventListener('listeningchange',sendSnapshot);
state.bus.addEventListener('strictprogress',sendSnapshot);

window.ChecklistOverlay={
  open,
  sync:sendSnapshot,
  isOpen:()=>Boolean(overlayWindow&&!overlayWindow.closed)
};
})();
