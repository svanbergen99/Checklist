(()=>{
'use strict';

const data=window.ChecklistData;
const state=window.ChecklistState;
const root=document.getElementById('checklistRoot');

function itemLabel(item){
  const span=document.createElement('span');
  if(item.html) span.innerHTML=item.html;
  else span.textContent=item.text||item.id;
  return span;
}

function makeRow(item){
  const label=document.createElement('label');
  label.className='checkline';
  label.dataset.checkId=item.id;
  const input=document.createElement('input');
  input.type='checkbox';
  input.id=item.id;
  input.checked=state.getChecked(item.id);
  input.addEventListener('change',()=>state.setChecked(item.id,input.checked,'main-ui'));
  label.append(input,itemLabel(item));
  return label;
}

function render(){
  root.innerHTML='';
  for(const section of data.sections){
    const sectionEl=document.createElement('section');
    sectionEl.className=section.className||'card';
    const heading=document.createElement('h2');
    heading.textContent=section.title;
    sectionEl.appendChild(heading);

    const checks=document.createElement('div');
    checks.className='checks';
    for(const item of section.items||[]) checks.appendChild(makeRow(item));
    sectionEl.appendChild(checks);

    if(section.acceptance){
      const acceptance=document.createElement('div');
      acceptance.className='acceptance-section';
      for(const item of section.acceptance){
        if(item.heading){
          const h=document.createElement('h2');
          h.textContent=item.heading;
          acceptance.appendChild(h);
        }
        const row=makeRow(item);
        acceptance.appendChild(row);

        if(item.answerButtons){
          const answers=document.createElement('div');
          answers.className='answer-buttons';
          answers.id='criminalAnswerButtons';
          answers.innerHTML='<button type="button" id="criminalNo">Nee — vraag klaar</button><button type="button" id="criminalYes">Ja — toon vervolg</button>';
          answers.querySelector('#criminalNo').addEventListener('click',()=>state.setCriminalAnswer(false,'main-ui'));
          answers.querySelector('#criminalYes').addEventListener('click',()=>state.setCriminalAnswer(true,'main-ui'));
          acceptance.appendChild(answers);
        }

        if(item.subcategories){
          const panel=document.createElement('div');
          panel.className='yes-options';
          panel.id='criminalOptions';
          const ol=document.createElement('ol');
          for(const text of item.subcategories){
            const li=document.createElement('li');
            li.textContent=text;
            ol.appendChild(li);
          }
          panel.appendChild(ol);
          acceptance.appendChild(panel);
        }
      }
      sectionEl.appendChild(acceptance);
    }

    root.appendChild(sectionEl);
  }
  sync();
}

function updateVehicleText(){
  const phrase=window.VehicleDetection.phrase();
  const business=document.querySelector('[data-check-id="check_3_1a"] > span');
  const registration=document.querySelector('[data-check-id="check_3_1b"] > span');
  if(business) business.textContent=`Heb je ${phrase} zakelijk gekocht of gefinancierd? Of gebruik je ${phrase} zakelijk?`;
  if(registration) registration.innerHTML=`<strong>Op welke naam staat het kenteken van ${phrase}?</strong>`;
}

function sync(){
  for(const item of data.allItems){
    const row=document.querySelector(`[data-check-id="${item.id}"]`);
    if(!row) continue;
    const input=row.querySelector('input[type="checkbox"]');
    if(input) input.checked=state.getChecked(item.id);
    row.hidden=!state.isVisible(item.id);
  }

  const answer=state.getCriminalAnswer();
  const no=document.getElementById('criminalNo');
  const yes=document.getElementById('criminalYes');
  if(no) no.classList.toggle('selected',answer==='no');
  if(yes) yes.classList.toggle('selected',answer==='yes');
  const options=document.getElementById('criminalOptions');
  if(options) options.hidden=answer!=='yes';
  updateVehicleText();
}

state.bus.addEventListener('change',sync);

window.ChecklistUI={render,sync,updateVehicleText,isVisible:id=>state.isVisible(id)};
})();
