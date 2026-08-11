// ---------------------------------------------------------
// 선진 — 배경화면 프로토타입
// 메모 = 개인 글 모음, 메일 = 작업 포트폴리오
// 내용은 실제 자료가 정해지기 전까지 자리표시자입니다.
// ---------------------------------------------------------

const $ = (sel) => document.querySelector(sel);

// ===========================================================
// 공용 앱 윈도우 컨트롤러 (아이콘 ↔ 창, 지니 효과, 드래그, 최대화)
// ===========================================================
let topZ = 10;

function setupAppAndIcon(icon, win) {
  const titlebar = win.querySelector(".titlebar");
  const closeBtn = win.querySelector(".tl-close");
  const minBtn = win.querySelector(".tl-min");
  const zoomBtn = win.querySelector(".tl-zoom");

  function iconCenter() {
    const r = icon.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function setGenieOrigin(rect) {
    const c = iconCenter();
    win.style.transformOrigin = `${c.x - rect.left}px ${c.y - rect.top}px`;
  }
  // 창이 닫혀있는(축소된) 상태에서도 실제 자리(중앙 정렬 또는 드래그된 위치)를 계산
  function restingRect() {
    const cs = getComputedStyle(win);
    const width = parseFloat(cs.width);
    const height = parseFloat(cs.height);
    let left, top;
    if (win.style.left) {
      left = parseFloat(win.style.left);
      top = parseFloat(win.style.top);
    } else {
      left = (window.innerWidth - width) / 2;
      top = (window.innerHeight - height) / 2;
    }
    return { left, top };
  }
  function focus() {
    win.style.zIndex = String(++topZ);
  }
  function open() {
    setGenieOrigin(restingRect());
    win.classList.add("open");
    win.classList.remove("maximized");
    focus();
  }
  function close() {
    setGenieOrigin(win.getBoundingClientRect());
    win.classList.remove("open", "maximized");
  }

  closeBtn.addEventListener("click", close);
  minBtn.addEventListener("click", close);
  win.addEventListener("mousedown", focus);

  let preZoomRect = null;
  zoomBtn.addEventListener("click", () => {
    const willMaximize = !win.classList.contains("maximized");
    if (willMaximize) {
      preZoomRect = {
        left: win.style.left,
        top: win.style.top,
        right: win.style.right,
        bottom: win.style.bottom,
        margin: win.style.margin,
      };
      win.style.left = "";
      win.style.top = "";
      win.style.right = "";
      win.style.bottom = "";
      win.style.margin = "";
      win.classList.add("maximized");
    } else {
      win.classList.remove("maximized");
      if (preZoomRect) {
        win.style.left = preZoomRect.left;
        win.style.top = preZoomRect.top;
        win.style.right = preZoomRect.right;
        win.style.bottom = preZoomRect.bottom;
        win.style.margin = preZoomRect.margin;
        preZoomRect = null;
      }
    }
  });

  // 타이틀바 드래그로 창 이동
  let dragState = null;
  titlebar.addEventListener("mousedown", (e) => {
    if (e.target.closest(".traffic-lights")) return;
    if (win.classList.contains("maximized")) return;
    const rect = win.getBoundingClientRect();
    dragState = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;
    win.style.right = "auto";
    win.style.bottom = "auto";
    win.style.margin = "0";
    win.classList.add("dragging");
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const w = win.offsetWidth;
    let newLeft = dragState.startLeft + dx;
    let newTop = dragState.startTop + dy;
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - 40));
    newLeft = Math.max(120 - w, Math.min(newLeft, window.innerWidth - 120));
    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  });
  window.addEventListener("mouseup", () => {
    if (!dragState) return;
    dragState = null;
    win.classList.remove("dragging");
  });

  // 바탕화면 아이콘 드래그 이동 (드래그가 아니면 클릭으로 간주해 창 열기)
  let iconDrag = null;
  let iconWasDragged = false;
  icon.addEventListener("mousedown", (e) => {
    iconWasDragged = false;
    const rect = icon.getBoundingClientRect();
    iconDrag = { startX: e.clientX, startY: e.clientY, startLeft: rect.left, startTop: rect.top };
    e.preventDefault();
  });
  window.addEventListener("mousemove", (e) => {
    if (!iconDrag) return;
    const dx = e.clientX - iconDrag.startX;
    const dy = e.clientY - iconDrag.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) iconWasDragged = true;
    if (!iconWasDragged) return;
    const w = icon.offsetWidth;
    const h = icon.offsetHeight;
    const newLeft = Math.max(0, Math.min(iconDrag.startLeft + dx, window.innerWidth - w));
    const newTop = Math.max(0, Math.min(iconDrag.startTop + dy, window.innerHeight - h));
    icon.style.left = `${newLeft}px`;
    icon.style.top = `${newTop}px`;
    icon.style.transform = "none";
  });
  window.addEventListener("mouseup", () => {
    iconDrag = null;
  });
  icon.addEventListener("click", (e) => {
    if (iconWasDragged) {
      e.preventDefault();
      return;
    }
    open();
  });

  return { icon, win, open, close };
}

