(()=>{
'use strict';

const data=window.ChecklistData;
const state=window.ChecklistState;
let overlayWindow=null;
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

function decorateStrict(container,id){
  if(!data.strictReadingTargets[id]) return;
  const doc=container.ownerDocument;
  const expected=window.ChecklistSpeech.strictTokens(id);
  let index=0;
  const walker=doc.createTreeWalker(container,doc.defaultView.NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const node of nodes){
    const frag=doc.createDocumentFragment();
    for(const part of node.textContent.split(/(\s+)/)){
      if(!part||/^\s+$/.test(part)){frag.appendChild(doc.createTextNode(part));continue;}
      const token=window.ChecklistSpeech.normalizeStrictWord(part);
      if(index<expected.length&&token===expected[index]){
        const span=doc.createElement('span');
        span.className='strict-word';
        span.dataset.strictIndex=String(index++);
        span.textContent=part;
        frag.appendChild(span);
      }else frag.appendChild(doc.createTextNode(part));
    }
    node.replaceWith(frag);
  }
}

function applyStrictProgress(id,progress){
  if(!overlayWindow||overlayWindow.closed) return;
  overlayWindow.document.querySelectorAll(`[data-check-id="${id}"], [data-strict-id="${id}"]`).forEach(target=>{
    target.querySelectorAll('.strict-word').forEach(word=>word.classList.toggle('read',Number(word.dataset.strictIndex)<progress));
  });
}

function renderRows(){
  if(!overlayWindow||overlayWindow.closed) return;
  const doc=overlayWindow.document;
  const list=doc.getElementById('overlayList');
  list.innerHTML='';
  let previous='';

  for(const item of data.allItems){
    const section=sectionFor(item.id);
    if(section!==previous){
      const h=doc.createElement('div');
      h.className='overlay-section';
      h.textContent=section;
      list.appendChild(h);
      previous=section;
    }

    const row=doc.createElement('label');
    row.className='overlay-row';
    row.dataset.checkId=item.id;
    const box=doc.createElement('input');
    box.type='checkbox';
    box.checked=state.getChecked(item.id);
    box.addEventListener('change',()=>state.setChecked(item.id,box.checked,'overlay'));
    const span=doc.createElement('span');
    span.innerHTML=sourceHtml(item);
    decorateStrict(span,item.id);
    row.append(box,span);
    list.appendChild(row);

    if(item.answerButtons){
      const answers=doc.createElement('div');
      answers.className='overlay-answer';
      answers.id='overlayCriminalAnswers';
      answers.innerHTML='<button type="button" data-answer="no">Nee — klaar</button><button type="button" data-answer="yes">Ja — vervolg</button>';
      answers.querySelector('[data-answer="no"]').addEventListener('click',()=>state.setCriminalAnswer(false,'overlay'));
      answers.querySelector('[data-answer="yes"]').addEventListener('click',()=>state.setCriminalAnswer(true,'overlay'));
      list.appendChild(answers);
    }

    if(item.subcategories){
      const panel=doc.createElement('div');
      panel.className='overlay-subcategories';
      panel.id='overlaySubcategories';
      panel.dataset.strictId=item.id;
      const strong=doc.createElement('strong');
      strong.textContent='Lees alle onderstaande subcategorieën voor:';
      const ol=doc.createElement('ol');
      for(const text of item.subcategories){
        const li=doc.createElement('li');
        li.textContent=text;
        ol.appendChild(li);
      }
      panel.append(strong,ol);
      decorateStrict(panel,item.id);
      list.appendChild(panel);
    }
  }
  sync();
}

function sync(){
  if(!overlayWindow||overlayWindow.closed) return;
  const doc=overlayWindow.document;
  const answer=state.getCriminalAnswer();
  let completed=0;

  for(const item of data.allItems){
    if(state.getChecked(item.id)) completed++;
    const row=doc.querySelector(`[data-check-id="${item.id}"]`);
    if(!row) continue;
    row.classList.toggle('checked',state.getChecked(item.id));
    let hidden=!state.isVisible(item.id)||(openOnly&&state.getChecked(item.id));
    if(item.id==='check_3_6'&&answer===null) hidden=false;
    row.classList.toggle('hidden',hidden);
    const box=row.querySelector('input[type="checkbox"]');
    if(box) box.checked=state.getChecked(item.id);
    if(item.vehicleRole){
      const label=row.querySelector(':scope > span');
      if(label) label.innerHTML=sourceHtml(item);
    }
    if(data.strictReadingTargets[item.id]) applyStrictProgress(item.id,window.ChecklistSpeech.currentProgress(item.id));
  }

  doc.querySelectorAll('.overlay-section').forEach(heading=>{
    let next=heading.nextElementSibling;
    let visible=false;
    while(next&&!next.classList.contains('overlay-section')){
      if(next.classList.contains('overlay-row')&&!next.classList.contains('hidden')) visible=true;
      next=next.nextElementSibling;
    }
    heading.hidden=!visible;
  });

  doc.getElementById('overlayEmpty')?.remove();
  if(openOnly&&completed===state.totalCount()){
    const empty=doc.createElement('div');
    empty.id='overlayEmpty';
    empty.className='overlay-empty';
    empty.textContent='✓ Alle controlepunten zijn afgevinkt';
    doc.getElementById('overlayList').appendChild(empty);
  }

  doc.getElementById('overlayProgress').textContent=`${completed}/${state.totalCount()} gereed`;
  const filter=doc.getElementById('overlayFilter');
  if(filter) filter.checked=openOnly;
  const listen=doc.getElementById('overlayListen');
  if(listen){
    listen.classList.toggle('active',window.ChecklistSpeech.isListening());
    listen.disabled=window.ChecklistSpeech.isListening();
    listen.textContent=window.ChecklistSpeech.isListening()?'🎙 Luistert…':'🎙 Meeluisteren';
  }
  const status=doc.getElementById('overlayStatus');
  if(status) status.textContent=window.ChecklistSpeech.status();

  const answers=doc.getElementById('overlayCriminalAnswers');
  if(answers){
    answers.hidden=openOnly&&answer!==null;
    answers.querySelector('[data-answer="no"]').classList.toggle('selected',answer==='no');
    answers.querySelector('[data-answer="yes"]').classList.toggle('selected',answer==='yes');
  }
  const subs=doc.getElementById('overlaySubcategories');
  if(subs) subs.hidden=answer!=='yes'||(openOnly&&state.getChecked('check_3_6_sub'));
}

function build(){
  const doc=overlayWindow.document;
  doc.head.innerHTML='<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Compliance overlay</title>';
  const link=doc.createElement('link');
  link.rel='stylesheet';
  link.href=new URL('overlay.css',window.location.href).href;
  doc.head.appendChild(link);
  doc.body.innerHTML=`<div class="overlay-shell"><header class="overlay-head"><div class="overlay-title"><strong>✓ Compliance</strong><span id="overlayProgress"></span></div><div class="overlay-controls"><button id="overlayListen" type="button">🎙 Meeluisteren</button><button id="overlayEnd" type="button">Einde gesprek</button></div><label class="overlay-filter"><input id="overlayFilter" type="checkbox" checked> Alleen openstaande punten</label><div id="overlayStatus">Microfoon staat uit</div></header><main id="overlayList"></main></div>`;
  doc.getElementById('overlayListen').addEventListener('click',()=>window.ChecklistSpeech.start());
  doc.getElementById('overlayEnd').addEventListener('click',()=>window.ChecklistApp.endConversation());
  doc.getElementById('overlayFilter').addEventListener('change',event=>{openOnly=event.target.checked;sync();});
  renderRows();
}

async function open(){
  const button=document.getElementById('overlayButton');
  if(!('documentPictureInPicture' in window)){
    alert('Deze Edge-versie ondersteunt het zwevende overlayvenster niet. Werk Edge bij en probeer het opnieuw.');
    return;
  }
  if(overlayWindow&&!overlayWindow.closed){overlayWindow.focus();return;}
  try{
    overlayWindow=await window.documentPictureInPicture.requestWindow({width:430,height:720});
    if(button) button.textContent='Overlay geopend';
    build();
    overlayWindow.addEventListener('pagehide',()=>{
      overlayWindow=null;
      if(button) button.textContent='Open overlay';
    },{once:true});
  }catch(_){
    overlayWindow=null;
    if(button) button.textContent='Open overlay';
    alert('De overlay kon niet worden geopend. Controleer of Edge dit bestand toestemming geeft voor Picture-in-Picture.');
  }
}

state.bus.addEventListener('change',sync);
state.bus.addEventListener('listeningchange',sync);
state.bus.addEventListener('strictprogress',event=>applyStrictProgress(event.detail.id,event.detail.progress));

window.ChecklistOverlay={open,sync,isOpen:()=>Boolean(overlayWindow&&!overlayWindow.closed)};
})();
