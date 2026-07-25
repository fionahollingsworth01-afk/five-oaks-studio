(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={image:null,format:'vertical'};

function addNavAndView(){
  const nav=$('.nav');
  const projectsBtn=nav&&nav.querySelector('[data-view="projects"]');
  if(!nav||$('#cards'))return;
  const btn=document.createElement('button');
  btn.dataset.view='cards'; btn.textContent='Cards';
  nav.insertBefore(btn,projectsBtn||null);
  nav.style.gridTemplateColumns='repeat(5,1fr)';

  const main=$('.content');
  const section=document.createElement('section');
  section.id='cards'; section.className='view';
  section.innerHTML=`
    <div class="sectionTitle"><div><h2>Cards & Thumbnail Studio</h2><p>Create title cards, credits, and YouTube thumbnails without leaving Five Oaks Studio.</p></div></div>
    <div class="grid2">
      <div class="card">
        <div class="field"><label for="cardType">What are you making?</label><select id="cardType"><option value="title">9:16 title card</option><option value="credits">9:16 credits card</option><option value="thumbnail">16:9 YouTube thumbnail</option></select></div>
        <div class="field"><label for="cardImage">Background image (optional)</label><input id="cardImage" type="file" accept="image/*"><small>Without an image, the app creates a warm Five Oaks background.</small></div>
        <div class="field"><label for="cardTitle">Main title</label><input id="cardTitle" placeholder="The New Bull"></div>
        <div class="field"><label for="cardSubtitle">Subtitle or second line</label><input id="cardSubtitle" placeholder="Inspired by Book 20"></div>
        <div class="field"><label for="cardCredits">Credits text</label><textarea id="cardCredits" class="shortText" placeholder="Written by Fiona Hollingsworth & Cyrus Wren&#10;Created for The World of Five Oaks"></textarea></div>
        <div class="field"><label for="textPosition">Text position</label><select id="textPosition"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option></select></div>
        <div class="field"><label><input id="darkOverlay" type="checkbox" checked style="width:auto"> Darken image behind words</label></div>
        <div class="actions"><button id="previewCard" class="primary">Update preview</button><button id="downloadCard" class="good">Download image</button><button id="clearCard">Clear</button></div>
        <p id="cardStatus" class="statusline"></p>
      </div>
      <div class="card"><div class="previewWrap cardPreview"><canvas id="cardCanvas" width="1080" height="1920"></canvas></div><div class="notice" style="margin-top:14px">Title and credits cards download at 1080 × 1920. Thumbnails download at 1280 × 720.</div></div>
    </div>`;
  const projects=$('#projects');
  main.insertBefore(section,projects||$('#toast'));

  btn.addEventListener('click',()=>showView('cards'));
  document.querySelectorAll('[data-view]').forEach(b=>{if(b===btn)return;b.addEventListener('click',()=>{if(b.dataset.view!=='cards')btn.classList.remove('active')})});
}

function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  if(id==='cards')draw();
}

function loadImage(file){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img); img.onerror=reject;
    img.src=URL.createObjectURL(file);
  });
}

function wrap(ctx,text,maxWidth){
  const lines=[];
  String(text||'').split(/\n/).forEach(p=>{
    if(!p){lines.push('');return;}
    const words=p.split(/\s+/); let line='';
    words.forEach(word=>{
      const test=line?line+' '+word:word;
      if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test;
    });
    if(line)lines.push(line);
  });
  return lines;
}

function fitText(ctx,text,maxWidth,start,min){
  let size=start;
  while(size>min){ctx.font=`800 ${size}px Georgia, serif`;if(wrap(ctx,text,maxWidth).length<=3&&Math.max(0,...wrap(ctx,text,maxWidth).map(l=>ctx.measureText(l).width))<=maxWidth)break;size-=4}
  return size;
}

function drawCover(ctx,img,w,h){
  const scale=Math.max(w/img.width,h/img.height),sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
}

