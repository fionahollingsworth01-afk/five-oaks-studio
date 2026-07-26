(()=>{
'use strict';

const DEFAULT_KEY='fiveOaksDefaultMp3Voice';
const LAST_KEY='fiveOaksLastMp3Voice';

const voices=[
  ['en-US-AvaNeural','Ava — natural American female'],
  ['en-US-EmmaNeural','Emma — warm American female'],
  ['en-US-JennyNeural','Jenny — clear American female'],
  ['en-US-AriaNeural','Aria — expressive American female'],
  ['en-US-SaraNeural','Sara — friendly American female'],
  ['en-US-JaneNeural','Jane — calm American female'],
  ['en-US-NancyNeural','Nancy — mature American female'],
  ['en-US-AmberNeural','Amber — bright American female'],
  ['en-US-AshleyNeural','Ashley — conversational American female'],
  ['en-US-CoraNeural','Cora — smooth American female'],
  ['en-US-ElizabethNeural','Elizabeth — polished American female'],
  ['en-US-MichelleNeural','Michelle — gentle American female'],
  ['en-US-MonicaNeural','Monica — natural American female'],
  ['en-US-AnaNeural','Ana — youthful American female'],
  ['en-US-AndrewNeural','Andrew — natural American male'],
  ['en-US-BrianNeural','Brian — mature American male'],
  ['en-US-ChristopherNeural','Christopher — steady American male'],
  ['en-US-DavisNeural','Davis — warm American male'],
  ['en-US-GuyNeural','Guy — clear American male'],
  ['en-US-EricNeural','Eric — confident American male'],
  ['en-US-JacobNeural','Jacob — conversational American male'],
  ['en-US-JasonNeural','Jason — smooth American male'],
  ['en-US-RogerNeural','Roger — strong American male'],
  ['en-US-SteffanNeural','Steffan — polished American male'],
  ['en-US-TonyNeural','Tony — mature American male'],
  ['en-US-BrandonNeural','Brandon — relaxed American male'],
  ['en-US-AvaMultilingualNeural','Ava Multilingual — natural female'],
  ['en-US-EmmaMultilingualNeural','Emma Multilingual — warm female'],
  ['en-US-AndrewMultilingualNeural','Andrew Multilingual — natural male'],
  ['en-US-BrianMultilingualNeural','Brian Multilingual — mature male'],
  ['en-GB-SoniaNeural','Sonia — British female'],
  ['en-GB-LibbyNeural','Libby — British female'],
  ['en-GB-RyanNeural','Ryan — British male'],
  ['en-AU-NatashaNeural','Natasha — Australian female'],
  ['en-AU-WilliamNeural','William — Australian male']
];

const presets=[
  ['','Choose a preset'],
  ...voices.map(([value,label])=>[value,label])
];

function fillSelect(select,items){
  if(!select)return;
  const current=select.value;
  select.innerHTML='';
  items.forEach(([value,label])=>{
    const option=document.createElement('option');
    option.value=value;
    option.textContent=label;
    select.appendChild(option);
  });
  if(items.some(([value])=>value===current))select.value=current;
}

function install(){
  const preset=document.getElementById('voicePreset');
  const mp3=document.getElementById('azureVoice');
  if(!preset||!mp3)return;

  fillSelect(mp3,voices);
  fillSelect(preset,presets);

  const saved=localStorage.getItem(DEFAULT_KEY)||localStorage.getItem(LAST_KEY)||'en-US-AvaNeural';
  if(voices.some(([value])=>value===saved))mp3.value=saved;
  else mp3.value='en-US-AvaNeural';

  preset.value='';
  preset.onchange=()=>{
    if(!preset.value)return;
    mp3.value=preset.value;
    mp3.dispatchEvent(new Event('change',{bubbles:true}));
  };

  mp3.addEventListener('change',()=>{
    localStorage.setItem(LAST_KEY,mp3.value);
  });

  let defaultButton=document.getElementById('setDefaultMp3Voice');
  if(!defaultButton){
    defaultButton=document.createElement('button');
    defaultButton.id='setDefaultMp3Voice';
    defaultButton.type='button';
    defaultButton.textContent='Make this my default MP3 voice';
    const favorite=document.getElementById('favoriteVoice');
    favorite?.parentElement?.appendChild(defaultButton);
  }
  defaultButton.onclick=()=>{
    localStorage.setItem(DEFAULT_KEY,mp3.value);
    localStorage.setItem(LAST_KEY,mp3.value);
    const label=mp3.options[mp3.selectedIndex]?.textContent||mp3.value;
    const status=document.getElementById('voiceStatus');
    if(status)status.textContent=`${label} is now your default MP3 voice.`;
  };

  localStorage.setItem(LAST_KEY,mp3.value);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
else install();
setTimeout(install,500);
})();
