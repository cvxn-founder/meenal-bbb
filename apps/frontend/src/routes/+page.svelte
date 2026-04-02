<script>
  const steps = [
    { n: 1,  label: 'Product Orientation',      desc: 'Define your brand, ingredients, dosage, pack sizes and sales baseline.' },
    { n: 2,  label: 'Environment Understanding', desc: 'Assess India macro, pharma market dynamics and category attractiveness.' },
    { n: 3,  label: 'Market Definition',         desc: 'Map the AWACS category, competitive landscape and key players.' },
    { n: 4,  label: 'Patient Funnel',            desc: 'Quantify the patient journey from disease pool to your target population.' },
    { n: 5,  label: 'Patient Journey Mapping',   desc: 'Trace origination, diagnosis, treatment choice and adherence stages.' },
    { n: 6,  label: 'Leverage Point',            desc: 'Identify where the biggest leakage occurs and where to focus.' },
    { n: 7,  label: 'Key Stakeholder Habits',    desc: 'Map who influences prescribing decisions and with what weight.' },
    { n: 8,  label: 'Contested Categories',      desc: 'Understand competitive doctor coverage and white-space opportunities.' },
    { n: 9,  label: 'Brand Wheel',               desc: 'Build features, SMP, brand essence and supporting evidence.' },
    { n: 10, label: 'Segmentation',              desc: 'Tier your HCP universe by potential and coverage priority.' },
    { n: 11, label: 'SWOT Analysis',             desc: 'Synthesise the full picture into strategic strengths and risks.' },
    { n: 12, label: 'AWACS / Market View',       desc: 'Review the MAT leaderboard and benchmark your brand position.' },
  ];
</script>

