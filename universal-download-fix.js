(()=>{
'use strict';

function setText(id,text){
  const el=document.getElementById(id);
  if(el && el.textContent!==text) el.textContent=text;
}

function labelDownloads(root=document){
  const labels={
    exportVideo:'Create & Download Video',
    createStory:'Create & Download Video',
    downloadCard:'Download Image',
    exportCredits:'Create & Download Credits Video',
    generateMp3:'Create & Download MP3',
    generateParts:'Create & Download All Parts',
    downloadAllAudio:'Download All Again'
  };
  Object.entries(labels).forEach(([id,text])=>setText(id,text));

  root.querySelectorAll?.('.downloadItem button,.downloadItem a.buttonLike').forEach(el=>{
    const text=(el.textContent||'').trim().toLowerCase();
    const parent=el.closest('.downloadItem');
    const heading=(parent?.querySelector('h3')?.textContent||'').toLowerCase();
    if(text==='save again') el.textContent=heading.endsWith('.mp3')?'Download MP3':'Download Video';
    const finalText=(el.textContent||'').trim().toLowerCase();
    if(finalText==='download video'||finalText==='download mp3'||finalText==='download image') el.classList.add('good');
  });

  const creditsNav=document.querySelector('.nav [data-view="credits"]');
  if(creditsNav && creditsNav.textContent!=='Credits') creditsNav.textContent='Credits';
}

function addHelpfulEmptyMessages(){
  const messages={
    downloadList:'Create a video above. Its Download Video button will appear here.',
    storyDownload:'Create the story video above. Its Download Video button will appear here.',
    creditsDownloads:'Create the credits video above. Its Download Video button will appear here.'
  };
  Object.entries(messages).forEach(([id,message])=>{
    const box=document.getElementById(id);
    if(!box||box.children.length) return;
    box.innerHTML=`<div class="empty">${message}</div>`;
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  labelDownloads();
  addHelpfulEmptyMessages();
  new MutationObserver(records=>{
    for(const record of records){
      record.addedNodes.forEach(node=>{
        if(node.nodeType===1) labelDownloads(node);
      });
    }
    addHelpfulEmptyMessages();
  }).observe(document.body,{childList:true,subtree:true});
});
})();