const notesApp = setupAppAndIcon($("#notes-icon"), $("#notes-window"));
const mailApp = setupAppAndIcon($("#mail-icon"), $("#mail-window"));

// 바탕화면(창 바깥) 클릭 시 열려있는 창 닫기
const desktopEl = $("#desktop");
desktopEl.addEventListener("click", (e) => {
  if (e.target !== desktopEl) return;
  [notesApp, mailApp].forEach((a) => {
    if (a.win.classList.contains("open")) a.close();
  });
});

// ===========================================================
// 메모 — 나의 글을 모아두는 공간
// ===========================================================
const notes = [
  {
    id: "intro",
    folder: "intro",
    title: "안녕하세요, 선진입니다 👋",
    date: "오늘 오전 9:14",
    preview: "반갑습니다! 이 메모장은 제가 써온 글과 기록들을 모아두는 공간이에요.",
    body: [
      "반갑습니다! 이 메모장은 제가 써온 글과 기록들을 모아두는 공간이에요.",
      "왼쪽 폴더에서 소개 · 글을 골라보시거나, 목록에서 메모를 하나씩 눌러보세요. 방향키(↑/↓)로도 메모 사이를 이동할 수 있어요.",
      "* 작업 포트폴리오는 배경화면의 '메일' 아이콘에서 확인하실 수 있어요.",
    ],
  },
  {
    id: "ideas",
    folder: "writing",
    title: "글감 아이디어",
    date: "8월 3일",
    preview: "쓰고 싶은 글감 체크리스트",
    checklist: [
      { text: "[아이디어 1]", done: true },
      { text: "[아이디어 2]", done: true },
      { text: "[아이디어 3]", done: false },
      { text: "[아이디어 4]", done: false },
    ],
  },
  {
    id: "writing1",
    folder: "writing",
    title: "[글 제목을 입력해주세요]",
    date: "어제 오후 3:40",
    preview: "짧은 소개나 발췌를 이 자리에 채워주세요.",
    body: [
      "[여기에 글의 도입부나 발췌를 적어주세요]",
      "[본문 내용을 자유롭게 작성해주세요.]",
    ],
  },
  {
    id: "writing2",
    folder: "writing",
    title: "[글 제목을 입력해주세요]",
    date: "8월 6일",
    preview: "짧은 소개나 발췌를 이 자리에 채워주세요.",
    body: [
      "[여기에 글의 도입부나 발췌를 적어주세요]",
      "[본문 내용을 자유롭게 작성해주세요.]",
    ],
  },
];

notes.forEach((n) => {
  if (n.checklist) n.checklist.forEach((c, i) => { c._uid = i; });
});

const folders = [
  { id: "all", label: "모든 iCloud" },
  { id: "intro", label: "소개" },
  { id: "writing", label: "글" },
];

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

// 방향키로 메모 이동 (검색창에 포커스가 있을 땐 기본 커서 이동 유지)
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
  if (document.activeElement === searchInput) return;
  if (!notesApp.win.classList.contains("open")) return;

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

// ===========================================================
// 메일 — 작업 포트폴리오 (네이버 메일 스타일)
// ===========================================================
const mails = [
  {
    id: "intro",
    folder: "inbox",
    unread: false,
    starred: true,
    sender: "선진",
    subject: "안녕하세요, 선진입니다 👋",
    date: "오늘 오전 9:14",
    preview: "반갑습니다! 이 메일함은 제가 작업해온 프로젝트들을 정리해둔 공간이에요.",
    body: [
      "반갑습니다! 이 메일함은 제가 작업해온 프로젝트들을 정리해둔 공간이에요.",
      "왼쪽 폴더에서 받은메일함 · 보낸메일함을 오가며 프로젝트와 연락처를 확인해보세요.",
      "* 아직 실제 프로젝트 내용은 채워지지 않은 프로토타입 단계입니다.",
    ],
  },
  {
    id: "project1",
    folder: "inbox",
    unread: true,
    starred: false,
    sender: "[발신자를 입력해주세요]",
    subject: "[프로젝트명을 입력해주세요]",
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
    folder: "inbox",
    unread: true,
    starred: false,
    sender: "[발신자를 입력해주세요]",
    subject: "[프로젝트명을 입력해주세요]",
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
    id: "contact",
    folder: "sent",
    unread: false,
    starred: false,
    sender: "나",
    to: "담당자님",
    subject: "연락처 안내드립니다",
    date: "7월 28일",
    preview: "이메일과 연락 가능한 채널을 정리했습니다.",
    body: [
      "이메일 — [이메일 주소를 입력해주세요]",
      "인스타그램 — [계정을 입력해주세요]",
      "편하신 방법으로 연락 주시면 빠르게 답변드리겠습니다. 봐주셔서 감사합니다 :)",
    ],
  },
];

