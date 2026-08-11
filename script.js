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

function renderChecklist(note) {
  return `<ul class="checklist">${note.checklist
    .map(
      (c, i) =>
        `<li class="${c.done ? "done" : ""}" data-index="${i}"><span class="check-dot"></span><span>${c.text}</span></li>`
    )
    .join("")}</ul>`;
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
    content.innerHTML = renderChecklist(note);
    content.querySelectorAll(".checklist li").forEach((li) => {
      li.addEventListener("click", () => {
        const i = Number(li.dataset.index);
        note.checklist[i].done = !note.checklist[i].done;
        li.classList.toggle("done", note.checklist[i].done);
        // 목록의 "N/M개 완료" 미리보기도 함께 갱신
        const row = listEl.querySelector(`.note-row[data-id="${id}"] .row-preview`);
        if (row) row.textContent = formatPreview(note);
      });
    });
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
// 데스크톱 ↔ 윈도우
// ---------------------------------------------------------
const windowEl = $("#window");

function openWindow() {
  windowEl.classList.add("open");
  windowEl.classList.remove("maximized");
}
function closeWindow() {
  windowEl.classList.remove("open", "maximized");
}

$("#app-icon").addEventListener("click", openWindow);
$("#win-close").addEventListener("click", closeWindow);
$("#win-min").addEventListener("click", closeWindow);
$("#win-zoom").addEventListener("click", () => {
  windowEl.classList.toggle("maximized");
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