function draw(){
  const canvas=$('#cardCanvas'); if(!canvas)return;
  const type=$('#cardType').value;
  const isThumb=type==='thumbnail';
  canvas.width=isThumb?1280:1080; canvas.height=isThumb?720:1920;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  if(state.image)drawCover(ctx,state.image,w,h);else{
    const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3b261a');g.addColorStop(.55,'#1d130e');g.addColorStop(1,'#090605');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=.18;ctx.strokeStyle='#d49a62';ctx.lineWidth=3;
    for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(0,h*(i/12));ctx.lineTo(w,h*((i+1)/12));ctx.stroke()}ctx.globalAlpha=1;
  }
  if($('#darkOverlay').checked){ctx.fillStyle=isThumb?'rgba(0,0,0,.46)':'rgba(0,0,0,.42)';ctx.fillRect(0,0,w,h)}
  const title=$('#cardTitle').value.trim(); const sub=$('#cardSubtitle').value.trim(); const credits=$('#cardCredits').value.trim();
  const pos=$('#textPosition').value;
  const centerY=pos==='top'?h*.25:pos==='bottom'?h*.74:h*.49;
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fffaf5';ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=isThumb?18:24;ctx.shadowOffsetY=5;
  if(type==='credits'){
    const head=title||'Credits';ctx.font=`800 ${isThumb?82:104}px Georgia, serif`;ctx.fillText(head,w/2,h*.18);
    ctx.font=`600 ${isThumb?38:48}px Georgia, serif`;const lines=wrap(ctx,credits||sub,w*.78),lh=isThumb?52:66;lines.forEach((line,i)=>ctx.fillText(line,w/2,h*.36+i*lh));
  }else{
    const titleSize=fitText(ctx,title,w*(isThumb?.82:.78),isThumb?110:138,isThumb?58:72);ctx.font=`800 ${titleSize}px Georgia, serif`;
    const lines=wrap(ctx,title,w*(isThumb?.82:.78)),lh=titleSize*1.03;const start=centerY-(lines.length-1)*lh/2;
    lines.forEach((line,i)=>ctx.fillText(line,w/2,start+i*lh));
    if(sub){ctx.font=`600 ${isThumb?42:50}px Georgia, serif`;const sl=wrap(ctx,sub,w*.78),sy=start+lines.length*lh+(isThumb?38:55);sl.forEach((line,i)=>ctx.fillText(line,w/2,sy+i*(isThumb?50:62)))}
  }
  ctx.shadowBlur=0;ctx.font=`700 ${isThumb?22:28}px system-ui`;ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillText('THE WORLD OF FIVE OAKS',w/2,h-(isThumb?34:55));
  $('#cardStatus').textContent=isThumb?'Thumbnail ready: 1280 × 720':'Card ready: 1080 × 1920';
}

function filename(){
  const type=$('#cardType').value;const title=$('#cardTitle').value.trim()||type;
  return title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+type+'.png';
}

function bind(){
  $('#cardType').addEventListener('change',()=>{const credits=$('#cardCredits');credits.closest('.field').style.display=$('#cardType').value==='credits'?'block':'none';draw()});
  $('#cardImage').addEventListener('change',async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{state.image=await loadImage(f);draw()}catch{$('#cardStatus').textContent='That image could not be opened.'}});
  ['cardTitle','cardSubtitle','cardCredits','textPosition','darkOverlay'].forEach(id=>$('#'+id).addEventListener(id==='darkOverlay'?'change':'input',draw));
  $('#previewCard').addEventListener('click',draw);
  $('#downloadCard').addEventListener('click',()=>{draw();const a=document.createElement('a');a.download=filename();a.href=$('#cardCanvas').toDataURL('image/png');a.click();$('#cardStatus').textContent='Image downloaded.'});
  $('#clearCard').addEventListener('click',()=>{if(!confirm('Clear this card?'))return;state.image=null;$('#cardImage').value='';$('#cardTitle').value='';$('#cardSubtitle').value='';$('#cardCredits').value='';draw()});
  $('#cardCredits').closest('.field').style.display='none';
  document.querySelectorAll('[data-jump]').forEach(b=>{if(b.dataset.jump==='cards')b.addEventListener('click',()=>showView('cards'))});
  draw();
}

function addHomeQuickLink(){
  const grid=$('.quickGrid');if(!grid||grid.querySelector('[data-jump="cards"]'))return;
  const b=document.createElement('button');b.className='card quick';b.dataset.jump='cards';b.innerHTML='<strong>Cards & Thumbnails</strong><span>Create 9:16 title cards, credits, and YouTube thumbnails.</span>';b.addEventListener('click',()=>showView('cards'));grid.insertBefore(b,grid.children[2]||null);
}

document.addEventListener('DOMContentLoaded',()=>{addNavAndView();addHomeQuickLink();bind()});
})();