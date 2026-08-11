// ---------------------------------------------------------
// 선진 — 메모 앱 스타일 포트폴리오 (프로토타입)
// 프로젝트 내용은 실제 자료가 정해지기 전까지 자리표시자입니다.
// ---------------------------------------------------------

const notes = [
  {
    id: "intro",
    folder: "intro",
    title: "안녕하세요, 선진입니다 👋",
    date: "오늘 오전 9:14",
    preview: "반갑습니다! 이 페이지는 제 포트폴리오를 메모 앱 형태로 정리해본 공간이에요.",
    body: [
      "반갑습니다! 이 페이지는 제 포트폴리오를 메모 앱 형태로 정리해본 공간이에요.",
      "왼쪽 폴더에서 소개 · 프로젝트 · 스킬 · 연락처를 골라보시거나, 목록에서 메모를 하나씩 눌러보세요. 방향키(↑/↓)로도 메모 사이를 이동할 수 있어요.",
      "* 아직 실제 프로젝트 내용은 채워지지 않은 프로토타입 단계입니다.",
    ],
  },
  {
    id: "project1",
    folder: "project",
    title: "[프로젝트명을 입력해주세요]",
    date: "어제 오후 3:40",
    preview: "프로젝트 개요, 역할, 기간을 이 자리에 채워주세요.",
    body: [
      "[여기에 프로젝트 한 줄 소개가 들어갑니다]",
      "기간 — [예: 2026.01 – 2026.03]",
      "역할 — [예: 기획 / 디자인 / 개발]",
      "[프로젝트 상세 설명, 문제 정의, 진행 과정, 결과 등을 자유롭게 작성해주세요.]",
    ],
  },
  {
    id: "project2",
    folder: "project",
    title: "[프로젝트명을 입력해주세요]",
    date: "8월 6일",
    preview: "프로젝트 개요, 역할, 기간을 이 자리에 채워주세요.",
    body: [
      "[여기에 프로젝트 한 줄 소개가 들어갑니다]",
      "기간 — [예: 2025.10 – 2025.12]",
      "역할 — [예: 기획 / 디자인 / 개발]",
      "[프로젝트 상세 설명, 문제 정의, 진행 과정, 결과 등을 자유롭게 작성해주세요.]",
    ],
  },
  {
    id: "skills",
    folder: "skills",
    title: "스킬",
    date: "8월 3일",
    preview: "보유 스킬 체크리스트",
    checklist: [
      { text: "[스킬 1]", done: true },
      { text: "[스킬 2]", done: true },
      { text: "[스킬 3]", done: false },
      { text: "[스킬 4]", done: false },
    ],
  },
  {
    id: "contact",
    folder: "contact",
    title: "연락처",
    date: "7월 28일",
    preview: "이메일과 연락 가능한 채널을 정리했습니다.",
    body: [
      "이메일 — [이메일 주소를 입력해주세요]",
      "인스타그램 — [계정을 입력해주세요]",
      "편하신 방법으로 연락 주시면 빠르게 답변드리겠습니다. 봐주셔서 감사합니다 :)",
    ],
  },
];

notes.forEach((n) => {
  if (n.checklist) n.checklist.forEach((c, i) => { c._uid = i; });
});

const folders = [
  { id: "all", label: "모든 iCloud" },
  { id: "intro", label: "소개" },
  { id: "project", label: "프로젝트" },
  { id: "skills", label: "스킬" },
  { id: "contact", label: "연락처" },
];

const $ = (sel) => document.querySelector(sel);
const listEl = $("#notes-list");
const detailPane = $("#detail-pane");
const searchInput = $("#search-input");

let activeFolder = "all";
let activeNoteId = null;

function folderCount(id) {
  return id === "all" ? notes.length : notes.filter((n) => n.folder === id).length;
}

function renderFolders() {
  $("#folders-list").innerHTML = folders
    .map(
      (f) => `
      <li>
        <div class="folder-row ${f.id === activeFolder ? "active" : ""}" data-folder="${f.id}">
          <svg viewBox="0 0 24 24" class="icon-folder-sm"><path d="M3 6a2 2 0 012-2h4.5l2 2H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"/></svg>
          <span class="folder-name">${f.label}</span>
          <span class="folder-count">${folderCount(f.id)}</span>
        </div>
      </li>`
    )
    .join("");

  $("#folders-list")
    .querySelectorAll(".folder-row")
    .forEach((row) => {
      row.addEventListener("click", () => {
        activeFolder = row.dataset.folder;
        searchInput.value = "";
        renderFolders();
        renderList();
      });
    });
}

function visibleNotes() {
  const q = searchInput.value.trim().toLowerCase();
  return notes.filter((n) => {
    const inFolder = activeFolder === "all" || n.folder === activeFolder;
    const matchesQuery = !q || n.title.toLowerCase().includes(q) || (n.preview || "").toLowerCase().includes(q);
    return inFolder && matchesQuery;
  });
}

