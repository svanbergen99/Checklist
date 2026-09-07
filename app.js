(()=>{
'use strict';

const state=window.ChecklistState;

function endConversation(){
  state.reset('end-conversation');
  window.VehicleDetection.reset();
  window.ChecklistSpeech.resetProgress();
  const transcript=document.getElementById('transcript');
  if(transcript){
    transcript.textContent=window.ChecklistSpeech.isListening()
      ?'Nieuw gesprek gestart — de microfoon luistert verder.'
      :'Klaar voor een nieuw gesprek.';
  }
  window.ChecklistSpeech.updateUI(window.ChecklistSpeech.isListening()
    ?'Vinkjes reset — luistert verder'
    :'Klaar voor een nieuw gesprek');
  window.scrollTo({top:0,behavior:'smooth'});
}

async function toggleFullscreen(){
  if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
}

function init(){
  window.ChecklistUI.render();
  window.VehicleDetection.reset();
  window.ChecklistUI.sync();
  document.getElementById('listenButton').addEventListener('click',()=>window.ChecklistSpeech.start());
  document.getElementById('endButton').addEventListener('click',endConversation);
  document.getElementById('overlayButton').addEventListener('click',()=>window.ChecklistOverlay.open());
  document.getElementById('fullscreenButton').addEventListener('click',toggleFullscreen);
}

window.ChecklistApp={init,endConversation,toggleFullscreen};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
