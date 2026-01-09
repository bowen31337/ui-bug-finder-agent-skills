# UI Bug Finder - Agent Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A collection of Agent Skills for finding UI bugs in websites, including accessibility issues (WCAG 2.x AA), usability problems, and custom UI specification violations.

## 📁 Project Structure

```
ui-bug-finder-agent-skills/
├── .cursor/
│   └── commands/           # Cursor IDE commands
├── .github/
│   └── workflows/          # CI/CD workflows
├── ui-bug-scanner/         # Main Agent Skill
│   ├── SKILL.md            # Skill definition
│   ├── scripts/            # Scanner implementation
│   ├── assets/             # Example spec rules
│   └── references/         # Documentation
├── prd.md                  # Product requirements
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd ui-bug-scanner
npm install
npx playwright install chromium
```

### 2. Run a Scan

```bash
cd ui-bug-scanner
npx ts-node scripts/scanner.ts --url https://example.com --viewport desktop,mobile
```

## 🎯 Cursor Commands

This project includes **8 pre-built Cursor commands** for easy scanning. Open Cursor in this folder and use the command palette (`Cmd/Ctrl + K`) then type `/` to see available commands.

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/scan-url` | Scan a single URL for all UI bugs | `/scan-url https://example.com` |
| `/scan-sitemap` | Crawl via sitemap and scan all pages | `/scan-sitemap https://example.com` |
| `/check-accessibility` | WCAG 2.x AA compliance check | `/check-accessibility https://example.com` |
| `/validate-ui-spec` | Validate against custom UI rules | `/validate-ui-spec https://example.com` |
| `/generate-sarif` | Generate SARIF for CI/CD integration | `/generate-sarif https://example.com` |
| `/fix-accessibility-issue` | Get fix recommendations | `/fix-accessibility-issue color contrast` |
| `/create-spec-rules` | Create custom specification rules | `/create-spec-rules` |
| `/mobile-usability` | Check mobile-specific usability | `/mobile-usability https://example.com` |

### How to Use Commands

1. **Open this project in Cursor IDE**
   ```bash
   cursor /path/to/ui-bug-finder-agent-skills
   ```

2. **Open the command palette**
   - Press `Cmd + K` (Mac) or `Ctrl + K` (Windows/Linux)

3. **Type `/` to see available commands**
   - Select a command from the list
   - Provide the URL or arguments when prompted

4. **Review the results**
   - Reports are generated in `ui-bug-scanner/reports/`
   - The AI will summarize findings and provide recommendations

### Command Details

#### `/scan-url` - Quick URL Scan
Scans a single URL for accessibility, usability, and spec violations across desktop and mobile viewports.

```
/scan-url https://mywebsite.com
```

**Output:** Summary of issues by severity, top issues to fix, and remediation guidance.

---

#### `/scan-sitemap` - Full Site Crawl
Discovers pages via sitemap.xml and scans up to 50 pages.

```
/scan-sitemap https://mywebsite.com
```

**Output:** Aggregate findings across all pages, common issues, and priority recommendations.

---

#### `/check-accessibility` - WCAG Compliance
Focused accessibility audit against WCAG 2.1/2.2 Level AA criteria.

```
/check-accessibility https://mywebsite.com
```

**Output:** Issues grouped by WCAG principle, specific criteria references, and code fixes.

---

#### `/validate-ui-spec` - Custom Rules
Validates against your team's UI specification rules.

```
/validate-ui-spec https://mywebsite.com
```

**Output:** Spec violations with element selectors and suggested fixes.

---

#### `/generate-sarif` - CI/CD Integration
Creates SARIF format report for GitHub Code Scanning or Azure DevOps.

```
/generate-sarif https://mywebsite.com
```

**Output:** SARIF file at `ui-bug-scanner/reports/findings.sarif.json` with CI integration instructions.

---

#### `/fix-accessibility-issue` - Get Fix Help
Provides detailed fix recommendations for specific accessibility issues.

```
/fix-accessibility-issue missing alt text
/fix-accessibility-issue color contrast
/fix-accessibility-issue keyboard navigation
```

**Output:** WCAG reference, impact explanation, before/after code examples.

---

#### `/create-spec-rules` - Build Custom Rules
Interactive guide to create custom UI specification rules.

```
/create-spec-rules
```

**Output:** JSON rules file saved to `ui-bug-scanner/assets/custom-specs.json`.

---

#### `/mobile-usability` - Mobile Check
Focused check for mobile-specific usability issues.

```
/mobile-usability https://mywebsite.com
```

**Output:** Mobile-specific issues (tap targets, horizontal scroll, etc.) with fixes.

## 📊 Report Formats

Scans generate reports in multiple formats:

| Format | Location | Use Case |
|--------|----------|----------|
| **Markdown** | `reports/report.md` | Human-readable report |
| **JSON** | `reports/findings.json` | Programmatic processing |
| **SARIF** | `reports/findings.sarif.json` | CI/CD integration |
| **Screenshots** | `reports/screenshots/` | Visual evidence |

## 🔧 CI/CD Integration

### GitHub Actions

Add to your workflow:

```yaml
- name: UI Bug Scan
  run: |
    cd ui-bug-scanner
    npm ci
    npx playwright install chromium
    npx ts-node scripts/scanner.ts --url ${{ secrets.STAGING_URL }} --format sarif
    
- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: ui-bug-scanner/reports/findings.sarif.json
```

### Exit Codes

- `0` - Scan completed (may have findings)
- `1` - Critical issues found (use for CI gates)

## 📚 Documentation

- [Skill Definition](ui-bug-scanner/SKILL.md) - Full skill instructions
- [README](ui-bug-scanner/README.md) - Detailed scanner documentation
- [WCAG Mapping](ui-bug-scanner/references/wcag-mapping.md) - WCAG criteria reference
- [Severity Guide](ui-bug-scanner/references/severity-guide.md) - Issue classification
- [Example Specs](ui-bug-scanner/assets/example-specs.json) - Custom rule examples

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

---

**Made with ❤️ for accessible web experiences**