function formatPreview(note) {
  if (note.checklist) {
    const doneCount = note.checklist.filter((c) => c.done).length;
    return `${doneCount}/${note.checklist.length}개 완료`;
  }
  return note.preview;
}

function renderList() {
  const filtered = visibleNotes();
  const folderLabel = folders.find((f) => f.id === activeFolder)?.label || "모든 iCloud";
  $("#list-title").textContent = folderLabel;
  $("#list-subtitle").textContent = `${filtered.length}개의 메모`;

  listEl.innerHTML = filtered
    .map(
      (n) => `
      <li>
        <div class="note-row ${n.id === activeNoteId ? "active" : ""}" data-id="${n.id}">
          <div class="row-top">
            <span class="row-title">${n.title}</span>
            <span class="row-date">${n.date}</span>
          </div>
          <span class="row-preview">${formatPreview(n)}</span>
        </div>
      </li>`
    )
    .join("");

  listEl.querySelectorAll(".note-row").forEach((row) => {
    row.addEventListener("click", () => openNote(row.dataset.id));
  });
}

function checklistMarkup(note) {
  const sorted = [...note.checklist].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  return sorted
    .map(
      (c) =>
        `<li class="${c.done ? "done" : ""}" data-uid="${c._uid}"><span class="check-dot"></span><span>${c.text}</span></li>`
    )
    .join("");
}

function bindChecklist(note, ul) {
  ul.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => toggleChecklistItem(note, ul, li));
  });
}