<div class="landing">

  <!-- ── Nav ── -->
  <header class="nav">
    <span class="nav-logo">BBB</span>
    <span class="nav-tag">Brand Building Blueprint</span>
    <a href="/workspace" class="nav-cta">Open Workspace →</a>
  </header>

  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-eyebrow">Pharma Brand Strategy</div>
      <h1 class="hero-title">Structure your brand<br>strategy. Step by step.</h1>
      <p class="hero-sub">
        A structured 12-step framework for Indian pharmaceutical brands.
        Built on clinical data, AWACS market intelligence, and AI-generated insights.
      </p>
      <div class="hero-actions">
        <a href="/workspace" class="btn-primary">Start Analysis →</a>
        <span class="hero-note">No sign-in required. State saved locally.</span>
      </div>
    </div>
  </section>

  <!-- ── Steps grid ── -->
  <section class="steps-section">
    <div class="steps-header">
      <h2 class="steps-title">The 12-step framework</h2>
      <p class="steps-sub">Each step is pre-loaded with relevant market data and generates AI narrative when you're ready.</p>
    </div>
    <div class="steps-grid">
      {#each steps as s}
        <div class="step-card">
          <span class="step-n">{s.n}</span>
          <div class="step-info">
            <span class="step-name">{s.label}</span>
            <span class="step-desc">{s.desc}</span>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- ── Data sources strip ── -->
  <section class="data-strip">
    <div class="strip-inner">
      <span class="strip-label">Powered by</span>
      <div class="strip-sources">
        <span class="source-pill">IQVIA AWACS (V3X2)</span>
        <span class="source-pill">ClinicalTrials.gov — 563K trials</span>
        <span class="source-pill">PubMed — 28M publications</span>
        <span class="source-pill">Qwen AI (DashScope)</span>
        <span class="source-pill accent">Ontologer GraphQL</span>
      </div>
    </div>
  </section>

  <!-- ── Footer CTA ── -->
  <section class="footer-cta">
    <h2 class="fcta-title">Ready to build your brand strategy?</h2>
    <p class="fcta-sub">Work through all 12 steps at your own pace. Your progress saves automatically.</p>
    <a href="/workspace" class="btn-primary">Start with Product Orientation →</a>
  </section>

  <footer class="footer">
    <span>BBB — Brand Building Blueprint</span>
    <span class="footer-dot">·</span>
    <span>Powered by <a href="https://ontologer.com" class="footer-link">Ontologer</a></span>
  </footer>

</div>

<style>
  /* ── Base ── */
  .landing {
    min-height: 100vh;
    background: #ffffff;
    color: #171717;
    font-family: 'Montserrat', sans-serif;
    display: flex; flex-direction: column;
  }

  /* ── Nav ── */
  .nav {
    display: flex; align-items: center; gap: 12px;
    padding: 0 48px; height: 56px;
    border-bottom: 1px solid #e5e5e5;
    background: #ffffff;
    position: sticky; top: 0; z-index: 50;
  }
  .nav-logo {
    font-size: 0.9rem; font-weight: 500;
    color: #0d9488; letter-spacing: 0.12em;
  }
  .nav-tag {
    font-size: 0.75rem; color: #171717;
    padding-left: 12px;
    border-left: 1px solid #e5e5e5;
  }
  .nav-cta {
    margin-left: auto;
    font-size: 0.75rem; font-weight: 500;
    color: #0d9488;
    padding: 6px 14px;
    border: 1px solid #0d9488;
    border-radius: 6px;
    transition: all 0.13s;
  }
  .nav-cta:hover { background: #f0fdfa; }

  /* ── Hero ── */
  .hero {
    padding: 72px 48px 56px;
    border-bottom: 1px solid #e5e5e5;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }
  .hero-inner { max-width: 620px; }
  .hero-eyebrow {
    font-size: 0.7rem; font-weight: 500;
    color: #0d9488; text-transform: uppercase;
    letter-spacing: 0.12em; margin-bottom: 16px;
  }
  .hero-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 500; line-height: 1.12;
    letter-spacing: -0.02em;
    color: #171717; margin: 0 0 20px;
  }
  .hero-sub {
    font-size: 0.9375rem; color: #171717;
    line-height: 1.65; margin: 0 0 28px;
    max-width: 500px;
  }
  .hero-actions {
    display: flex; align-items: center; gap: 20px;
    flex-wrap: wrap;
  }
  .hero-note {
    font-size: 0.72rem; color: #171717;
  }

  /* ── Steps section ── */
  .steps-section {
    padding: 72px 48px;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }
  .steps-header { margin-bottom: 40px; }
  .steps-title {
    font-size: 1.5rem; font-weight: 500;
    color: #171717; margin: 0 0 10px;
    letter-spacing: -0.01em;
  }
  .steps-sub { font-size: 0.875rem; color: #171717; margin: 0; line-height: 1.6; }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: #e5e5e5;
    border: 1px solid #e5e5e5;
  }
  .step-card {
    background: #ffffff;
    padding: 20px 22px;
    display: flex; gap: 14px;
    transition: background 0.12s;
  }
  .step-card:hover { background: #fafafa; }

  .step-n {
    font-size: 0.7rem; font-weight: 500;
    color: #0d9488;
    width: 22px; height: 22px; flex-shrink: 0;
    border: 1px solid #0d9488;
    display: flex; align-items: center; justify-content: center;
    border-radius: 4px; margin-top: 1px;
  }
  .step-info { display: flex; flex-direction: column; gap: 4px; }
  .step-name { font-size: 0.8125rem; font-weight: 500; color: #171717; }
  .step-desc { font-size: 0.72rem; color: #171717; line-height: 1.55; }

  /* ── Data strip ── */
  .data-strip {
    background: #fafafa;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    padding: 24px 48px;
  }
  .strip-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  }
  .strip-label {
    font-size: 0.7rem; font-weight: 500;
    color: #171717; text-transform: uppercase;
    letter-spacing: 0.08em; white-space: nowrap;
  }
  .strip-sources { display: flex; gap: 8px; flex-wrap: wrap; }
  .source-pill {
    font-size: 0.72rem; font-weight: 500;
    color: #171717;
    border: 1px solid #d4d4d4;
    padding: 4px 10px; border-radius: 4px;
    background: #ffffff;
  }
  .source-pill.accent {
    color: #0d9488; border-color: #0d9488;
    background: #f0fdfa;
  }

  /* ── Footer CTA ── */
  .footer-cta {
    padding: 72px 48px;
    text-align: center;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }
  .fcta-title {
    font-size: 1.5rem; font-weight: 500;
    color: #171717; margin: 0 0 12px;
    letter-spacing: -0.01em;
  }
  .fcta-sub {
    font-size: 0.875rem; color: #171717;
    margin: 0 0 28px; line-height: 1.6;
  }

  /* ── Shared button ── */
  .btn-primary {
    display: inline-flex; align-items: center;
    background: #0d9488; color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.8125rem; font-weight: 500;
    padding: 11px 22px; border-radius: 6px;
    border: none; cursor: pointer;
    text-decoration: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.10);
    transition: all 0.13s;
  }
  .btn-primary:hover {
    background: #0f766e;
    box-shadow: 0 2px 8px rgba(13,148,136,0.2);
    transform: translateY(-1px);
  }

  /* ── Footer ── */
  .footer {
    padding: 20px 48px;
    border-top: 1px solid #e5e5e5;
    display: flex; align-items: center; gap: 8px;
    font-size: 0.72rem; color: #171717;
    margin-top: auto;
  }
  .footer-dot { color: #d4d4d4; }
  .footer-link { color: #0d9488; text-decoration: none; }
  .footer-link:hover { text-decoration: underline; }

  @media (max-width: 768px) {
    .hero, .steps-section, .footer-cta { padding: 48px 24px; }
    .nav { padding: 0 24px; }
    .steps-grid { grid-template-columns: 1fr; }
    .hero-stat-row { flex-direction: column; gap: 20px; }
    .hero-stat { border-right: none; padding: 0; border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
    .hero-stat:last-child { border-bottom: none; }
    .data-strip { padding: 20px 24px; }
    .footer { padding: 20px 24px; }
  }
</style>
