(()=>{
'use strict';

function fixLabels(){
  const motionNav=document.querySelector('.nav [data-view="motion"]');
  const storyNav=document.querySelector('.nav [data-view="story"]');
  if(motionNav) motionNav.textContent='Motion';
  if(storyNav) storyNav.textContent='Video';

  const storyTitle=document.querySelector('#story .sectionTitle h2');
  const storyCopy=document.querySelector('#story .sectionTitle p');
  if(storyTitle) storyTitle.textContent='Video Builder';
  if(storyCopy) storyCopy.textContent='Join 3–5 images with narration into one downloadable video.';

  const imageInput=document.getElementById('storyImages');
  if(imageInput){
    imageInput.multiple=true;
    imageInput.setAttribute('multiple','');
  }
  const imageLabel=document.querySelector('label[for="storyImages"]');
  if(imageLabel) imageLabel.textContent='Choose 3–5 images';

  const createStory=document.getElementById('createStory');
  if(createStory) createStory.textContent='Create Video';
  const exportMotion=document.getElementById('exportVideo');
  if(exportMotion) exportMotion.textContent='Create Motion Video';

  document.querySelectorAll('.downloadItem button,.downloadItem a[download]').forEach(el=>{
    const item=el.closest('.downloadItem');
    const name=(item?.querySelector('h3')?.textContent||'').toLowerCase();
    if(name.endsWith('.mp3')) el.textContent='Download MP3';
    else el.textContent='Download Video';
    el.classList.add('good');
  });

  const storyBox=document.getElementById('storyDownload');
  if(storyBox && !storyBox.children.length){
    storyBox.innerHTML='<div class="empty">After you create the video, the Download Video button will appear here.</div>';
  }
  const motionBox=document.getElementById('downloadList');
  if(motionBox && !motionBox.children.length){
    motionBox.innerHTML='<div class="empty">After you create the motion clip, the Download Video button will appear here.</div>';
  }

  document.querySelectorAll('.badge').forEach(el=>{
    if(el.textContent.includes('Version')) el.textContent='Version 0.7.4';
  });
  const footer=document.querySelector('.footer');
  if(footer) footer.textContent='Five Oaks Studio — Version 0.7.4';
}

function addStoryDownloadHeading(){
  const box=document.getElementById('storyDownload');
  if(!box||document.getElementById('storyDownloadHeading')) return;
  const h=document.createElement('h3');
  h.id='storyDownloadHeading';
  h.textContent='Finished Video';
  h.style.margin='18px 0 8px';
  box.parentElement.insertBefore(h,box);
}

function run(){fixLabels();addStoryDownloadHeading();}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);
else run();

new MutationObserver(run).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(run,500);
setTimeout(run,1500);
})();