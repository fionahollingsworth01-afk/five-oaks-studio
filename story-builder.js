(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const state={scenes:[],audioFile:null,audioUrl:'',playing:false};
const loadImage=file=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=URL.createObjectURL(file)});
const safeName=s=>(s||'five-oaks-story').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'five-oaks-story';

function showView(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
 if(id==='story')drawFrame(0);
}

function addUI(){
 const nav=$('.nav'); if(!nav||$('#story'))return;
 const projects=nav.querySelector('[data-view="projects"]');
 const btn=document.createElement('button');btn.dataset.view='story';btn.textContent='Story';nav.insertBefore(btn,projects||null);nav.style.gridTemplateColumns='repeat(6,1fr)';
 btn.addEventListener('click',()=>showView('story'));
 const section=document.createElement('section');section.id='story';section.className='view';
 section.innerHTML=`<div class="sectionTitle"><div><h2>Simple Story Builder</h2><p>Test a short vertical video with 3–5 images and one narration file.</p></div></div>
 <div class="grid2"><div class="card">
 <div class="field"><label for="storyTitle">Video file title</label><input id="storyTitle" placeholder="The New Bull"></div>
 <div class="field"><label for="storyImages">Choose 3–5 images</label><input id="storyImages" type="file" accept="image/*" multiple><small>For this first test, keep it to five images or fewer.</small></div>
 <div id="sceneList" class="projectList"></div>
 <div class="field" style="margin-top:14px"><label for="storyAudio">Narration MP3 (optional)</label><input id="storyAudio" type="file" accept="audio/*"><small>The final image stays onscreen if the narration is longer than the image timing.</small></div>
 <div class="field"><label><input id="storyFade" type="checkbox" checked style="width:auto"> Fade between images</label></div>
 <div class="actions"><button id="previewStory" class="primary">Preview</button><button id="stopStory">Stop</button><button id="createStory" class="good">Create video</button><button id="clearStory">Clear</button></div>
 <p id="storyStatus" class="statusline"></p><div class="notice warn">This is the iPhone test version. Export format depends on what your browser supports. Keep the first video short.</div>
 </div><div class="card"><div class="previewWrap"><canvas id="storyCanvas" width="540" height="960"></canvas></div><div id="storyDownload" class="downloadList" style="margin-top:14px"></div></div></div>`;
 $('.content').insertBefore(section,$('#projects')||$('#toast'));
 const grid=$('.quickGrid');if(grid&&!grid.querySelector('[data-jump="story"]')){const q=document.createElement('button');q.className='card quick';q.dataset.jump='story';q.innerHTML='<strong>Simple Story Builder</strong><span>Join 3–5 images and one narration file into a vertical video.</span>';q.addEventListener('click',()=>showView('story'));grid.insertBefore(q,grid.children[3]||null)}
}

