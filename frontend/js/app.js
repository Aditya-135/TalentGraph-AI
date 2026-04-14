import { analyzeGraph, checkHealth } from "./api.js";

const jobSkills = [];
let selectedFile = null;

function updateFileDisplay(file) {
  const fileDropArea = $("#fileDropArea");
  const fileMsg = $("#fileMsg");
  if (file) {
    fileMsg.textContent = file.name;
    fileDropArea.classList.add("has-file");
    selectedFile = file;
  } else {
    fileMsg.textContent = "Drag and drop PDF here or click to browse";
    fileDropArea.classList.remove("has-file");
    selectedFile = null;
  }
}

const $ = (sel) => document.querySelector(sel);

function normalizeSkill(s) {
  return s.trim().replace(/\s+/g, " ");
}

function addSkill(list, inputEl, chipsEl) {
  const raw = inputEl.value;
  const parts = raw.split(/[,;\n]+/).map(normalizeSkill).filter(Boolean);
  for (const p of parts) {
    if (!list.includes(p.toLowerCase())) list.push(p.toLowerCase());
  }
  inputEl.value = "";
  renderChips(list, chipsEl);
}

function removeSkill(list, index, chipsEl) {
  list.splice(index, 1);
  renderChips(list, chipsEl);
}

function renderChips(list, container) {
  container.innerHTML = "";
  list.forEach((skill, i) => {
    const li = document.createElement("li");
    li.className = "chip";
    const span = document.createElement("span");
    span.textContent = skill;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-remove";
    btn.setAttribute("aria-label", `Remove ${skill}`);
    btn.textContent = "×";
    btn.addEventListener("click", () => removeSkill(list, i, container));
    li.append(span, btn);
    container.appendChild(li);
  });
}

function setupSkillInput(inputId, addBtnId, chipsId, list) {
  const input = $(inputId);
  const addBtn = $(addBtnId);
  const chips = $(chipsId);

  const commit = () => addSkill(list, input, chips);

  addBtn.addEventListener("click", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
  });
}

function setConnectionStatus(state, label) {
  const pill = $("#connectionStatus");
  const dot = $("#connectionDot");
  const lbl = $("#connectionLabel");
  pill.classList.remove("is-ok", "is-error");
  if (state === "ok") pill.classList.add("is-ok");
  if (state === "error") pill.classList.add("is-error");
  lbl.textContent = label;
}

async function pingApi() {
  try {
    await checkHealth();
    setConnectionStatus("ok", "API connected");
  } catch {
    setConnectionStatus("error", "API unreachable");
  }
}

const CIRC = 2 * Math.PI * 52;

function setScoreRing(percent) {
  const fg = $("#scoreRingFg");
  const offset = CIRC - (CIRC * Math.min(100, Math.max(0, percent))) / 100;
  fg.style.strokeDashoffset = String(offset);
}

function setDecisionBadge(decision) {
  const el = $("#decisionBadge");
  el.classList.remove("is-accept", "is-review", "is-block");
  el.textContent = decision || "—";
  if (decision === "AUTO_ACCEPT") el.classList.add("is-accept");
  else if (decision === "REVIEW_REQUIRED") el.classList.add("is-review");
  else if (decision === "BLOCK_AUTOMATION") el.classList.add("is-block");
}

function fillList(ul, items, emptyMsg) {
  ul.innerHTML = "";
  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = emptyMsg;
    ul.appendChild(li);
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  }
}

function showToast(message, isError = false) {
  const region = $("#toastRegion");
  const t = document.createElement("div");
  t.className = `toast${isError ? " is-error" : ""}`;
  t.textContent = message;
  region.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity 0.3s";
    setTimeout(() => t.remove(), 320);
  }, 5200);
}

function createSvgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
  return el;
}

