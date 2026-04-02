<script>
  import { page } from '$app/state';

  const items = [
    {
      href: '/workspace',
      label: 'Workspace',
      icon: 'M3 5a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm0 9a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-5zm9-9a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1V5zm0 9a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5z',
    },
  ];

  function isActive(pathname, href) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  let tip = $state({ show: false, label: '', y: 0 });

  function showTip(e, label) {
    const rect = e.currentTarget.getBoundingClientRect();
    tip = { show: true, label, y: rect.top + rect.height / 2 };
  }

  function hideTip() { tip = { ...tip, show: false }; }
</script>

<aside class="icon-sidebar">
  <a
    href="/"
    class="brand"
    aria-label="BBB home"
    onmouseenter={(e) => showTip(e, 'Brand Building Blueprint')}
    onmouseleave={hideTip}
  >
    <span class="brand-text">B</span>
  </a>

  <div class="divider"></div>

  {#each items as item}
    <a
      href={item.href}
      class="nav-item"
      class:active={isActive(page.url.pathname, item.href)}
      aria-label={item.label}
      onmouseenter={(e) => showTip(e, item.label)}
      onmouseleave={hideTip}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"
           stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d={item.icon} />
      </svg>
    </a>
  {/each}
</aside>

{#if tip.show}
  <div class="tip" style="top: {tip.y}px">{tip.label}</div>
{/if}

<style>
  .icon-sidebar {
    width: var(--sidebar-w);
    min-width: var(--sidebar-w);
    height: 100%;
    background: #171717;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 2px;
    z-index: 200;
    border-right: 1px solid #262626;
    flex-shrink: 0;
  }

  .brand {
    width: 32px; height: 32px;
    border-radius: 4px;
    background: rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
    transition: background 0.13s;
    text-decoration: none;
  }
  .brand:hover { background: rgba(255,255,255,0.14); }

  .brand-text {
    color: #ffffff;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.04em;
  }

  .divider {
    width: 24px; height: 1px;
    background: rgba(255,255,255,0.08);
    margin: 4px 0;
    flex-shrink: 0;
  }

  .nav-item {
    width: 32px; height: 32px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.35);
    transition: color 0.13s, background 0.13s;
    text-decoration: none;
  }
  .nav-item:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
  .nav-item.active { color: #ffffff; background: rgba(255,255,255,0.1); }

  .tip {
    position: fixed;
    left: 56px;
    transform: translateY(-50%);
    background: #171717;
    border: 1px solid #333;
    border-radius: 4px;
    padding: 3px 8px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    color: #ffffff;
    white-space: nowrap;
    pointer-events: none;
    z-index: 300;
  }
</style>