// 체크 시 취소선을 긋고, 눌린 항목이 자연스럽게 아래로 이동하도록 FLIP 애니메이션 적용
function toggleChecklistItem(note, ul, li) {
  const uid = Number(li.dataset.uid);
  const item = note.checklist.find((c) => c._uid === uid);
  if (!item) return;

  const firstRects = new Map();
  Array.from(ul.children).forEach((el) => firstRects.set(el.dataset.uid, el.getBoundingClientRect()));

  item.done = !item.done;
  ul.innerHTML = checklistMarkup(note);
  bindChecklist(note, ul);

  Array.from(ul.children).forEach((el) => {
    const first = firstRects.get(el.dataset.uid);
    if (!first) return;
    const dy = first.top - el.getBoundingClientRect().top;
    if (!dy) return;
    el.style.transition = "none";
    el.style.transform = `translateY(${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = "transform .32s cubic-bezier(.32,.72,0,1)";
      el.style.transform = "";
    });
    el.addEventListener("transitionend", () => { el.style.transition = ""; }, { once: true });
  });

  const row = listEl.querySelector(`.note-row[data-id="${note.id}"] .row-preview`);
  if (row) row.textContent = formatPreview(note);
}

function openNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  activeNoteId = id;

  listEl.querySelectorAll(".note-row").forEach((row) => {
    row.classList.toggle("active", row.dataset.id === id);
  });

  $("#detail-date").textContent = note.date;
  $("#detail-title").textContent = note.title;

  const content = $("#detail-content");
  if (note.checklist) {
    content.innerHTML = `<ul class="checklist"></ul>`;
    const ul = content.querySelector(".checklist");
    ul.innerHTML = checklistMarkup(note);
    bindChecklist(note, ul);
  } else {
    content.innerHTML = note.body
      .map((p) => `<p class="${p.startsWith("[") ? "placeholder" : ""}">${p}</p>`)
      .join("");
  }

  detailPane.classList.add("open");
}

// ---------------------------------------------------------
// 방향키로 메모 이동 (검색창에 포커스가 있을 땐 기본 커서 이동 유지)
// ---------------------------------------------------------
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  if (document.activeElement === searchInput) return;
  if (!$("#window").classList.contains("open")) return;

  const filtered = visibleNotes();
  if (filtered.length === 0) return;
  e.preventDefault();

  const currentIndex = filtered.findIndex((n) => n.id === activeNoteId);
  let nextIndex;
  if (currentIndex === -1) {
    nextIndex = 0;
  } else if (e.key === "ArrowDown") {
    nextIndex = Math.min(currentIndex + 1, filtered.length - 1);
  } else {
    nextIndex = Math.max(currentIndex - 1, 0);
  }
  openNote(filtered[nextIndex].id);
});

$("#back-btn").addEventListener("click", () => {
  detailPane.classList.remove("open");
});

searchInput.addEventListener("input", renderList);

// ---------------------------------------------------------
// 데스크톱 ↔ 윈도우 (아이콘 위치에서 열리고 닫히는 "지니 효과")
// ---------------------------------------------------------
const windowEl = $("#window");
const appIconEl = $("#app-icon");
const titlebarEl = $(".titlebar");

function iconCenter() {
  const r = appIconEl.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function setGenieOrigin(rect) {
  const icon = iconCenter();
  windowEl.style.transformOrigin = `${icon.x - rect.left}px ${icon.y - rect.top}px`;
}

// 창이 닫혀있는(축소된) 상태에서도 실제 자리(중앙 정렬 또는 드래그된 위치)를 계산
function restingRect() {
  const cs = getComputedStyle(windowEl);
  const width = parseFloat(cs.width);
  const height = parseFloat(cs.height);
  let left, top;
  if (windowEl.style.left) {
    left = parseFloat(windowEl.style.left);
    top = parseFloat(windowEl.style.top);
  } else {
    left = (window.innerWidth - width) / 2;
    top = (window.innerHeight - height) / 2;
  }
  return { left, top };
}

function openWindow() {
  setGenieOrigin(restingRect());
  windowEl.classList.add("open");
  windowEl.classList.remove("maximized");
}
function closeWindow() {
  setGenieOrigin(windowEl.getBoundingClientRect());
  windowEl.classList.remove("open", "maximized");
}

$("#win-close").addEventListener("click", closeWindow);
$("#win-min").addEventListener("click", closeWindow);

let preZoomRect = null;
$("#win-zoom").addEventListener("click", () => {
  const willMaximize = !windowEl.classList.contains("maximized");
  if (willMaximize) {
    preZoomRect = {
      left: windowEl.style.left,
      top: windowEl.style.top,
      right: windowEl.style.right,
      bottom: windowEl.style.bottom,
      margin: windowEl.style.margin,
    };
    windowEl.style.left = "";
    windowEl.style.top = "";
    windowEl.style.right = "";
    windowEl.style.bottom = "";
    windowEl.style.margin = "";
    windowEl.classList.add("maximized");
  } else {
    windowEl.classList.remove("maximized");
    if (preZoomRect) {
      windowEl.style.left = preZoomRect.left;
      windowEl.style.top = preZoomRect.top;
      windowEl.style.right = preZoomRect.right;
      windowEl.style.bottom = preZoomRect.bottom;
      windowEl.style.margin = preZoomRect.margin;
      preZoomRect = null;
    }
  }
});

// 바탕화면(윈도우 바깥) 클릭 시 메모창 닫기
const desktopEl = $("#desktop");
desktopEl.addEventListener("click", (e) => {
  if (e.target === desktopEl && windowEl.classList.contains("open")) {
    closeWindow();
  }
});

// ---------------------------------------------------------
// 타이틀바 드래그로 창 이동
// ---------------------------------------------------------
let dragState = null;

titlebarEl.addEventListener("mousedown", (e) => {
  if (e.target.closest(".traffic-lights")) return;
  if (windowEl.classList.contains("maximized")) return;
  const rect = windowEl.getBoundingClientRect();
  dragState = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
  windowEl.style.left = `${rect.left}px`;
  windowEl.style.top = `${rect.top}px`;
  windowEl.style.right = "auto";
  windowEl.style.bottom = "auto";
  windowEl.style.margin = "0";
  windowEl.classList.add("dragging");
  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!dragState) return;
  const dx = e.clientX - dragState.startX;
  const dy = e.clientY - dragState.startY;
  const w = windowEl.offsetWidth;
  let newLeft = dragState.startLeft + dx;
  let newTop = dragState.startTop + dy;
  newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));
  newLeft = Math.max(120 - w, Math.min(newLeft, window.innerWidth - 120));
  windowEl.style.left = `${newLeft}px`;
  windowEl.style.top = `${newTop}px`;
});

window.addEventListener("mouseup", () => {
  if (!dragState) return;
  dragState = null;
  windowEl.classList.remove("dragging");
});

// ---------------------------------------------------------
// 바탕화면 아이콘 드래그 이동 (드래그가 아니면 클릭으로 간주해 창 열기)
// ---------------------------------------------------------
let iconDrag = null;
let iconWasDragged = false;

appIconEl.addEventListener("mousedown", (e) => {
  iconWasDragged = false;
  const rect = appIconEl.getBoundingClientRect();
  iconDrag = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
  e.preventDefault();
});

window.addEventListener("mousemove", (e) => {
  if (!iconDrag) return;
  const dx = e.clientX - iconDrag.startX;
  const dy = e.clientY - iconDrag.startY;
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) iconWasDragged = true;
  if (!iconWasDragged) return;
  const w = appIconEl.offsetWidth;
  const h = appIconEl.offsetHeight;
  let newLeft = Math.max(0, Math.min(iconDrag.startLeft + dx, window.innerWidth - w));
  let newTop = Math.max(0, Math.min(iconDrag.startTop + dy, window.innerHeight - h));
  appIconEl.style.left = `${newLeft}px`;
  appIconEl.style.top = `${newTop}px`;
  appIconEl.style.transform = "none";
});

window.addEventListener("mouseup", () => {
  iconDrag = null;
});

appIconEl.addEventListener("click", (e) => {
  if (iconWasDragged) {
    e.preventDefault();
    return;
  }
  openWindow();
});

// ---------------------------------------------------------
// 초기 렌더
// ---------------------------------------------------------
renderFolders();
renderList();

const desktopQuery = window.matchMedia("(min-width: 681px)");
function ensureDesktopSelection() {
  if (desktopQuery.matches && !activeNoteId) {
    openNote(notes[0].id);
  }
}
ensureDesktopSelection();
desktopQuery.addEventListener("change", ensureDesktopSelection);
