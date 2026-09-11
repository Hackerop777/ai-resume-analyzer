// ==========================================================================
// AI Resume Analyzer Agent - Unified Frontend Motion Engine
// Features: Two-Tier Architecture (Landing Page -> Agent Workspace),
//           Lenis Momentum Scroll, GSAP 3D Deck Stacking, Magnetic Buttons,
//           Live Micro-Widgets, Draggable Canvas Physics, Dual-Layer Markdown.
// ==========================================================================

let currentSessionId = "sess_" + Math.random().toString(36).substring(2, 10);
let selectedFile = null;
let sampleProfiles = {};
let lenis = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Icons
  if (window.lucide) lucide.createIcons();

  // 2. Initialize Lenis Smooth Scroll
  initSmoothScroll();

  // 3. Initialize GSAP Scroll & 3D Stacking Engine
  initGSAPMotion();

  // 4. Initialize Magnetic Buttons Physics
  initMagneticButtons();

  // 5. Initialize Freeform Draggable Canvas Widget
  initDraggableWidget();

  // 6. Initialize View Switcher (Landing vs Agent Workspace)
  initViewSwitcher();

  // 7. Initialize Live Micro-Widgets on Landing Page
  initMicroWidgets();

  // 8. Initialize Dynamic Island Dock
  initDynamicDock();

  // 9. Initialize Day / Night Theme Engine
  initTheme();

  // 10. Fetch 1-Click Samples
  try {
    const res = await fetch("/api/samples");
    if (res.ok) {
      sampleProfiles = await res.json();
    }
  } catch (err) {
    console.warn("Could not fetch samples:", err);
  }

  // 11. Core UI Setups for Agent Workspace
  setupTabs();
  setupDropzone();
  setupPresets();
  setupExternalDocsAccordion();
  setupAnalyzeAction();
  setupChat();

  // 12. Initialize GraphMind Canvas Engine
  initGraphMindCanvas();

  // Default to Landing Page (Overview) unless explicit #agent or #canvas hash is requested
  if (window.location.hash === "#canvas" || window.location.pathname === "/canvas") {
    switchView("canvas", false);
  } else if (window.location.hash === "#agent") {
    switchView("agent", false);
  } else {
    switchView("landing", false);
  }
});

// ==========================================================================
// 0. Day / Night Theme Engine
// ==========================================================================
function applyTheme(theme) {
  const isDark = theme === "dark";
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme_preference", isDark ? "dark" : "light");

  // Update icons
  const headerIcon = document.getElementById("theme-icon");
  const dockIcon = document.getElementById("dock-theme-icon");
  const canvasIcon = document.getElementById("canvas-theme-icon");
  if (headerIcon) headerIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
  if (dockIcon) dockIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
  if (canvasIcon) canvasIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
  if (window.lucide) lucide.createIcons();
}

function initTheme() {
  const saved = localStorage.getItem("theme_preference");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const activeTheme = saved ? saved : (prefersDark ? "dark" : "light");
  applyTheme(activeTheme);

  const toggleBtn = document.getElementById("theme-toggle-btn");
  const dockToggle = document.getElementById("dock-theme-toggle");
  const canvasToggle = document.getElementById("canvas-theme-toggle-btn");

  const handleToggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    applyTheme(isDark ? "light" : "dark");
  };

  if (toggleBtn) toggleBtn.addEventListener("click", handleToggle);
  if (dockToggle) dockToggle.addEventListener("click", handleToggle);
  if (canvasToggle) canvasToggle.addEventListener("click", handleToggle);
}

// ==========================================================================
// 1. Lenis Smooth Momentum Scroll Engine
// ==========================================================================
function initSmoothScroll() {
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.4
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

// ==========================================================================
// 2. GSAP Motion: 3D Stacking & Scroll Scrubbing
// ==========================================================================
function initGSAPMotion() {
  if (typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Headline Mask Reveal
    gsap.fromTo(
      ".text-mask-reveal h1",
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.1 }
    );

    // 3D Card Stacking Fan-Out on Scroll
    const deck = document.getElementById("deck-container");
    if (deck) {
      ScrollTrigger.create({
        trigger: "#showcase-stack-section",
        start: "top 70%",
        end: "bottom 30%",
        onEnter: () => deck.classList.add("fanned"),
        onLeaveBack: () => deck.classList.remove("fanned")
      });
    }

    // Scroll Scrubbing Paragraph Opacity
    const scrubParas = document.querySelectorAll(".scroll-scrub-p");
    scrubParas.forEach((p) => {
      ScrollTrigger.create({
        trigger: p,
        start: "top 80%",
        end: "bottom 30%",
        onEnter: () => {
          p.classList.remove("dim");
          p.classList.add("active");
        },
        onLeaveBack: () => {
          p.classList.add("dim");
          p.classList.remove("active");
        }
      });
    });
  }
}

// ==========================================================================
// 3. View Switcher: Landing Page <-> Agent Workspace
// ==========================================================================
let currentView = "landing";
let previousView = "landing";

