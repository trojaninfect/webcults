/* ============================================================
   WEBCULTS HQ — shared site script
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
  { name:"WINTER", badge:"</>", dev:true },
  { name:"MENCE" },
  { name:"SONAR" },
];

/* Add your audio: put mp3s in an /audio folder, set src below */
const PLAYLIST = [
  { title:"UNTITLED 01", artist:"CHANGED BY TOMORROW", src:"" },
  { title:"UNTITLED 02", artist:"WEBCULTS HQ",         src:"" },
  { title:"UNTITLED 03", artist:"WEBCULTS HQ",         src:"" },
];

function escapeHTML(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------- SEARCH (header) ----------
   Searches the roster; sends you to roster.html?q=... */
const searchForm = document.getElementById('search-form');
if (searchForm){
  searchForm.addEventListener('submit', e=>{
    e.preventDefault();
    const q = document.getElementById('search-input').value.trim();
    location.href = 'roster.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });
}

/* ---------- ROSTER GRID (roster.html) ---------- */
const rosterEl = document.getElementById('roster');
if (rosterEl){
  const q = new URLSearchParams(location.search).get('q');
  const query = (q||'').toLowerCase();
  const list = query
    ? ROSTER.filter(m => (m.name + ' ' + (m.aka||'')).toLowerCase().includes(query))
    : ROSTER;
  if (query){
    const note = document.getElementById('roster-search-note');
    if (note){
      note.textContent = list.length
        ? `Search results for "${q}" — ${list.length} member(s). `
        : `No members found for "${q}". `;
      const a = document.createElement('a');
      a.href = 'roster.html'; a.textContent = 'Show all';
      a.style.color = 'var(--red)'; a.style.fontWeight = 'bold';
      note.appendChild(a);
      note.style.display = 'block';
    }
  }
  rosterEl.innerHTML = list.map(m=>{
    const badge = m.badge ? `<span class="badge${m.dev?' dev':''}">${escapeHTML(m.badge)}</span>` : '';
    const aka = m.aka ? `<span class="aka">${escapeHTML(m.aka)}</span>` : '';
    return `<div class="roster-cell"><span>${escapeHTML(m.name)}</span>${aka}${badge}</div>`;
  }).join('') || '<div class="roster-empty">Nothing here.</div>';
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
      ...ROSTER.map(m=>"  > "+m.name
        +(m.aka?" ("+m.aka+")":"")
        +(m.badge?" ["+m.badge+"]":"")),
      "",
      "full roster > roster.html",
    ],
    lore: [
      "FILE: ORIGIN.TXT",
      "WEBCULTS HQ — music collective.",
      "Founded by Changed By Tomorrow (aka sadflexxing).",
      "Redefining the underground.",
    ],
    whoami: ["guest — clearance: RESTRICTED. we see you."],
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
    p.className = 'p'; p.textContent = 'guest@webcults:~$ ';
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
