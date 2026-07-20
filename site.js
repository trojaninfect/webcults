/* ============================================================
   WEBCULTS HQ — shared site script
   Runs on every page; features activate only if their
   elements exist on that page.
============================================================ */

/* ---------- CONFIG (edit here) ---------- */
const ROSTER = [
  { name:"CHANGED BY TOMORROW", aka:"aka sadflexxing", badge:"FOUNDER" },
  { name:"DEADHORSE" },
  { name:"DOVES" },
  { name:"POEMS" },
  { name:"ASKING4MERCY" },
  { name:"NEVADA" },
  { name:"XOUL" },
  { name:"VALLEYS" },
  { name:"TRIPPSTERY" },
  { name:"JUNKI" },
  { name:"MEMORIES" },
  { name:"SINH" },
  { name:"WINTER", badge:"</>" },
  { name:"MENCE" },
  { name:"SONAR" },
];
const SUBTITLE_TEXT = "MUSIC COLLECTIVE";

/* Add your audio files here: put mp3s in an /audio folder and
   set src to e.g. "audio/track1.mp3". Empty src = disabled demo row. */
const PLAYLIST = [
  { title:"UNTITLED 01", artist:"CHANGED BY TOMORROW", src:"" },
  { title:"UNTITLED 02", artist:"WEBCULTS HQ",         src:"" },
  { title:"UNTITLED 03", artist:"WEBCULTS HQ",         src:"" },
];

/* ---------- MOBILE NAV ---------- */
const navToggle = document.getElementById('nav-toggle');
if (navToggle){
  navToggle.addEventListener('click', ()=>{
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', menu.classList.contains('open'));
  });
}

/* ---------- CLICK-TO-ENTER GATE (index only) ---------- */
const gate = document.getElementById('gate');
function enterSite(){
  if (gate){
    gate.classList.add('gone');
    setTimeout(()=>gate.remove(),700);
  }
  startTypewriter();
  startDrips();
}
if (gate){
  gate.addEventListener('click', enterSite);
  gate.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') enterSite(); });
  /* mobile or already entered this session: skip the gate */
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || innerWidth <= 768;
  if (isMobile || sessionStorage.getItem('wc_entered')){
    gate.remove(); startTypewriter(); startDrips();
  } else {
    gate.addEventListener('click', ()=>sessionStorage.setItem('wc_entered','1'), {once:true});
  }
}

/* ---------- TYPEWRITER SUBTITLE (index only) ---------- */
let typeStarted = false;
function startTypewriter(){
  const el = document.getElementById('typed');
  if (!el || typeStarted) return; typeStarted = true;
  let i = 0;
  (function tick(){
    if (i <= SUBTITLE_TEXT.length){
      el.textContent = SUBTITLE_TEXT.slice(0, i++);
      setTimeout(tick, 55 + Math.random()*60);
    } else {
      const a = document.getElementById('hero-actions');
      if (a) a.classList.add('show');
    }
  })();
}

