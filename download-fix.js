(()=>{
'use strict';

try{
  if ('canShare' in navigator) {
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});
  }
}catch{
  try{ navigator.canShare=()=>false; }catch{}
}

function loadScript(src,match){
  if(document.querySelector(`script[src^="${match}"]`)) return;
  const script=document.createElement('script');
  script.src=src;
  script.async=false;
  document.head.appendChild(script);
}

function renameVoiceButtons(){
  const create=document.getElementById('generateMp3');
  const createParts=document.getElementById('generateParts');
  const all=document.getElementById('downloadAllAudio');
  if(create) create.textContent='Create & Download MP3';
  if(createParts) createParts.textContent='Create & Download All Parts';
  if(all) all.textContent='Download all again';

  const list=document.getElementById('audioDownloadList');
  if(list){
    list.querySelectorAll('button').forEach(button=>{
      if(button.textContent.trim()==='Save again') button.textContent='Download MP3';
    });
  }
}

function showVersion(){
  document.querySelectorAll('.badge').forEach(el=>{
    if(el.textContent.includes('Version')) el.textContent='Version 0.7.2';
  });
  const footer=document.querySelector('.footer');
  if(footer) footer.textContent='Five Oaks Studio — Version 0.7.2';
}

loadScript('scrolling-credits.js?v=072','scrolling-credits.js');
loadScript('universal-download-fix.js?v=072','universal-download-fix.js');
loadScript('story-download-fix.js?v=072','story-download-fix.js');

document.addEventListener('DOMContentLoaded',()=>{
  renameVoiceButtons();
  showVersion();
  const list=document.getElementById('audioDownloadList');
  if(list) new MutationObserver(renameVoiceButtons).observe(list,{childList:true,subtree:true});
});
})();