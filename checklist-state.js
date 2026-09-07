(()=>{
'use strict';

const data=window.ChecklistData;
const bus=new EventTarget();
const checked={};
for(const item of data.allItems){
  checked[item.id]=localStorage.getItem('werkcheck_'+item.id)==='true';
}

let communicationMode=localStorage.getItem('communication_mode');
if(!['post','digital'].includes(communicationMode)) communicationMode=null;
let criminalAnswer=localStorage.getItem('criminal_answer');
if(!['yes','no'].includes(criminalAnswer)) criminalAnswer=null;
let vehicleObject=data.genericVehicleObject;

function emit(type,detail={}){
  bus.dispatchEvent(new CustomEvent(type,{detail}));
  bus.dispatchEvent(new CustomEvent('change',{detail:{type,...detail}}));
}

function setChecked(id,value,source='state'){
  if(!(id in checked)) return;
  const next=Boolean(value);
  if(checked[id]===next) return;
  checked[id]=next;
  localStorage.setItem('werkcheck_'+id,String(next));
  emit('checkchange',{id,value:next,source});
}

function setCommunicationMode(mode,source='state'){
  const next=['post','digital'].includes(mode)?mode:null;
  communicationMode=next;
  if(next) localStorage.setItem('communication_mode',next);
  else localStorage.removeItem('communication_mode');

  if(next==='digital') setChecked('check_3_2',true,source);
  if(next==='post') setChecked('check_3_2',false,source);
  emit('communicationchange',{mode:next,source});
}

function setCriminalAnswer(answer,source='state'){
  const previous=criminalAnswer;
  criminalAnswer=answer===true?'yes':answer===false?'no':null;
  if(criminalAnswer) localStorage.setItem('criminal_answer',criminalAnswer);
  else localStorage.removeItem('criminal_answer');

  if(criminalAnswer){
    setChecked('check_3_6',true,source);
    if(criminalAnswer==='no') setChecked('check_3_6_sub',true,source);
    if(criminalAnswer==='yes'&&previous==='no') setChecked('check_3_6_sub',false,source);
  }
  emit('criminalchange',{answer:criminalAnswer,source});
}

function setVehicleObject(object,source='state'){
  if(!object||vehicleObject.key===object.key) return;
  vehicleObject=object;
  emit('vehiclechange',{object,source});
}

function resetVehicleObject(source='state'){
  vehicleObject=data.genericVehicleObject;
  emit('vehiclechange',{object:vehicleObject,source});
}

function reset(source='reset'){
  for(const id of Object.keys(checked)){
    checked[id]=false;
    localStorage.setItem('werkcheck_'+id,'false');
  }
  communicationMode=null;
  criminalAnswer=null;
  localStorage.removeItem('communication_mode');
  localStorage.removeItem('criminal_answer');
  vehicleObject=data.genericVehicleObject;
  emit('reset',{source});
}

function isVisible(id){
  if(id==='check_3_2') return communicationMode==='post';
  if(id==='check_3_6_sub') return criminalAnswer==='yes';
  return true;
}

function completedCount(){
  return Object.values(checked).filter(Boolean).length;
}

window.ChecklistState={
  bus,
  getChecked:id=>Boolean(checked[id]),
  setChecked,
  getCommunicationMode:()=>communicationMode,
  setCommunicationMode,
  getCriminalAnswer:()=>criminalAnswer,
  setCriminalAnswer,
  getVehicleObject:()=>vehicleObject,
  setVehicleObject,
  resetVehicleObject,
  reset,
  isVisible,
  completedCount,
  totalCount:()=>Object.keys(checked).length,
  snapshot:()=>({checked:{...checked},communicationMode,criminalAnswer,vehicleObject})
};
})();
