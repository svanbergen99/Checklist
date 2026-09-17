(()=>{
'use strict';

const RATE=0.072;
const STORAGE_KEY='checklist-pause-timer-v1';
let selectedWorkHours=null;
let state=null;
let ticker=null;

const $=id=>document.getElementById(id);

function todayKey(){
  const now=new Date();
  const year=now.getFullYear();
  const month=String(now.getMonth()+1).padStart(2,'0');
  const day=String(now.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}

function calculateBudgetSeconds(hours){
  return Math.round(hours*60*60*RATE);
}

function formatTime(seconds){
  const safe=Math.max(0,Math.floor(seconds));
  const minutes=Math.floor(safe/60);
  const secs=safe%60;
  return `${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

function formatHours(hours){
  return `${String(hours).replace('.',',')} uur`;
}

function loadState(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(!saved||saved.date!==todayKey()) return null;
    if(!(saved.workHours>0)||!(saved.budgetSeconds>0)) return null;
    return {
      date:saved.date,
      workHours:Number(saved.workHours),
      budgetSeconds:Number(saved.budgetSeconds),
      usedSeconds:Math.max(0,Number(saved.usedSeconds)||0),
      runningSince:saved.runningSince?Number(saved.runningSince):null
    };
  }catch(_error){
    return null;
  }
}

function saveState(){
  if(!state) return;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}

function liveUsedSeconds(){
  if(!state) return 0;
  const running=state.runningSince?Math.max(0,(Date.now()-state.runningSince)/1000):0;
  return state.usedSeconds+running;
}

function setSelectedHours(hours,sourceButton=null){
  selectedWorkHours=hours>0?hours:null;
  document.querySelectorAll('[data-work-hours]').forEach(button=>button.classList.toggle('selected',button===sourceButton));
  $('pauseBudgetPreview').textContent=selectedWorkHours?formatTime(calculateBudgetSeconds(selectedWorkHours)):'--:--';
  $('openPauseCockpit').disabled=!selectedWorkHours;
}

function showSetup(){
  $('pauseSetup').hidden=false;
  $('pauseCockpit').hidden=true;
  selectedWorkHours=null;
  $('customWorkHours').value='';
  setSelectedHours(null);
}

function showCockpit(){
  $('pauseSetup').hidden=true;
  $('pauseCockpit').hidden=false;
  render();
}

function render(){
  if(!state) return;
  const used=liveUsedSeconds();
  const remaining=Math.max(0,state.budgetSeconds-used);
  const running=Boolean(state.runningSince);
  const overBudget=used>=state.budgetSeconds;

  $('pauseRemaining').textContent=formatTime(remaining);
  $('pauseUsed').textContent=formatTime(used);
  $('pauseBudget').textContent=formatTime(state.budgetSeconds);
  $('pauseWorkday').textContent=formatHours(state.workHours);
  $('pauseStateLabel').textContent=overBudget
    ?'Pauzetijd voor vandaag opgebruikt'
    :running?'Pauze loopt':'Klaar voor je pauze';
  $('pauseStartStop').textContent=running?'Stop pauze':'Start pauze';
  $('pauseStartStop').classList.toggle('running',running);
  $('pauseCockpit').classList.toggle('over-budget',overBudget);

  const button=$('pauseTimerButton');
  if(button){
    button.textContent=running?`⏱ Pauze ${formatTime(remaining)}`:'⏱ Pauzetimer';
    button.classList.toggle('running',running);
  }
}

function startTicker(){
  if(ticker) return;
  ticker=setInterval(render,250);
}

function openModal(){
  const modal=$('pauseTimerModal');
  modal.hidden=false;
  document.body.style.overflow='hidden';
  state=loadState();
  if(state) showCockpit();
  else showSetup();
  render();
  startTicker();
}

function closeModal(){
  $('pauseTimerModal').hidden=true;
  document.body.style.overflow='';
}

function createWorkday(){
  if(!selectedWorkHours) return;
  state={
    date:todayKey(),
    workHours:selectedWorkHours,
    budgetSeconds:calculateBudgetSeconds(selectedWorkHours),
    usedSeconds:0,
    runningSince:null
  };
  saveState();
  showCockpit();
}

function togglePause(){
  if(!state) return;
  if(state.runningSince){
    state.usedSeconds=liveUsedSeconds();
    state.runningSince=null;
  }else{
    state.runningSince=Date.now();
  }
  saveState();
  render();
}

function resetWorkday(){
  state=null;
  localStorage.removeItem(STORAGE_KEY);
  showSetup();
  renderButtonFromSavedState();
}

function renderButtonFromSavedState(){
  state=loadState();
  render();
  if(!state){
    const button=$('pauseTimerButton');
    if(button){
      button.textContent='⏱ Pauzetimer';
      button.classList.remove('running');
    }
  }
}

function init(){
  $('pauseTimerButton').addEventListener('click',openModal);
  $('pauseTimerClose').addEventListener('click',closeModal);
  document.querySelectorAll('[data-pause-close]').forEach(element=>element.addEventListener('click',closeModal));

  document.querySelectorAll('[data-work-hours]').forEach(button=>{
    button.addEventListener('click',()=>{
      $('customWorkHours').value='';
      setSelectedHours(Number(button.dataset.workHours),button);
    });
  });

  $('customWorkHours').addEventListener('input',event=>{
    const hours=parseFloat(String(event.target.value).replace(',','.'));
    setSelectedHours(Number.isFinite(hours)&&hours>=0.5&&hours<=24?hours:null);
  });

  $('openPauseCockpit').addEventListener('click',createWorkday);
  $('pauseStartStop').addEventListener('click',togglePause);
  $('pauseNewDay').addEventListener('click',resetWorkday);

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!$('pauseTimerModal').hidden) closeModal();
  });

  renderButtonFromSavedState();
  startTicker();
}

window.ChecklistPauseTimer={open:openModal,close:closeModal,reset:resetWorkday};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
