(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={image:null,mode:'title',scrollFormat:'vertical',bgImage:null,logoImage:null,running:false,animation:0,lastScroll:null};
const safe=s=>(s||'five-oaks').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'five-oaks';

function showView(id){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  $$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  if(id==='cards'){drawCard();drawScrollStill()}
}

function addUI(){
  const nav=$('.nav'); if(!nav||$('#cards'))return;
  const projects=nav.querySelector('[data-view="projects"]');
  const btn=document.createElement('button');btn.dataset.view='cards';btn.textContent='Cards';nav.insertBefore(btn,projects||null);
  btn.addEventListener('click',()=>showView('cards'));
  const section=document.createElement('section');section.id='cards';section.className='view';
  section.innerHTML=`
  <div class="sectionTitle"><div><h2>Cards Studio</h2><p>Create title cards, credits cards, and scrolling credits.</p></div></div>
  <div class="formatToggle cardTabs" style="margin-bottom:14px">
    <button class="active" data-card-tab="title">Title Card</button>
    <button data-card-tab="credits">Credits Card</button>
    <button data-card-tab="scroll">Scrolling Credits</button>
  </div>
  <div id="staticCardPanel">
    <div class="grid2"><div class="card">
      <div class="field"><label for="cardImage">Background image (optional)</label><input id="cardImage" type="file" accept="image/*"></div>
      <div class="field"><label for="cardTitle">Main title</label><input id="cardTitle" placeholder="The New Bull"></div>
      <div class="field" id="cardSubtitleField"><label for="cardSubtitle">Subtitle or second line</label><input id="cardSubtitle" placeholder="Inspired by Book 20"></div>
      <div class="field hidden" id="cardCreditsField"><label for="cardCredits">Credits text</label><textarea id="cardCredits" class="shortText" placeholder="Written by Fiona Hollingsworth & Cyrus Wren&#10;Created for The World of Five Oaks"></textarea></div>
      <div class="field"><label for="textPosition">Text position</label><select id="textPosition"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option></select></div>
      <div class="field"><label><input id="darkOverlay" type="checkbox" checked style="width:auto"> Darken image behind words</label></div>
      <div class="actions"><button id="previewCard" class="primary">Update preview</button><button id="downloadCard" class="good">Download image</button><button id="clearCard">Clear</button></div>
      <p id="cardStatus" class="statusline"></p>
    </div><div class="card"><div class="previewWrap cardPreview"><canvas id="cardCanvas" width="1080" height="1920"></canvas></div><div class="notice" style="margin-top:14px">Cards download at 1080 × 1920.</div></div></div>
  </div>
  <div id="scrollCardPanel" class="hidden">
    <div class="grid2"><div class="card">
      <div class="field"><label for="creditsText">Scrolling credits text</label><textarea id="creditsText" class="shortText">THE WORLD OF FIVE OAKS\n\nWritten by\nFiona Hollingsworth\n&\nCyrus Wren\n\nInspired by\nThe World of Five Oaks\n\n© 2026 All Rights Reserved</textarea></div>
      <div class="grid2">
        <div class="field"><label for="creditsSpeed">Scroll speed</label><select id="creditsSpeed"><option value="36">Slow</option><option value="52" selected>Medium</option><option value="72">Fast</option></select></div>
        <div class="field"><label for="creditsFontSize">Font size</label><input id="creditsFontSize" type="range" min="28" max="72" step="2" value="46"><small><span id="creditsFontValue">46</span> px</small></div>
        <div class="field"><label for="creditsFont">Font</label><select id="creditsFont"><option value="Georgia">Classic serif</option><option value="system-ui">Clean modern</option><option value="Trebuchet MS">Warm sans serif</option><option value="Courier New">Typewriter</option></select></div>
        <div class="field"><label for="creditsAlign">Alignment</label><select id="creditsAlign"><option value="center">Centered</option><option value="left">Left aligned</option></select></div>
        <div class="field"><label for="creditsTextColor">Text color</label><input id="creditsTextColor" type="color" value="#fff7ed"></div>
        <div class="field"><label for="creditsBgColor">Background color</label><input id="creditsBgColor" type="color" value="#090604"></div>
      </div>
      <div class="field"><label for="creditsBackground">Background image (optional)</label><input id="creditsBackground" type="file" accept="image/*"></div>
      <div class="field"><label for="creditsLogo">Logo at beginning (optional)</label><input id="creditsLogo" type="file" accept="image/*"></div>
      <div class="field"><label>Format</label><div class="formatToggle" id="creditsFormat"><button class="active" data-scroll-format="vertical">9:16</button><button data-scroll-format="wide">16:9</button></div></div>
      <div class="field"><label><input id="creditsFade" type="checkbox" checked style="width:auto"> Fade in and out</label></div>
      <div class="actions"><button id="previewCredits" class="primary">Preview scroll</button><button id="stopCredits">Stop</button><button id="exportCredits" class="good">Create & Download Video</button><button id="downloadLastCredits" disabled>Download last video</button></div>
      <p id="creditsStatus" class="statusline"></p>
    </div><div class="card"><div class="previewWrap cardPreview"><canvas id="creditsCanvas" width="720" height="1280"></canvas></div><div id="creditsDownloads" class="downloadList" style="margin-top:14px"></div></div></div>
  </div>`;
  $('.content').insertBefore(section,$('#projects')||$('#toast'));
  const grid=$('.quickGrid');if(grid&&!grid.querySelector('[data-jump="cards"]')){const q=document.createElement('button');q.className='card quick';q.dataset.jump='cards';q.innerHTML='<strong>Cards Studio</strong><span>Create title cards, credits cards, and scrolling credits.</span>';q.addEventListener('click',()=>showView('cards'));grid.insertBefore(q,grid.children[2]||null)}
}

function loadImage(file,key='image'){if(!file){state[key]=null;return Promise.resolve()}return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{state[key]=img;URL.revokeObjectURL(img.src);resolve()};img.onerror=reject;img.src=URL.createObjectURL(file)})}
function wrap(ctx,text,max){const lines=[];String(text||'').split(/\n/).forEach(p=>{if(!p){lines.push('');return}let line='';p.split(/\s+/).forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>max&&line){lines.push(line);line=word}else line=t});if(line)lines.push(line)});return lines}
function cover(ctx,img,w,h){const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,w,h)}
function drawCard(){const c=$('#cardCanvas');if(!c)return;const ctx=c.getContext('2d'),w=c.width=1080,h=c.height=1920;if(state.image)cover(ctx,state.image,w,h);else{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#3b261a');g.addColorStop(.55,'#1d130e');g.addColorStop(1,'#090605');ctx.fillStyle=g;ctx.fillRect(0,0,w,h)}if($('#darkOverlay').checked){ctx.fillStyle='rgba(0,0,0,.42)';ctx.fillRect(0,0,w,h)}ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fffaf5';ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=24;const title=$('#cardTitle').value.trim();const sub=$('#cardSubtitle').value.trim();const credits=$('#cardCredits').value.trim();if(state.mode==='credits'){ctx.font='800 104px Georgia,serif';ctx.fillText(title||'Credits',w/2,h*.18);ctx.font='600 48px Georgia,serif';wrap(ctx,credits||sub,w*.78).forEach((line,i)=>ctx.fillText(line,w/2,h*.36+i*66))}else{ctx.font='800 132px Georgia,serif';const lines=wrap(ctx,title||'Title Card',w*.78),y=$('#textPosition').value==='top'?h*.25:$('#textPosition').value==='bottom'?h*.74:h*.49;lines.forEach((line,i)=>ctx.fillText(line,w/2,y+(i-(lines.length-1)/2)*138));if(sub){ctx.font='600 50px Georgia,serif';wrap(ctx,sub,w*.78).forEach((line,i)=>ctx.fillText(line,w/2,y+lines.length*90+70+i*62))}}ctx.shadowBlur=0;ctx.font='700 28px system-ui';ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillText('THE WORLD OF FIVE OAKS',w/2,h-55);$('#cardStatus').textContent='Card ready: 1080 × 1920'}
function downloadCanvas(c,name){const a=document.createElement('a');a.download=name;a.href=c.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove()}

function scrollMetrics(ctx){const size=+$('creditsFontSize').value,lh=Math.round(size*1.55),lines=$('#creditsText').value.replace(/\r/g,'').split('\n'),logo=state.logoImage?Math.round(size*6.2):0;ctx.font=`700 ${size}px "${$('#creditsFont').value}"`;return{size,lh,lines,logo,total:lines.length*lh+logo}}
function scrollBg(ctx,c){ctx.fillStyle=$('#creditsBgColor').value;ctx.fillRect(0,0,c.width,c.height);if(state.bgImage){const s=Math.max(c.width/state.bgImage.width,c.height/state.bgImage.height),w=state.bgImage.width*s,h=state.bgImage.height*s;ctx.globalAlpha=.42;ctx.drawImage(state.bgImage,(c.width-w)/2,(c.height-h)/2,w,h);ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(0,0,c.width,c.height)}}
function drawScroll(y,opacity=1){const c=$('#creditsCanvas');if(!c)return;const ctx=c.getContext('2d');scrollBg(ctx,c);const m=scrollMetrics(ctx);ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=$('#creditsTextColor').value;ctx.textBaseline='top';ctx.textAlign=$('#creditsAlign').value;const x=ctx.textAlign==='center'?c.width/2:c.width*.11;let yy=y;if(state.logoImage){const maxW=c.width*.48,maxH=m.size*4.2,s=Math.min(maxW/state.logoImage.width,maxH/state.logoImage.height,1),w=state.logoImage.width*s,h=state.logoImage.height*s;ctx.drawImage(state.logoImage,(c.width-w)/2,yy,w,h);yy+=m.logo}m.lines.forEach(line=>{if(line.trim())ctx.fillText(line,x,yy);yy+=m.lh});ctx.restore()}
function resizeScroll(){const c=$('#creditsCanvas');[c.width,c.height]=state.scrollFormat==='wide'?[1280,720]:[720,1280]}
function drawScrollStill(){if(!$('#creditsCanvas'))return;resizeScroll();drawScroll($('#creditsCanvas').height*.18)}
function animateScroll(){cancelAnimationFrame(state.animation);state.running=true;const c=$('#creditsCanvas'),m=scrollMetrics(c.getContext('2d')),speed=+$('creditsSpeed').value,startY=c.height+40,endY=-m.total-30,travel=startY-endY,duration=travel/speed*1000,start=performance.now(),fade=$('#creditsFade').checked;return new Promise(resolve=>{const frame=now=>{if(!state.running){resolve();return}const e=now-start,p=Math.min(e/duration,1),y=startY-travel*p,op=fade?Math.min(1,e/900,(duration-e)/900):1;drawScroll(y,Math.max(0,op));if(p<1)state.animation=requestAnimationFrame(frame);else{state.running=false;resolve()}};state.animation=requestAnimationFrame(frame)})}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
async function exportScroll(){if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('#creditsStatus').textContent='This browser cannot export the credits video.';return}const c=$('#creditsCanvas'),stream=c.captureStream(30),types=['video/mp4;codecs=h264','video/mp4','video/webm;codecs=vp9','video/webm'],mime=types.find(t=>MediaRecorder.isTypeSupported(t))||'',chunks=[],rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:6000000}:undefined);rec.ondataavailable=e=>e.data?.size&&chunks.push(e.data);const done=new Promise(r=>rec.onstop=r);$('#creditsStatus').textContent='Creating credits video…';rec.start(250);await animateScroll();rec.stop();await done;const type=rec.mimeType||mime||'video/webm',ext=type.includes('mp4')?'mp4':'webm',name=`five-oaks-scrolling-credits.${ext}`,blob=new Blob(chunks,{type});state.lastScroll={blob,name};$('#downloadLastCredits').disabled=false;const box=$('#creditsDownloads');box.innerHTML=`<div class="downloadItem"><div><h3>${name}</h3><small>Scrolling credits video</small></div><div class="actions"><button id="creditsDownloadAgain" class="good">Download video</button></div></div>`;$('#creditsDownloadAgain').onclick=()=>downloadBlob(blob,name);downloadBlob(blob,name);$('#creditsStatus').textContent='Credits video created and downloaded.'}