function safeFilename(s) {
  return String(s || "graph")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64) || "graph";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function trimLabel(label, max = 14) {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

let _latestGraph = { svg: null, meta: null, view: { scale: 1, tx: 0, ty: 0 } };

function applyViewTransform(g) {
  const { scale, tx, ty } = _latestGraph.view;
  g.setAttribute("transform", `translate(${tx} ${ty}) scale(${scale})`);
}

function setDownloadEnabled(enabled) {
  $("#downloadSvg").disabled = !enabled;
  $("#downloadPng").disabled = !enabled;
}

function wireGraphControls(svg, viewportG) {
  const zoomIn = $("#graphZoomIn");
  const zoomOut = $("#graphZoomOut");
  const reset = $("#graphResetView");

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const setScale = (next) => {
    _latestGraph.view.scale = clamp(next, 0.6, 1.9);
    applyViewTransform(viewportG);
  };

  zoomIn.onclick = () => setScale(_latestGraph.view.scale * 1.12);
  zoomOut.onclick = () => setScale(_latestGraph.view.scale / 1.12);
  reset.onclick = () => {
    _latestGraph.view = { scale: 1, tx: 0, ty: 0 };
    applyViewTransform(viewportG);
  };

  // Drag to pan
  let dragging = false;
  let start = null;

  const onDown = (e) => {
    dragging = true;
    viewportG.classList.add("is-panning");
    start = { x: e.clientX, y: e.clientY, tx: _latestGraph.view.tx, ty: _latestGraph.view.ty };
    svg.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging || !start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    _latestGraph.view.tx = start.tx + dx;
    _latestGraph.view.ty = start.ty + dy;
    applyViewTransform(viewportG);
  };
  const onUp = () => {
    dragging = false;
    start = null;
    viewportG.classList.remove("is-panning");
  };

  svg.addEventListener("pointerdown", onDown);
  svg.addEventListener("pointermove", onMove);
  svg.addEventListener("pointerup", onUp);
  svg.addEventListener("pointercancel", onUp);

  // Wheel zoom (trackpad friendly)
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      const factor = dir > 0 ? 0.93 : 1.07;
      setScale(_latestGraph.view.scale * factor);
    },
    { passive: false },
  );
}

