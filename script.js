// ---------------------------------------------------------
// 선진 — 메모 앱 스타일 포트폴리오 (프로토타입)
// 프로젝트 내용은 실제 자료가 정해지기 전까지 자리표시자입니다.
// ---------------------------------------------------------

const notes = [
  {
    id: "intro",
    title: "안녕하세요, 선진입니다 👋",
    date: "오늘 오전 9:14",
    preview: "반갑습니다! 이 페이지는 제 포트폴리오를 메모 앱 형태로 정리해본 공간이에요.",
    body: [
      "반갑습니다! 이 페이지는 제 포트폴리오를 메모 앱 형태로 정리해본 공간이에요.",
      "왼쪽(또는 목록)에서 메모를 하나씩 눌러보시면 자기소개, 프로젝트, 스킬, 연락처를 확인하실 수 있습니다.",
      "* 아직 실제 프로젝트 내용은 채워지지 않은 프로토타입 단계입니다.",
    ],
  },
  {
    id: "project1",
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

const $ = (sel) => document.querySelector(sel);
const listEl = $("#notes-list");
const detailPane = $("#detail-pane");
const searchInput = $("#search-input");

function formatPreview(note) {
  if (note.checklist) {
    const doneCount = note.checklist.filter((c) => c.done).length;
    return `${doneCount}/${note.checklist.length}개 완료`;
  }
  return note.preview;
}

function renderList(filter = "") {
  const q = filter.trim().toLowerCase();
  const filtered = notes.filter(
    (n) => !q || n.title.toLowerCase().includes(q) || (n.preview || "").toLowerCase().includes(q)
  );

  listEl.innerHTML = filtered
    .map(
      (n) => `
      <li>
        <div class="note-row" data-id="${n.id}">
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

  $("#note-count").textContent = `${notes.length}개의 메모`;
}

function openNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  listEl.querySelectorAll(".note-row").forEach((row) => {
    row.classList.toggle("active", row.dataset.id === id);
  });

  $("#detail-date").textContent = note.date;
  $("#detail-title").textContent = note.title;

  const content = $("#detail-content");
  if (note.checklist) {
    content.innerHTML = `<ul class="checklist">${note.checklist
      .map(
        (c) =>
          `<li class="${c.done ? "done" : ""}"><span class="check-dot"></span><span>${c.text}</span></li>`
      )
      .join("")}</ul>`;
  } else {
    content.innerHTML = note.body
      .map((p) => `<p class="${p.startsWith("[") ? "placeholder" : ""}">${p}</p>`)
      .join("");
  }

  detailPane.classList.add("open");
}

$("#back-btn").addEventListener("click", () => {
  detailPane.classList.remove("open");
});

searchInput.addEventListener("input", () => renderList(searchInput.value));

renderList();

// 데스크톱(2단 레이아웃)에서는 항상 메모가 하나 열려있도록 함
// (로드 시점뿐 아니라, 모바일→데스크톱으로 창을 리사이즈하는 경우까지 대응)
const desktopQuery = window.matchMedia("(min-width: 760px)");
function ensureDesktopSelection() {
  if (desktopQuery.matches && !listEl.querySelector(".note-row.active")) {
    openNote(notes[0].id);
  }
}
ensureDesktopSelection();
desktopQuery.addEventListener("change", ensureDesktopSelection);
