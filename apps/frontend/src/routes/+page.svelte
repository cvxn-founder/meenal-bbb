<script>
  import { onMount } from 'svelte';

  let svgEl;

  onMount(async () => {
    const d3 = await import('d3');

    // Fixed viewBox — SVG scales via CSS width:100%
    const VW = 900, VH = 380;

    // Centroid rectangle dimensions (sized to text + padding)
    // "Ontologer" ~68px, "data network" ~76px at 13/12px → rw = 76 + 32 = 108 → use 112
    const rw = 112, rh = 54;
    const lx = rw / 2 + 20, ly = VH / 2; // centroid centre

    // Right nodes
    const rx = 700, rr = 5;
    const nodes = [
      { label: 'IQVIA AWACS',        sub: 'V3X2 · 42 brands · 5yr MAT'   },
      { label: 'ClinicalTrials.gov', sub: '563,000 indexed trials'        },
      { label: 'PubMed',             sub: '28M publications'              },
      { label: 'HCP Universe',       sub: '132K doctors indexed'          },
      { label: 'Qwen AI',            sub: 'Narrative generation'          },
      { label: 'GraphQL API',        sub: '88 resolvers · real-time'      },
    ];
    const gap = 52;
    const totalH = (nodes.length - 1) * gap;
    const startY = ly - totalH / 2;
    nodes.forEach((n, i) => { n.x = rx; n.y = startY + i * gap; });

    // d3.linkHorizontal: true cubic bezier S-curve
    const link = d3.linkHorizontal().x(d => d.x).y(d => d.y);

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${VW} ${VH}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Dashed bezier edges — exits right edge of rect, enters left of dot
    nodes.forEach(n => {
      svg.append('path')
        .attr('d', link({
          source: { x: lx + rw / 2, y: ly },
          target: { x: n.x - rr,    y: n.y },
        }))
        .attr('fill', 'none')
        .attr('stroke', '#a3a3a3')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '5 4');
    });

    // Right node dots + labels
    const g = svg.selectAll('.rn')
      .data(nodes).enter()
      .append('g')
      .attr('transform', n => `translate(${n.x},${n.y})`);

    g.append('circle')
      .attr('r', rr)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#737373')
      .attr('stroke-width', 1.5);

    g.append('text')
      .attr('x', 14).attr('dy', '-0.15em')
      .style('font-size', '13px').style('font-weight', '500')
      .style('fill', '#171717').style('font-family', 'Montserrat, sans-serif')
      .text(n => n.label);

    g.append('text')
      .attr('x', 14).attr('dy', '1.1em')
      .style('font-size', '12px')
      .style('fill', '#525252').style('font-family', 'Montserrat, sans-serif')
      .text(n => n.sub);

    // Centroid rectangle — neutral-900 bg, white text
    const cg = svg.append('g').attr('transform', `translate(${lx},${ly})`);

    cg.append('rect')
      .attr('x', -rw / 2).attr('y', -rh / 2)
      .attr('width', rw).attr('height', rh)
      .attr('fill', '#171717')
      .attr('rx', 4);

    cg.append('text')
      .attr('text-anchor', 'middle').attr('dy', '-0.3em')
      .style('font-size', '13px').style('font-weight', '500')
      .style('fill', '#ffffff').style('font-family', 'Montserrat, sans-serif')
      .text('Ontologer');

    cg.append('text')
      .attr('text-anchor', 'middle').attr('dy', '1.1em')
      .style('font-size', '12px')
      .style('fill', '#a3a3a3').style('font-family', 'Montserrat, sans-serif')
      .text('data network');
  });

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
    <div class="hero-left">
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
    <div class="hero-right">
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
    </div>
  </section>

  <!-- ── Ontologer network ── -->
  <section class="network-band">
    <div class="band-inner">
      <div class="band-header">
        <span class="band-eyebrow">Data sources</span>
        <h2 class="band-title">Powered by the Ontologer network.</h2>
        <p class="band-sub">Every step in the workspace draws from a live graph of clinical, commercial, and HCP data — queried in real time.</p>
      </div>
    </div>
    <div class="network-svg-wrap">
      <svg bind:this={svgEl}></svg>
    </div>
  </section>

  <!-- ── What you produce ── -->
  <section class="output-band">
    <div class="band-inner output-inner">
      <div class="output-left">
        <span class="band-eyebrow">Outputs</span>
        <h2 class="band-title">What you walk away with.</h2>
        <p class="band-sub">A complete brand strategy document — structured, evidence-backed, ready to present.</p>
      </div>
      <div class="output-list">
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">Market sizing with category and competitive benchmarks</span>
        </div>
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">Patient funnel with quantified leakage at each stage</span>
        </div>
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">Competitive doctor coverage and white-space map</span>
        </div>
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">Brand wheel — features, SMP, essence, evidence</span>
        </div>
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">HCP segmentation tiers and coverage prioritisation</span>
        </div>
        <div class="output-row">
          <span class="output-check">✓</span>
          <span class="output-text">Full SWOT with AI-synthesised strategic commentary</span>
        </div>
      </div>
    </div>
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
    padding: 64px 48px 56px;
    border-bottom: 1px solid #e5e5e5;
    max-width: 1340px; margin: 0 auto; width: 100%;
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 56px;
    align-items: start;
  }
  .hero-left {}
  .hero-right { min-width: 0; }
  .hero-eyebrow {
    font-size: 0.75rem; font-weight: 500;
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
  }
  .hero-actions {
    display: flex; align-items: center; gap: 20px;
    flex-wrap: wrap;
  }
  .hero-note {
    font-size: 0.75rem; color: #171717;
  }

  /* ── Shared band helpers ── */
  .band-inner {
    max-width: 1100px; margin: 0 auto;
    padding: 0 48px;
  }
  .band-eyebrow {
    font-size: 0.75rem; font-weight: 500;
    color: #0d9488; text-transform: uppercase;
    letter-spacing: 0.12em; display: block; margin-bottom: 10px;
  }
  .band-title {
    font-size: 1.5rem; font-weight: 500;
    color: #171717; margin: 0 0 10px;
    letter-spacing: -0.01em; line-height: 1.2;
  }
  .band-sub {
    font-size: 0.875rem; color: #171717;
    margin: 0; line-height: 1.65; max-width: 540px;
  }
  .band-header { margin-bottom: 36px; }

  /* ── Ontologer network band ── */
  .network-band {
    background: #f5f5f5;
    border-top: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    padding: 64px 0 40px;
  }
  .network-svg-wrap {
    max-width: 1100px; margin: 0 auto;
    padding: 0 48px;
  }
  .network-svg-wrap svg {
    width: 100%; height: auto; display: block;
  }

  /* ── What you produce band ── */
  .output-band {
    background: #ffffff;
    border-bottom: 1px solid #e5e5e5;
    padding: 64px 0;
  }
  .output-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: start;
  }
  .output-left { display: flex; flex-direction: column; gap: 0; }
  .output-list {
    display: flex; flex-direction: column;
    border: 1px solid #e5e5e5;
    background: #ffffff;
  }
  .output-row {
    display: flex; align-items: baseline; gap: 12px;
    padding: 13px 18px;
    border-bottom: 1px solid #e5e5e5;
    font-size: 0.8125rem; color: #171717;
  }
  .output-row:last-child { border-bottom: none; }
  .output-check {
    color: #0d9488; font-size: 0.75rem;
    flex-shrink: 0; font-weight: 500;
  }

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
    font-size: 0.75rem; font-weight: 500;
    color: #0d9488;
    width: 22px; height: 22px; flex-shrink: 0;
    border: 1px solid #0d9488;
    display: flex; align-items: center; justify-content: center;
    border-radius: 4px; margin-top: 1px;
  }
  .step-info { display: flex; flex-direction: column; gap: 4px; }
  .step-name { font-size: 0.8125rem; font-weight: 500; color: #171717; }
  .step-desc { font-size: 0.75rem; color: #171717; line-height: 1.55; }

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
    font-size: 0.75rem; color: #171717;
    margin-top: auto;
  }
  .footer-dot { color: #d4d4d4; }
  .footer-link { color: #0d9488; text-decoration: none; }
  .footer-link:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; padding: 48px 24px; }
    .nav { padding: 0 24px; }
    .steps-grid { grid-template-columns: repeat(2, 1fr); }
    .band-inner { padding: 0 24px; }
    .network-band, .output-band { padding: 48px 0; }
    .network-svg-wrap { padding: 0 24px; }
    .output-inner { grid-template-columns: 1fr; gap: 32px; }
    .footer { padding: 20px 24px; }
  }
  @media (max-width: 480px) {
    .steps-grid { grid-template-columns: 1fr; }
  }
</style>