function switchView(targetView, smoothScroll = true) {
  const landing = document.getElementById("landing-view");
  const agent = document.getElementById("agent-view");
  const canvas = document.getElementById("canvas-view");
  const dock = document.getElementById("floating-dock");
  const dragWidget = document.getElementById("draggable-widget");

  if (targetView !== currentView) {
    previousView = currentView;
    currentView = targetView;
  }

  if (targetView === "canvas") {
    if (landing) landing.classList.add("hidden");
    if (agent) agent.classList.add("hidden");
    if (canvas) canvas.classList.remove("hidden");
    if (dock) dock.classList.add("hidden");
    if (dragWidget) dragWidget.classList.add("hidden");
    window.location.hash = "canvas";

    const backText = document.getElementById("canvas-back-text");
    if (backText) {
      backText.textContent = previousView === "landing" ? "Back to Overview" : "Back to Workspace";
    }
    if (window.onCanvasActivated) window.onCanvasActivated();
    if (window.lucide) lucide.createIcons();
    return;
  }

  // Non-canvas views (Landing Page or Agent Workspace)
  if (canvas) canvas.classList.add("hidden");
  if (dock) dock.classList.remove("hidden");
  if (dragWidget) dragWidget.classList.remove("hidden");

  if (targetView === "agent") {
    if (landing) landing.classList.add("hidden");
    if (agent) agent.classList.remove("hidden");
    window.location.hash = "agent";

    // Update Dock state
    if (dock) {
      dock.querySelectorAll(".dock-item").forEach((d) => d.classList.remove("active"));
      const agentItem = dock.querySelector('[data-action="go-agent"]');
      if (agentItem) agentItem.classList.add("active");
    }

    if (smoothScroll) {
      if (lenis) lenis.scrollTo(0, { duration: 0.8 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    if (agent) agent.classList.add("hidden");
    if (landing) landing.classList.remove("hidden");
    window.location.hash = "";

    // Update Dock state
    if (dock) {
      dock.querySelectorAll(".dock-item").forEach((d) => d.classList.remove("active"));
      const landingItem = dock.querySelector('[data-action="go-landing"]');
      if (landingItem) landingItem.classList.add("active");
    }

    if (smoothScroll) {
      if (lenis) lenis.scrollTo(0, { duration: 0.8 });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (window.lucide) lucide.createIcons();
}

function initViewSwitcher() {
  // Buttons that launch Agent Workspace
  const launchButtons = [
    document.getElementById("nav-launch-btn"),
    document.getElementById("hero-interact-btn"),
    document.getElementById("narrative-launch-btn")
  ];

  launchButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => switchView("agent"));
    }
  });

  // Buttons that launch Canvas Chat
  const canvasButtons = [
    document.getElementById("nav-canvas-btn"),
    document.getElementById("nav-canvas-link"),
    document.getElementById("btn-open-canvas-from-chat")
  ];

  canvasButtons.forEach((btn) => {
    if (btn) {
      btn.addEventListener("click", () => switchView("canvas"));
    }
  });

  // Back from Canvas
  const canvasBackBtn = document.getElementById("btn-canvas-back");
  if (canvasBackBtn) {
    canvasBackBtn.addEventListener("click", () => switchView(previousView || "agent"));
  }

  // Back to Landing Page Buttons
  const backBtn = document.getElementById("btn-back-to-landing");
  const brandLogo = document.getElementById("nav-brand-logo");

  if (backBtn) backBtn.addEventListener("click", () => switchView("landing"));
  if (brandLogo) brandLogo.addEventListener("click", () => switchView("landing"));
}

// ==========================================================================
// 4. Live Micro-Widgets on Landing Page
// ==========================================================================
function initMicroWidgets() {
  // Widget 1: ATS Strictness Toggle
  const toggle1 = document.getElementById("demo-toggle-1");
  const status1 = document.getElementById("demo-toggle-status");
  if (toggle1 && status1) {
    toggle1.addEventListener("click", () => {
      toggle1.classList.toggle("active");
      const isStrict = toggle1.classList.contains("active");
      status1.textContent = isStrict
        ? "Status: Strict Mode (Require >50% metrics, 0 weak verbs)"
        : "Status: Standard Mode (Require >40% metrics)";
      status1.className = isStrict
        ? "p-3 rounded-xl bg-[#FDF0ED] border border-[#C53030]/30 text-xs font-mono text-[#C53030] font-semibold"
        : "p-3 rounded-xl bg-[#FAF7F2] border border-[#E2D7C5] text-xs font-mono text-[#8D5B4C] font-semibold";
    });
  }

  // Widget 2: Interactive Keyword Gap Tester
  const pills = document.querySelectorAll(".demo-pill");
  const counter = document.getElementById("demo-skill-counter");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const skill = pill.getAttribute("data-skill");
      const isMatched = pill.classList.contains("bg-[#EAF4EC]");

      if (isMatched) {
        pill.className = "demo-pill px-2.5 py-1 rounded-lg bg-[#FDF0ED] text-[#C53030] border border-[#C53030]/30 text-xs font-mono font-semibold transition";
        pill.textContent = `✗ ${skill}`;
      } else {
        pill.className = "demo-pill px-2.5 py-1 rounded-lg bg-[#EAF4EC] text-[#2E7D32] border border-[#2E7D32]/30 text-xs font-mono font-semibold transition";
        pill.textContent = `✓ ${skill}`;
      }

      const matchedCount = document.querySelectorAll(".demo-pill.bg-\\[\\#EAF4EC\\]").length;
      const missingCount = pills.length - matchedCount;
      if (counter) {
        counter.textContent = `${matchedCount} Matched • ${missingCount} Missing`;
      }
    });
  });

  // Widget 3: Formula Switcher
  const btnXyz = document.getElementById("tab-formula-xyz");
  const btnStar = document.getElementById("tab-formula-star");
  const formulaDisplay = document.getElementById("demo-formula-display");

  if (btnXyz && btnStar && formulaDisplay) {
    btnXyz.addEventListener("click", () => {
      btnXyz.className = "flex-1 py-1 rounded-lg bg-[#8D5B4C] text-white font-bold text-[11px]";
      btnStar.className = "flex-1 py-1 rounded-lg text-[#786B63] hover:text-[#291E1A] font-bold text-[11px]";
      formulaDisplay.innerHTML = "<strong>Google X-Y-Z:</strong> Accomplished [X] by [Z] as measured by [Y]. Puts the measurable business or technical metric upfront.";
    });

    btnStar.addEventListener("click", () => {
      btnStar.className = "flex-1 py-1 rounded-lg bg-[#8D5B4C] text-white font-bold text-[11px]";
      btnXyz.className = "flex-1 py-1 rounded-lg text-[#786B63] hover:text-[#291E1A] font-bold text-[11px]";
      formulaDisplay.innerHTML = "<strong>STAR Method:</strong> Situation, Task, Action, Result. Great for behavioral questions like 'Tell me about a technical challenge'.";
    });
  }
}

// ==========================================================================
// 5. Magnetic Tracking Buttons Physics
// ==========================================================================
function initMagneticButtons() {
  const magneticEls = document.querySelectorAll('[data-magnetic="true"]');

  magneticEls.forEach((el) => {
    let boundRect = null;

    el.addEventListener("mouseenter", () => {
      boundRect = el.getBoundingClientRect();
    });

    el.addEventListener("mousemove", (e) => {
      if (!boundRect) boundRect = el.getBoundingClientRect();
      const x = e.clientX - boundRect.left - boundRect.width / 2;
      const y = e.clientY - boundRect.top - boundRect.height / 2;
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0px, 0px)";
      boundRect = null;
    });
  });
}

// ==========================================================================
// 6. Freeform Draggable Canvas Widget
// ==========================================================================
function initDraggableWidget() {
  const widget = document.getElementById("draggable-widget");
  const handle = widget ? widget.querySelector(".drag-handle") : null;
  const toggleBtn = document.getElementById("widget-toggle-btn");
  const body = document.getElementById("widget-body");

  if (!widget || !handle) return;

  let isDragging = false;
  let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

  handle.addEventListener("mousedown", (e) => {
    isDragging = true;
    widget.classList.add("dragging");
    startX = e.clientX;
    startY = e.clientY;

    const rect = widget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    widget.style.right = "auto";
    widget.style.left = `${initialLeft}px`;
    widget.style.top = `${initialTop}px`;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const maxLeft = window.innerWidth - widget.offsetWidth - 16;
    const maxTop = window.innerHeight - widget.offsetHeight - 16;
    const newLeft = Math.max(16, Math.min(maxLeft, initialLeft + dx));
    const newTop = Math.max(16, Math.min(maxTop, initialTop + dy));

    widget.style.left = `${newLeft}px`;
    widget.style.top = `${newTop}px`;
  }

  function onMouseUp() {
    isDragging = false;
    widget.classList.remove("dragging");
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  if (toggleBtn && body) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      body.classList.toggle("hidden");
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        icon.setAttribute("data-lucide", body.classList.contains("hidden") ? "maximize-2" : "minus");
        if (window.lucide) lucide.createIcons();
      }
    });
  }
}

// ==========================================================================
// 7. Floating Dynamic Island (Dock)
// ==========================================================================
function initDynamicDock() {
  const dock = document.getElementById("floating-dock");
  if (!dock) return;

  const items = dock.querySelectorAll(".dock-item");

  items.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const action = item.getAttribute("data-action");

      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      if (action === "go-landing") {
        switchView("landing");
      } else if (action === "go-deck") {
        switchView("landing", false);
        const el = document.getElementById("showcase-stack-section");
        if (el) lenis ? lenis.scrollTo(el, { offset: -30 }) : el.scrollIntoView({ behavior: "smooth" });
      } else if (action === "go-widgets") {
        switchView("landing", false);
        const el = document.getElementById("micro-widgets-section");
        if (el) lenis ? lenis.scrollTo(el, { offset: -30 }) : el.scrollIntoView({ behavior: "smooth" });
      } else if (action === "go-agent") {
        switchView("agent");
      } else if (action === "go-canvas") {
        switchView("canvas");
      }
    });
  });
}

