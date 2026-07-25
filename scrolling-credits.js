(() => {
  'use strict';

  const state = {
    format: 'vertical',
    running: false,
    animationId: 0,
    bgImage: null,
    logoImage: null
  };

  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .creditsControls{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
      .creditsControls .wideField{grid-column:1/-1}
      .creditsPreview canvas{max-height:68vh}
      .creditsHelp{color:var(--muted);font-size:.9rem;line-height:1.45}
      @media(max-width:620px){.creditsControls{grid-template-columns:1fr}.creditsControls .wideField{grid-column:auto}}
    `;
    document.head.appendChild(style);
  }

  function installView() {
    const nav = document.querySelector('.nav');
    const projectsButton = nav?.querySelector('[data-view="projects"]');
    if (!nav || !projectsButton || $('credits')) return;

    const button = document.createElement('button');
    button.dataset.view = 'credits';
    button.textContent = 'Cards';
    nav.insertBefore(button, projectsButton);

    const main = document.querySelector('main.content');
    const projects = $('projects');
    const section = document.createElement('section');
    section.id = 'credits';
    section.className = 'view';
    section.innerHTML = `
      <div class="sectionTitle"><div><h2>Scrolling Credits Studio</h2><p>Create movie-style credits that roll upward.</p></div></div>
      <div class="grid2">
        <div class="card">
          <div class="creditsControls">
            <div class="field wideField"><label for="creditsText">Credits text</label><textarea id="creditsText" class="shortText" placeholder="THE WORLD OF FIVE OAKS\n\nWritten by\nFiona Hollingsworth\n&\nCyrus Wren">THE WORLD OF FIVE OAKS\n\nWritten by\nFiona Hollingsworth\n&\nCyrus Wren\n\nInspired by\nThe World of Five Oaks\n\n© 2026 All Rights Reserved</textarea></div>
            <div class="field"><label for="creditsSpeed">Scroll speed</label><select id="creditsSpeed"><option value="36">Slow</option><option value="52" selected>Medium</option><option value="72">Fast</option></select></div>
            <div class="field"><label for="creditsFontSize">Font size</label><input id="creditsFontSize" type="range" min="28" max="72" step="2" value="46"><small><span id="creditsFontValue">46</span> px</small></div>
            <div class="field"><label for="creditsFont">Font</label><select id="creditsFont"><option value="Georgia">Classic serif</option><option value="system-ui">Clean modern</option><option value="Trebuchet MS">Warm sans serif</option><option value="Courier New">Typewriter</option></select></div>
            <div class="field"><label for="creditsAlign">Alignment</label><select id="creditsAlign"><option value="center" selected>Centered</option><option value="left">Left aligned</option></select></div>
            <div class="field"><label for="creditsTextColor">Text color</label><input id="creditsTextColor" type="color" value="#fff7ed"></div>
            <div class="field"><label for="creditsBgColor">Background color</label><input id="creditsBgColor" type="color" value="#090604"></div>
            <div class="field"><label for="creditsBackground">Background image (optional)</label><input id="creditsBackground" type="file" accept="image/*"></div>
            <div class="field"><label for="creditsLogo">Logo at beginning (optional)</label><input id="creditsLogo" type="file" accept="image/*"></div>
            <div class="field wideField"><label>Format</label><div class="formatToggle" id="creditsFormat"><button class="active" data-credits-format="vertical">9:16</button><button data-credits-format="wide">16:9</button></div></div>
            <div class="field"><label><input id="creditsFade" type="checkbox" checked style="width:auto"> Fade in and out</label></div>
            <div class="field"><label for="creditsHold">Hold at end</label><select id="creditsHold"><option value="1">1 second</option><option value="2" selected>2 seconds</option><option value="3">3 seconds</option><option value="5">5 seconds</option></select></div>
          </div>
          <div class="actions"><button id="previewCredits" class="primary">Preview scroll</button><button id="stopCredits">Stop</button><button id="exportCredits" class="good">Create credits video</button></div>
          <p id="creditsStatus" class="statusline"></p>
          <p class="creditsHelp">The exported file uses the best video format supported by this browser. Keep this page open while it records.</p>
        </div>
        <div class="card"><div class="previewWrap creditsPreview"><canvas id="creditsCanvas" width="720" height="1280"></canvas></div></div>
      </div>
      <div class="card" style="margin-top:16px"><h3>Credits videos this session</h3><div id="creditsDownloads" class="downloadList"><div class="empty">No credits video created yet.</div></div></div>
    `;
    main.insertBefore(section, projects);
  }

  function bindNavigation() {
    document.querySelectorAll('.nav button[data-view]').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        button.classList.add('active');
        $(button.dataset.view)?.classList.add('active');
        if (button.dataset.view === 'credits') drawStill();
      });
    });
  }

  function setCanvasSize() {
    const canvas = $('creditsCanvas');
    if (state.format === 'wide') {
      canvas.width = 1280;
      canvas.height = 720;
    } else {
      canvas.width = 720;
      canvas.height = 1280;
    }
  }

  function loadImage(file, key) {
    if (!file) { state[key] = null; drawStill(); return; }
    const img = new Image();
    img.onload = () => { state[key] = img; URL.revokeObjectURL(img.src); drawStill(); };
    img.src = URL.createObjectURL(file);
  }

  function linesAndMetrics(ctx) {
    const fontSize = Number($('creditsFontSize').value);
    const lineHeight = Math.round(fontSize * 1.55);
    ctx.font = `700 ${fontSize}px "${$('creditsFont').value}"`;
    const lines = $('creditsText').value.replace(/\r/g, '').split('\n');
    const logoSpace = state.logoImage ? Math.round(fontSize * 6.2) : 0;
    return { fontSize, lineHeight, lines, logoSpace, totalHeight: lines.length * lineHeight + logoSpace };
  }

  function drawBackground(ctx, canvas) {
    ctx.fillStyle = $('creditsBgColor').value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (state.bgImage) {
      const img = state.bgImage;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.globalAlpha = 0.42;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      ctx.globalAlpha = 1;
      const shade = ctx.createLinearGradient(0, 0, 0, canvas.height);
      shade.addColorStop(0, 'rgba(0,0,0,.35)'); shade.addColorStop(.5, 'rgba(0,0,0,.15)'); shade.addColorStop(1, 'rgba(0,0,0,.5)');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function drawFrame(offsetY, opacity = 1) {
    const canvas = $('creditsCanvas');
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, canvas);
    const { fontSize, lineHeight, lines, logoSpace } = linesAndMetrics(ctx);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = $('creditsTextColor').value;
    ctx.textBaseline = 'top';
    const alignment = $('creditsAlign').value;
    ctx.textAlign = alignment;
    const x = alignment === 'center' ? canvas.width / 2 : Math.round(canvas.width * .11);
    let y = offsetY;
    if (state.logoImage) {
      const maxW = canvas.width * .48;
      const maxH = fontSize * 4.2;
      const scale = Math.min(maxW / state.logoImage.width, maxH / state.logoImage.height, 1);
      const w = state.logoImage.width * scale, h = state.logoImage.height * scale;
      ctx.drawImage(state.logoImage, (canvas.width - w) / 2, y, w, h);
      y += logoSpace;
    }
    for (const line of lines) {
      if (line.trim()) ctx.fillText(line, x, y);
      y += lineHeight;
    }
    ctx.restore();
  }

  function drawStill() {
    if (!$('creditsCanvas')) return;
    setCanvasSize();
    drawFrame(Math.round($('creditsCanvas').height * .18), 1);
  }

  async function animate(recording = false) {
    cancelAnimationFrame(state.animationId);
    state.running = true;
    const canvas = $('creditsCanvas');
    const ctx = canvas.getContext('2d');
    const metrics = linesAndMetrics(ctx);
    const speed = Number($('creditsSpeed').value);
    const hold = Number($('creditsHold').value) * 1000;
    const startY = canvas.height + 40;
    const endY = -metrics.totalHeight - 30;
    const travel = startY - endY;
    const travelMs = travel / speed * 1000;
    const fade = $('creditsFade').checked;
    const started = performance.now();

    return new Promise(resolve => {
      const frame = now => {
        if (!state.running) { resolve(); return; }
        const elapsed = now - started;
        const movingElapsed = Math.min(elapsed, travelMs);
        const progress = movingElapsed / travelMs;
        const y = startY - travel * progress;
        let opacity = 1;
        if (fade) {
          if (elapsed < 900) opacity = elapsed / 900;
          else if (elapsed > travelMs + hold - 900) opacity = Math.max(0, (travelMs + hold - elapsed) / 900);
        }
        drawFrame(y, opacity);
        if (elapsed < travelMs + hold) state.animationId = requestAnimationFrame(frame);
        else { state.running = false; resolve(); }
      };
      state.animationId = requestAnimationFrame(frame);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function addDownload(blob, filename) {
    const list = $('creditsDownloads');
    if (list.querySelector('.empty')) list.innerHTML = '';
    const item = document.createElement('div');
    item.className = 'downloadItem';
    item.innerHTML = `<div><h3>${filename}</h3><small>Scrolling credits video</small></div><div class="actions"><button class="good">Download video</button></div>`;
    item.querySelector('button').addEventListener('click', () => downloadBlob(blob, filename));
    list.prepend(item);
  }

  async function exportVideo() {
    if (!window.MediaRecorder) {
      $('creditsStatus').textContent = 'This browser cannot record a credits video.';
      return;
    }
    const canvas = $('creditsCanvas');
    const stream = canvas.captureStream(30);
    const types = ['video/mp4;codecs=h264', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
    const chunks = [];
    let recorder;
    try { recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 6000000 } : undefined); }
    catch (error) { $('creditsStatus').textContent = 'Video recording is not supported on this device.'; return; }
    recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
    const finished = new Promise(resolve => recorder.onstop = resolve);
    $('creditsStatus').textContent = 'Creating credits video… keep this page open.';
    recorder.start(250);
    await animate(true);
    await sleep(250);
    recorder.stop();
    await finished;
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const blob = new Blob(chunks, { type: mimeType || `video/${extension}` });
    const filename = `five-oaks-scrolling-credits.${extension}`;
    addDownload(blob, filename);
    downloadBlob(blob, filename);
    $('creditsStatus').textContent = 'Credits video created and downloaded.';
  }

  function bindControls() {
    ['creditsText','creditsFont','creditsAlign','creditsTextColor','creditsBgColor'].forEach(id => $(id).addEventListener('input', drawStill));
    $('creditsFontSize').addEventListener('input', () => { $('creditsFontValue').textContent = $('creditsFontSize').value; drawStill(); });
    $('creditsBackground').addEventListener('change', e => loadImage(e.target.files[0], 'bgImage'));
    $('creditsLogo').addEventListener('change', e => loadImage(e.target.files[0], 'logoImage'));
    document.querySelectorAll('[data-credits-format]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-credits-format]').forEach(b => b.classList.remove('active'));
      button.classList.add('active'); state.format = button.dataset.creditsFormat; drawStill();
    }));
    $('previewCredits').addEventListener('click', () => animate(false));
    $('stopCredits').addEventListener('click', () => { state.running = false; cancelAnimationFrame(state.animationId); drawStill(); $('creditsStatus').textContent = 'Preview stopped.'; });
    $('exportCredits').addEventListener('click', exportVideo);
  }

  document.addEventListener('DOMContentLoaded', () => {
    installStyles(); installView(); bindNavigation(); bindControls(); drawStill();
  });
})();