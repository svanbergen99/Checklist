(()=>{
'use strict';

const list=document.getElementById('overlayList');
const progress=document.getElementById('overlayProgress');
const status=document.getElementById('overlayStatus');
const listen=document.getElementById('overlayListen');
const end=document.getElementById('overlayEnd');
const filter=document.getElementById('overlayFilter');

function send(action,payload={}){
  const message={source:'checklist-overlay-frame',action,...payload};
  if(window.ChecklistOverlayBridge?.action){
    window.ChecklistOverlayBridge.action(message);
    return;
  }
  parent.postMessage(message,location.origin);
}

function normalizeStrictWord(value){
  const normalized=String(value||'').toLocaleLowerCase('nl-NL').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const numbers={een:'1',vijf:'5',acht:'8'};
  const polite={je:'u_vorm',jij:'u_vorm',jou:'u_vorm',jouw:'u_vorm',u:'u_vorm',uw:'u_vorm',bent:'ben',heeft:'heb',hoeft:'hoef',wil:'wilt',bekijken:'kijken',we:'wij'};
  return numbers[normalized]||polite[normalized]||normalized;
}

function applyStrictMarkup(container,tokens,progressValue){
  if(!Array.isArray(tokens)||!tokens.length) return;
  const expected=tokens;
  let expectedIndex=0;
  const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);

  for(const node of nodes){
    const frag=document.createDocumentFragment();
    for(const part of node.textContent.split(/(\s+)/)){
      if(!part||/^\s+$/.test(part)){
        frag.append(document.createTextNode(part));
        continue;
      }
      const normalized=normalizeStrictWord(part);
      const expectedNormalized=String(expected[expectedIndex]||'');
      if(expectedIndex<expected.length&&normalized&&normalized===expectedNormalized){
        const word=document.createElement('span');
        word.className='strict-word';
        if(expectedIndex<Number(progressValue||0)) word.classList.add('read');
        word.textContent=part;
        frag.append(word);
        expectedIndex++;
      }else{
        frag.append(document.createTextNode(part));
      }
    }
    node.replaceWith(frag);
  }
}

function rowFor(item){
  const row=document.createElement('label');
  row.className='overlay-row';
  row.dataset.checkId=item.id;

  const box=document.createElement('input');
  box.type='checkbox';
  box.checked=Boolean(item.checked);
  box.addEventListener('change',()=>send('setChecked',{id:item.id,checked:box.checked}));

  const text=document.createElement('span');
  text.className='overlay-text';
  text.innerHTML=item.html||item.text||item.id;
  applyStrictMarkup(text,item.strictTokens,item.strictProgress);

  row.append(box,text);
  if(item.checked) row.classList.add('checked');
  if(item.hidden) row.hidden=true;
  return row;
}

function sectionHeading(text){
  const heading=document.createElement('div');
  heading.className='overlay-section';
  heading.textContent=text;
  return heading;
}

function answerPanel(answer,hidden){
  const panel=document.createElement('div');
  panel.className='overlay-answer';
  panel.hidden=hidden;
  panel.innerHTML='<button type="button" data-answer="no">Nee — klaar</button><button type="button" data-answer="yes">Ja — vervolg</button>';
  panel.querySelector('[data-answer="no"]').classList.toggle('selected',answer==='no');
  panel.querySelector('[data-answer="yes"]').classList.toggle('selected',answer==='yes');
  panel.querySelector('[data-answer="no"]').addEventListener('click',()=>send('criminalAnswer',{answer:false}));
  panel.querySelector('[data-answer="yes"]').addEventListener('click',()=>send('criminalAnswer',{answer:true}));
  return panel;
}

function subcategoriesPanel(item){
  const panel=document.createElement('div');
  panel.className='overlay-subcategories';
  panel.hidden=Boolean(item.subcategoriesHidden);
  const strong=document.createElement('strong');
  strong.textContent='Lees alle onderstaande subcategorieën voor:';
  const ol=document.createElement('ol');
  for(const value of item.subcategories||[]){
    const li=document.createElement('li');
    li.textContent=value;
    ol.append(li);
  }
  panel.append(strong,ol);
  return panel;
}

function render(data){
  document.documentElement.classList.toggle('listening',Boolean(data.listening));
  progress.textContent=`${data.completed}/${data.total} gereed`;
  status.textContent=data.status||'Microfoon staat uit';
  listen.disabled=Boolean(data.listening);
  listen.classList.toggle('active',Boolean(data.listening));
  listen.textContent=data.listening?'🎙 Luistert…':'🎙 Meeluisteren';
  filter.checked=Boolean(data.openOnly);

  list.innerHTML='';
  let previous='';
  let visibleRows=0;

  for(const item of data.items||[]){
    if(item.section!==previous){
      list.append(sectionHeading(item.section));
      previous=item.section;
    }
    const row=rowFor(item);
    list.append(row);
    if(!item.hidden) visibleRows++;

    if(item.answerButtons){
      list.append(answerPanel(data.criminalAnswer,Boolean(item.answerHidden)));
    }
    if(item.subcategories){
      list.append(subcategoriesPanel(item));
    }
  }

  for(const heading of list.querySelectorAll('.overlay-section')){
    let next=heading.nextElementSibling;
    let hasVisible=false;
    while(next&&!next.classList.contains('overlay-section')){
      if(next.classList.contains('overlay-row')&&!next.hidden) hasVisible=true;
      next=next.nextElementSibling;
    }
    heading.hidden=!hasVisible;
  }

  if(!visibleRows){
    const empty=document.createElement('div');
    empty.className='overlay-empty';
    empty.textContent='✓ Alle controlepunten zijn afgevinkt';
    list.append(empty);
  }
}

window.addEventListener('message',event=>{
  if(event.origin!==location.origin) return;
  const message=event.data;
  if(message?.source!=='checklist-overlay-host'||message.type!=='snapshot') return;
  render(message.data||{});
});

listen.addEventListener('click',()=>send('startListening'));
end.addEventListener('click',()=>send('endConversation'));
filter.addEventListener('change',()=>send('setOpenOnly',{value:filter.checked}));

send('ready');
})();
