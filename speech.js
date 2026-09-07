(()=>{
'use strict';

const data=window.ChecklistData;
const state=window.ChecklistState;
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;
let isListening=false;
const strictWordProgress={};
const strictPreviewProgress={};

const listenButton=document.getElementById('listenButton');
const listenStatus=document.getElementById('listenStatus');
const transcript=document.getElementById('transcript');

function normalizeSpeech(text){
  return String(text||'').toLocaleLowerCase('nl-NL').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function normalizeStrictWord(word){
  const normalized=normalizeSpeech(word);
  const numbers={een:'1',vijf:'5',acht:'8'};
  const polite={je:'u_vorm',jij:'u_vorm',jou:'u_vorm',jouw:'u_vorm',u:'u_vorm',uw:'u_vorm',bent:'ben',heeft:'heb',hoeft:'hoef',wil:'wilt',bekijken:'kijken',we:'wij'};
  return numbers[normalized]||polite[normalized]||normalized;
}

function strictTokens(id){
  return String(data.strictReadingTargets[id]||'').split(/\s+/).filter(Boolean).map(normalizeStrictWord).filter(Boolean);
}

function strictSpokenTokens(text){
  return normalizeSpeech(text)
    .replace(/\bbetalen\s+(?:we|wij)\s+de\s+schade\s+niet\b/g,'betalen wij je schade niet')
    .replace(/\bverkeers\s*product(?:en)?\b/g,'verkeersproducten')
    .replace(/\bvaar\s+bevoegdheid\b/g,'vaarbevoegdheid')
    .replace(/\brij\s+bevoegdheid\b/g,'rijbevoegdheid')
    .split(/\s+/).filter(Boolean).map(normalizeStrictWord);
}

function calculateStrictProgress(id,text,startProgress){
  const expected=strictTokens(id);
  const spoken=strictSpokenTokens(text);
  let progress=startProgress||0;
  for(const word of spoken){
    const maySkip=id==='check_3_6'&&expected[progress-1]==='verdachte'&&expected[progress]==='het'&&expected[progress+1]==='gaat'&&expected[progress+2]==='om'&&word===expected[progress+3];
    if(maySkip) progress+=3;
    if(progress<expected.length&&word===expected[progress]) progress++;
  }
  return progress;
}

function emitProgress(id,progress){
  state.bus.dispatchEvent(new CustomEvent('strictprogress',{detail:{id,progress,total:strictTokens(id).length}}));
}

function processStrict(id,text){
  const expected=strictTokens(id);
  const progress=calculateStrictProgress(id,text,strictWordProgress[id]||0);
  strictWordProgress[id]=progress;
  strictPreviewProgress[id]=progress;
  emitProgress(id,progress);
  if(progress>=expected.length&&expected.length){
    state.setChecked(id,true,'speech-strict');
  }
}

function previewStrict(text){
  const active=data.allItems.find(item=>item.id.startsWith('check_3_')&&!state.getChecked(item.id)&&state.isVisible(item.id));
  if(!active||!data.strictReadingTargets[active.id]) return;
  const preview=calculateStrictProgress(active.id,text,strictWordProgress[active.id]||0);
  strictPreviewProgress[active.id]=Math.max(strictPreviewProgress[active.id]||0,preview);
  emitProgress(active.id,strictPreviewProgress[active.id]);
}

function hasAny(text,values){return values.some(value=>text.includes(value));}

const flexibleMatchers={
  check_2_0:text=>hasAny(text,['e mail adres','email adres','emailadres','e mailadres','mail adres','mailadres']),
  check_2_4:text=>hasAny(text,['communicatiewijze','communicatie wijze','communicatievoorkeur','communicatie voorkeur'])&&hasAny(text,['post','digitaal']),
  check_3_0:text=>text.includes('premie')&&hasAny(text,['automatisch','beoordelen','besluitvorming']),
  check_3_1:text=>text.includes('premie')&&hasAny(text,['exacte','totaal','totale']),
  check_3_1a:text=>text.includes('zakelijk')&&hasAny(text,['gekocht','gefinancierd','gebruik','gebruikt']),
  check_3_1b:text=>text.includes('kenteken')&&hasAny(text,['welke naam','op naam','naam staat']),
  check_3_2:text=>text.includes('voorwaarden')&&hasAny(text,['digitaal','niet via de post','niet per post']),
  check_3_3:text=>text.includes('toestemming')&&hasAny(text,['afschrijven','af te schrijven','rekening']),
  check_3_4:text=>hasAny(text,['eerlijk','volledig'])&&hasAny(text,['schade niet','verzekering stoppen']),
  check_3_5:text=>text.includes('zelf')&&text.includes('verzeker')&&hasAny(text,['opgezegd','op gezegd','opzegde']),
  check_3_6:text=>hasAny(text,['uitvoering','uitvoeren','uitvoer'])&&hasAny(text,['straf','maatregel']),
  check_3_6_sub:text=>hasAny(text,['fraude en cybercriminaliteit','fraude of cybercriminaliteit','cyber criminaliteit']),
  check_3_7:text=>hasAny(text,['schade gemeld','schades gemeld','schademelding'])&&text.includes('verzeker')
};

function detectCommunicationMode(text){
  const normalized=normalizeSpeech(text);
  const post=/\bpost\b/.test(normalized);
  const digital=/\bdigitaal\b/.test(normalized);
  if(post&&!digital) return 'post';
  if(digital&&!post) return 'digital';
  return null;
}

function matchItem(id,text,normalized){
  const phrases=data.speechRules[id]||[];
  const communicationMode=id==='check_2_4'?detectCommunicationMode(text):null;
  const exact=id==='check_2_4'?communicationMode!==null:phrases.some(phrase=>normalized.includes(normalizeSpeech(phrase)));
  const flexible=id==='check_2_4'?false:Boolean(flexibleMatchers[id]?.(normalized));
  return {matched:exact||flexible,communicationMode};
}

function complete(id,communicationMode){
  if(communicationMode) state.setCommunicationMode(communicationMode,'speech');
  state.setChecked(id,true,'speech');
  const row=document.querySelector(`[data-check-id="${id}"]`);
  row?.animate([{transform:'scale(1)'},{transform:'scale(1.025)'},{transform:'scale(1)'}],{duration:420});
}

function processSpeech(text){
  const normalized=normalizeSpeech(text);
  const free=data.allItems.filter(item=>/^check_[12]_/.test(item.id)&&!state.getChecked(item.id)&&state.isVisible(item.id));
  if(free.length){
    for(const item of free){
      const match=matchItem(item.id,text,normalized);
      if(match.matched) complete(item.id,match.communicationMode);
    }
    return;
  }

  const active=data.allItems.find(item=>item.id.startsWith('check_3_')&&!state.getChecked(item.id)&&state.isVisible(item.id));
  if(!active) return;
  if(data.strictReadingTargets[active.id]){
    processStrict(active.id,text);
    return;
  }
  const match=matchItem(active.id,text,normalized);
  if(match.matched) complete(active.id,match.communicationMode);
}

function processAcceptanceAnswer(text){
  if(!state.getChecked('check_3_6')||state.getCriminalAnswer()!==null) return;
  const normalized=normalizeSpeech(text);
  const yes=/^(ja|ja hoor|jazeker)\b/.test(normalized)||/\b(ja|ja hoor|jazeker)$/.test(normalized);
  const no=/^(nee|nee hoor)\b/.test(normalized)||/\b(nee|nee hoor)$/.test(normalized);
  if(yes&&!no) state.setCriminalAnswer(true,'speech-answer');
  if(no&&!yes) state.setCriminalAnswer(false,'speech-answer');
}

function setupRecognition(){
  if(!SpeechRecognition) return false;
  recognition=new SpeechRecognition();
  recognition.lang='nl-NL';
  recognition.continuous=true;
  recognition.interimResults=true;
  recognition.onresult=event=>{
    let finalText='';
    let interimText='';
    for(let i=event.resultIndex;i<event.results.length;i++){
      const words=event.results[i][0].transcript;
      if(event.results[i].isFinal) finalText+=words+' ';
      else interimText+=words;
    }
    const heard=(finalText||interimText).trim();
    if(heard) transcript.textContent=heard;
    if(finalText.trim()){
      window.VehicleDetection.updateFromSpeech(finalText);
      processSpeech(finalText);
      window.VehicleDetection.updateFromSpeech(finalText);
      processAcceptanceAnswer(finalText);
    }
    if(interimText.trim()){
      window.VehicleDetection.updateFromSpeech(interimText);
      previewStrict(interimText);
    }
  };
  recognition.onerror=event=>{
    if(event.error==='not-allowed'){
      isListening=false;
      updateUI('Microfoontoegang geweigerd');
    }else if(event.error!=='no-speech'){
      listenStatus.textContent='Fout: '+event.error;
      emitListening();
    }
  };
  recognition.onend=()=>{
    if(isListening){try{recognition.start();}catch(_){}}
  };
  return true;
}

function emitListening(){
  state.bus.dispatchEvent(new CustomEvent('listeningchange',{detail:{isListening,status:listenStatus.textContent}}));
}

function updateUI(message){
  document.querySelector('.speech-panel')?.classList.toggle('listening',isListening);
  listenButton?.classList.toggle('listening',isListening);
  if(listenButton){
    listenButton.disabled=isListening;
    listenButton.textContent=isListening?'🎙 Meeluisteren actief':'🎙 Start meeluisteren';
  }
  if(listenStatus) listenStatus.textContent=message||(isListening?'Luistert…':'Microfoon staat uit');
  emitListening();
}

async function start(){
  if(!recognition&&!setupRecognition()){
    if(listenStatus) listenStatus.textContent='Spraakherkenning wordt niet ondersteund in deze browser';
    emitListening();
    return;
  }
  if(isListening) return;
  isListening=true;
  if(transcript) transcript.textContent='Luisteren gestart… spreek een controlepunt uit.';
  updateUI();
  try{recognition.start();}
  catch(_){isListening=false;updateUI('Kon de microfoon niet starten');}
}

function resetProgress(){
  for(const key of Object.keys(strictWordProgress)) delete strictWordProgress[key];
  for(const key of Object.keys(strictPreviewProgress)) delete strictPreviewProgress[key];
  for(const id of Object.keys(data.strictReadingTargets)) emitProgress(id,0);
}

state.bus.addEventListener('checkchange',event=>{
  const {id,value}=event.detail;
  if(!value&&data.strictReadingTargets[id]){
    strictWordProgress[id]=0;
    strictPreviewProgress[id]=0;
    emitProgress(id,0);
  }
});
state.bus.addEventListener('reset',resetProgress);

window.ChecklistSpeech={
  start,
  isListening:()=>isListening,
  status:()=>listenStatus?.textContent||'',
  resetProgress,
  normalizeSpeech,
  normalizeStrictWord,
  strictTokens,
  currentProgress:id=>strictPreviewProgress[id]||strictWordProgress[id]||0,
  calculateStrictProgress,
  updateUI
};
})();
