(()=>{
'use strict';
let lastUrl='';
let lastName='five-oaks-story.webm';

function ensureButton(){
  const box=document.getElementById('storyDownload');
  if(!box) return;
  let button=document.getElementById('downloadLastStory');
  if(!button){
    button=document.createElement('button');
    button.id='downloadLastStory';
    button.className='good';
    button.textContent='Download Story Video';
    button.disabled=true;
    button.addEventListener('click',()=>{
      if(!lastUrl) return;
      const a=document.createElement('a');
      a.href=lastUrl;
      a.download=lastName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    box.parentElement?.insertBefore(button,box);
  }
}

function captureReadyDownload(){
  const box=document.getElementById('storyDownload');
  if(!box) return;
  const link=box.querySelector('a[download]');
  if(!link) return;
  if(link.href===lastUrl) return;
  lastUrl=link.href;
  lastName=link.getAttribute('download')||'five-oaks-story.webm';
  const button=document.getElementById('downloadLastStory');
  if(button){
    button.disabled=false;
    button.textContent='Download Story Video';
  }
  link.textContent='Download Story Video';
  link.classList.add('good');
  setTimeout(()=>link.click(),150);
}

document.addEventListener('DOMContentLoaded',()=>{
  ensureButton();
  const observer=new MutationObserver(()=>{
    ensureButton();
    captureReadyDownload();
  });
  observer.observe(document.body,{childList:true,subtree:true});
});
})();