(()=>{
'use strict';

try{
  if('canShare' in navigator){
    Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false});
  }
}catch{
  try{navigator.canShare=()=>false}catch{}
}

function setText(id,text){
  const el=document.getElementById(id);
  if(el && el.textContent!==text) el.textContent=text;
}

function patchVersion(){
  document.querySelectorAll('.badge').forEach(el=>{
    if(el.textContent.includes('Version') && el.textContent!=='Version 0.7.6') el.textContent='Version 0.7.6';
  });
  const footer=document.querySelector('.footer');
  if(footer && footer.textContent!=='Five Oaks Studio — Version 0.7.6') footer.textContent='Five Oaks Studio — Version 0.7.6';
}

function patchLabels(){
  setText('generateMp3','Create & Download MP3');
  setText('generateParts','Create & Download All Parts');
  setText('downloadAllAudio','Download all again');
  setText('exportVideo','Create Video');
  setText('createStory','Create Video');
  setText('downloadCard','Download Image');
  setText('exportCredits','Create Credits Video');

  document.querySelectorAll('#audioDownloadList button').forEach(b=>{
    if((b.textContent||'').trim()==='Save again') b.textContent='Download MP3';
  });
  document.querySelectorAll('#downloadList button').forEach(b=>{
    if((b.textContent||'').trim()==='Save again') b.textContent='Download Video';
    b.classList.add('good');
  });
  document.querySelectorAll('#storyDownload a[download],#storyDownload button').forEach(b=>{
    if((b.textContent||'').trim()!=='Download Video') b.textContent='Download Video';
    b.classList.add('good');
  });
}

function ensureStoryMultiple(){
  const input=document.getElementById('storyImages');
  if(input){
    input.multiple=true;
    input.setAttribute('multiple','');
    input.setAttribute('accept','image/*');
  }
}

function ensureLastButtons(){
  const motionCreate=document.getElementById('exportVideo');
  if(motionCreate && !document.getElementById('downloadLastMotion')){
    const b=document.createElement('button');
    b.id='downloadLastMotion';
    b.textContent='Download Last Video';
    b.disabled=true;
    b.addEventListener('click',()=>{
      const target=document.querySelector('#downloadList .downloadItem button');
      if(target && target!==b) target.click();
    });
    motionCreate.parentElement.appendChild(b);
  }

  const storyCreate=document.getElementById('createStory');
  if(storyCreate && !document.getElementById('downloadLastStory')){
    const b=document.createElement('button');
    b.id='downloadLastStory';
    b.textContent='Download Last Video';
    b.disabled=true;
    b.addEventListener('click',()=>{
      const target=document.querySelector('#storyDownload .downloadItem a[download],#storyDownload .downloadItem button');
      if(target && target!==b) target.click();
    });
    storyCreate.parentElement.appendChild(b);
  }
}

function refreshReadyButtons(){
  const motion=document.getElementById('downloadLastMotion');
  if(motion) motion.disabled=!document.querySelector('#downloadList .downloadItem button');
  const story=document.getElementById('downloadLastStory');
  if(story) story.disabled=!document.querySelector('#storyDownload .downloadItem a[download],#storyDownload .downloadItem button');
}

function patch(){
  patchVersion();
  patchLabels();
  ensureStoryMultiple();
  ensureLastButtons();
  refreshReadyButtons();
}

function loadScript(src,id){
  if(document.getElementById(id)) return;
  const s=document.createElement('script');
  s.id=id;
  s.src=src;
  s.async=false;
  document.head.appendChild(s);
}

loadScript('scrolling-credits.js?v=076','five-oaks-scrolling-credits');
loadScript('universal-download-fix.js?v=076','five-oaks-universal-downloads');
loadScript('story-download-fix.js?v=076','five-oaks-story-downloads');
loadScript('video-story-fix.js?v=076','five-oaks-video-story-fix');
loadScript('voice-presets.js?v=076','five-oaks-voice-presets');

document.addEventListener('DOMContentLoaded',()=>{
  patch();
  [250,750,1500,3000].forEach(ms=>setTimeout(patch,ms));
});
})();
