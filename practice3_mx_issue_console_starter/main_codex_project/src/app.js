const FILTERS = ["All", "P0", "P1", "P2", "Camera", "Battery", "Connectivity", "Foldable UX", "UI", "Performance"];
let triagedIssues = [];
let activeFilter = "All";

const byId = (id) => document.getElementById(id);

async function requestTriage(issue) {
  const res = await fetch("/api/triage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(issue),
  });
  if (!res.ok) throw new Error("failed to triage " + issue.id + ": " + res.status);
  return res.json();
}

function updateSummary() {
  const count = (priority) => triagedIssues.filter(({ triage }) => triage.priority === priority).length;
  byId("summary-p0").textContent = count("P0");
  byId("summary-p1").textContent = count("P1");
  byId("summary-p2").textContent = count("P2");
  byId("summary-review").textContent = triagedIssues.filter(({ triage }) => triage.ownerReview).length;
}

function createFilterBar() {
  const bar = byId("filter-bar");
  bar.replaceChildren();
  FILTERS.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = filter;
    button.className = "filter-button";
    button.dataset.filter = filter;
    button.setAttribute("aria-pressed", String(filter === activeFilter));
    button.addEventListener("click", () => {
      activeFilter = filter;
      bar.querySelectorAll(".filter-button").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.filter === activeFilter)));
      renderCards();
    });
    bar.appendChild(button);
  });
}

function renderCards() {
  const board = byId("issue-board");
  board.replaceChildren();
  const visible = triagedIssues.filter(({ issue, triage }) => activeFilter === "All" || activeFilter === triage.priority || activeFilter === issue.area);
  if (!visible.length) {
    const empty = document.createElement("p");
    empty.className = "placeholder";
    empty.textContent = "선택한 필터에 해당하는 이슈가 없습니다.";
    board.appendChild(empty);
    return;
  }
  visible.forEach(({ issue, triage }) => {
    const card = document.createElement("article");
    card.className = "card card-" + triage.priority.toLowerCase() + (triage.priority === "P0" ? " card-p0" : "");
    card.dataset.priority = triage.priority;
    card.dataset.area = issue.area;
    card.innerHTML = `
      <div class="card-heading"><span class="issue-id">${issue.id}</span><span class="priority-badge">${triage.priority}</span></div>
      <h2>${issue.title || "제목 없음"}</h2>
      <p class="device">${issue.device || "Unknown device"}</p>
      <dl class="issue-facts"><div><dt>Area</dt><dd>${issue.area}</dd></div><div><dt>Severity</dt><dd>${issue.severity}</dd></div><div><dt>Repro</dt><dd>${issue.reproRate}%</dd></div><div><dt>Impact</dt><dd>${issue.impactScope}</dd></div></dl>
      <p class="owner">Owner: <strong>${triage.owner || "Unassigned"}</strong>${triage.ownerReview ? " <span class=\"review\">Review required</span>" : ""}</p>
      <div class="tests"><span>Required tests</span><ul>${(triage.requiredTests || []).map((test) => `<li>${test}</li>`).join("")}</ul></div>`;
    board.appendChild(card);
  });
}

async function loadIssues() {
  const res = await fetch("/api/issues");
  if (!res.ok) throw new Error("failed to fetch issues: " + res.status);
  const issues = await res.json();
  triagedIssues = await Promise.all(issues.map(async (issue) => ({ issue, triage: await requestTriage(issue) })));
  updateSummary();
  createFilterBar();
  renderCards();
}

loadIssues().catch((err) => {
  console.error(err);
  const panel = byId("error-panel");
  if (panel) panel.textContent = "이슈를 불러오지 못했습니다. 서버가 실행 중인지 확인하세요.";
});