function renderGraph(data, payload) {
  const canvas = $("#graphCanvas");
  canvas.innerHTML = "";

  const xai = data.explainability || {};
  const candidateSkills = (payload.candidate_skills || []).map((s) => s.toLowerCase());
  const jobSkills = (payload.job_skills || []).map((s) => s.toLowerCase());
  const candidateSkillSet = new Set(candidateSkills);
  const jobSkillSet = new Set(jobSkills);

  // Prefer backend reasoning, but fall back to deterministic intersection if needed.
  const backendMatched = (xai.matched_nodes || []).map((s) => s.toLowerCase());
  const backendMissing = (xai.missing_nodes || []).map((s) => s.toLowerCase());
  const matched = new Set(backendMatched.length ? backendMatched : jobSkills.filter((s) => candidateSkillSet.has(s)));
  const missing = new Set(backendMissing.length ? backendMissing : jobSkills.filter((s) => !candidateSkillSet.has(s)));

  const height = Math.max(420, 180 + Math.max(candidateSkills.length, jobSkills.length) * 58);
  const width = 980;
  const svg = createSvgEl("svg", {
    viewBox: `0 0 ${width} ${height}`,
    class: "graph-svg",
    role: "img",
    "aria-label": "Graph visualization",
  });
  svg.appendChild(createSvgEl("title")).textContent = "Candidate and job skill graph";

  const viewportG = createSvgEl("g", { class: "graph-viewport" });
  svg.appendChild(viewportG);

  const leftRoot = { x: 190, y: 110 };
  const rightRoot = { x: 790, y: 110 };

  const gap = 54;
  const leftStartY = 200;
  const rightStartY = 200;

  const leftNodes = candidateSkills.map((skill, i) => ({ label: skill, x: 360, y: leftStartY + i * gap }));
  const rightNodes = jobSkills.map((skill, i) => ({ label: skill, x: 620, y: rightStartY + i * gap }));

  const leftByLabel = new Map();
  leftNodes.forEach((n) => leftByLabel.set(n.label, n));
  const rightByLabel = new Map();
  rightNodes.forEach((n) => rightByLabel.set(n.label, n));

  const drawNode = (node, isRoot, state = "neutral") => {
    const cls = isRoot ? "graph-node-root" : `graph-node-skill${state === "match" ? " match" : state === "missing" ? " missing" : ""}`;
    const r = isRoot ? 32 : 18;
    viewportG.appendChild(createSvgEl("circle", { cx: node.x, cy: node.y, r, class: cls }));

    const title = createSvgEl("title");
    title.textContent = node.label;
    viewportG.lastChild.appendChild?.(title);

    const label = createSvgEl("text", {
      x: node.x,
      y: node.y + (isRoot ? 52 : 34),
      "text-anchor": "middle",
      class: `graph-label${isRoot ? " root" : ""}`,
    });
    label.textContent = trimLabel(node.label, isRoot ? 20 : 16);
    viewportG.appendChild(label);
  };

  const drawEdge = (from, to, cls = "") => {
    const c1 = from.x + (to.x > from.x ? 30 : -30);
    const c2 = to.x + (to.x > from.x ? -30 : 30);
    const path = createSvgEl("path", {
      d: `M ${from.x} ${from.y} C ${c1} ${from.y}, ${c2} ${to.y}, ${to.x} ${to.y}`,
      class: `graph-edge${cls ? ` ${cls}` : ""}`,
    });
    viewportG.appendChild(path);
  };

  drawNode({ ...leftRoot, label: payload.candidate_name }, true);
  drawNode({ ...rightRoot, label: payload.job_title }, true);

  // Candidate side: show all candidate skills; highlight those that are required by the job.
  leftNodes.forEach((node) => {
    const state = jobSkillSet.has(node.label) ? "match" : "neutral";
    drawEdge(leftRoot, node, state === "match" ? "match" : "");
    drawNode(node, false, state);
  });

  // Job side: show all required skills; mark matched/missing based on reasoning.
  rightNodes.forEach((node) => {
    const state = matched.has(node.label) ? "match" : missing.has(node.label) ? "missing" : "neutral";
    drawEdge(rightRoot, node, state === "match" ? "match" : state === "missing" ? "missing" : "");
    drawNode(node, false, state);
  });

  // Connect identical skills across sides (this fixes cases like “python” not showing connected).
  jobSkills.forEach((skill) => {
    const l = leftByLabel.get(skill);
    const r = rightByLabel.get(skill);
    if (!l || !r) return;
    const cls = matched.has(skill) ? "match" : "missing";
    drawEdge(l, r, cls);
  });

  canvas.appendChild(svg);

  // Save latest graph for download
  _latestGraph.svg = svg;
  _latestGraph.meta = { candidate: payload.candidate_name, job: payload.job_title };
  _latestGraph.view = { scale: 1, tx: 0, ty: 0 };
  applyViewTransform(viewportG);
  wireGraphControls(svg, viewportG);
  setDownloadEnabled(true);
}

async function downloadLatestSvg() {
  const svg = _latestGraph.svg;
  if (!svg) return;
  const clone = svg.cloneNode(true);
  // Ensure the current transform is included (g already has transform attr)
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const name = `${safeFilename(_latestGraph.meta?.candidate)}_vs_${safeFilename(_latestGraph.meta?.job)}.svg`;
  downloadBlob(blob, name);
}

async function downloadLatestPng() {
  const svg = _latestGraph.svg;
  if (!svg) return;
  const clone = svg.cloneNode(true);
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  const scale = 2; // crisp export
  const vb = svg.viewBox.baseVal;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(vb.width * scale);
  canvas.height = Math.round(vb.height * scale);
  const ctx = canvas.getContext("2d");

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  // Background (match canvas)
  ctx.fillStyle = "#0f131b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const name = `${safeFilename(_latestGraph.meta?.candidate)}_vs_${safeFilename(_latestGraph.meta?.job)}.png`;
  downloadBlob(pngBlob, name);
}

function showResults(data, payload) {
  $("#resultsEmpty").hidden = true;
  $("#resultsContent").hidden = false;

  // Populate Candidate Profile
  const name = payload.candidate_name || "Unknown";
  $("#profileName").textContent = name;
  $("#profileInitials").textContent = name.charAt(0).toUpperCase();
  $("#profileEmail").textContent = data.email || "Not specified";
  $("#profilePhone").textContent = data.phone || "Not specified";
  $("#profileJobTarget").textContent = payload.job_title || "Unknown";
  fillList($("#profileEduList"), data.education, "No education terms found");

  const score = data.metrics?.structural_alignment_score ?? 0;
  $("#scoreNumber").textContent = String(score);
  setScoreRing(score);

  const xai = data.explainability || {};
  setDecisionBadge(xai.xai_decision);
  $("#decisionExpl").textContent = xai.xai_explanation || "";

  fillList($("#matchedList"), xai.matched_nodes, "No matched concepts.");
  fillList($("#missingList"), xai.missing_nodes, "No gaps — full coverage.");

  $("#rawJson").textContent = JSON.stringify(data, null, 2);
  renderGraph(data, payload);
}

