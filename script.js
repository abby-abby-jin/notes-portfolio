// ---------------------------------------------------------
// 선진 — 배경화면 프로토타입
// 메모 = 개인 글 모음, 메일 = 작업 포트폴리오
// 내용은 실제 자료가 정해지기 전까지 자리표시자입니다.
// ---------------------------------------------------------

const $ = (sel) => document.querySelector(sel);

// 빈 줄로 구분된 본문 텍스트를 문단(<p>) 목록으로 변환
function paragraphsToHtml(text) {
  return (text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="${p.startsWith("[") ? "placeholder" : ""}">${p}</p>`)
    .join("");
}

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
// 메모 — 나의 글을 모아두는 공간 (content/notes.json에서 불러옴)
// ===========================================================
let notes = [];
let folders = [];

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
  if (note.checklist && note.checklist.length) {
    content.innerHTML = `<ul class="checklist"></ul>`;
    const ul = content.querySelector(".checklist");
    ul.innerHTML = checklistMarkup(note);
    bindChecklist(note, ul);
  } else {
    content.innerHTML = paragraphsToHtml(note.body);
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

const desktopQuery = window.matchMedia("(min-width: 681px)");
function ensureDesktopSelection() {
  if (desktopQuery.matches && !activeNoteId) {
    openNote(notes[0].id);
  }
}
desktopQuery.addEventListener("change", ensureDesktopSelection);

// ===========================================================
// 메일 — 작업 포트폴리오 (content/mails.json에서 불러옴)
// ===========================================================
let mails = [];
let mailFolders = [];
const mailListEl = $("#mail-list");
const mailSearchInput = $("#mail-search-input");
const mailMainEl = $(".mail-main");

let activeMailFolder = "sent";
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
      m.sender.toLowerCase().includes(q) ||
      (m.to || "").toLowerCase().includes(q);
    return inFolder && matchesQuery;
  });
}

function renderMailList() {
  const filtered = visibleMails();
  const folderLabel = mailFolders.find((f) => f.id === activeMailFolder)?.label || "보낸메일함";
  $("#mail-list-title").textContent = folderLabel;

  mailListEl.innerHTML = filtered
    .map(
      (m) => `
      <li class="mail-row ${m.unread ? "unread" : ""} ${m.starred ? "starred" : ""}" data-id="${m.id}">
        <span class="mail-dot"></span>
        <button class="mail-star" aria-label="중요 표시" data-id="${m.id}">
          <svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6-4.5-4.1 6-.7z"/></svg>
        </button>
        <span class="mail-sender">${m.to || m.sender}</span>
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

  const images = mail.images || [];
  const imagesHtml = images.length
    ? `<div class="mail-images">${images
        .map((src) => `<button type="button" class="mail-image-thumb" style="background-image:url('${src}')" data-src="${src}" aria-label="첨부 이미지 크게 보기"></button>`)
        .join("")}</div>`
    : "";
  $("#mail-detail-content").innerHTML = paragraphsToHtml(mail.body) + imagesHtml;
  $("#mail-detail-content")
    .querySelectorAll(".mail-image-thumb")
    .forEach((btn) => btn.addEventListener("click", () => openLightbox(btn.dataset.src)));

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

// 메일 클라이언트가 연결되어 있지 않은 방문자를 위해, 주소를 클립보드에도 함께 복사
let toastTimer = null;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ---------------------------------------------------------
// 이메일 주소 모달
// ---------------------------------------------------------
const contactOverlay = $("#contact-overlay");

function openContactModal() {
  contactOverlay.classList.add("open");
}
function closeContactModal() {
  contactOverlay.classList.remove("open");
}

$("#compose-btn").addEventListener("click", openContactModal);
$("#contact-close").addEventListener("click", closeContactModal);
contactOverlay.addEventListener("click", (e) => {
  if (e.target === contactOverlay) closeContactModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && contactOverlay.classList.contains("open")) closeContactModal();
});

$("#contact-copy").addEventListener("click", () => {
  showToast("이메일 주소가 복사됐어요: apome@naver.com");
  navigator.clipboard?.writeText?.("apome@naver.com").catch(() => {});
});

// ---------------------------------------------------------
// 첨부 이미지 라이트박스
// ---------------------------------------------------------
const lightbox = $("#image-lightbox");
const lightboxImg = $("#lightbox-img");

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add("open");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightboxImg.src = "";
}
$("#lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
});

// ---------------------------------------------------------
// 콘텐츠 불러오기 (content/notes.json, content/mails.json)
// CMS(관리자 페이지)에서 수정한 내용이 이 파일들에 반영됩니다.
// ---------------------------------------------------------
async function loadContent() {
  const [notesData, mailsData] = await Promise.all([
    fetch("content/notes.json").then((r) => r.json()),
    fetch("content/mails.json").then((r) => r.json()),
  ]);

  folders = [{ id: "all", label: "모든 iCloud" }, ...(notesData.folders || [])];
  notes = notesData.items || [];
  notes.forEach((n, i) => {
    if (!n.id) n.id = `note-${i}`;
    if (n.checklist) n.checklist.forEach((c, ci) => { c._uid = ci; });
  });

  mailFolders = mailsData.folders || [];
  mails = mailsData.items || [];
  mails.forEach((m, i) => {
    if (!m.id) m.id = `mail-${i}`;
  });

  renderFolders();
  renderList();
  ensureDesktopSelection();

  renderMailFolders();
  renderMailList();
}

loadContent();
