(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={clips:[],music:null,last:null,format:'vertical',busy:false};
const safe=s=>(s||'five-oaks-video').trim().replace(/[^a-z0-9 _-]/gi,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80)||'five-oaks-video';

function showView(id){
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  $$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
  scrollTo({top:0,behavior:'smooth'});
}

function addUI(){
  if($('#videoBuilder'))return;
  const nav=$('.nav'), projects=nav?.querySelector('[data-view="projects"]');
  if(nav){const b=document.createElement('button');b.dataset.view='videoBuilder';b.textContent='Clips';nav.insertBefore(b,projects||null);b.onclick=()=>showView('videoBuilder')}
  const section=document.createElement('section');section.id='videoBuilder';section.className='view';
  section.innerHTML=`
  <div class="sectionTitle"><div><h2>Video Clip Builder</h2><p>Join up to five short video clips and add background music.</p></div></div>
  <div class="grid2"><div class="card">
    <div class="field"><label for="clipProjectName">Finished video name</label><input id="clipProjectName" placeholder="Book 20 Scene Video"></div>
    <div class="field"><label for="videoClipUpload">Upload 1–5 video clips</label><input id="videoClipUpload" type="file" accept="video/*" multiple><small>Each clip should be 3–8 seconds. Clips play in the order shown below.</small></div>
    <div id="clipList" class="downloadList"></div>
    <div class="field"><label>Format</label><div class="formatToggle" id="clipFormat"><button class="active" data-clip-format="vertical">9:16</button><button data-clip-format="wide">16:9</button></div></div>
    <div class="field"><label for="musicUpload">Background music (optional)</label><input id="musicUpload" type="file" accept="audio/*"></div>
    <div id="musicInfo" class="notice hidden"></div>
    <div class="field"><label>Music volume</label><div class="rangeRow"><input id="musicVolume" type="range" min="0" max="100" step="1" value="18"><span id="musicVolumeValue" class="valuePill">18%</span></div></div>
    <div class="field"><label><input id="musicFade" type="checkbox" checked style="width:auto"> Fade music in and out</label></div>
    <div class="actions"><button id="previewClipBuild" class="primary">Preview</button><button id="stopClipBuild">Stop</button><button id="exportClipBuild" class="good">Create & Download Video</button><button id="clearClipBuild">Clear</button></div>
    <p id="clipBuildStatus" class="statusline"></p>
  </div><div class="card"><div class="previewWrap"><canvas id="clipBuildCanvas" width="720" height="1280"></canvas></div><div class="notice" style="margin-top:14px">The original clip sound is muted. Uploaded music is added underneath the finished video.</div></div></div>
  <div class="card" style="margin-top:16px"><h3>Finished video</h3><div id="clipBuildDownloads" class="downloadList"><div class="empty">Your finished video will appear here.</div></div></div>`;
  $('.content')?.insertBefore(section,$('#projects')||$('#toast'));
  const grid=$('.quickGrid');if(grid&&!grid.querySelector('[data-jump="videoBuilder"]')){const q=document.createElement('button');q.className='card quick';q.dataset.jump='videoBuilder';q.innerHTML='<strong>Video Clip Builder</strong><span>Join five short clips and add music.</span>';q.onclick=()=>showView('videoBuilder');grid.insertBefore(q,grid.children[2]||null)}
}

function mediaDuration(file,type){return new Promise((resolve,reject)=>{const el=document.createElement(type),u=URL.createObjectURL(file);el.preload='metadata';el.onloadedmetadata=()=>{const d=el.duration;URL.revokeObjectURL(u);Number.isFinite(d)?resolve(d):reject(new Error('Could not read duration.'))};el.onerror=()=>{URL.revokeObjectURL(u);reject(new Error(`Could not open ${file.name}.`))};el.src=u})}
function renderClips(){const box=$('#clipList');if(!box)return;box.innerHTML=state.clips.length?'':'<div class="empty">No video clips selected.</div>';state.clips.forEach((c,i)=>{const row=document.createElement('div');row.className='downloadItem';row.innerHTML=`<div><h3>${i+1}. ${c.file.name}</h3><small>${c.duration.toFixed(1)} seconds</small></div>`;const acts=document.createElement('div');acts.className='actions';const up=document.createElement('button');up.textContent='↑';up.disabled=i===0;up.onclick=()=>{[state.clips[i-1],state.clips[i]]=[state.clips[i],state.clips[i-1]];renderClips()};const down=document.createElement('button');down.textContent='↓';down.disabled=i===state.clips.length-1;down.onclick=()=>{[state.clips[i+1],state.clips[i]]=[state.clips[i],state.clips[i+1]];renderClips()};const remove=document.createElement('button');remove.textContent='Remove';remove.className='danger';remove.onclick=()=>{state.clips.splice(i,1);renderClips();drawEmpty()};acts.append(up,down,remove);row.appendChild(acts);box.appendChild(row)})}
function resize(){const c=$('#clipBuildCanvas');if(!c)return;[c.width,c.height]=state.format==='wide'?[1280,720]:[720,1280];drawEmpty()}
function drawEmpty(){const c=$('#clipBuildCanvas');if(!c)return;const x=c.getContext('2d');x.fillStyle='#080605';x.fillRect(0,0,c.width,c.height);x.fillStyle='#bfae9f';x.textAlign='center';x.font='30px system-ui';x.fillText(state.clips.length?`${state.clips.length} clip${state.clips.length===1?'':'s'} ready`:'Upload video clips',c.width/2,c.height/2)}
function coverVideo(ctx,v,c){const ir=v.videoWidth/v.videoHeight,cr=c.width/c.height;let sx=0,sy=0,sw=v.videoWidth,sh=v.videoHeight;if(ir>cr){sw=v.videoHeight*cr;sx=(v.videoWidth-sw)/2}else{sh=v.videoWidth/cr;sy=(v.videoHeight-sh)/2}ctx.drawImage(v,sx,sy,sw,sh,0,0,c.width,c.height)}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
async function playSequence(recording=false){
  if(!state.clips.length)throw new Error('Upload at least one video clip.');
  const canvas=$('#clipBuildCanvas'),ctx=canvas.getContext('2d');
  state.busy=true;
  for(const clip of state.clips){
    if(!state.busy)break;
    const v=document.createElement('video'),u=URL.createObjectURL(clip.file);v.src=u;v.muted=true;v.playsInline=true;v.preload='auto';
    await new Promise((res,rej)=>{v.onloadeddata=res;v.onerror=()=>rej(new Error(`Could not play ${clip.file.name}.`))});
    v.currentTime=0;await v.play();
    await new Promise(resolve=>{const frame=()=>{if(!state.busy||v.ended||v.currentTime>=clip.duration-.03){v.pause();resolve();return}ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);coverVideo(ctx,v,canvas);requestAnimationFrame(frame)};requestAnimationFrame(frame)});
    URL.revokeObjectURL(u);
  }
  state.busy=false;
}
function stopAll(){state.busy=false;$$('video').forEach(v=>{if(!v.closest('#videoBuilder'))return;v.pause()});const a=$('#clipMusicPlayer');if(a){a.pause();a.remove()}drawEmpty()}
function makeMusic(total,ctx,dest){if(!state.music)return null;const a=document.createElement('audio');a.id='clipMusicPlayer';a.src=URL.createObjectURL(state.music);a.loop=true;a.preload='auto';document.body.appendChild(a);const src=ctx.createMediaElementSource(a),gain=ctx.createGain();src.connect(gain).connect(dest);const level=Number($('#musicVolume').value)/100,fade=$('#musicFade').checked,now=ctx.currentTime;gain.gain.setValueAtTime(fade?0:level,now);if(fade)gain.gain.linearRampToValueAtTime(level,now+Math.min(1.2,total/4));if(fade&&total>1.5){gain.gain.setValueAtTime(level,now+Math.max(1,total-1.2));gain.gain.linearRampToValueAtTime(0,now+total)}return{a,url:a.src}}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
async function exportVideo(){
  if(state.busy)return;
  if(!state.clips.length){$('#clipBuildStatus').textContent='Upload at least one clip first.';return}
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('#clipBuildStatus').textContent='Use Chrome or Edge on the laptop to create the video.';return}
  const b=$('#exportClipBuild');b.disabled=true;$('#clipBuildStatus').textContent='Creating your finished video…';
  const canvas=$('#clipBuildCanvas'),videoStream=canvas.captureStream(30),audioCtx=new (window.AudioContext||window.webkitAudioContext)(),dest=audioCtx.createMediaStreamDestination(),total=state.clips.reduce((n,c)=>n+c.duration,0),music=makeMusic(total,audioCtx,dest),stream=new MediaStream([...videoStream.getVideoTracks(),...dest.stream.getAudioTracks()]);
  const types=['video/mp4;codecs=h264,aac','video/mp4','video/webm;codecs=vp9,opus','video/webm'],mime=types.find(t=>MediaRecorder.isTypeSupported(t))||'',chunks=[],rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:7000000}:undefined);rec.ondataavailable=e=>e.data?.size&&chunks.push(e.data);const done=new Promise(r=>rec.onstop=r);rec.start(250);
  try{if(music){await audioCtx.resume();await music.a.play()}await playSequence(true);await wait(150);rec.stop();await done;const type=rec.mimeType||mime||'video/webm',ext=type.includes('mp4')?'mp4':'webm',name=`${safe($('#clipProjectName').value)}.${ext}`,blob=new Blob(chunks,{type});state.last={blob,name};const box=$('#clipBuildDownloads');box.innerHTML=`<div class="downloadItem"><div><h3>${name}</h3><small>${total.toFixed(1)} seconds · music ${state.music?'added':'not added'}</small></div><div class="actions"><button id="downloadClipBuildAgain" class="good">Download Video</button></div></div>`;$('#downloadClipBuildAgain').onclick=()=>downloadBlob(blob,name);downloadBlob(blob,name);$('#clipBuildStatus').textContent='Finished video created and downloaded.'}catch(e){if(rec.state!=='inactive')rec.stop();$('#clipBuildStatus').textContent=e.message||'The video could not be created.'}finally{if(music){music.a.pause();URL.revokeObjectURL(music.url);music.a.remove()}await audioCtx.close();b.disabled=false;state.busy=false}
}
function bind(){
  $('#videoClipUpload').onchange=async e=>{const files=[...e.target.files].slice(0,5);state.clips=[];$('#clipBuildStatus').textContent='Checking clips…';for(const file of files){try{const duration=await mediaDuration(file,'video');if(duration<2.8||duration>8.25){$('#clipBuildStatus').textContent=`Skipped ${file.name}: clips must be 3–8 seconds.`;continue}state.clips.push({file,duration})}catch(err){$('#clipBuildStatus').textContent=err.message}}renderClips();drawEmpty();if(state.clips.length)$('#clipBuildStatus').textContent=`${state.clips.length} clip${state.clips.length===1?'':'s'} ready.`;e.target.value=''};
  $('#musicUpload').onchange=async e=>{const f=e.target.files?.[0];state.music=f||null;const box=$('#musicInfo');if(f){const d=await mediaDuration(f,'audio').catch(()=>0);box.textContent=`Music: ${f.name}${d?` · ${d.toFixed(1)} seconds`:''}. It will loop if needed.`;box.classList.remove('hidden')}else box.classList.add('hidden')};
  $('#musicVolume').oninput=e=>$('#musicVolumeValue').textContent=`${e.target.value}%`;
  $$('[data-clip-format]').forEach(b=>b.onclick=()=>{$$('[data-clip-format]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.format=b.dataset.clipFormat;resize()});
  $('#previewClipBuild').onclick=async()=>{if(state.busy)return;$('#clipBuildStatus').textContent='Previewing clips…';try{await playSequence();$('#clipBuildStatus').textContent='Preview finished.'}catch(e){$('#clipBuildStatus').textContent=e.message}};
  $('#stopClipBuild').onclick=stopAll;$('#exportClipBuild').onclick=exportVideo;
  $('#clearClipBuild').onclick=()=>{stopAll();state.clips=[];state.music=null;$('#musicUpload').value='';$('#musicInfo').classList.add('hidden');$('#clipProjectName').value='';renderClips();$('#clipBuildStatus').textContent='Cleared.'};
}
function init(){addUI();bind();resize();renderClips();document.querySelectorAll('.badge').forEach(el=>{if(el.textContent.includes('Version'))el.textContent='Version 0.8.1'});const footer=$('.footer');if(footer)footer.textContent='Five Oaks Studio — Version 0.8.1'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();