function resetResults() {
  $("#resultsEmpty").hidden = false;
  $("#resultsContent").hidden = true;
  $("#graphCanvas").innerHTML = "";
  _latestGraph = { svg: null, meta: null, view: { scale: 1, tx: 0, ty: 0 } };
  setDownloadEnabled(false);
  $("#rawJson").hidden = true;
  $("#toggleRaw").setAttribute("aria-expanded", "false");
  $("#toggleRaw").textContent = "Show raw JSON response";
}

function setLoading(loading) {
  const btn = $("#submitBtn");
  const sp = $("#submitSpinner");
  btn.disabled = loading;
  sp.hidden = !loading;
}

function flushPendingSkillInputs() {
  addSkill(jobSkills, $("#jobSkillInput"), $("#jobChips"));
}

document.addEventListener("DOMContentLoaded", () => {
  setupSkillInput("#jobSkillInput", "#addJobSkill", "#jobChips", jobSkills);

  const fileDropArea = $("#fileDropArea");
  const resumeFile = $("#resumeFile");

  fileDropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    fileDropArea.classList.add("is-active");
  });
  fileDropArea.addEventListener("dragleave", () => {
    fileDropArea.classList.remove("is-active");
  });
  fileDropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    fileDropArea.classList.remove("is-active");
    if (e.dataTransfer.files.length) {
      resumeFile.files = e.dataTransfer.files;
      updateFileDisplay(e.dataTransfer.files[0]);
    }
  });
  resumeFile.addEventListener("change", () => {
    updateFileDisplay(resumeFile.files[0]);
  });

  $("#analysisForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    flushPendingSkillInputs();
    const candidateName = normalizeSkill($("#candidateName").value);
    const jobTitle = normalizeSkill($("#jobTitle").value);

    if (!candidateName || !jobTitle) {
      showToast("Please enter candidate name and job title.", true);
      return;
    }
    if (!selectedFile) {
      showToast("Please provide a candidate resume (PDF).", true);
      return;
    }
    if (jobSkills.length === 0) {
      showToast("Add at least one job required skill.", true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("candidate_name", candidateName);
      formData.append("job_title", jobTitle);
      formData.append("job_skills_input", jobSkills.join(","));
      formData.append("resume_file", selectedFile);

      const data = await analyzeGraph(formData);
      if (data.status === "success") {
        const metaPayload = {
          candidate_name: candidateName,
          job_title: jobTitle,
          candidate_skills: data.extracted_skills || [],
          job_skills: [...jobSkills]
        };
        showResults(data, metaPayload);
      }
      else showToast("Unexpected response from server.", true);
    } catch (err) {
      showToast(err.message || "Request failed", true);
    } finally {
      setLoading(false);
    }
  });

  $("#resetBtn").addEventListener("click", () => {
    $("#candidateName").value = "";
    $("#jobTitle").value = "";
    jobSkills.length = 0;
    renderChips(jobSkills, $("#jobChips"));
    $("#resumeFile").value = "";
    updateFileDisplay(null);
    resetResults();
  });

  $("#toggleRaw").addEventListener("click", () => {
    const pre = $("#rawJson");
    const btn = $("#toggleRaw");
    const open = pre.hidden;
    pre.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide raw JSON response" : "Show raw JSON response";
  });

  setScoreRing(0);
  pingApi();

  setDownloadEnabled(false);
  $("#downloadSvg").addEventListener("click", () => {
    downloadLatestSvg().catch(() => showToast("Failed to download SVG.", true));
  });
  $("#downloadPng").addEventListener("click", () => {
    downloadLatestPng().catch(() => showToast("Failed to download PNG.", true));
  });
});
