(()=>{
'use strict';
const $=id=>document.getElementById(id);
const LAST='fiveOaksLastAzureVoice';

const presets=[
  {value:'ava',label:'Ava — warm natural woman',voice:'en-US-AvaNeural',rate:.95,pitch:1},
  {value:'emma',label:'Emma — warm woman',voice:'en-US-EmmaNeural',rate:.95,pitch:1},
  {value:'jenny',label:'Jenny — clear woman',voice:'en-US-JennyNeural',rate:.98,pitch:1},
  {value:'andrew',label:'Andrew — natural narrator',voice:'en-US-AndrewNeural',rate:.95,pitch:1},
  {value:'brian',label:'Brian — mature man',voice:'en-US-BrianNeural',rate:.9,pitch:.95},
  {value:'christopher',label:'Christopher — steady man',voice:'en-US-ChristopherNeural',rate:.95,pitch:1},
  {value:'davis',label:'Davis — younger warm man',voice:'en-US-DavisNeural',rate:1,pitch:1},
  {value:'guy',label:'Guy — clear man',voice:'en-US-GuyNeural',rate:.97,pitch:1}
];

function setRanges(rate,pitch){
  const r=$('rate'),p=$('pitch');
  if(r){r.value=rate;$('rateValue')&&($('rateValue').textContent=Number(rate).toFixed(2));}
  if(p){p.value=pitch;$('pitchValue')&&($('pitchValue').textContent=Number(pitch).toFixed(2));}
}

function installPresetOptions(){
  const select=$('voicePreset');
  if(!select)return;
  select.innerHTML='<option value="">Choose a preset</option>';
  presets.forEach(item=>{
    const option=document.createElement('option');
    option.value=item.value;option.textContent=item.label;select.appendChild(option);
  });
  select.onchange=()=>{
    const chosen=presets.find(p=>p.value===select.value);
    if(!chosen)return;
    const voice=$('azureVoice');
    if(voice){voice.value=chosen.voice;voice.dispatchEvent(new Event('change',{bubbles:true}));}
    setRanges(chosen.rate,chosen.pitch);
    localStorage.setItem(LAST,chosen.voice);
    const status=$('voiceStatus');if(status)status.textContent=`${chosen.label.split(' — ')[0]} selected for MP3 voiceovers.`;
  };
}

function rememberVoice(){
  const voice=$('azureVoice');if(!voice)return;
  voice.addEventListener('change',()=>localStorage.setItem(LAST,voice.value));
  const saved=localStorage.getItem(LAST)||'en-US-AvaNeural';
  if([...voice.options].some(o=>o.value===saved))voice.value=saved;
  else voice.value='en-US-AvaNeural';
  localStorage.setItem(LAST,voice.value);
}

function addDefaultButton(){
  const voice=$('azureVoice');if(!voice||$('makeDefaultVoice'))return;
  const actions=voice.closest('.card')?.querySelector('.actions');if(!actions)return;
  const b=document.createElement('button');b.id='makeDefaultVoice';b.type='button';b.textContent='Make this my default MP3 voice';
  b.onclick=()=>{localStorage.setItem(LAST,voice.value);const name=voice.options[voice.selectedIndex]?.textContent||voice.value;const status=$('voiceStatus');if(status)status.textContent=`${name} will be selected when the app opens.`;};
  actions.appendChild(b);
}

function patchVersion(){
 document.querySelectorAll('.badge').forEach(el=>{if(el.textContent.includes('Version'))el.textContent='Version 0.7.6'});
 const footer=document.querySelector('.footer');if(footer)footer.textContent='Five Oaks Studio — Version 0.7.6';
}

document.addEventListener('DOMContentLoaded',()=>{installPresetOptions();rememberVoice();addDefaultButton();patchVersion();});
})();