// ==========================================================================
// 8. Global Helper: Markdown Renderer
// ==========================================================================
function escapeHtml(str) {
  return (str || "").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderMarkdown(rawText) {
  if (!rawText) return "";

  let cleaned = rawText
    .replace(/^(\s*)\*{3}(?!\*)\s*([^*]+)\*\*/gm, "$1- **$2**")
    .replace(/^(\s*)\*{3}(?!\*)/gm, "$1- ")
    .replace(/^(\s*)\*\*\s*\*\s*([^*:]+):?\*/gm, "$1- **$2:**")
    .replace(/([^\n])\n(#{1,4}\s+)/g, "$1\n\n$2");

  if (window.marked && typeof window.marked.parse === "function") {
    return window.marked.parse(cleaned);
  }

  return escapeHtml(cleaned)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

// ==========================================================================
// 9. Agent Workspace: Tabs, Dropzone, and Presets
// ==========================================================================
function setupTabs() {
  const tabFile = document.getElementById("tab-file-btn");
  const tabText = document.getElementById("tab-text-btn");
  const dropzone = document.getElementById("file-dropzone");
  const textContainer = document.getElementById("resume-text-container");

  if (!tabFile || !tabText) return;

  tabFile.addEventListener("click", () => {
    tabFile.className = "px-3 py-1 rounded-lg bg-[#8D5B4C] text-white font-semibold shadow-sm transition";
    tabText.className = "px-3 py-1 rounded-lg text-[#786B63] hover:text-[#291E1A] font-semibold transition";
    dropzone.classList.remove("hidden");
    textContainer.classList.add("hidden");
  });

  tabText.addEventListener("click", () => {
    tabText.className = "px-3 py-1 rounded-lg bg-[#8D5B4C] text-white font-semibold shadow-sm transition";
    tabFile.className = "px-3 py-1 rounded-lg text-[#786B63] hover:text-[#291E1A] font-semibold transition";
    textContainer.classList.remove("hidden");
    dropzone.classList.add("hidden");
  });
}

function setupDropzone() {
  const dropzone = document.getElementById("file-dropzone");
  const fileInput = document.getElementById("resume-file-input");
  const fileChip = document.getElementById("selected-file-chip");
  const fileName = document.getElementById("selected-file-name");
  const removeBtn = document.getElementById("remove-file-btn");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("border-[#8D5B4C]", "bg-[#F5EFEB]");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("border-[#8D5B4C]", "bg-[#F5EFEB]");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-[#8D5B4C]", "bg-[#F5EFEB]");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFileSelected(fileInput.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = "";
      fileChip.classList.add("hidden");
    });
  }

  function handleFileSelected(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileChip.classList.remove("hidden");
  }
}

function setupPresets() {
  const btnSwe = document.getElementById("btn-sample-swe");
  const btnMl = document.getElementById("btn-sample-ml");
  const resumeTextInput = document.getElementById("resume-text-input");
  const jdTextInput = document.getElementById("jd-text-input");
  const extDocInput = document.getElementById("ext-doc-input");
  const tabText = document.getElementById("tab-text-btn");

  if (btnSwe) {
    btnSwe.addEventListener("click", () => {
      if (sampleProfiles.software_engineer) {
        const p = sampleProfiles.software_engineer;
        if (tabText) tabText.click();
        if (resumeTextInput) resumeTextInput.value = p.resume;
        if (jdTextInput) jdTextInput.value = p.job_description;
        if (p.external_docs && extDocInput) {
          extDocInput.value = p.external_docs;
          openExternalDocs();
        }
        updateJdCharCount();
      }
    });
  }

  if (btnMl) {
    btnMl.addEventListener("click", () => {
      if (sampleProfiles.ai_ml_engineer) {
        const p = sampleProfiles.ai_ml_engineer;
        if (tabText) tabText.click();
        if (resumeTextInput) resumeTextInput.value = p.resume;
        if (jdTextInput) jdTextInput.value = p.job_description;
        if (p.external_docs && extDocInput) {
          extDocInput.value = p.external_docs;
          openExternalDocs();
        }
        updateJdCharCount();
      }
    });
  }

  if (jdTextInput) {
    jdTextInput.addEventListener("input", updateJdCharCount);
  }

  function updateJdCharCount() {
    const len = jdTextInput ? jdTextInput.value.length : 0;
    const counter = document.getElementById("jd-char-count");
    if (counter) counter.textContent = `${len} chars`;
  }
}

function setupExternalDocsAccordion() {
  const btn = document.getElementById("ext-doc-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const content = document.getElementById("ext-doc-content");
      const icon = document.getElementById("ext-doc-icon");
      if (content) content.classList.toggle("hidden");
      if (icon) icon.classList.toggle("rotate-180");
    });
  }
}

function openExternalDocs() {
  const content = document.getElementById("ext-doc-content");
  const icon = document.getElementById("ext-doc-icon");
  if (content) content.classList.remove("hidden");
  if (icon) icon.classList.add("rotate-180");
}

