(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const MAX_CLIPS=5,MAX_TOTAL_SECONDS=180,MAX_CLIP_SECONDS=180,MIN_CLIP_SECONDS=.25,CROSSFADE_SECONDS=.6;
const state={clips:[],music:null,voice:null,last:null,format:'vertical',busy:false};
const safe=s=>(s||'five-oaks-video').trim().replace(/[^a-z0-9 _-]/gi,'').replace(/\s+/g,'-').replace(/-+/g,'-').slice(0,80)||'five-oaks-video';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));scrollTo({top:0,behavior:'smooth'})}
function addUI(){
 if($('#videoBuilder'))return;
 const nav=$('.nav'),projects=nav?.querySelector('[data-view="projects"]');
 if(nav){const b=document.createElement('button');b.dataset.view='videoBuilder';b.textContent='Clips';nav.insertBefore(b,projects||null);b.onclick=()=>showView('videoBuilder')}
 const section=document.createElement('section');section.id='videoBuilder';section.className='view';
 section.innerHTML=`
 <div class="sectionTitle"><div><h2>Complete Video Builder</h2><p>Blend clips, voiceover, music, a title card, and scrolling credits into one video up to three minutes long.</p></div></div>
 <div class="grid2"><div class="card">
  <div class="field"><label for="clipProjectName">Finished video name</label><input id="clipProjectName" placeholder="Book 20 Scene Video"></div>
  <div class="field"><label for="videoClipUpload">Upload 1–5 video clips</label><input id="videoClipUpload" type="file" accept="video/*" multiple><small>The complete finished video, including cards, may be up to 3 minutes.</small></div>
  <div id="clipList" class="downloadList"></div>
  <div class="field"><label><input id="blendClips" type="checkbox" checked style="width:auto"> Smoothly blend clips together</label></div>
  <div class="field"><label>Format</label><div class="formatToggle" id="clipFormat"><button class="active" data-clip-format="vertical">9:16</button><button data-clip-format="wide">16:9</button></div></div>
  <hr>
  <div class="field"><label><input id="useTitleCard" type="checkbox" style="width:auto"> Add title card</label></div>
  <div class="field"><label for="titleText">Title</label><input id="titleText" placeholder="The Harvey Family"></div>
  <div class="field"><label for="subtitleText">Subtitle (optional)</label><input id="subtitleText" placeholder="Inspired by Book 20 of The Five Oaks Saga"></div>
  <div class="field"><label>Title card length</label><div class="rangeRow"><input id="titleDuration" type="range" min="2" max="8" step="1" value="4"><span id="titleDurationValue" class="valuePill">4 sec</span></div></div>
  <hr>
  <div class="field"><label for="voiceUpload">Voiceover</label><input id="voiceUpload" type="file" accept="audio/*"></div><div id="voiceInfo" class="notice hidden"></div>
  <div class="field"><label>Voiceover volume</label><div class="rangeRow"><input id="voiceVolume" type="range" min="0" max="100" step="1" value="100"><span id="voiceVolumeValue" class="valuePill">100%</span></div></div>
  <div class="field"><label for="musicUpload">Background music</label><input id="musicUpload" type="file" accept="audio/*"></div><div id="musicInfo" class="notice hidden"></div>
  <div class="field"><label>Music volume</label><div class="rangeRow"><input id="musicVolume" type="range" min="0" max="100" step="1" value="18"><span id="musicVolumeValue" class="valuePill">18%</span></div></div>
  <div class="field"><label><input id="musicFade" type="checkbox" checked style="width:auto"> Fade music in and out</label></div>
  <hr>
  <div class="field"><label><input id="useCredits" type="checkbox" style="width:auto"> Add scrolling credits</label></div>
  <div class="field"><label for="creditsText">Credits — one line per entry</label><textarea id="creditsText" rows="8" placeholder="Inspired by Book 20 of The Five Oaks Saga\nWritten by Fiona Hollingsworth & Cyrus Wren\nCreated with Five Oaks Studio"></textarea></div>
  <div class="field"><label>Credits length</label><div class="rangeRow"><input id="creditsDuration" type="range" min="5" max="20" step="1" value="10"><span id="creditsDurationValue" class="valuePill">10 sec</span></div></div>
  <div class="actions"><button id="previewClipBuild" class="primary">Preview</button><button id="stopClipBuild">Stop</button><button id="exportClipBuild" class="good">Create & Download Video</button><button id="clearClipBuild">Clear</button></div>
  <p id="clipBuildStatus" class="statusline"></p>
 </div><div class="card"><div class="previewWrap"><canvas id="clipBuildCanvas" width="720" height="1280"></canvas></div><div class="notice" style="margin-top:14px">Voiceover and music are mixed directly into the finished video. Title and credits are added automatically when selected.</div></div></div>
 <div class="card" style="margin-top:16px"><h3>Finished video</h3><div id="clipBuildDownloads" class="downloadList"><div class="empty">Your finished video will appear here.</div></div></div>`;
 $('.content')?.insertBefore(section,$('#projects')||$('#toast'));
 const grid=$('.quickGrid');if(grid&&!grid.querySelector('[data-jump="videoBuilder"]')){const q=document.createElement('button');q.className='card quick';q.dataset.jump='videoBuilder';q.innerHTML='<strong>Complete Video Builder</strong><span>Combine clips, voiceover, music, title, and credits.</span>';q.onclick=()=>showView('videoBuilder');grid.insertBefore(q,grid.children[2]||null)}
}
function mediaDuration(file,type){return new Promise((resolve,reject)=>{const el=document.createElement(type),u=URL.createObjectURL(file);el.preload='metadata';el.onloadedmetadata=()=>{const d=el.duration;URL.revokeObjectURL(u);Number.isFinite(d)?resolve(d):reject(new Error('Could not read duration.'))};el.onerror=()=>{URL.revokeObjectURL(u);reject(new Error(`Could not open ${file.name}.`))};el.src=u})}
function rawDuration(){return state.clips.reduce((n,c)=>n+c.duration,0)}
function blendEnabled(){return $('#blendClips')?.checked!==false}
function transitionFor(a,b){return blendEnabled()?Math.min(CROSSFADE_SECONDS,a.duration/3,b.duration/3):0}
function clipsDuration(){let total=rawDuration();for(let i=0;i<state.clips.length-1;i++)total-=transitionFor(state.clips[i],state.clips[i+1]);return Math.max(0,total)}
function titleSeconds(){return $('#useTitleCard')?.checked?Number($('#titleDuration')?.value||4):0}
function creditsSeconds(){return $('#useCredits')?.checked?Number($('#creditsDuration')?.value||10):0}
function totalDuration(){return clipsDuration()+titleSeconds()+creditsSeconds()}
function updateReadyStatus(){const total=totalDuration();$('#clipBuildStatus').textContent=state.clips.length?`${state.clips.length} clip${state.clips.length===1?'':'s'} ready · finished length ${total.toFixed(1)} of 180 seconds.`:'No clips selected.'}
function renderClips(){const box=$('#clipList');if(!box)return;box.innerHTML=state.clips.length?'':'<div class="empty">No video clips selected.</div>';state.clips.forEach((c,i)=>{const row=document.createElement('div');row.className='downloadItem';row.innerHTML=`<div><h3>${i+1}. ${c.file.name}</h3><small>${c.duration.toFixed(1)} seconds</small></div>`;const acts=document.createElement('div');acts.className='actions';const up=document.createElement('button');up.textContent='↑';up.disabled=i===0;up.onclick=()=>{[state.clips[i-1],state.clips[i]]=[state.clips[i],state.clips[i-1]];renderClips();updateReadyStatus()};const down=document.createElement('button');down.textContent='↓';down.disabled=i===state.clips.length-1;down.onclick=()=>{[state.clips[i+1],state.clips[i]]=[state.clips[i],state.clips[i+1]];renderClips();updateReadyStatus()};const remove=document.createElement('button');remove.textContent='Remove';remove.className='danger';remove.onclick=()=>{state.clips.splice(i,1);renderClips();drawEmpty();updateReadyStatus()};acts.append(up,down,remove);row.appendChild(acts);box.appendChild(row)});if(state.clips.length){const total=document.createElement('div');total.className='notice';total.textContent=`Complete finished length: ${totalDuration().toFixed(1)} of 180 seconds`;box.appendChild(total)}}
function resize(){const c=$('#clipBuildCanvas');if(!c)return;[c.width,c.height]=state.format==='wide'?[1280,720]:[720,1280];drawEmpty()}
function drawEmpty(){const c=$('#clipBuildCanvas');if(!c)return;const x=c.getContext('2d');x.fillStyle='#080605';x.fillRect(0,0,c.width,c.height);x.fillStyle='#bfae9f';x.textAlign='center';x.font='30px system-ui';x.fillText(state.clips.length?`${state.clips.length} clips · ${totalDuration().toFixed(1)} sec`:'Upload video clips',c.width/2,c.height/2)}
function coverVideo(ctx,v,c){const ir=v.videoWidth/v.videoHeight,cr=c.width/c.height;let sx=0,sy=0,sw=v.videoWidth,sh=v.videoHeight;if(ir>cr){sw=v.videoHeight*cr;sx=(v.videoWidth-sw)/2}else{sh=v.videoWidth/cr;sy=(v.videoHeight-sh)/2}ctx.drawImage(v,sx,sy,sw,sh,0,0,c.width,c.height)}
function drawCenteredText(ctx,canvas,title,subtitle=''){ctx.fillStyle='#080605';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f4eadf';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${Math.round(canvas.width*.075)}px Georgia,serif`;wrapText(ctx,title||'',canvas.width/2,canvas.height*.46,canvas.width*.82,Math.round(canvas.width*.09));if(subtitle){ctx.fillStyle='#cdbca9';ctx.font=`${Math.round(canvas.width*.035)}px Georgia,serif`;wrapText(ctx,subtitle,canvas.width/2,canvas.height*.62,canvas.width*.78,Math.round(canvas.width*.05))}}
function wrapText(ctx,text,x,y,maxWidth,lineHeight){const words=String(text).split(/\s+/);let line='',lines=[];for(const word of words){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word}else line=test}if(line)lines.push(line);const start=y-(lines.length-1)*lineHeight/2;lines.forEach((l,i)=>ctx.fillText(l,x,start+i*lineHeight))}
async function playCard(seconds,drawer){const start=performance.now();await new Promise(resolve=>{const frame=now=>{if(!state.busy){resolve();return}const p=Math.min(1,(now-start)/(seconds*1000));drawer(p);if(p>=1)resolve();else requestAnimationFrame(frame)};requestAnimationFrame(frame)})}
function loadVideoItem(clip){return new Promise((resolve,reject)=>{const v=document.createElement('video'),url=URL.createObjectURL(clip.file);v.src=url;v.muted=true;v.playsInline=true;v.preload='auto';v.onloadeddata=()=>resolve({v,url,clip});v.onerror=()=>{URL.revokeObjectURL(url);reject(new Error(`Could not play ${clip.file.name}.`))}})}
function drawFrame(ctx,canvas,first,second,alpha=0){ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.globalAlpha=1;coverVideo(ctx,first,canvas);if(second&&alpha>0){ctx.globalAlpha=Math.max(0,Math.min(1,alpha));coverVideo(ctx,second,canvas);ctx.globalAlpha=1}}
function runFrames(test){return new Promise(resolve=>{const frame=()=>{if(!state.busy||test()){resolve();return}requestAnimationFrame(frame)};requestAnimationFrame(frame)})}
async function playSequence(){
 if(!state.clips.length)throw new Error('Upload at least one video clip.');
 const canvas=$('#clipBuildCanvas'),ctx=canvas.getContext('2d'),items=[];state.busy=true;
 try{
  if(titleSeconds())await playCard(titleSeconds(),()=>drawCenteredText(ctx,canvas,$('#titleText').value,$('#subtitleText').value));
  for(const clip of state.clips)items.push(await loadVideoItem(clip));
  let current=items[0];current.v.currentTime=0;await current.v.play();
  for(let i=0;i<items.length;i++){
   if(!state.busy)break;current=items[i];const next=items[i+1]||null,transition=next?transitionFor(current.clip,next.clip):0,blendStart=Math.max(0,current.clip.duration-transition);
   await runFrames(()=>{drawFrame(ctx,canvas,current.v);return current.v.ended||current.v.currentTime>=blendStart-.02});if(!state.busy)break;
   if(next&&transition>0){next.v.currentTime=0;await next.v.play();await runFrames(()=>{const alpha=next.v.currentTime/transition;drawFrame(ctx,canvas,current.v,next.v,alpha);return next.v.currentTime>=transition-.02||next.v.ended});current.v.pause()}
   else if(next){current.v.pause();next.v.currentTime=0;await next.v.play()}
   else{await runFrames(()=>{drawFrame(ctx,canvas,current.v);return current.v.ended||current.v.currentTime>=current.clip.duration-.02});current.v.pause()}
  }
  if(state.busy&&creditsSeconds())await playCard(creditsSeconds(),p=>{ctx.fillStyle='#080605';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f4eadf';ctx.textAlign='center';ctx.textBaseline='middle';const lines=($('#creditsText').value||'').split(/\n+/).filter(Boolean),font=Math.round(canvas.width*.042),gap=font*1.8,total=lines.length*gap,start=canvas.height+font,end=-total-font,y=start+(end-start)*p;ctx.font=`${font}px Georgia,serif`;lines.forEach((line,i)=>ctx.fillText(line,canvas.width/2,y+i*gap))});
 }finally{items.forEach(item=>{item.v.pause();URL.revokeObjectURL(item.url)});state.busy=false}
}
function stopAll(){state.busy=false;['clipMusicPlayer','clipVoicePlayer'].forEach(id=>{const a=$('#'+id);if(a){a.pause();URL.revokeObjectURL(a.src);a.remove()}});drawEmpty()}
function makeAudio(file,id,level,loop,ctx,dest,total,fade=false){if(!file)return null;const a=document.createElement('audio');a.id=id;a.src=URL.createObjectURL(file);a.loop=loop;a.preload='auto';document.body.appendChild(a);const src=ctx.createMediaElementSource(a),gain=ctx.createGain();src.connect(gain).connect(dest);const now=ctx.currentTime;gain.gain.setValueAtTime(fade?0:level,now);if(fade)gain.gain.linearRampToValueAtTime(level,now+Math.min(1.2,total/4));if(fade&&total>1.5){gain.gain.setValueAtTime(level,now+Math.max(1,total-1.2));gain.gain.linearRampToValueAtTime(0,now+total)}return{a,url:a.src}}
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
async function exportVideo(){
 if(state.busy)return;if(!state.clips.length){$('#clipBuildStatus').textContent='Upload at least one clip first.';return}
 const total=totalDuration();if(total>MAX_TOTAL_SECONDS+.05){$('#clipBuildStatus').textContent='The complete video, including title and credits, must be three minutes or shorter.';return}
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){$('#clipBuildStatus').textContent='Use Chrome or Edge on the laptop to create the video.';return}
 const b=$('#exportClipBuild');b.disabled=true;$('#clipBuildStatus').textContent='Creating your complete video… Keep this page open until it downloads.';
 const canvas=$('#clipBuildCanvas'),videoStream=canvas.captureStream(30),audioCtx=new (window.AudioContext||window.webkitAudioContext)(),dest=audioCtx.createMediaStreamDestination();
 const music=makeAudio(state.music,'clipMusicPlayer',Number($('#musicVolume').value)/100,true,audioCtx,dest,total,$('#musicFade').checked),voice=makeAudio(state.voice,'clipVoicePlayer',Number($('#voiceVolume').value)/100,false,audioCtx,dest,total,false);
 const stream=new MediaStream([...videoStream.getVideoTracks(),...dest.stream.getAudioTracks()]),types=['video/mp4;codecs=h264,aac','video/mp4','video/webm;codecs=vp9,opus','video/webm'],mime=types.find(t=>MediaRecorder.isTypeSupported(t))||'',chunks=[],rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:7000000}:undefined);rec.ondataavailable=e=>e.data?.size&&chunks.push(e.data);const done=new Promise(r=>rec.onstop=r);rec.start(250);
 try{await audioCtx.resume();if(music)await music.a.play();if(voice)await voice.a.play();await playSequence();await wait(150);rec.stop();await done;const type=rec.mimeType||mime||'video/webm',ext=type.includes('mp4')?'mp4':'webm',name=`${safe($('#clipProjectName').value)}.${ext}`,blob=new Blob(chunks,{type});state.last={blob,name};const box=$('#clipBuildDownloads');box.innerHTML=`<div class="downloadItem"><div><h3>${name}</h3><small>${total.toFixed(1)} seconds · voiceover ${state.voice?'added':'not added'} · music ${state.music?'added':'not added'} · title ${titleSeconds()?'added':'off'} · credits ${creditsSeconds()?'added':'off'}</small></div><div class="actions"><button id="downloadClipBuildAgain" class="good">Download Video</button></div></div>`;$('#downloadClipBuildAgain').onclick=()=>downloadBlob(blob,name);downloadBlob(blob,name);$('#clipBuildStatus').textContent='Complete video created and downloaded.'}
 catch(e){if(rec.state!=='inactive')rec.stop();$('#clipBuildStatus').textContent=e.message||'The video could not be created.'}
 finally{[music,voice].filter(Boolean).forEach(x=>{x.a.pause();URL.revokeObjectURL(x.url);x.a.remove()});await audioCtx.close();b.disabled=false;state.busy=false}
}
function fileInfo(inputId,stateKey,boxId,label){$(inputId).onchange=async e=>{const f=e.target.files?.[0];state[stateKey]=f||null;const box=$(boxId);if(f){const d=await mediaDuration(f,'audio').catch(()=>0);box.textContent=`${label}: ${f.name}${d?` · ${d.toFixed(1)} seconds`:''}`;box.classList.remove('hidden')}else box.classList.add('hidden')}}
function bind(){
 $('#videoClipUpload').onchange=async e=>{const files=[...e.target.files].slice(0,MAX_CLIPS);state.clips=[];$('#clipBuildStatus').textContent='Checking clips…';let used=0,last='';for(const file of files){try{const d=await mediaDuration(file,'video');if(d<MIN_CLIP_SECONDS){last=`Skipped ${file.name}: clip is too short.`;continue}if(d>MAX_CLIP_SECONDS+.05){last=`Skipped ${file.name}: clip is longer than three minutes.`;continue}if(used+d>MAX_TOTAL_SECONDS+.05){last=`Skipped ${file.name}: clips exceed three minutes.`;continue}state.clips.push({file,duration:d});used+=d}catch(err){last=err.message}}renderClips();drawEmpty();updateReadyStatus();if(last)$('#clipBuildStatus').textContent+=` ${last}`;e.target.value=''};
 $('#blendClips').onchange=()=>{renderClips();drawEmpty();updateReadyStatus()};
 fileInfo('#musicUpload','music','#musicInfo','Music');fileInfo('#voiceUpload','voice','#voiceInfo','Voiceover');
 $('#musicVolume').oninput=e=>$('#musicVolumeValue').textContent=`${e.target.value}%`;$('#voiceVolume').oninput=e=>$('#voiceVolumeValue').textContent=`${e.target.value}%`;
 $('#titleDuration').oninput=e=>{$('#titleDurationValue').textContent=`${e.target.value} sec`;renderClips();updateReadyStatus()};$('#creditsDuration').oninput=e=>{$('#creditsDurationValue').textContent=`${e.target.value} sec`;renderClips();updateReadyStatus()};
 ['#useTitleCard','#useCredits'].forEach(id=>$(id).onchange=()=>{renderClips();updateReadyStatus()});
 $$('[data-clip-format]').forEach(b=>b.onclick=()=>{$$('[data-clip-format]').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.format=b.dataset.clipFormat;resize()});
 $('#previewClipBuild').onclick=async()=>{if(state.busy)return;$('#clipBuildStatus').textContent='Previewing complete video…';try{await playSequence();$('#clipBuildStatus').textContent='Preview finished.'}catch(e){$('#clipBuildStatus').textContent=e.message}};
 $('#stopClipBuild').onclick=stopAll;$('#exportClipBuild').onclick=exportVideo;
 $('#clearClipBuild').onclick=()=>{stopAll();state.clips=[];state.music=null;state.voice=null;['#musicUpload','#voiceUpload'].forEach(id=>$(id).value='');['#musicInfo','#voiceInfo'].forEach(id=>$(id).classList.add('hidden'));$('#clipProjectName').value='';$('#titleText').value='';$('#subtitleText').value='';$('#creditsText').value='';$('#useTitleCard').checked=false;$('#useCredits').checked=false;renderClips();$('#clipBuildStatus').textContent='Cleared.'}
}
function init(){addUI();bind();resize();renderClips();document.querySelectorAll('.badge').forEach(el=>{if(el.textContent.includes('Version'))el.textContent='Version 0.8.4'});const footer=$('.footer');if(footer)footer.textContent='Five Oaks Studio — Version 0.8.4'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();