/* ---------- DRIP CANVAS (index only) ---------- */
let dripsStarted = false;
function startDrips(){
  const cv = document.getElementById('drip-canvas');
  if (!cv || dripsStarted) return; dripsStarted = true;
  const ctx = cv.getContext('2d');
  function size(){ cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
  size(); addEventListener('resize', size);
  const drips = [];
  setInterval(()=>{
    if (drips.length < 22) drips.push({
      x: Math.random()*cv.width, y: -10,
      w: 1 + Math.random()*2, v: .4 + Math.random()*1.1, life: 1
    });
  }, 900);
  (function loop(){
    ctx.clearRect(0,0,cv.width,cv.height);
    for (let i=drips.length-1; i>=0; i--){
      const d = drips[i];
      d.y += d.v; d.life -= .0016;
      if (d.life <= 0 || d.y > cv.height){ drips.splice(i,1); continue; }
      const g = ctx.createLinearGradient(0, d.y-60, 0, d.y);
      g.addColorStop(0,'rgba(179,27,27,0)');
      g.addColorStop(1,`rgba(179,27,27,${.5*d.life})`);
      ctx.fillStyle = g;
      ctx.fillRect(d.x, d.y-60, d.w, 60);
      ctx.fillStyle = `rgba(200,20,20,${.7*d.life})`;
      ctx.beginPath();
      ctx.ellipse(d.x + d.w/2, d.y, d.w*1.4, d.w*2.2, 0, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ---------- DROPDOWN SECTIONS ---------- */
function toggleDrop(id){
  const el = document.getElementById(id);
  el.classList.toggle('open');
  el.querySelector('.drop-header').setAttribute('aria-expanded', el.classList.contains('open'));
}
window.toggleDrop = toggleDrop;

/* ---------- ROSTER GRID (roster.html) ---------- */
function escapeHTML(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
const rosterEl = document.getElementById('roster');
if (rosterEl){
  rosterEl.innerHTML = ROSTER.map(m=>{
    const badge = m.badge ? `<span class="badge">${escapeHTML(m.badge)}</span>` : '';
    const aka = m.aka ? `<span class="aka">${escapeHTML(m.aka)}</span>` : '';
    return `<div class="roster-cell"><span>${escapeHTML(m.name)}</span>${aka}${badge}</div>`;
  }).join('');
}

/* ---------- TERMINAL (index.html) ---------- */
const termScreen = document.getElementById('term-screen');
if (termScreen){
  const termInput  = document.getElementById('term-input');
  const promptLine = document.getElementById('term-prompt-line');
  const TERMINAL_DATA = {
    help: [
      "AVAILABLE COMMANDS:",
      "  help      — this list",
      "  roster    — list active members",
      "  lore      — collective origin file",
      "  clear     — wipe the screen",
      "  whoami    — identify yourself",
    ],
    roster: [
      "ACTIVE MEMBERS:",
      "  ▸ CHANGED BY TOMORROW (aka sadflexxing) [FOUNDER]",
      ...ROSTER.slice(1).map(m=>"  ▸ "+m.name+(m.badge?" ["+m.badge+"]":"")),
      "",
      "full roster ▸ roster.html",
    ],
    lore: [
      "FILE: ORIGIN.TXT",
      "WEBCULTS HQ — music collective.",
      "Founded by Changed By Tomorrow (aka sadflexxing).",
      "Genre classification: [REDACTED].",
    ],
    whoami: ["ghost — clearance: RESTRICTED. we see you."],
  };
  function termPrint(lines, accent=false){
    lines.forEach(txt=>{
      const div = document.createElement('div');
      div.className = 'term-line';
      if (accent){
        const span = document.createElement('span');
        span.className = 'accent'; span.textContent = txt;
        div.appendChild(span);
      } else div.textContent = txt;
      termScreen.insertBefore(div, promptLine);
    });
    termScreen.scrollTop = termScreen.scrollHeight;
  }
  termScreen.addEventListener('click', ()=>termInput.focus());
  termInput.addEventListener('keydown', e=>{
    if (e.key !== 'Enter') return;
    const cmd = termInput.value.trim().toLowerCase();
    termInput.value = '';
    const echo = document.createElement('div');
    echo.className = 'term-line';
    const p = document.createElement('span');
    p.className = 'p'; p.textContent = 'ghost@webcults:~$ ';
    echo.appendChild(p);
    echo.appendChild(document.createTextNode(cmd));
    termScreen.insertBefore(echo, promptLine);
    if (!cmd) return;
    if (cmd === 'clear'){
      termScreen.querySelectorAll('.term-line:not(#term-prompt-line)').forEach(l=>l.remove());
      return;
    }
    if (TERMINAL_DATA[cmd]) termPrint(TERMINAL_DATA[cmd]);
    else termPrint([`command not found: ${cmd} — type 'help'`], true);
  });
}

/* ---------- MEDIA PLAYER (mediaplayer.html) ---------- */
const playerEl = document.getElementById('player');
if (playerEl){
  const audio = new Audio();
  const listEl = document.getElementById('playlist');
  const trackEl = document.getElementById('p-track');
  const artistEl = document.getElementById('p-artist');
  const playBtn = document.getElementById('p-play');
  const seek = document.getElementById('p-seek');
  const timeEl = document.getElementById('p-time');
  let current = -1;

  function fmt(s){
    if (!isFinite(s)) return "0:00";
    return Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,'0');
  }
  function render(){
    listEl.innerHTML = PLAYLIST.map((t,i)=>`
      <li class="${i===current?'playing':''}" data-i="${i}">
        <span>${String(i+1).padStart(2,'0')} · ${escapeHTML(t.title)} — ${escapeHTML(t.artist)}</span>
        <span class="dur">${t.src ? '▸' : 'NO FILE'}</span>
      </li>`).join('');
    listEl.querySelectorAll('li').forEach(li=>{
      li.addEventListener('click', ()=>load(+li.dataset.i, true));
    });
  }
  function load(i, autoplay){
    const t = PLAYLIST[i];
    if (!t) return;
    current = i;
    trackEl.textContent = t.title;
    artistEl.textContent = t.artist;
    render();
    if (!t.src){
      audio.removeAttribute('src');
      playBtn.textContent = '►';
      timeEl.textContent = 'add src in site.js';
      return;
    }
    audio.src = t.src;
    if (autoplay) audio.play();
  }
  playBtn.addEventListener('click', ()=>{
    if (current < 0){ load(0, true); return; }
    if (!audio.src) return;
    audio.paused ? audio.play() : audio.pause();
  });
  document.getElementById('p-prev').addEventListener('click', ()=>load(Math.max(0,current-1), true));
  document.getElementById('p-next').addEventListener('click', ()=>load(Math.min(PLAYLIST.length-1,current+1), true));
  audio.addEventListener('play', ()=>playBtn.textContent='❚❚');
  audio.addEventListener('pause', ()=>playBtn.textContent='►');
  audio.addEventListener('ended', ()=>{ if (current < PLAYLIST.length-1) load(current+1, true); });
  audio.addEventListener('timeupdate', ()=>{
    if (audio.duration){
      seek.value = (audio.currentTime/audio.duration)*100;
      timeEl.textContent = fmt(audio.currentTime)+' / '+fmt(audio.duration);
    }
  });
  seek.addEventListener('input', ()=>{
    if (audio.duration) audio.currentTime = (seek.value/100)*audio.duration;
  });
  load(0, false);
}
