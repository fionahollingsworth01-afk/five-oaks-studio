(()=>{
'use strict';
try{if('canShare' in navigator)Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})}catch{try{navigator.canShare=()=>false}catch{}}

function loadRepair(){
 if(document.querySelector('script[src^="final-ui-repair.js"]'))return;
 const s=document.createElement('script');s.src='final-ui-repair.js?v=074';s.async=false;document.head.appendChild(s);
}
function renameVoiceButtons(){
 const create=document.getElementById('generateMp3'),parts=document.getElementById('generateParts'),all=document.getElementById('downloadAllAudio');
 if(create)create.textContent='Create & Download MP3';if(parts)parts.textContent='Create & Download All Parts';if(all)all.textContent='Download all again';
 document.querySelectorAll('#audioDownloadList button').forEach(b=>{if(/save again/i.test(b.textContent))b.textContent='Download MP3'});
}
function installDownloadButtons(){
 const motionCreate=document.getElementById('exportVideo');
 if(motionCreate&&!document.getElementById('downloadLastMotion')){
  const b=document.createElement('button');b.id='downloadLastMotion';b.textContent='Download Last Motion Video';b.disabled=true;motionCreate.parentElement.appendChild(b);
  b.onclick=()=>document.querySelector('#downloadList .downloadItem button')?.click();
 }
 const storyCreate=document.getElementById('createStory');
 if(storyCreate&&!document.getElementById('downloadLastStory')){
  const b=document.createElement('button');b.id='downloadLastStory';b.textContent='Download Last Video';b.disabled=true;storyCreate.parentElement.appendChild(b);
  b.onclick=()=>document.querySelector('#storyDownload .downloadItem a[download],#storyDownload .downloadItem button')?.click();
 }
 const card=document.getElementById('downloadCard');if(card)card.textContent='Download Card Image';
}
function refreshDownloads(){
 document.querySelectorAll('#downloadList .downloadItem button').forEach(b=>{b.textContent='Download Video';b.classList.add('good')});
 const motion=document.getElementById('downloadLastMotion');if(motion&&document.querySelector('#downloadList .downloadItem button'))motion.disabled=false;
 document.querySelectorAll('#storyDownload .downloadItem a[download],#storyDownload .downloadItem button').forEach(b=>{b.textContent='Download Video';b.classList.add('good','buttonLike')});
 const story=document.getElementById('downloadLastStory');if(story&&document.querySelector('#storyDownload .downloadItem a[download],#storyDownload .downloadItem button'))story.disabled=false;
 renameVoiceButtons();
}
function patchVersion(){document.querySelectorAll('.badge').forEach(el=>{if(el.textContent.includes('Version'))el.textContent='Version 0.7.4'});const footer=document.querySelector('.footer');if(footer)footer.textContent='Five Oaks Studio — Version 0.7.4'}
loadRepair();
document.addEventListener('DOMContentLoaded',()=>{
 patchVersion();
 setTimeout(()=>{installDownloadButtons();refreshDownloads();const root=document.querySelector('main.content')||document.body;new MutationObserver(()=>{installDownloadButtons();refreshDownloads()}).observe(root,{childList:true,subtree:true})},0);
});
})();