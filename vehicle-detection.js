(()=>{
'use strict';

const data=window.ChecklistData;
const state=window.ChecklistState;
let pending=null;

function normalize(text){
  return String(text||'').toLocaleLowerCase('nl-NL').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function detect(text){
  const normalized=normalize(text);
  if(!normalized) return null;
  const matches=[];
  for(const object of data.vehicleObjects){
    for(const alias of object.aliases){
      const term=normalize(alias);
      const escaped=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const pattern=new RegExp(`(^|\\s)${escaped}($|\\s)`);
      if(pattern.test(normalized)) matches.push({object,length:term.length});
    }
  }
  matches.sort((a,b)=>b.length-a.length);
  return matches[0]?.object||null;
}

function updateFromSpeech(text){
  const found=detect(text);
  if(found) pending=found;
  if(!state.getChecked('check_3_0')) return;
  const object=found||pending;
  if(object) state.setVehicleObject(object,'speech');
}

function reset(){
  pending=null;
  state.resetVehicleObject('vehicle-reset');
}

function phrase(){
  const object=state.getVehicleObject();
  return `${object.article} ${object.label}`;
}

window.VehicleDetection={normalize,detect,updateFromSpeech,reset,phrase};
})();