// ==========================================================================
// 10. Main Analyze Action
// ==========================================================================
function setupAnalyzeAction() {
  const btn = document.getElementById("btn-analyze");
  const placeholderState = document.getElementById("placeholder-state");
  const loadingState = document.getElementById("loading-state");
  const resultsContainer = document.getElementById("results-container");

  if (!btn) return;

  btn.addEventListener("click", async () => {
    const jdTextInput = document.getElementById("jd-text-input");
    const resumeTextInput = document.getElementById("resume-text-input");
    const extDocInput = document.getElementById("ext-doc-input");

    const jdText = jdTextInput ? jdTextInput.value.trim() : "";
    const resumeText = resumeTextInput ? resumeTextInput.value.trim() : "";
    const extDoc = extDocInput ? extDocInput.value.trim() : "";

    if (!selectedFile && !resumeText) {
      alert("Please upload a resume file (PDF/DOCX/TXT) or paste resume text.");
      return;
    }

    if (!jdText) {
      alert("Please enter the target Job Description.");
      return;
    }

    currentSessionId = "sess_" + Math.random().toString(36).substring(2, 10);

    if (placeholderState) placeholderState.classList.add("hidden");
    if (resultsContainer) resultsContainer.classList.add("hidden");
    if (loadingState) loadingState.classList.remove("hidden");

    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");

    const formData = new FormData();
    formData.append("jd_text", jdText);
    formData.append("session_id", currentSessionId);
    if (extDoc) formData.append("external_doc_text", extDoc);

    if (selectedFile) {
      formData.append("resume_file", selectedFile);
    } else {
      formData.append("resume_text", resumeText);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Analysis failed");
      }

      const data = await response.json();
      renderResults(data);

      if (loadingState) loadingState.classList.add("hidden");
      if (resultsContainer) resultsContainer.classList.remove("hidden");

      if (window.lucide) lucide.createIcons();

      if (lenis) {
        lenis.scrollTo(resultsContainer, { offset: -20, duration: 1.2 });
      } else if (resultsContainer) {
        resultsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (err) {
      alert("Error: " + err.message);
      if (loadingState) loadingState.classList.add("hidden");
      if (placeholderState) placeholderState.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  });
}

// ==========================================================================
// 11. Render Analysis Results
// ==========================================================================
function renderResults(data) {
  const analysis = data.analysis || {};
  const scores = analysis.scores || {};
  const ats = data.ats_audit || {};
  const skills = data.skill_gap || {};
  const telemetry = data.telemetry || {};

  document.getElementById("detected-candidate-name").textContent = (analysis.candidate_name || "Candidate") + " — Evaluation";
  document.getElementById("detected-target-role").textContent = analysis.target_role || "Target Role";
  document.getElementById("score-rationale").textContent = scores.score_rationale || analysis.executive_summary || "";

  const overall = scores.overall_score || 0;
  const gaugeText = document.getElementById("gauge-text");
  const gaugeCircle = document.getElementById("gauge-circle");

  if (gaugeText) gaugeText.textContent = `${overall}%`;
  if (gaugeCircle) {
    gaugeCircle.setAttribute("stroke-dasharray", `${overall}, 100`);
    gaugeCircle.classList.remove("green", "amber", "red");
    if (overall >= 75) gaugeCircle.classList.add("green");
    else if (overall >= 50) gaugeCircle.classList.add("amber");
    else gaugeCircle.classList.add("red");
  }

  setBar("tech", scores.technical_score || 0);
  setBar("exp", scores.experience_score || 0);
  setBar("ats", scores.ats_score || 0);
  setBar("soft", scores.soft_skills_score || 0);

  document.getElementById("telemetry-latency").textContent = `${telemetry.total_latency_ms || 0} ms`;
  document.getElementById("telemetry-tokens").textContent = `~${(telemetry.prompt_tokens_est || 0) + (telemetry.output_tokens_est || 0)}`;
  document.getElementById("telemetry-model").textContent = telemetry.model || "gemini-3.5-flash-lite";

  const widgetMatch = document.getElementById("widget-match-score");
  if (widgetMatch) widgetMatch.textContent = `${overall}% Match`;

  const metricPct = ats.metric_audit ? ats.metric_audit.metric_percentage : 0;
  document.getElementById("ats-metric-pct").textContent = `${metricPct}%`;
  document.getElementById("ats-metric-bar").style.width = `${Math.min(100, metricPct)}%`;

  const verbAudit = ats.verb_audit || {};
  document.getElementById("ats-verbs-count").textContent = `${verbAudit.strong_verb_count || 0} strong verbs`;
  const weakVerbs = verbAudit.weak_found || [];
  const weakVerbsEl = document.getElementById("ats-weak-verbs");
  if (weakVerbsEl) {
    weakVerbsEl.textContent = weakVerbs.length > 0 ? `Flagged: ${weakVerbs.join(", ")}` : "No weak verbs flagged ✓";
    weakVerbsEl.className = weakVerbs.length > 0 ? "text-[11px] text-[#B45309] truncate font-medium" : "text-[11px] text-[#2E7D32] truncate font-medium";
  }

  const contact = ats.contact_audit || {};
  const contactBadges = document.getElementById("ats-contact-badges");
  if (contactBadges) {
    contactBadges.innerHTML = `
      <span class="px-2.5 py-0.5 rounded-full font-semibold ${contact.has_email ? 'bg-[#EAF4EC] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-[#FDF0ED] text-[#C53030] border border-[#C53030]/30'}">Email ${contact.has_email ? '✓' : '✗'}</span>
      <span class="px-2.5 py-0.5 rounded-full font-semibold ${contact.has_phone ? 'bg-[#EAF4EC] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-[#FDF0ED] text-[#C53030] border border-[#C53030]/30'}">Phone ${contact.has_phone ? '✓' : '✗'}</span>
      <span class="px-2.5 py-0.5 rounded-full font-semibold ${contact.has_linkedin ? 'bg-[#EAF4EC] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-[#FDF0ED] text-[#C53030] border border-[#C53030]/30'}">LinkedIn ${contact.has_linkedin ? '✓' : '✗'}</span>
      <span class="px-2.5 py-0.5 rounded-full font-semibold ${contact.has_github ? 'bg-[#EAF4EC] text-[#2E7D32] border border-[#2E7D32]/30' : 'bg-[#F5EFEB] text-[#786B63] border border-[#E2D7C5]'}">GitHub ${contact.has_github ? '✓' : '–'}</span>
    `;
  }

  const warningsContainer = document.getElementById("ats-warnings-container");
  const findings = ats.findings || [];
  if (warningsContainer) {
    if (findings.length > 0) {
      warningsContainer.innerHTML = findings.map((f) => `
        <div class="flex items-start gap-2 p-2.5 rounded-xl bg-[#FDF0ED] border border-[#C53030]/25 text-[#C53030]">
          <i data-lucide="alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C53030]"></i>
          <span class="font-medium">${f}</span>
        </div>
      `).join("");
    } else {
      warningsContainer.innerHTML = `
        <div class="flex items-center gap-2 p-2.5 rounded-xl bg-[#EAF4EC] border border-[#2E7D32]/25 text-[#2E7D32]">
          <i data-lucide="check-circle" class="w-4 h-4 flex-shrink-0 text-[#2E7D32]"></i>
          <span class="font-semibold">Passed all essential ATS formatting checks!</span>
        </div>
      `;
    }
  }

  const matchedPills = document.getElementById("matched-skills-pills");
  const missingPills = document.getElementById("missing-skills-pills");
  const matchedTech = skills.matched_tech || [];
  const missingTech = skills.missing_tech || [];

  if (matchedPills) {
    matchedPills.innerHTML = matchedTech.length > 0
      ? matchedTech.map((s) => `<span class="px-3 py-1 rounded-lg bg-[#EAF4EC] border border-[#2E7D32]/30 text-[#2E7D32] font-mono font-semibold text-[11px] shadow-sm">${s}</span>`).join("")
      : '<span class="text-[#786B63]">No direct technical skill overlaps detected.</span>';
  }

  if (missingPills) {
    missingPills.innerHTML = missingTech.length > 0
      ? missingTech.map((s) => `<span class="px-3 py-1 rounded-lg bg-[#FDF0ED] border border-[#C53030]/30 text-[#C53030] font-mono font-semibold text-[11px] shadow-sm">${s}</span>`).join("")
      : '<span class="text-[#786B63]">All key JD skills appear to be addressed!</span>';
  }

  const rewritesContainer = document.getElementById("rewrites-container");
  const rewrites = analysis.bullet_rewrites || [];
  if (rewritesContainer) {
    rewritesContainer.innerHTML = rewrites.map((r) => `
      <div class="p-4 md:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E2D7C5] space-y-3 shadow-sm">
        <div class="flex items-center justify-between text-xs">
          <span class="px-2.5 py-1 rounded-md bg-[#F5EFEB] text-[#8D5B4C] border border-[#E2D7C5] font-bold text-[10px] uppercase">
            ${r.impact_type || 'X-Y-Z Formula'}
          </span>
          <button class="copy-rewrite-btn px-3 py-1 rounded-lg bg-white hover:bg-[#F5EFEB] text-[#6B4226] border border-[#E2D7C5] transition flex items-center gap-1.5 text-[11px] font-bold shadow-sm" data-text="${escapeHtml(r.rewritten_bullet)}">
            <i data-lucide="copy" class="w-3.5 h-3.5 text-[#8D5B4C]"></i>
            <span>Copy Rewrite</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div class="p-3.5 rounded-xl bg-[#FDF0ED] border border-[#C53030]/20 space-y-1">
            <span class="text-[10px] uppercase font-extrabold text-[#C53030] block">Original Weak Bullet:</span>
            <p class="text-[#291E1A] leading-relaxed">${r.original_bullet}</p>
          </div>
          <div class="p-3.5 rounded-xl bg-[#EAF4EC] border border-[#2E7D32]/20 space-y-1">
            <span class="text-[10px] uppercase font-extrabold text-[#2E7D32] block">Google X-Y-Z Rewrite:</span>
            <p class="text-[#1C4D22] font-semibold leading-relaxed">${r.rewritten_bullet}</p>
          </div>
        </div>
        <p class="text-[11px] text-[#786B63] italic">Why this wins: ${r.rationale}</p>
      </div>
    `).join("");

    document.querySelectorAll(".copy-rewrite-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-text");
        navigator.clipboard.writeText(text);
        const span = btn.querySelector("span");
        const orig = span.textContent;
        span.textContent = "Copied! ✓";
        btn.classList.add("text-[#2E7D32]");
        setTimeout(() => {
          span.textContent = orig;
          btn.classList.remove("text-[#2E7D32]");
        }, 1500);
      });
    });
  }

  const sectionsContainer = document.getElementById("sections-breakdown-container");
  const sections = analysis.sections_breakdown || [];
  if (sectionsContainer) {
    sectionsContainer.innerHTML = sections.map((sec) => {
      const statusColor = sec.status === 'Strong' ? 'text-[#2E7D32] border-[#2E7D32]/30 bg-[#EAF4EC]' :
                          sec.status === 'Moderate' ? 'text-[#B45309] border-[#B45309]/30 bg-[#F5EFEB]' :
                          'text-[#C53030] border-[#C53030]/30 bg-[#FDF0ED]';
      return `
        <div class="p-4 md:p-5 rounded-2xl bg-[#FAF7F2] border border-[#E2D7C5] space-y-2.5 shadow-sm">
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-[#291E1A]">${sec.section_name}</h4>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}">${sec.status || 'Audited'}</span>
              <span class="text-xs font-mono font-bold text-[#6B4226]">${sec.score || 0}%</span>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div>
              <span class="text-[#2E7D32] font-bold block mb-1">Strengths:</span>
              <ul class="list-disc list-inside space-y-1 text-[#786B63]">
                ${(sec.strengths || []).map((s) => `<li>${s}</li>`).join("")}
              </ul>
            </div>
            <div>
              <span class="text-[#B45309] font-bold block mb-1">Actionable Fix:</span>
              <ul class="list-disc list-inside space-y-1 text-[#786B63]">
                ${(sec.recommended_fixes || []).map((f) => `<li>${f}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  const suggestionsContainer = document.getElementById("actionable-suggestions-container");
  const suggestions = analysis.actionable_suggestions || [];
  if (suggestionsContainer) {
    suggestionsContainer.innerHTML = suggestions.map((item) => {
      const pColor = item.priority === 'HIGH' ? 'bg-[#FDF0ED] text-[#C53030] border-[#C53030]/30' :
                     item.priority === 'MEDIUM' ? 'bg-[#F5EFEB] text-[#B45309] border-[#B45309]/30' :
                     'bg-[#FAF7F2] text-[#786B63] border-[#E2D7C5]';
      return `
        <div class="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E2D7C5] flex items-start gap-3 shadow-sm">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${pColor} flex-shrink-0 mt-0.5">${item.priority}</span>
          <div class="space-y-1 text-xs">
            <div class="flex items-center gap-2">
              <h5 class="font-bold text-[#291E1A]">${item.title}</h5>
              <span class="text-[10px] text-[#A3968C] font-mono">(${item.category})</span>
            </div>
            <p class="text-[#786B63]">${item.description}</p>
            <p class="text-[#8D5B4C] font-semibold mt-1">👉 Fix: ${item.action_step}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="flex items-start gap-2.5 text-[#291E1A]">
        <div class="w-7 h-7 rounded-full bg-[#8D5B4C] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm">AI</div>
        <div class="p-3.5 rounded-2xl bg-white border border-[#E2D7C5] max-w-xl space-y-1.5 shadow-sm">
          <p class="font-bold text-[#8D5B4C] text-xs">Analysis Complete (${scores.overall_score}% Match)</p>
          <div class="chat-markdown">${renderMarkdown(analysis.executive_summary)}</div>
          <p class="text-[10px] text-[#A3968C] pt-1.5 border-t border-[#E2D7C5]">Ask me anything: how to frame your experience, pitch to this hiring manager, or rewrite any section!</p>
        </div>
      </div>
    `;
  }
}

function setBar(id, val) {
  const scoreEl = document.getElementById(`score-${id}`);
  const barEl = document.getElementById(`bar-${id}`);
  if (scoreEl) scoreEl.textContent = `${val}%`;
  if (barEl) barEl.style.width = `${val}%`;
}

// ==========================================================================
// 12. Interactive Chat with Short-Term Memory
// ==========================================================================
function setupChat() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");

  if (!form || !input || !messages) return;

  document.querySelectorAll(".chat-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent.trim();
      form.dispatchEvent(new Event("submit"));
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    appendChatMessage("user", msg);
    input.value = "";

    const loadingId = "bubble-" + Date.now();
    appendLoadingBubble(loadingId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: msg
        })
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();

      removeLoadingBubble(loadingId);
      appendChatMessage("agent", data.reply);
    } catch (err) {
      removeLoadingBubble(loadingId);
      appendChatMessage("agent", "Sorry, I had trouble answering that follow-up: " + err.message);
    }
  });

  function appendChatMessage(role, text) {
    const isUser = role === "user";
    const div = document.createElement("div");
    div.className = isUser ? "flex items-start justify-end gap-2.5" : "flex items-start gap-2.5";

    const contentHtml = isUser
      ? `<p class="whitespace-pre-line text-xs font-medium">${escapeHtml(text)}</p>`
      : `<div class="chat-markdown">${renderMarkdown(text)}</div>`;

    div.innerHTML = `
      ${!isUser ? '<div class="w-7 h-7 rounded-full bg-[#8D5B4C] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-1 shadow-sm">AI</div>' : ''}
      <div class="p-3.5 rounded-2xl max-w-2xl ${isUser ? 'bg-[#8D5B4C] text-white' : 'bg-white border border-[#E2D7C5] text-[#291E1A] shadow-sm'}">
        ${contentHtml}
      </div>
      ${isUser ? '<div class="w-7 h-7 rounded-full bg-[#6B4226] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-1 shadow-sm">You</div>' : ''}
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function appendLoadingBubble(id) {
    const div = document.createElement("div");
    div.id = id;
    div.className = "flex items-start gap-2.5 text-[#786B63]";
    div.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-[#8D5B4C] text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold shadow-sm">AI</div>
      <div class="p-3 rounded-2xl bg-white border border-[#E2D7C5] flex items-center gap-2 text-[11px] font-semibold text-[#8D5B4C] shadow-sm">
        <span class="w-2 h-2 rounded-full bg-[#C88A58] animate-ping"></span>
        <span>Gemini 3.5 Flash Lite is thinking...</span>
      </div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeLoadingBubble(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
}

// ==========================================================================
// 10. GRAPHMIND INTERACTIVE NODE-TREE CANVAS CHAT ENGINE (DAG 2D WHITEBOARD)
// ==========================================================================
let canvasNodes = [];
let canvasPanX = 120;
let canvasPanY = 100;
let canvasZoom = 1.0;
let isCanvasPanning = false;
let canvasStartScreen = { x: 0, y: 0 };
let canvasStartPan = { x: 0, y: 0 };
let activeBranchParentNode = null;
let activeDraggingNode = null;
let dragMouseOffset = { x: 0, y: 0 };

function initGraphMindCanvas() {
  const stage = document.getElementById("canvas-stage");
  const plane = document.getElementById("canvas-plane");
  if (!stage || !plane) return;

  // Viewport Drag-to-Pan (Mouse)
  stage.addEventListener("mousedown", (e) => {
    // Only pan if clicking on empty stage, svg background, or nodes-container background
    if (
      e.target === stage ||
      e.target.id === "canvas-plane" ||
      e.target.id === "canvas-svg" ||
      e.target.id === "canvas-nodes-container" ||
      e.target.tagName === "svg"
    ) {
      isCanvasPanning = true;
      stage.classList.add("is-panning");
      canvasStartScreen = { x: e.clientX, y: e.clientY };
      canvasStartPan = { x: canvasPanX, y: canvasPanY };
      closeBranchPopover();
    }
  });

  window.addEventListener("mousemove", (e) => {
    if (isCanvasPanning) {
      canvasPanX = canvasStartPan.x + (e.clientX - canvasStartScreen.x);
      canvasPanY = canvasStartPan.y + (e.clientY - canvasStartScreen.y);
      updateCanvasTransform();
    } else if (activeDraggingNode) {
      const coords = screenToCanvasCoords(e.clientX, e.clientY);
      activeDraggingNode.x = coords.x - dragMouseOffset.x;
      activeDraggingNode.y = coords.y - dragMouseOffset.y;

      const el = document.getElementById(`node-${activeDraggingNode.id}`);
      if (el) {
        el.style.left = `${activeDraggingNode.x}px`;
        el.style.top = `${activeDraggingNode.y}px`;
      }
      renderCanvasConnectors();
    }
  });

  window.addEventListener("mouseup", () => {
    if (isCanvasPanning) {
      isCanvasPanning = false;
      stage.classList.remove("is-panning");
    }
    if (activeDraggingNode) {
      const el = document.getElementById(`node-${activeDraggingNode.id}`);
      if (el) el.classList.remove("dragging");
      activeDraggingNode = null;
      renderCanvasConnectors();
    }
  });

  // Wheel Rules: Regular Scroll = PAN; Ctrl/Meta + Scroll = ZOOM
  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom around cursor
        const rect = stage.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(Math.max(0.25, canvasZoom * factor), 2.5);

        canvasPanX = mouseX - (mouseX - canvasPanX) * (newZoom / canvasZoom);
        canvasPanY = mouseY - (mouseY - canvasPanY) * (newZoom / canvasZoom);
        canvasZoom = newZoom;
        updateCanvasTransform();
      } else {
        // Pan canvas
        canvasPanX -= e.deltaX;
        canvasPanY -= e.deltaY;
        updateCanvasTransform();
      }
    },
    { passive: false }
  );

  // Touch Support
  let touchStartDist = 0;
  let touchStartPan = { x: 0, y: 0 };
  let touchStartCoords = { x: 0, y: 0 };

  stage.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        if (
          e.target === stage ||
          e.target.id === "canvas-svg" ||
          e.target.id === "canvas-nodes-container" ||
          e.target.tagName === "svg"
        ) {
          isCanvasPanning = true;
          touchStartCoords = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          touchStartPan = { x: canvasPanX, y: canvasPanY };
        }
      } else if (e.touches.length === 2) {
        isCanvasPanning = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1 && isCanvasPanning) {
        const dx = e.touches[0].clientX - touchStartCoords.x;
        const dy = e.touches[0].clientY - touchStartCoords.y;
        canvasPanX = touchStartPan.x + dx;
        canvasPanY = touchStartPan.y + dy;
        updateCanvasTransform();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const factor = dist / touchStartDist;
          canvasZoom = Math.min(Math.max(0.25, canvasZoom * factor), 2.5);
          touchStartDist = dist;
          updateCanvasTransform();
        }
      }
    },
    { passive: true }
  );

  stage.addEventListener("touchend", () => {
    isCanvasPanning = false;
    touchStartDist = 0;
  });

  // Dock Buttons (Bottom-Right)
  const btnZoomIn = document.getElementById("btn-canvas-zoom-in");
  const btnZoomOut = document.getElementById("btn-canvas-zoom-out");
  const btnReset = document.getElementById("btn-canvas-reset");
  const btnRecenter = document.getElementById("btn-canvas-recenter");

  if (btnZoomIn) {
    btnZoomIn.addEventListener("click", () => {
      canvasZoom = Math.min(2.5, canvasZoom + 0.15);
      updateCanvasTransform();
    });
  }
  if (btnZoomOut) {
    btnZoomOut.addEventListener("click", () => {
      canvasZoom = Math.max(0.25, canvasZoom - 0.15);
      updateCanvasTransform();
    });
  }
  if (btnReset) {
    btnReset.addEventListener("click", () => {
      canvasZoom = 1.0;
      updateCanvasTransform();
    });
  }
  if (btnRecenter) {
    btnRecenter.addEventListener("click", recenterCanvas);
  }

  // Left Toolbar Tools
  const toolAddRoot = document.getElementById("tool-add-root");
  const toolAutoLayout = document.getElementById("tool-autolayout");
  const toolClear = document.getElementById("tool-clear-canvas");

  if (toolAddRoot) {
    toolAddRoot.addEventListener("click", () => {
      const q = prompt("Enter a new Root Discussion Query:");
      if (q && q.trim()) {
        plantRootQuery(q.trim());
      }
    });
  }
  if (toolAutoLayout) {
    toolAutoLayout.addEventListener("click", autoLayoutDAG);
  }
  if (toolClear) {
    toolClear.addEventListener("click", () => {
      if (confirm("Clear all nodes from GraphMind Canvas?")) {
        clearCanvas();
      }
    });
  }

  // Empty State Form & Chips
  const emptyForm = document.getElementById("canvas-empty-form");
  const emptyInput = document.getElementById("canvas-empty-input");
  if (emptyForm && emptyInput) {
    emptyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = emptyInput.value.trim();
      if (!val) return;
      emptyInput.value = "";
      plantRootQuery(val);
    });
  }

  document.querySelectorAll(".canvas-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      plantRootQuery(chip.textContent.trim());
    });
  });

  // Branch Popover Controls
  setupBranchPopover();

  // History Tree Panel Toggle & Search
  setupHistoryPanel();
}

window.onCanvasActivated = function () {
  recenterCanvas();
  checkEmptyState();
  renderCanvasConnectors();
  updateCanvasTelemetry();
};

function updateCanvasTransform() {
  const plane = document.getElementById("canvas-plane");
  if (plane) {
    plane.style.transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasZoom})`;
  }
  const badge = document.getElementById("canvas-zoom-badge");
  if (badge) badge.textContent = `${Math.round(canvasZoom * 100)}%`;
}

