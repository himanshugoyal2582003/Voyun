let currentSong = new Audio();
let songs = [];
let currfolder = "";
let listType = "all";

function normalizePath(p) {
  return String(p || "")
    .replace(/%5C/gi, "/")
    .replace(/\\/g, "/")
    .replace(/^\/*/, "/")
    .replace(/\/{2,}/g, "/");
}

function toMMSS(sec) {
  if (!isFinite(sec) || sec < 0) return "00:00";
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(Math.floor(sec % 60)).padStart(2, "0");
  return `${m}:${s}`;
}

function byFile(a, b) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

async function readDirectory(dirPathAbs) {
  const res = await fetch(normalizePath(dirPathAbs));
  const html = await res.text();
  const div = document.createElement("div");
  div.innerHTML = html;
  const anchors = Array.from(div.querySelectorAll("a"));
  const files = [];
  const folders = [];

  for (const a of anchors) {
    const href = a.getAttribute("href") || "";
    const url = new URL(href, location.origin);
    let p = normalizePath(url.pathname);
    if (p === normalizePath(dirPathAbs)) continue;
    const parent = normalizePath(dirPathAbs).replace(/\/$/, "");
    const segments = p.split("/").filter(Boolean);
    const parentSegs = parent.split("/").filter(Boolean);
    if (segments.length !== parentSegs.length + 1) continue;
    if (/\/$/.test(href) || a.textContent.trim().endsWith("/")) {
      folders.push(p.endsWith("/") ? p : p + "/");
      continue;
    }
    if (/\.(mp3|m4a)$/i.test(p)) files.push(p);
  }
  return { files, folders };
}

function renderList(items) {
  const ul = document.querySelector(".songList ul");
  ul.innerHTML = items
    .map(
      s => `
      <li>
        <img class="invert" width="34" src="music.svg" alt="">
        <div class="info">
          <div>${s.name}</div>
          <div>${s.folder || "All Songs"}</div>
        </div>
        <div class="playnow"><span>Play Now</span></div>
      </li>`
    )
    .join("");

  Array.from(ul.querySelectorAll("li")).forEach((li, i) => {
    li.addEventListener("click", () => playMusic(items[i]));
  });
}

function makeSongObj(absPath) {
  const parts = normalizePath(absPath).split("/").filter(Boolean);
  const name = decodeURIComponent(parts[parts.length - 1]);
  let folder = "Songs";
  if (parts.length >= 3 && parts[0] === "songs") {
    folder = parts[1];
  } else if (parts.length === 2 && parts[0] === "songs") {
    folder = "Songs";
  }
  return { name, path: normalizePath(absPath), folder };
}

async function loadFolderOnly(subfolder) {
  listType = "folder";
  currfolder = `songs/${subfolder}`;
  const { files } = await readDirectory(`/${currfolder}/`);
  const list = files.map(makeSongObj).sort(byFile);
  songs = list;
  renderList(list);
}

async function loadAllSongs() {
  listType = "all";
  currfolder = "songs";
  const root = await readDirectory("/songs/");
  const all = root.files.map(makeSongObj);
  for (const folderAbs of root.folders) {
    const sub = await readDirectory(folderAbs);
    all.push(...sub.files.map(makeSongObj));
  }
  all.sort((a, b) => {
    const f = a.folder.localeCompare(b.folder, undefined, { sensitivity: "base" });
    if (f !== 0) return f;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
  songs = all;
  renderList(all);
}

function playMusic(song, pauseOnly = false) {
  const src = typeof song === "string" ? normalizePath(song) : song.path;
  currentSong.src = src;
  if (!pauseOnly) {
    currentSong.play().catch(console.error);
    const playBtn = document.getElementById("play");
    if (playBtn) playBtn.src = "pause.svg";
  }
  const label = typeof song === "string" ? decodeURIComponent(song.split("/").pop()) : song.name;
  document.querySelector(".songinfo").textContent = label;
  document.querySelector(".songtime").textContent = "00:00/00:00";
  const circle = document.querySelector(".circle");
  if (circle) circle.style.left = "0%";
}

function getCurrentIndex() {
  const playing = decodeURIComponent(currentSong.src.split("/").pop() || "");
  return songs.findIndex(s => s.name === playing);
}

function setupPrevNext() {
  const previous = document.getElementById("previous");
  const next = document.getElementById("next");

  if (previous) {
    previous.addEventListener("click", () => {
      const i = getCurrentIndex();
      if (i > 0) playMusic(songs[i - 1]);
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      const i = getCurrentIndex();
      if (i + 1 < songs.length) playMusic(songs[i + 1]);
    });
  }

  currentSong.addEventListener("ended", () => {
    const i = getCurrentIndex();
    if (i + 1 < songs.length) playMusic(songs[i + 1]);
  });
}

function setupSeekbar() {
  const seekbar = document.querySelector(".seekbar");
  const circle = document.querySelector(".circle");
  const played = document.querySelector(".played-progress");
  let dragging = false;

  if (!seekbar || !circle) return;

  circle.addEventListener("mousedown", () => (dragging = true));
  document.addEventListener("mouseup", () => (dragging = false));
  document.addEventListener("mousemove", e => {
    if (!dragging || !currentSong.duration) return;
    const r = seekbar.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const pct = (x / r.width) * 100;
    circle.style.left = `${pct}%`;
    if (played) played.style.width = `${pct}%`;
    currentSong.currentTime = (pct / 100) * currentSong.duration;
  });

  seekbar.addEventListener("click", e => {
    if (!currentSong.duration) return;
    const r = seekbar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    currentSong.currentTime = pct * currentSong.duration;
  });

  currentSong.addEventListener("timeupdate", () => {
    const pct = currentSong.duration ? (currentSong.currentTime / currentSong.duration) * 100 : 0;
    if (played) played.style.width = `${pct}%`;
    circle.style.left = `${pct}%`;
    document.querySelector(".songtime").textContent =
      `${toMMSS(currentSong.currentTime)}/${toMMSS(currentSong.duration)}`;
  });
}

function setupVolume() {
  const range = document.querySelector(".range input");
  const volIcon = document.querySelector(".volume > img");
  currentSong.volume = 0.6;
  if (range) range.value = 60;

  range?.addEventListener("input", e => {
    currentSong.volume = (parseInt(e.target.value, 10) || 0) / 100;
    if (currentSong.volume > 0 && currentSong.muted) {
      currentSong.muted = false;
      if (volIcon) volIcon.src = "volume.svg";
    }
  });

  volIcon?.addEventListener("click", e => {
    currentSong.muted = !currentSong.muted;
    if (currentSong.muted) {
      if (range) range.value = 0;
      e.target.src = "mute.svg";
    } else {
      if (range) {
        if (+range.value === 0) range.value = 60;
        currentSong.volume = (+range.value) / 100;
      }
      e.target.src = "volume.svg";
    }
  });
}

function setupHamburger() {
  const ham = document.querySelector(".hamburger");
  const closeBtn = document.querySelector(".close");
  const left = document.querySelector(".left");
  ham?.addEventListener("click", () => left && (left.style.left = "0"));
  closeBtn?.addEventListener("click", () => left && (left.style.left = "-120%"));
}

function setupCards() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const folder = card.dataset.folder;
      if (folder) loadFolderOnly(folder);
    });
  });
}

function setupReload() {
  const reloadBtn = document.querySelector(".reload");
  reloadBtn?.addEventListener("click", () => loadAllSongs());
}

function setupPlayPauseBtn() {
  const playBtn = document.getElementById("play");
  playBtn?.addEventListener("click", () => {
    if (!currentSong.src && songs.length) {
      playMusic(songs[0]);
      return;
    }
    if (currentSong.paused) {
      currentSong.play().catch(console.error);
      playBtn.src = "pause.svg";
    } else {
      currentSong.pause();
      playBtn.src = "play.svg";
    }
  });
}

async function main() {
  setupHamburger();
  setupCards();
  setupReload();
  setupPrevNext();
  setupSeekbar();
  setupVolume();
  setupPlayPauseBtn();
  await loadAllSongs();
}

main();