function drawCover(ctx,img,w,h,zoom=1){
 const scale=Math.max(w/img.width,h/img.height)*zoom,sw=w/scale,sh=h/scale,sx=(img.width-sw)/2,sy=(img.height-sh)/2;
 ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
}
function totalSeconds(){return state.scenes.reduce((n,s)=>n+s.duration,0)}
function sceneAt(t){let passed=0;for(let i=0;i<state.scenes.length;i++){const end=passed+state.scenes[i].duration;if(t<end||i===state.scenes.length-1)return{scene:state.scenes[i],index:i,local:t-passed};passed=end}return null}
function drawFrame(t){
 const canvas=$('#storyCanvas');if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.fillStyle='#090605';ctx.fillRect(0,0,w,h);
 if(!state.scenes.length){ctx.fillStyle='#cbb8aa';ctx.font='700 27px system-ui';ctx.textAlign='center';ctx.fillText('Choose 3–5 images',w/2,h/2);return}
 const hit=sceneAt(Math.max(0,t));if(!hit)return;const {scene,index,local}=hit;drawCover(ctx,scene.img,w,h,1+Math.min(.035,local*.006));
 if($('#storyFade')&&$('#storyFade').checked){const fade=.45;let alpha=0;if(local<fade)alpha=1-local/fade;else if(scene.duration-local<fade&&index<state.scenes.length-1)alpha=1-(scene.duration-local)/fade;if(alpha>0){ctx.fillStyle=`rgba(0,0,0,${Math.max(0,Math.min(1,alpha))})`;ctx.fillRect(0,0,w,h)}}
}
function renderList(){
 const list=$('#sceneList');if(!list)return;if(!state.scenes.length){list.innerHTML='<div class="empty">No images chosen yet.</div>';drawFrame(0);return}
 list.innerHTML='';state.scenes.forEach((s,i)=>{const row=document.createElement('div');row.className='projectItem';row.innerHTML=`<div><h3>${i+1}. ${s.file.name}</h3><small>Scene ${i+1}</small></div><div class="actions"><label style="display:flex;align-items:center;gap:6px">Seconds <input data-duration="${i}" type="number" min="1" max="20" step="1" value="${s.duration}" style="width:72px"></label><button data-up="${i}" ${i===0?'disabled':''}>↑</button><button data-down="${i}" ${i===state.scenes.length-1?'disabled':''}>↓</button><button data-remove="${i}" class="danger">Remove</button></div>`;list.appendChild(row)});
 list.querySelectorAll('[data-duration]').forEach(x=>x.addEventListener('change',()=>{state.scenes[+x.dataset.duration].duration=Math.max(1,Math.min(20,+x.value||4));x.value=state.scenes[+x.dataset.duration].duration}));
 list.querySelectorAll('[data-up]').forEach(x=>x.addEventListener('click',()=>move(+x.dataset.up,-1)));list.querySelectorAll('[data-down]').forEach(x=>x.addEventListener('click',()=>move(+x.dataset.down,1)));list.querySelectorAll('[data-remove]').forEach(x=>x.addEventListener('click',()=>{state.scenes.splice(+x.dataset.remove,1);renderList()}));drawFrame(0)
}
function move(i,d){const j=i+d;if(j<0||j>=state.scenes.length)return;[state.scenes[i],state.scenes[j]]=[state.scenes[j],state.scenes[i]];renderList()}
async function chooseImages(files){
 const chosen=[...files].slice(0,5);state.scenes=[];$('#storyStatus').textContent='Opening images…';
 for(const file of chosen){try{state.scenes.push({file,img:await loadImage(file),duration:4})}catch{}}
 renderList();$('#storyStatus').textContent=state.scenes.length?`${state.scenes.length} image(s) ready.`:'Those images could not be opened.'
}
async function preview(){
 if(!state.scenes.length){$('#storyStatus').textContent='Choose images first.';return}stop();state.playing=true;const start=performance.now(),duration=totalSeconds();
 if(state.audioUrl){const a=$('#storyPreviewAudio');if(a){a.currentTime=0;a.play().catch(()=>{})}}
 const tick=now=>{if(!state.playing)return;const t=(now-start)/1000;drawFrame(Math.min(t,duration-.01));if(t<duration)requestAnimationFrame(tick);else{state.playing=false;$('#storyStatus').textContent='Preview finished.'}};requestAnimationFrame(tick)
}
function stop(){state.playing=false;const a=$('#storyPreviewAudio');if(a){a.pause();a.currentTime=0}drawFrame(0)}
function bestMime(){const choices=['video/mp4;codecs=h264,aac','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return choices.find(x=>window.MediaRecorder&&MediaRecorder.isTypeSupported(x))||''}
async function createVideo(){
 if(!state.scenes.length){$('#storyStatus').textContent='Choose images first.';return}if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('#storyStatus').textContent='This browser cannot export the video. The rest of Five Oaks Studio is unchanged.';return}
 const button=$('#createStory');button.disabled=true;$('#storyStatus').textContent='Preparing video… Keep this page open.';stop();
 let audio=null,ctx=null,source=null,destination=null;try{
  const canvas=$('#storyCanvas'),stream=canvas.captureStream(30);let runSeconds=totalSeconds();
  if(state.audioFile){audio=new Audio(state.audioUrl);audio.preload='auto';await new Promise(r=>{if(Number.isFinite(audio.duration))r();else{audio.onloadedmetadata=r;audio.onerror=r}});if(Number.isFinite(audio.duration))runSeconds=Math.max(runSeconds,audio.duration);ctx=new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();source=ctx.createMediaElementSource(audio);destination=ctx.createMediaStreamDestination();source.connect(destination);source.connect(ctx.destination);destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t))}
  const mime=bestMime(),recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined),chunks=[];recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||e)});recorder.start(1000);if(audio){audio.currentTime=0;await audio.play()}
  const start=performance.now();await new Promise(resolve=>{const tick=now=>{const t=(now-start)/1000;drawFrame(Math.min(t,totalSeconds()-.01));$('#storyStatus').textContent=`Creating video… ${Math.min(100,Math.round(t/runSeconds*100))}%`;if(t<runSeconds)requestAnimationFrame(tick);else resolve()};requestAnimationFrame(tick)});
  if(audio)audio.pause();recorder.stop();await done;const type=recorder.mimeType||mime||'video/webm',blob=new Blob(chunks,{type}),ext=type.includes('mp4')?'mp4':'webm',url=URL.createObjectURL(blob),name=`${safeName($('#storyTitle').value)}.${ext}`;
  const box=$('#storyDownload');box.innerHTML='';const item=document.createElement('div');item.className='downloadItem';item.innerHTML=`<div><h3>${name}</h3><small>${(blob.size/1048576).toFixed(1)} MB</small></div><div class="actions"><a class="buttonLike" href="${url}" download="${name}">Download video</a></div>`;box.appendChild(item);$('#storyStatus').textContent=`Video ready. Download the ${ext.toUpperCase()} file below.`
 }catch(err){console.error(err);$('#storyStatus').textContent='The phone could not finish this export. Try fewer images or shorter timing.'}finally{if(ctx)ctx.close().catch(()=>{});button.disabled=false;drawFrame(0)}
}
function clearAll(){if(!confirm('Clear this story builder?'))return;stop();state.scenes=[];state.audioFile=null;if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);state.audioUrl='';$('#storyImages').value='';$('#storyAudio').value='';$('#storyTitle').value='';$('#storyDownload').innerHTML='';renderList();$('#storyStatus').textContent='Cleared.'}
function bind(){
 $('#storyImages').addEventListener('change',e=>chooseImages(e.target.files));
 $('#storyAudio').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);state.audioFile=f||null;state.audioUrl=f?URL.createObjectURL(f):'';let a=$('#storyPreviewAudio');if(!a){a=document.createElement('audio');a.id='storyPreviewAudio';a.hidden=true;document.body.appendChild(a)}a.src=state.audioUrl;$('#storyStatus').textContent=f?`Narration ready: ${f.name}`:'Narration removed.'});
 $('#previewStory').addEventListener('click',preview);$('#stopStory').addEventListener('click',stop);$('#createStory').addEventListener('click',createVideo);$('#clearStory').addEventListener('click',clearAll);renderList()
}
document.addEventListener('DOMContentLoaded',()=>{addUI();bind()});
})();