function screenToCanvasCoords(screenX, screenY) {
  const stage = document.getElementById("canvas-stage");
  const rect = stage ? stage.getBoundingClientRect() : { left: 0, top: 0 };
  const canvasX = (screenX - rect.left - canvasPanX) / canvasZoom;
  const canvasY = (screenY - rect.top - canvasPanY) / canvasZoom;
  return { x: canvasX, y: canvasY };
}

// --------------------------------------------------------------------------
// Core DAG Operations & Ancestor Chaining
// --------------------------------------------------------------------------
function addNodeToDAG(data) {
  const node = {
    id: data.id || "node_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
    type: data.type, // 'user' | 'agent'
    text: data.text || "",
    parentId: data.parentId !== undefined ? data.parentId : null,
    childrenIds: [],
    x: data.x || 0,
    y: data.y || 0,
    width: data.type === "user" ? 330 : 400,
    height: 180,
    status: data.status || "ready", // 'ready' | 'thinking' | 'error'
    meta: data.meta || {
      latency_ms: 0,
      total_tokens: 0,
      suggested_followups: []
    }
  };

  if (node.parentId) {
    const parent = canvasNodes.find((n) => String(n.id) === String(node.parentId));
    if (parent && !parent.childrenIds.includes(node.id)) {
      parent.childrenIds.push(node.id);
    }
  }

  canvasNodes.push(node);
  renderCanvasNodeDOM(node);
  renderCanvasConnectors();
  updateCanvasTelemetry();
  updateCanvasHistoryTree();
  checkEmptyState();
  return node;
}