function setTab(mode){state.mode=mode;$$('[data-card-tab]').forEach(b=>b.classList.toggle('active',b.dataset.cardTab===mode));$('#staticCardPanel').classList.toggle('hidden',mode==='scroll');$('#scrollCardPanel').classList.toggle('hidden',mode!=='scroll');$('#cardSubtitleField').classList.toggle('hidden',mode==='credits');$('#cardCreditsField').classList.toggle('hidden',mode!=='credits');if(mode==='scroll')drawScrollStill();else drawCard()}
function bind(){
  $$('[data-card-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.cardTab)));
  $('#cardImage').addEventListener('change',async e=>{await loadImage(e.target.files?.[0]);drawCard()});
  ['cardTitle','cardSubtitle','cardCredits','textPosition','darkOverlay'].forEach(id=>$('#'+id).addEventListener(id==='darkOverlay'?'change':'input',drawCard));
  $('#previewCard').onclick=drawCard;$('#downloadCard').onclick=()=>{drawCard();downloadCanvas($('#cardCanvas'),`${safe($('#cardTitle').value||state.mode)}-${state.mode}.png`);$('#cardStatus').textContent='Image downloaded.'};
  $('#clearCard').onclick=()=>{state.image=null;$('#cardImage').value='';$('#cardTitle').value='';$('#cardSubtitle').value='';$('#cardCredits').value='';drawCard()};
  ['creditsText','creditsFont','creditsAlign','creditsTextColor','creditsBgColor'].forEach(id=>$('#'+id).addEventListener('input',drawScrollStill));
  $('#creditsFontSize').oninput=()=>{$('#creditsFontValue').textContent=$('#creditsFontSize').value;drawScrollStill()};
  $('#creditsBackground').onchange=async e=>{await loadImage(e.target.files?.[0],'bgImage');drawScrollStill()};$('#creditsLogo').onchange=async e=>{await loadImage(e.target.files?.[0],'logoImage');drawScrollStill()};
  $$('[data-scroll-format]').forEach(b=>b.onclick=()=>{$$('[data-scroll-format]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.scrollFormat=b.dataset.scrollFormat;drawScrollStill()});
  $('#previewCredits').onclick=animateScroll;$('#stopCredits').onclick=()=>{state.running=false;cancelAnimationFrame(state.animation);drawScrollStill()};$('#exportCredits').onclick=exportScroll;$('#downloadLastCredits').onclick=()=>state.lastScroll&&downloadBlob(state.lastScroll.blob,state.lastScroll.name);
  setTab('title');
}
document.addEventListener('DOMContentLoaded',()=>{addUI();bind()});
})();