(()=>{
'use strict';
try{if('canShare' in navigator)Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})}catch{try{navigator.canShare=()=>false}catch{}}
function renameVoiceButtons(){
 const create=document.getElementById('generateMp3'),parts=document.getElementById('generateParts'),all=document.getElementById('downloadAllAudio');
 if(create)create.textContent='Create & Download MP3';if(parts)parts.textContent='Create & Download All Parts';if(all)all.textContent='Download all again';
 document.querySelectorAll('#audioDownloadList button').forEach(b=>{if(/save again/i.test(b.textContent))b.textContent='Download MP3'});
}
function installDownloadButtons(){
 const motionCreate=document.getElementById('exportVideo');
 if(motionCreate&&!document.getElementById('downloadLastMotion')){
  const b=document.createElement('button');b.id='downloadLastMotion';b.textContent='Download last video';b.disabled=true;motionCreate.parentElement.appendChild(b);
  b.onclick=()=>document.querySelector('#downloadList button')?.click();
 }
 const storyCreate=document.getElementById('createStory');
 if(storyCreate&&!document.getElementById('downloadLastStory')){
  const b=document.createElement('button');b.id='downloadLastStory';b.textContent='Download last video';b.disabled=true;storyCreate.parentElement.appendChild(b);
  b.onclick=()=>document.querySelector('#storyDownload a,#storyDownload button')?.click();
 }
 const card=document.getElementById('downloadCard');if(card)card.textContent='Download card image';
}
function refreshDownloads(){
 document.querySelectorAll('#downloadList button').forEach(b=>{b.textContent='Download video';b.classList.add('good')});
 const motion=document.getElementById('downloadLastMotion');if(motion&&document.querySelector('#downloadList button'))motion.disabled=false;
 document.querySelectorAll('#storyDownload a,#storyDownload button').forEach(b=>{b.textContent='Download video';b.classList.add('good','buttonLike')});
 const story=document.getElementById('downloadLastStory');if(story&&document.querySelector('#storyDownload a,#storyDownload button'))story.disabled=false;
 renameVoiceButtons();
}
function patchVersion(){document.querySelectorAll('.badge').forEach(el=>{if(el.textContent.includes('Version'))el.textContent='Version 0.7.3'});const footer=document.querySelector('.footer');if(footer)footer.textContent='Five Oaks Studio — Version 0.7.3'}
document.addEventListener('DOMContentLoaded',()=>{
 patchVersion();
 setTimeout(()=>{installDownloadButtons();refreshDownloads();const root=document.querySelector('main.content')||document.body;new MutationObserver(()=>{installDownloadButtons();refreshDownloads()}).observe(root,{childList:true,subtree:true})},0);
});
})();