function reconstructBranchHistory(nodeId) {
  const chain = [];
  let curr = canvasNodes.find((n) => String(n.id) === String(nodeId));
  while (curr) {
    chain.unshift({
      role: curr.type === "user" ? "user" : "agent",
      content: curr.text
    });
    if (!curr.parentId) break;
    curr = canvasNodes.find((n) => String(n.id) === String(curr.parentId));
  }
  return chain;
}

// --------------------------------------------------------------------------
// Node DOM Rendering & Event Binding
// --------------------------------------------------------------------------
function renderCanvasNodeDOM(node) {
  const container = document.getElementById("canvas-nodes-container");
  if (!container) return;

  const div = document.createElement("div");
  div.id = `node-${node.id}`;
  div.className = `graph-node ${node.type === "user" ? "graph-node-user" : "graph-node-agent"}`;
  div.style.left = `${node.x}px`;
  div.style.top = `${node.y}px`;

  div.innerHTML = getNodeInnerHTML(node);
  container.appendChild(div);

  // Capture rendered dimensions
  requestAnimationFrame(() => {
    node.width = div.offsetWidth || (node.type === "user" ? 330 : 400);
    node.height = div.offsetHeight || 180;
    renderCanvasConnectors();
  });

  // Drag handle on node header
  const header = div.querySelector(".node-header");
  if (header) {
    header.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      activeDraggingNode = node;
      div.classList.add("dragging");
      const coords = screenToCanvasCoords(e.clientX, e.clientY);
      dragMouseOffset = { x: coords.x - node.x, y: coords.y - node.y };
    });
  }

  // Branch Button (for Agent Nodes)
  const branchBtn = div.querySelector(".btn-branch");
  if (branchBtn) {
    branchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openBranchPopover(node);
    });
  }

  if (window.lucide) lucide.createIcons();
}

