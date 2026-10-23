const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');
const screenshotsDir = path.join(docsDir, 'screenshots');

function toBase64(filePath, mimeType = 'image/png') {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const fileBuffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

const desktopImg = toBase64(path.join(screenshotsDir, 'desktop_view.png'));
const mobileImg = toBase64(path.join(screenshotsDir, 'mobile_view.png'));
const searchImg = toBase64(path.join(screenshotsDir, 'search_filter.png'));
const modalImg = toBase64(path.join(screenshotsDir, 'modal_confirm.png'));
const logoPng = toBase64(path.join(rootDir, 'frontend/public/logo.png'), 'image/png');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Technical Test Submission Report — Luthfi Mirza Darsono</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 14mm 12mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 10pt;
      -webkit-font-smoothing: antialiased;
    }

    /* HEADER BANNER */
    .header-banner {
      background: linear-gradient(135deg, #0052af 0%, #003067 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 10px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-info h1 {
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: -0.4px;
      margin-bottom: 3px;
      color: #ffffff;
    }

    .header-info p {
      font-size: 10pt;
      color: #bfdbfe;
      font-weight: 500;
    }

    .header-logo img {
      height: 38px;
      width: auto;
      object-fit: contain;
    }

    /* CANDIDATE CARD */
    .candidate-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 18px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px 16px;
    }

    .candidate-item {
      display: flex;
      flex-direction: column;
    }

    .candidate-label {
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }

    .candidate-value {
      font-size: 9.5pt;
      color: #0f172a;
      font-weight: 600;
    }

    .candidate-value a {
      color: #0052af;
      text-decoration: none;
    }

    .badge-public {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 1px 7px;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 700;
      width: fit-content;
      margin-top: 1px;
    }

    /* SECTIONS */
    .section {
      margin-bottom: 16px;
    }

    .section-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 4px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .section-title span.indicator {
      display: inline-block;
      width: 4px;
      height: 15px;
      background: #0052af;
      border-radius: 2px;
    }

    .lead-text {
      font-size: 9pt;
      color: #334155;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    /* FEATURE GROUPS */
    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .feature-group {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
    }

    .feature-group h4 {
      font-size: 9.5pt;
      color: #0052af;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .feature-group ul {
      list-style: none;
    }

    .feature-group li {
      position: relative;
      padding-left: 18px;
      font-size: 8.5pt;
      color: #334155;
      margin-bottom: 3.5px;
      line-height: 1.4;
    }

    .feature-group li::before {
      content: "✓";
      position: absolute;
      left: 0;
      top: 0;
      color: #059669;
      font-weight: 800;
      font-size: 9pt;
    }

    /* SCREENSHOTS SHOWCASE */
    .screenshots-showcase {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 6px;
    }

    .screenshot-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
    }

    .screenshot-card h5 {
      font-size: 8.5pt;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 6px;
      text-align: center;
    }

    .screenshot-img-box {
      width: 100%;
      height: 180px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .screenshot-img-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #ffffff;
    }

    /* TEST BOX */
    .test-summary-box {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 8px;
    }

    .test-pill {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
    }

    .test-pill-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }

    .test-name {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
    }

    .test-status {
      background: #ecfdf5;
      color: #047857;
      font-weight: 700;
      font-size: 7.5pt;
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid #a7f3d0;
    }

    .test-desc {
      font-size: 8pt;
      color: #475569;
      line-height: 1.35;
    }

    /* TABLES */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 8pt;
    }

    table.data-table th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      font-weight: 700;
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
    }

    table.data-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }

    table.data-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    .method-badge {
      display: inline-block;
      font-weight: 700;
      font-size: 7pt;
      padding: 1px 5px;
      border-radius: 3px;
      text-align: center;
      min-width: 40px;
    }
    .method-get { background: #dbeafe; color: #1e40af; }
    .method-post { background: #dcfce7; color: #166534; }
    .method-put { background: #fef9c3; color: #854d0e; }
    .method-delete { background: #fee2e2; color: #991b1b; }
    .method-patch { background: #f3e8ff; color: #6b21a8; }

    .code-box {
      background: #0f172a;
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5pt;
      line-height: 1.4;
      margin-top: 6px;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="header-banner">
    <div class="header-info">
      <h1>Technical Test Submission Report</h1>
      <p>Fullstack Menu Tree System — Solusi Teknologi Kreatif (STK)</p>
    </div>
    <div class="header-logo">
      <img src="${logoPng}" alt="STK Logo" />
    </div>
  </div>

  <div class="candidate-card">
    <div class="candidate-item">
      <span class="candidate-label">Candidate Name</span>
      <span class="candidate-value">Luthfi Mirza Darsono</span>
    </div>
    <div class="candidate-item">
      <span class="candidate-label">Applied Position</span>
      <span class="candidate-value">Fullstack Web Developer</span>
    </div>
    <div class="candidate-item">
      <span class="candidate-label">Date of Submission</span>
      <span class="candidate-value">23 Oktober 2026</span>
    </div>
    <div class="candidate-item">
      <span class="candidate-label">Repository Visibility</span>
      <span class="badge-public">Public Repository</span>
    </div>
    <div class="candidate-item" style="grid-column: span 4; margin-top: 2px;">
      <span class="candidate-label">GitHub Repository Link</span>
      <span class="candidate-value"><a href="https://github.com/LuthfiMirza/fullstack-menu-tree-app">https://github.com/LuthfiMirza/fullstack-menu-tree-app</a></span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <span class="indicator"></span>
      Executive Summary & Architectural Architecture
    </div>
    <p class="lead-text">
      A production-grade fullstack web application implementing a recursive, unlimited-depth hierarchical menu tree with interactive CRUD operations, drag-and-drop reordering & reparenting, real-time search filtering with ancestor preservation, and pixel-perfect Figma UI fidelity.
    </p>

    <div class="features-grid">
      <div class="feature-group">
        <h4>1. Backend Core & Bonus Features (NestJS 10, TypeORM, PostgreSQL 16)</h4>
        <ul>
          <li><strong>Adjacency List Pattern:</strong> Parent-child hierarchy with <code>parentId</code> foreign key and <code>ON DELETE CASCADE</code>.</li>
          <li><strong>Derived Dynamic Depth:</strong> Depth is computed on the fly on read via ancestor traversal to prevent denormalization errors.</li>
          <li><strong>Transactional Compaction:</strong> Sibling moves and reordering execute inside atomic transactions, guaranteeing gap-free contiguous <code>0..k-1</code> positions.</li>
          <li><strong>Server-Side Cycle Detection:</strong> Graph traversal algorithm prevents reparenting any node into itself or its own descendants (<code>409 Conflict</code>).</li>
          <li><strong>OpenAPI / Swagger Documentation:</strong> Interactive API documentation active and live at <code>/api/docs</code>.</li>
          <li><strong>Health Check Endpoint:</strong> Dedicated <code>/api/health</code> endpoint with server uptime and status.</li>
        </ul>
      </div>

      <div class="feature-group">
        <h4>2. Frontend Core & Bonus Features (Next.js 14 App Router, Tailwind CSS, Zustand)</h4>
        <ul>
          <li><strong>Figma UI Fidelity:</strong> Strict adherence to design tokens (Primary <code>#0052AF</code>, Text <code>#1D2939</code>, Background <code>#F8FAFC</code>).</li>
          <li><strong>Unlimited Nested Hierarchy:</strong> Recursive rendering with connector guide lines, toggle chevrons, and Expand/Collapse All controls.</li>
          <li><strong>Smart Real-Time Search:</strong> Case-insensitive search that auto-expands all ancestor branches and highlights matching text in yellow.</li>
          <li><strong>Interactive Detail Form:</strong> Pinned System Code UUID, Menu ID, Depth, Parent Data, and editable Menu Name with save states.</li>
          <li><strong>Smooth Drag-and-Drop (@dnd-kit):</strong> Reorder siblings and reparent nodes across levels with optimistic updates and automatic rollback.</li>
          <li><strong>Safe Deletion Dialog:</strong> Confirmation modal showing the exact count of affected sub-menu descendants before cascade removal.</li>
          <li><strong>Mobile Responsive Shell:</strong> Sticky brand header with slide-over drawer navigation for mobile and tablet screens.</li>
        </ul>
      </div>

      <div class="feature-group">
        <h4>3. Bonus DevOps & Containerization (Docker & Docker Compose)</h4>
        <ul>
          <li><strong>Development Mode (<code>docker-compose.dev.yml</code>):</strong> Live hot-reloading with bind mounts for both frontend and backend.</li>
          <li><strong>Production Mode (<code>docker-compose.yml</code>):</strong> Optimized multi-stage Docker builds, non-root users, and automated DB migrations.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-break"></div>

  <div class="section">
    <div class="section-title">
      <span class="indicator"></span>
      Application Visual Verification (Figma vs Live Implementation)
    </div>
    <p class="lead-text">
      The interface reflects the Figma specification across key states: desktop hierarchy with detail form, mobile responsive navigation, real-time search filtering, and safe modal confirmations.
    </p>

    <div class="screenshots-showcase">
      <div class="screenshot-card">
        <h5>Desktop View (Figma-Aligned Hierarchy & Form)</h5>
        <div class="screenshot-img-box">
          <img src="${desktopImg}" alt="Desktop View Screenshot" />
        </div>
      </div>

      <div class="screenshot-card">
        <h5>Mobile Responsive Navigation (Drawer & Sticky Header)</h5>
        <div class="screenshot-img-box">
          <img src="${mobileImg}" alt="Mobile View Screenshot" />
        </div>
      </div>

      <div class="screenshot-card">
        <h5>Live Search (Yellow Highlight & Ancestor Auto-Expansion)</h5>
        <div class="screenshot-img-box">
          <img src="${searchImg}" alt="Search Filter Screenshot" />
        </div>
      </div>

      <div class="screenshot-card">
        <h5>Safe Cascade Deletion Confirmation Dialog</h5>
        <div class="screenshot-img-box">
          <img src="${modalImg}" alt="Confirmation Modal Screenshot" />
        </div>
      </div>
    </div>
  </div>

  <div class="section" style="margin-top: 14px;">
    <div class="section-title">
      <span class="indicator"></span>
      Automated Unit Tests & Verification
    </div>
    <div class="test-summary-box">
      <div class="test-pill">
        <div class="test-pill-header">
          <span class="test-name">Backend Unit Tests (Jest)</span>
          <span class="test-status">36 / 36 PASSED</span>
        </div>
        <p class="test-desc">
          Verifies tree construction, cycle detection guard, dynamic depth computation, orphan handling, and transactional move/reorder rollbacks.
        </p>
      </div>

      <div class="test-pill">
        <div class="test-pill-header">
          <span class="test-name">Frontend Unit Tests (Vitest)</span>
          <span class="test-status">22 / 22 PASSED</span>
        </div>
        <p class="test-desc">
          Verifies hierarchical search filtering, ancestor auto-expansion, case-insensitive matchers, tree flattening, and client-side drop guards.
        </p>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-break"></div>

  <div class="section">
    <div class="section-title">
      <span class="indicator"></span>
      RESTful API Endpoints Summary
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 75px;">Method</th>
          <th>Endpoint</th>
          <th>Description</th>
          <th style="width: 110px;">Status Code</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td><code>/api/health</code></td>
          <td>Health status check and system uptime</td>
          <td><code>200 OK</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td><code>/api/menus</code></td>
          <td>Get full menu tree ordered by contiguous positions</td>
          <td><code>200 OK</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-get">GET</span></td>
          <td><code>/api/menus/:id</code></td>
          <td>Get single menu detail (with derived depth & parentName)</td>
          <td><code>200 OK / 404</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-post">POST</span></td>
          <td><code>/api/menus</code></td>
          <td>Create new root menu or child node under parent</td>
          <td><code>201 Created</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-put">PUT</span></td>
          <td><code>/api/menus/:id</code></td>
          <td>Update menu item name</td>
          <td><code>200 OK / 404</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-delete">DELETE</span></td>
          <td><code>/api/menus/:id</code></td>
          <td>Cascade delete menu item and all descendants</td>
          <td><code>204 No Content</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-patch">PATCH</span></td>
          <td><code>/api/menus/:id/move</code></td>
          <td>Move menu item to new parent and position (cycle guarded)</td>
          <td><code>200 OK / 409</code></td>
        </tr>
        <tr>
          <td><span class="method-badge method-patch">PATCH</span></td>
          <td><code>/api/menus/:id/reorder</code></td>
          <td>Reorder menu position within same sibling level</td>
          <td><code>200 OK</code></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section" style="margin-top: 14px;">
    <div class="section-title">
      <span class="indicator"></span>
      Quick Start Execution Guide
    </div>
    <p class="lead-text" style="margin-bottom: 6px;">
      <strong>Option A — Run with Docker Compose (Recommended):</strong>
    </p>
    <div class="code-box">
git clone https://github.com/LuthfiMirza/fullstack-menu-tree-app.git
cd fullstack-menu-tree-app
cp .env.example .env
docker compose up --build
    </div>
    <p class="lead-text" style="margin-top: 8px; font-size: 8.5pt; color: #64748b;">
      • Frontend UI: <strong>http://localhost:3000</strong> &nbsp;|&nbsp;
      • Backend API: <strong>http://localhost:3001/api</strong> &nbsp;|&nbsp;
      • Swagger Docs: <strong>http://localhost:3001/api/docs</strong>
    </p>

    <p class="lead-text" style="margin-top: 12px; margin-bottom: 6px;">
      <strong>Option B — Run Locally with Node.js & PostgreSQL:</strong>
    </p>
    <div class="code-box">
# Backend (Terminal 1)
cd backend && cp .env.example .env && npm install
npm run migration:run && npm run seed && npm run start:dev

# Frontend (Terminal 2)
cd frontend && cp .env.example .env.local && npm install && npm run dev
    </div>
  </div>

  <div class="section" style="margin-top: 14px;">
    <div class="section-title">
      <span class="indicator"></span>
      Key Architectural Decisions & Edge Case Safeguards
    </div>
    <div class="feature-group" style="font-size: 8.5pt; color: #334155;">
      <ul style="list-style: none;">
        <li style="margin-bottom: 4px;"><strong>No Hardcoded Depths:</strong> Depth is derived dynamically on read traversal. Moving a subtree with 100 descendants never requires updating 100 depth columns.</li>
        <li style="margin-bottom: 4px;"><strong>Contiguous Position Compaction:</strong> Deleting or moving nodes automatically shifts remaining sibling positions within a single SQL transaction.</li>
        <li style="margin-bottom: 4px;"><strong>Dual-Layer Cycle Guard:</strong> Reparenting checks both client-side and server-side graph descendants to guarantee no circular dependencies can corrupt the tree.</li>
      </ul>
    </div>
  </div>

</body>
</html>`;

const outputPath = path.join(docsDir, 'SUBMISSION_REPORT.html');
fs.writeFileSync(outputPath, htmlContent, 'utf-8');
console.log(`Generated polished HTML with embedded base64 images at: ${outputPath}`);