const mailFolders = [
  { id: "inbox", label: "받은메일함" },
  { id: "sent", label: "보낸메일함" },
  { id: "draft", label: "임시보관함" },
];

const mailListEl = $("#mail-list");
const mailSearchInput = $("#mail-search-input");
const mailMainEl = $(".mail-main");

let activeMailFolder = "inbox";
let activeMailId = null;

function mailFolderCount(id) {
  return mails.filter((m) => m.folder === id).length;
}
function mailUnreadCount(id) {
  return mails.filter((m) => m.folder === id && m.unread).length;
}

function renderMailFolders() {
  $("#mail-folders-list").innerHTML = mailFolders
    .map((f) => {
      const unread = mailUnreadCount(f.id);
      return `
      <li>
        <div class="folder-row ${f.id === activeMailFolder ? "active" : ""} ${unread > 0 ? "has-unread" : ""}" data-folder="${f.id}">
          <span class="folder-name">${f.label}</span>
          <span class="folder-count">${mailFolderCount(f.id)}</span>
        </div>
      </li>`;
    })
    .join("");

  $("#mail-folders-list")
    .querySelectorAll(".folder-row")
    .forEach((row) => {
      row.addEventListener("click", () => {
        activeMailFolder = row.dataset.folder;
        mailSearchInput.value = "";
        renderMailFolders();
        renderMailList();
      });
    });
}

function visibleMails() {
  const q = mailSearchInput.value.trim().toLowerCase();
  return mails.filter((m) => {
    const inFolder = m.folder === activeMailFolder;
    const matchesQuery =
      !q ||
      m.subject.toLowerCase().includes(q) ||
      (m.preview || "").toLowerCase().includes(q) ||
      m.sender.toLowerCase().includes(q);
    return inFolder && matchesQuery;
  });
}

function renderMailList() {
  const filtered = visibleMails();
  const folderLabel = mailFolders.find((f) => f.id === activeMailFolder)?.label || "받은메일함";
  $("#mail-list-title").textContent = folderLabel;

  mailListEl.innerHTML = filtered
    .map(
      (m) => `
      <li class="mail-row ${m.unread ? "unread" : ""} ${m.starred ? "starred" : ""}" data-id="${m.id}">
        <span class="mail-dot"></span>
        <button class="mail-star" aria-label="중요 표시" data-id="${m.id}">
          <svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z"/></svg>
        </button>
        <span class="mail-sender">${m.sender}</span>
        <span class="mail-subject-wrap">
          <span class="mail-subject">${m.subject}</span>
          <span class="mail-snippet">${m.preview}</span>
        </span>
        <span class="mail-date">${m.date}</span>
      </li>`
    )
    .join("");

  mailListEl.querySelectorAll(".mail-star").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mail = mails.find((m) => m.id === btn.dataset.id);
      mail.starred = !mail.starred;
      renderMailList();
    });
  });

  mailListEl.querySelectorAll(".mail-row").forEach((row) => {
    row.addEventListener("click", () => openMail(row.dataset.id));
  });
}

function openMail(id) {
  const mail = mails.find((m) => m.id === id);
  if (!mail) return;
  activeMailId = id;
  if (mail.unread) {
    mail.unread = false;
    renderMailFolders();
    renderMailList();
  }

  $("#mail-detail-subject").textContent = mail.subject;
  $("#mail-detail-sender").textContent = mail.to ? `${mail.sender} → ${mail.to}` : mail.sender;
  $("#mail-detail-date").textContent = mail.date;

  $("#mail-detail-content").innerHTML = mail.body
    .map((p) => `<p class="${p.startsWith("[") ? "placeholder" : ""}">${p}</p>`)
    .join("");

  $("#mail-star-btn").classList.toggle("active", !!mail.starred);

  mailMainEl.classList.add("detail-open");
}

$("#mail-back-btn").addEventListener("click", () => {
  mailMainEl.classList.remove("detail-open");
});

$("#mail-star-btn").addEventListener("click", () => {
  const mail = mails.find((m) => m.id === activeMailId);
  if (!mail) return;
  mail.starred = !mail.starred;
  $("#mail-star-btn").classList.toggle("active", mail.starred);
  renderMailList();
});

mailSearchInput.addEventListener("input", renderMailList);

renderMailFolders();
renderMailList();