function updateNodeDOM(node) {
  const div = document.getElementById(`node-${node.id}`);
  if (!div) return;
  div.innerHTML = getNodeInnerHTML(node);

  requestAnimationFrame(() => {
    node.width = div.offsetWidth || (node.type === "user" ? 330 : 400);
    node.height = div.offsetHeight || 180;
    renderCanvasConnectors();
  });

  const header = div.querySelector(".node-header");
  if (header) {
    header.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      activeDraggingNode = node;
      div.classList.add("dragging");
      const coords = screenToCanvasCoords(e.clientX, e.clientY);
      dragMouseOffset = { x: coords.x - node.x, y: coords.y - node.y };
    });
  }

  const branchBtn = div.querySelector(".btn-branch");
  if (branchBtn) {
    branchBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openBranchPopover(node);
    });
  }

  if (window.lucide) lucide.createIcons();
}

function getNodeInnerHTML(node) {
  const isUser = node.type === "user";

  if (isUser) {
    return `
      <div class="node-header">
        <div class="flex items-center gap-1.5">
          <i data-lucide="user" class="w-3.5 h-3.5"></i>
          <span>Student Query</span>
        </div>
        <span class="text-[10px] font-mono opacity-70">#${String(node.id).slice(-4)}</span>
      </div>
      <div class="node-body">
        <p class="font-medium text-[#1D4ED8] dark:text-[#93C5FD]">${escapeHtml(node.text)}</p>
      </div>
    `;
  }

  // Agent Node
  if (node.status === "thinking") {
    return `
      <div class="node-header">
        <div class="flex items-center gap-1.5">
          <i data-lucide="bot" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
          <span>Gemini 3.5 Flash Lite</span>
        </div>
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
      </div>
      <div class="node-body flex items-center gap-2 text-xs text-[#786B63]">
        <div class="w-4 h-4 rounded-full border-2 border-[#E2D7C5] border-t-emerald-600 animate-spin flex-shrink-0"></div>
        <span>Generating grounded answer along this branch...</span>
      </div>
    `;
  }

  const latencyPill = node.meta && node.meta.latency_ms ? `${node.meta.latency_ms}ms` : "Fast";
  const tokensPill = node.meta && node.meta.total_tokens ? `~${node.meta.total_tokens} tokens` : "Low-Token";

  return `
    <div class="node-header">
      <div class="flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
        <span>AI Career Coach</span>
      </div>
      <div class="flex items-center gap-1 text-[10px] font-mono">
        <span class="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">${latencyPill}</span>
      </div>
    </div>
    <div class="node-body chat-markdown">
      ${renderMarkdown(node.text)}
    </div>
    <div class="node-footer">
      <span class="font-mono text-[10px] text-[#786B63]">${tokensPill}</span>
      <button type="button" class="btn-branch">
        <i data-lucide="git-branch" class="w-3 h-3"></i>
        <span>+ Branch Follow-up</span>
      </button>
    </div>
  `;
}

// --------------------------------------------------------------------------
// SVG Bézier Connector Engine
// --------------------------------------------------------------------------
function renderCanvasConnectors() {
  const g = document.getElementById("canvas-svg-connectors");
  if (!g) return;
  g.innerHTML = "";

  canvasNodes.forEach((node) => {
    if (node.parentId) {
      const parent = canvasNodes.find((n) => String(n.id) === String(node.parentId));
      if (!parent) return;

      const pEl = document.getElementById(`node-${parent.id}`);
      const cEl = document.getElementById(`node-${node.id}`);
      const pWidth = pEl ? pEl.offsetWidth : parent.width || 380;
      const pHeight = pEl ? pEl.offsetHeight : parent.height || 180;
      const cWidth = cEl ? cEl.offsetWidth : node.width || 330;

      // Parent output: Bottom-center
      const x1 = parent.x + pWidth / 2;
      const y1 = parent.y + pHeight;

      // Child input: Top-center
      const x2 = node.x + cWidth / 2;
      const y2 = node.y;

      const dy = Math.abs(y2 - y1) * 0.5;
      const d = `M ${x1} ${y1} C ${x1} ${y1 + Math.max(dy, 40)}, ${x2} ${y2 - Math.max(dy, 40)}, ${x2} ${y2}`;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "canvas-connector");
      path.setAttribute("marker-end", "url(#arrowhead)");
      g.appendChild(path);
    }
  });
}

// --------------------------------------------------------------------------
// Planting Queries & Branching
// --------------------------------------------------------------------------
async function plantRootQuery(promptText) {
  const rootX = 100 + canvasNodes.filter((n) => !n.parentId).length * 480;
  const rootY = 80;

  const userNode = addNodeToDAG({
    type: "user",
    text: promptText,
    parentId: null,
    x: rootX + 35,
    y: rootY,
    status: "ready"
  });

  const agentNode = addNodeToDAG({
    type: "agent",
    text: "",
    parentId: userNode.id,
    x: rootX,
    y: rootY + 110,
    status: "thinking"
  });

  recenterToNode(userNode);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: currentSessionId,
        message: promptText,
        parent_id: String(userNode.id),
        branch_history: []
      })
    });

    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();

    agentNode.status = "ready";
    agentNode.text = data.reply;
    agentNode.meta = {
      latency_ms: data.latency_ms || 0,
      total_tokens: data.total_tokens || 0,
      suggested_followups: data.suggested_followups || []
    };
    updateNodeDOM(agentNode);
    updateCanvasTelemetry();
    updateCanvasHistoryTree();
  } catch (err) {
    agentNode.status = "ready";
    agentNode.text = `Error connecting to Gemini: ${err.message}`;
    updateNodeDOM(agentNode);
  }
}

async function branchFromNode(parentNode, userPromptText) {
  closeBranchPopover();

  // Node spreading formula to prevent sibling card overlaps
  const existingChildren = canvasNodes.filter((n) => String(n.parentId) === String(parentNode.id));
  const siblingIndex = existingChildren.length;
  const totalSiblings = siblingIndex + 1;

  const childX = parentNode.x + (siblingIndex - (totalSiblings - 1) / 2) * 440;
  const childY = parentNode.y + (parentNode.height || 180) + 70;

  const userNode = addNodeToDAG({
    type: "user",
    text: userPromptText,
    parentId: parentNode.id,
    x: childX + 35,
    y: childY,
    status: "ready"
  });

  const agentNode = addNodeToDAG({
    type: "agent",
    text: "",
    parentId: userNode.id,
    x: childX,
    y: childY + 110,
    status: "thinking"
  });

  // Reconstruct branch ancestry for isolated memory
  const branchHistory = reconstructBranchHistory(parentNode.id);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: currentSessionId,
        message: userPromptText,
        parent_id: String(parentNode.id),
        branch_history: branchHistory
      })
    });

    if (!res.ok) throw new Error("Branch request failed");
    const data = await res.json();

    agentNode.status = "ready";
    agentNode.text = data.reply;
    agentNode.meta = {
      latency_ms: data.latency_ms || 0,
      total_tokens: data.total_tokens || 0,
      suggested_followups: data.suggested_followups || []
    };
    updateNodeDOM(agentNode);
    updateCanvasTelemetry();
    updateCanvasHistoryTree();
  } catch (err) {
    agentNode.status = "ready";
    agentNode.text = `Branch generation error: ${err.message}`;
    updateNodeDOM(agentNode);
  }
}

