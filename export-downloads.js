(()=>{
'use strict';
const $=id=>document.getElementById(id);
function addMotionButton(){
 const create=$('exportVideo');if(!create||$('downloadLastMotion'))return;
 const b=document.createElement('button');b.id='downloadLastMotion';b.textContent='Download last video';b.disabled=true;create.parentElement.appendChild(b);
 b.onclick=()=>{const target=$('downloadList')?.querySelector('button');if(target)target.click()};
 const list=$('downloadList');if(list)new MutationObserver(()=>{const target=list.querySelector('button');if(target){target.textContent='Download video';target.classList.add('good');b.disabled=false}}).observe(list,{childList:true,subtree:true});
}
function addStoryButton(){
 const create=$('createStory');if(!create||$('downloadLastStory'))return;
 const b=document.createElement('button');b.id='downloadLastStory';b.textContent='Download last video';b.disabled=true;create.parentElement.appendChild(b);
 b.onclick=()=>{const target=$('storyDownload')?.querySelector('a,button');if(target)target.click()};
 const list=$('storyDownload');if(list)new MutationObserver(()=>{const target=list.querySelector('a,button');if(target){target.textContent='Download video';target.classList.add('good');b.disabled=false}}).observe(list,{childList:true,subtree:true});
}
function tidyCardButtons(){const b=$('downloadCard');if(b)b.textContent='Download card image'}
document.addEventListener('DOMContentLoaded',()=>{addMotionButton();addStoryButton();tidyCardButtons()});
})();