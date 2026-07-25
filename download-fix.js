(()=>{
'use strict';

// Five Oaks Studio is primarily used as a download tool on iPhone.
// Prevent the iOS share sheet from replacing the normal file download.
try{
  if ('canShare' in navigator) {
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});
  }
}catch{
  try{ navigator.canShare=()=>false; }catch{}
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

function loadScrollingCredits(){
  if(document.querySelector('script[src="scrolling-credits.js"]')) return;
  const script=document.createElement('script');
  script.src='scrolling-credits.js?v=070';
  script.defer=true;
  document.body.appendChild(script);
}

function showVersion(){
  document.querySelectorAll('.badge').forEach(el=>{
    if(el.textContent.includes('Version')) el.textContent='Version 0.7.0';
  });
  const footer=document.querySelector('.footer');
  if(footer) footer.textContent='Five Oaks Studio — Version 0.7.0';
}

document.addEventListener('DOMContentLoaded',()=>{
  renameVoiceButtons();
  showVersion();
  loadScrollingCredits();
  const list=document.getElementById('audioDownloadList');
  if(list) new MutationObserver(renameVoiceButtons).observe(list,{childList:true,subtree:true});
});
})();