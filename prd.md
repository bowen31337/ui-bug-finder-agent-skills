## PRD: Website UI Bug Scanner Agent Skill (Usability + WCAG 2.x AA + Custom UI Specs)

### 1) Overview
Build an **agent skill** that can take a website (and optional credentials + test instructions) and produce a **high-signal UI bug report** covering:
- **Accessibility compliance** against **WCAG 2.x Level AA** (automated + assisted checks)
- **Usability issues** (heuristic + interaction-based)
- **Custom UI specs** supplied by the team (design system rules, component contracts, product-specific UX requirements)

The skill should return **actionable issues** with evidence (DOM snippets, screenshots, selectors, reproduction steps), severity, WCAG mappings where applicable, and suggested fixes.

> Note: Automated tooling cannot verify all WCAG success criteria; the skill should clearly label findings as **“automated fail”**, **“likely issue”**, or **“needs human review.”** WCAG is a normative standard with many criteria that require human judgment. WCAG reference: W3C WCAG 2.1 Recommendation (and later WCAG 2.2) (Level A/AA/AAA) [W3C WCAG 2.1](https://www.w3.org/TR/WCAG21/) and [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).

---

### 2) Goals
1. **Find real UI bugs fast** with low noise:
   - Accessibility: missing labels, focus issues, contrast failures, keyboard traps, improper ARIA usage, etc.
   - Usability: unreachable controls, confusing error states, broken flows, poor responsive behavior, etc.
2. **Produce developer-ready tickets**:
   - Clear “Steps to Reproduce”
   - “Expected vs Actual”
   - Evidence attachments
   - WCAG criteria references (where relevant)
   - Suggested remediation guidance
3. **Validate custom UI specs**:
   - Team-defined component requirements (e.g., button min size, required aria-label patterns, modal focus management rules)
   - Design token constraints (colors, typography, spacing)
4. **Be runnable in CI** and locally, generating machine-readable artifacts (e.g., JSON, SARIF).

---

### 3) Non-goals
- Replacing expert manual accessibility audits
- Performing security scanning or vulnerability exploitation
- Guaranteeing full coverage of all pages/flows without provided navigation hints (SPAs and authenticated apps need guidance)

---

### 4) Primary users
- QA engineers (regression checks, release gates)
- Frontend engineers (actionable defects)
- Accessibility specialists (triage + verification)
- Designers / Design system owners (spec compliance)
- PMs (release readiness reports)

---

### 5) Key use cases
1. **Single URL quick scan**: “Scan this page on desktop + mobile and report issues.”
2. **Site crawl**: “Scan top N pages from sitemap and internal links.”
3. **Authenticated app scan**: “Login using these credentials, then scan these routes.”
4. **Critical user journey**: “Add item to cart → checkout → payment page.”
5. **CI gate**: “Fail build if any Critical a11y issues or if contrast violations > 0.”

---

### 6) Inputs
Minimum:
- `startUrls`: list of URLs
Optional:
- `crawlMode`: `single | sitemap | bfs | journey`
- `maxPages`, `maxDepth`, `allowDomains`, `denyPatterns`
- `auth`: cookies, headers, or scripted login steps
- `viewports`: e.g. `[desktop, tablet, mobile]`
- `locales`: e.g. `en-US`
- `customSpecs`: ruleset reference or inline spec (see DSL below)
- `interactionPlan`: optional scripted interactions (click menus, open modals)
- `standards`: WCAG target: `2.1-AA` (default), optionally `2.2-AA`
- `outputFormats`: `json`, `markdown`, `sarif`

---

### 7) Outputs
- **Human report** (Markdown/HTML):
  - Summary by severity and category
  - Top issues and affected pages
  - Per-page findings with screenshots
- **Machine report**:
  - `findings.json` (canonical schema)
  - Optional `sarif.json` for code scanning integrations
- **Artifacts**:
  - Screenshots (full page + element)
  - HAR (optional), DOM snapshots (optional)
  - Accessibility tree snapshots (optional)

---

### 8) Finding schema (canonical)
Each finding should include:
- `id`: stable hash (rule + selector + page)
- `category`: `accessibility | usability | spec`
- `severity`: `critical | high | medium | low | info`
- `confidence`: `certain | likely | needs_review`
- `pageUrl`, `viewport`, `locale`
- `title`, `description`
- `stepsToReproduce` (bullet list)
- `expected`, `actual`
- `evidence`:
  - `selectors` (CSS/XPath)
  - `domSnippet`
  - `screenshotPath`
  - `videoPath` (optional)
- Accessibility fields (when applicable):
  - `wcag`: `{ version: "2.1", level: "AA", successCriteria: ["1.4.3"], techniqueRefs?: [...] }`
  - `tool`: e.g. axe-core rule id
- Remediation:
  - `suggestedFix`
  - `devNotes`
  - `references` (links to WCAG/ARIA guidance)

---

### 9) Functional requirements

#### 9.1 Crawling & navigation
- Support:
  - Sitemap-based discovery (`/sitemap.xml`)
  - BFS crawl with domain allowlist
  - “Journey mode” (scripted path)
- Respect:
  - configurable rate limits / concurrency
  - denylist routes (logout, destructive actions)
- Deduplicate pages by canonical URL + template similarity (optional)

#### 9.2 Rendering & interaction
- Headless browser automation (Chromium-based) for JS-heavy apps
- Execute interaction plans:
  - open menus, modals, accordions
  - tab through focusable elements
  - fill forms (safe mode; avoid irreversible actions unless explicitly allowed)
- Capture:
  - screenshots
  - accessibility tree snapshot
  - computed styles for key nodes

#### 9.3 Accessibility checks (WCAG 2.x AA)
Automated checks should cover at least:
- **Name/role/value** and labeling issues (e.g., missing accessible names)
- **Keyboard accessibility**: focus traps, unreachable controls (best-effort simulation)
- **Focus visible** indicators (heuristic detection)
- **Color contrast** for text and key UI elements (where determinable)
- **ARIA validity** and common misuses
- **Form errors**: missing error association (best-effort)
- **Headings/landmarks** structure checks (heuristic)

Recommended engines:
- **axe-core** (widely used a11y ruleset) [Deque axe-core](https://github.com/dequelabs/axe-core)
- Optionally Lighthouse accessibility audits [Google Lighthouse](https://github.com/GoogleChrome/lighthouse)

#### 9.4 Usability checks (heuristics + interaction-based)
Examples (MVP scope):
- Click targets too small (especially mobile)
- Overlapping elements / clipped content at common breakpoints
- Modals not dismissible, background scroll not locked
- Sticky headers covering anchor targets
- Inline validation that blocks progress without clear messaging
- Broken back navigation / unexpected scroll jumps (heuristic)
- Missing loading states for long actions (heuristic; mark “likely”)

#### 9.5 Custom UI spec validation
Support a **rules DSL** that can express:
- Component constraints:
  - “All icon-only buttons must have aria-label”
  - “Primary button must be >= 44x44 px on mobile”
  - “Modal must trap focus and restore focus on close”
- Token constraints:
  - “Text color must be from approved palette”
  - “Min contrast ratio 4.5:1 for normal text (or 3:1 for large text)” (aligning with WCAG 1.4.3 definitions) [W3C 1.4.3 Contrast Minimum](https://www.w3.org/TR/WCAG21/#contrast-minimum)

#### 9.6 Reporting & integrations
- Output:
  - Markdown summary
  - JSON findings
  - SARIF (for GitHub code scanning style ingestion)
- Optional integrations:
  - Jira/GitHub Issues ticket creation (behind explicit opt-in)

---

### 10) MVP scope (suggested)
**MVP (4 pillars):**
1. Crawl + render (sitemap/BFS + viewport matrix)
2. axe-core accessibility scan + evidence capture
3. Spec rules DSL v1 (simple selector-based checks + computed style constraints)
4. Report generator (Markdown + JSON + SARIF)

**Later:**
- Journey recording/playback
- Visual regression + layout anomaly detection (diffing)
- Smarter deduplication and clustering of repeated issues
- Auto-fix PR suggestions for common issues (guarded, opt-in)

---

### 11) Success metrics
- Precision: % of findings accepted as real issues (target high for “certain” class)
- Coverage: pages scanned / intended pages
- Time: scan duration per page at default settings
- Noise: median findings per page (should be manageable)
- CI adoption: teams enabling gating thresholds

---

### 12) Risks & mitigations
- **False positives** (esp. usability heuristics)  
  Mitigation: confidence levels + strong evidence + conservative defaults.
- **Auth complexity**  
  Mitigation: support cookies + scripted login steps; store secrets safely.
- **Dynamic UI** (content loads after interactions)  
  Mitigation: interaction plans, auto-expand common components, wait-for-network-idle strategies.
- **Legal/ethical scanning**  
  Mitigation: explicit allowlist domains; safe mode; no destructive actions by default.

---

## Architecture Doc: Agent Skill Design

### 1) High-level architecture
**Core idea:** Orchestrate a browser-based crawler, run multiple analyzers (a11y/usability/spec), collect evidence, and produce normalized findings.

**Components**
1. **Skill API / Adapter**
   - Implements the agent-skill interface (per your platform)
   - Validates inputs, returns outputs in required shape
2. **Orchestrator**
   - Builds scan plan (pages × viewports × locales)
   - Schedules jobs and aggregates results
3. **Browser Runner Pool**
   - Headless Chromium (Playwright recommended)
   - Sandbox isolation per run
4. **Analyzers**
   - **A11y Analyzer**: axe-core + optional Lighthouse
   - **Spec Analyzer**: custom DSL rules evaluated on DOM + computed styles
   - **Usability Analyzer**: interaction simulation + layout checks + heuristics
5. **Evidence Store**
   - Blob store for screenshots, DOM snapshots, traces
6. **Report Generator**
   - Converts canonical findings → Markdown/HTML/JSON/SARIF
7. **Policy & Safety Layer**
   - Domain allowlist, rate limiting, PII handling, destructive action prevention

---

### 2) Data flow
1. **Input ingestion**
   - Parse `startUrls`, crawl mode, viewports, auth, customSpecs.
2. **Discovery**
   - If sitemap: fetch and filter URLs.
   - If BFS: visit pages, extract internal links, obey rules.
3. **Per-page execution**
   - Launch browser context (viewport/locale)
   - Apply auth (cookies or scripted login)
   - Navigate, wait for stable state
   - Run interaction plan (optional)
   - Capture evidence (screenshots, DOM, a11y tree)
   - Run analyzers and collect raw results
4. **Normalization**
   - Convert analyzer outputs into canonical finding schema
   - Deduplicate + cluster repeated issues
5. **Reporting**
   - Generate human + machine outputs
6. **Return results**
   - Provide report artifacts and summary objects to the calling agent

---

### 3) Browser Runner details
**Recommended stack:** Playwright (Chromium) for reliability and tracing.

Runner responsibilities:
- Deterministic navigation:
  - `waitUntil: networkidle` (with upper bounds)
  - optional “DOM stable” heuristic (no layout shifts for X ms)
- Tracing:
  - console logs
  - network errors
  - page errors
- Evidence:
  - full-page screenshot
  - per-node screenshot for violating elements
  - DOM snippet extraction by selector
- Interaction primitives:
  - click, type, select
  - keyboard tabbing loop with focus tracking
  - scroll and viewport resizing

---

### 4) Analyzer modules

#### 4.1 Accessibility Analyzer
- Run axe-core in the page context and export:
  - violations, incomplete, passes (store optionally)
  - nodes affected + selectors + HTML snippets
- Map axe rule IDs to WCAG SC where available (axe provides mapping metadata in many cases; verify per rule).
- Enrich with:
  - computed contrast checks (when not fully covered)
  - focus order anomalies (basic tab traversal + record focusable sequence)

Citations:
- axe-core project: https://github.com/dequelabs/axe-core  
- WCAG 2.1 and 2.2 specs: https://www.w3.org/TR/WCAG21/ , https://www.w3.org/TR/WCAG22/

#### 4.2 Spec Analyzer (Custom DSL)
A simple, expressive DSL that’s easy to version-control.

**Example DSL (JSON)**
```json
{
  "version": "1.0",
  "rules": [
    {
      "id": "icon-button-accessible-name",
      "type": "accessibility-spec",
      "selector": "button.icon-only, [role='button'].icon-only",
      "assert": {
        "accessibleName": { "minLength": 1 }
      },
      "severity": "high",
      "message": "Icon-only buttons must have an accessible name (aria-label or labelled-by)."
    },
    {
      "id": "min-tap-target-mobile",
      "type": "usability-spec",
      "selector": "button, a, input, [role='button']",
      "when": { "viewport": "mobile" },
      "assert": {
        "boundingBox": { "minWidthPx": 44, "minHeightPx": 44 }
      },
      "severity": "medium",
      "message": "Interactive controls must be at least 44x44 px on mobile."
    },
    {
      "id": "approved-text-colors",
      "type": "ui-token-spec",
      "selector": "p, span, li, label",
      "assert": {
        "computedStyle.color": { "in": ["rgb(17, 24, 39)", "rgb(55, 65, 81)"] }
      },
      "severity": "low",
      "message": "Text color must use approved palette tokens."
    }
  ]
}
```

**Spec engine implementation**
- Query DOM by selector
- For each node:
  - compute bounding box (via `getBoundingClientRect()`)
  - compute styles (via `getComputedStyle`)
  - compute accessible name (via browser accessibility APIs where possible; otherwise heuristic + label associations)
- Emit findings with evidence and exact rule ID

#### 4.3 Usability Analyzer
Because “usability bugs” are often subjective, combine:
- **Deterministic checks**:
  - overlaps (elements intersecting in viewport)
  - clipped text (scrollWidth > clientWidth for key components)
  - fixed headers covering target after anchor navigation
  - missing visible focus outline (heuristic: focus ring absent and no style change)
- **Interaction checks**:
  - tab traversal: detect focus traps / loops
  - modal open/close: ensure focus restoration (best-effort)
- **Heuristic checks (mark as likely)**:
  - unclear error copy (only if detectable patterns)
  - missing loading indicators (based on long tasks without DOM changes)

Keep usability findings conservative and evidence-rich; default confidence = `likely` unless you can prove it.

---

### 5) Deduplication and clustering
Problem: one underlying bug appears on 50 pages.

Strategy:
- Create a stable signature:
  - `{ruleId/toolId} + {normalized selector} + {component fingerprint} + {viewport}`
- Cluster and show:
  - “1 issue affecting 37 pages”
  - Provide top 3 example URLs + export full list

---

### 6) Severity model (recommended)
- **Critical**: blocks completing primary tasks; severe a11y failures (e.g., keyboard trap, missing form labels on required fields in core flow)
- **High**: major impairment but with workaround
- **Medium**: meaningful friction or partial a11y barrier
- **Low/Info**: polish, minor inconsistencies, advisory

Add an independent **confidence** axis to avoid overstating.

---

### 7) Security, privacy, and safety
- Enforce `allowDomains` and block SSRF-like targets (localhost, link-local, metadata IP ranges) unless explicitly allowed.
- Secrets handling:
  - accept credentials via secure secret references, not raw logs
  - redact tokens in outputs
- PII:
  - avoid storing form inputs in screenshots where possible (masking selectors)
- Destructive actions:
  - safe mode default: disallow submit/purchase/delete unless rule explicitly allowed

---

### 8) Deployment and scaling
- Stateless API + job runner workers
- Browser pool scaling by concurrency limits
- Cache:
  - reuse browser binaries
  - optional page snapshot caching per commit SHA / build id

---

### 9) Observability
- Per run:
  - pages scanned, success/fail counts
  - median page time, timeouts
  - top error types (navigation failures, selector timeouts)
- Debug artifacts:
  - Playwright trace zip for failed pages (optional)

---

### 10) Agent skill interface (example)
I don’t have the full `agentskills.io/specification` text available here, so treat this as a **platform-agnostic** shape you can adapt to your skill manifest format.

**Skill: `ui-a11y-usability-scanner`**

**Primary operation:** `scanWebsite`

**Input (JSON schema sketch)**
```json
{
  "startUrls": ["https://example.com"],
  "crawlMode": "sitemap",
  "maxPages": 50,
  "viewports": ["desktop", "mobile"],
  "standards": { "wcag": "2.1-AA" },
  "auth": {
    "cookies": [{ "name": "session", "value": "...", "domain": "example.com" }]
  },
  "customSpecs": { "ref": "repo://ui-specs/rules.v1.json" },
  "outputFormats": ["json", "markdown", "sarif"]
}
```

**Output**
```json
{
  "summary": {
    "pagesScanned": 42,
    "findings": { "critical": 3, "high": 11, "medium": 27, "low": 14, "info": 8 }
  },
  "artifacts": {
    "reportMarkdownPath": "artifacts/report.md",
    "findingsJsonPath": "artifacts/findings.json",
    "sarifPath": "artifacts/findings.sarif.json",
    "screenshotsDir": "artifacts/screenshots/"
  },
  "topFindings": [
    {
      "id": "axe-color-contrast|.cta-button|mobile|...",
      "category": "accessibility",
      "severity": "high",
      "confidence": "certain",
      "pageUrl": "https://example.com/pricing",
      "title": "Insufficient color contrast on primary CTA",
      "wcag": { "version": "2.1", "level": "AA", "successCriteria": ["1.4.3"] }
    }
  ]
}
```

---

## consider the following aspects
- **Playwright** runner + traces/screenshots
- **axe-core** injection for accessibility checks
- **Custom spec DSL v1** with selector + computedStyle + boundingBox assertions
- Canonical findings schema + Markdown/SARIF export
- Conservative usability checks (layout overlap, clipped text, tap target size, focus trap detection)