// --------------------------------------------------------------------------
// Branch Popover Logic
// --------------------------------------------------------------------------
function setupBranchPopover() {
  const popover = document.getElementById("canvas-branch-popover");
  const input = document.getElementById("canvas-branch-input");
  const btnSubmit = document.getElementById("btn-submit-branch");
  const btnCancel = document.getElementById("btn-cancel-branch");
  const btnClose = document.getElementById("btn-close-branch-popover");

  if (!popover || !input) return;

  btnSubmit.addEventListener("click", () => {
    const text = input.value.trim();
    if (text && activeBranchParentNode) {
      branchFromNode(activeBranchParentNode, text);
    }
  });

  if (btnCancel) btnCancel.addEventListener("click", closeBranchPopover);
  if (btnClose) btnClose.addEventListener("click", closeBranchPopover);
}

function openBranchPopover(node) {
  activeBranchParentNode = node;
  const popover = document.getElementById("canvas-branch-popover");
  const input = document.getElementById("canvas-branch-input");
  const suggestions = document.getElementById("canvas-branch-suggestions");
  if (!popover || !input) return;

  // Position popover relative to canvas node coordinates
  popover.style.left = `${node.x + (node.width || 400) / 2 - 180}px`;
  popover.style.top = `${node.y + (node.height || 180) + 15}px`;

  // Populate dynamic suggestions
  if (suggestions) {
    suggestions.innerHTML = "";
    const items =
      node.meta && node.meta.suggested_followups && node.meta.suggested_followups.length > 0
        ? node.meta.suggested_followups
        : [
            "How do I explain this in an interview?",
            "Can you give me an exact script for this?",
            "What common mistake should I avoid?"
          ];

    items.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "text-[10px] px-2 py-1 rounded-full bg-[#FAF7F2] dark:bg-[#1E1714] text-[#8D5B4C] dark:text-[#E09A67] border border-[#E2D7C5] hover:border-[#C88A58] transition text-left";
      b.textContent = s;
      b.addEventListener("click", () => {
        input.value = s;
      });
      suggestions.appendChild(b);
    });
  }

  input.value = "";
  popover.classList.remove("hidden");
  // Place popover into transform plane so it pans along with canvas
  const plane = document.getElementById("canvas-plane");
  if (plane && popover.parentElement !== plane) {
    plane.appendChild(popover);
  }
  input.focus();
}

function closeBranchPopover() {
  const popover = document.getElementById("canvas-branch-popover");
  if (popover) popover.classList.add("hidden");
  activeBranchParentNode = null;
}

// --------------------------------------------------------------------------
// Auto-Layout (BFS Tree Spreading Algorithm)
// --------------------------------------------------------------------------
function autoLayoutDAG() {
  if (canvasNodes.length === 0) return;

  const roots = canvasNodes.filter((n) => !n.parentId);
  let currentRootX = 80;

  roots.forEach((root) => {
    const treeWidth = layoutSubtree(root, currentRootX, 80);
    currentRootX += treeWidth + 120;
  });

  // Re-apply DOM positions with smooth transition
  canvasNodes.forEach((node) => {
    const el = document.getElementById(`node-${node.id}`);
    if (el) {
      el.style.transition = "left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.left = `${node.x}px`;
      el.style.top = `${node.y}px`;
      setTimeout(() => {
        el.style.transition = "";
      }, 450);
    }
  });

  renderCanvasConnectors();
  recenterCanvas();
}

function layoutSubtree(node, startX, startY) {
  const children = canvasNodes.filter((n) => String(n.parentId) === String(node.id));

  if (children.length === 0) {
    node.x = startX;
    node.y = startY;
    return node.width || 380;
  }

  let totalChildrenWidth = 0;
  let childX = startX;

  children.forEach((child) => {
    const w = layoutSubtree(child, childX, startY + 360);
    childX += w + 60;
    totalChildrenWidth += w + 60;
  });

  totalChildrenWidth -= 60; // remove last gap
  node.x = startX + Math.max(0, (totalChildrenWidth - (node.width || 380)) / 2);
  node.y = startY;

  return Math.max(node.width || 380, totalChildrenWidth);
}

// --------------------------------------------------------------------------
// History Tree Panel & Telemetry
// --------------------------------------------------------------------------
function setupHistoryPanel() {
  const panel = document.getElementById("canvas-history-panel");
  const toggleBtn = document.getElementById("btn-toggle-history-panel");
  const closeBtn = document.getElementById("btn-close-history");
  const searchInput = document.getElementById("canvas-search-history");

  if (toggleBtn && panel) {
    toggleBtn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
    });
  }
  if (closeBtn && panel) {
    closeBtn.addEventListener("click", () => {
      panel.classList.add("collapsed");
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      document.querySelectorAll(".history-tree-item").forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? "block" : "none";
      });
    });
  }
}

function updateCanvasHistoryTree() {
  const list = document.getElementById("canvas-history-list");
  if (!list) return;

  if (canvasNodes.length === 0) {
    list.innerHTML = `<p class="text-[11px] text-[#786B63] p-2 text-center italic">No dialogue nodes yet.</p>`;
    return;
  }

  list.innerHTML = "";
  canvasNodes.forEach((node) => {
    const item = document.createElement("div");
    item.className =
      "history-tree-item p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1E1714] border border-[#E2D7C5] dark:border-[#352922] hover:border-[#C88A58] cursor-pointer transition text-xs";
    const roleIcon = node.type === "user" ? "👤" : "✨";
    const preview = node.text ? node.text.substring(0, 48) + "..." : "(Generating...)";

    item.innerHTML = `
      <div class="flex items-center justify-between text-[10px] font-mono text-[#786B63]">
        <span>${roleIcon} ${node.type.toUpperCase()}</span>
        <span>#${String(node.id).slice(-4)}</span>
      </div>
      <p class="font-semibold text-[#291E1A] dark:text-[#F5EFEB] mt-0.5">${escapeHtml(preview)}</p>
    `;

    item.addEventListener("click", () => {
      recenterToNode(node);
    });

    list.appendChild(item);
  });
}

function updateCanvasTelemetry() {
  const nodeCountEl = document.getElementById("canvas-node-count");
  const tokensEl = document.getElementById("canvas-est-tokens");

  if (nodeCountEl) nodeCountEl.textContent = `${canvasNodes.length} Nodes`;

  if (tokensEl) {
    const totalTokens = canvasNodes.reduce((acc, n) => acc + (n.meta ? n.meta.total_tokens || 0 : 0), 0);
    tokensEl.textContent = totalTokens > 0 ? `~${totalTokens} Tokens (Branch Isolated)` : "Branch-Isolated Context";
  }
}

function checkEmptyState() {
  const empty = document.getElementById("canvas-empty-state");
  if (empty) {
    if (canvasNodes.length === 0) {
      empty.classList.remove("hidden");
    } else {
      empty.classList.add("hidden");
    }
  }
}

function recenterCanvas() {
  if (canvasNodes.length > 0) {
    recenterToNode(canvasNodes[0]);
  } else {
    canvasPanX = Math.round((window.innerWidth - 450) / 2);
    canvasPanY = 120;
    canvasZoom = 1.0;
    updateCanvasTransform();
  }
}

function recenterToNode(node) {
  const stage = document.getElementById("canvas-stage");
  const stageW = stage ? stage.offsetWidth : window.innerWidth;
  const stageH = stage ? stage.offsetHeight : window.innerHeight;

  canvasPanX = Math.round(stageW / 2 - (node.x + (node.width || 380) / 2) * canvasZoom);
  canvasPanY = Math.round(stageH / 3 - node.y * canvasZoom);
  updateCanvasTransform();
}

function clearCanvas() {
  canvasNodes = [];
  const container = document.getElementById("canvas-nodes-container");
  if (container) container.innerHTML = "";
  const svgConnectors = document.getElementById("canvas-svg-connectors");
  if (svgConnectors) svgConnectors.innerHTML = "";
  closeBranchPopover();
  checkEmptyState();
  updateCanvasTelemetry();
  updateCanvasHistoryTree();
  recenterCanvas();
}

