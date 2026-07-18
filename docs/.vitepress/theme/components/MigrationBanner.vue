<template>
  <aside class="sp-migration-banner" aria-label="Project migration notice">
    <div class="sp-migration-banner__inner">
      <p>
        <strong>ESPHome Media Player support is ending.</strong>
        Move to EspControl for all these features and more.
      </p>
      <a href="https://jtenniswood.github.io/espcontrol/getting-started/migrate-esphome-media-player">
        View migration guide <span aria-hidden="true">→</span>
      </a>
    </div>
  </aside>
</template>

<style scoped>
.sp-migration-banner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--vp-z-index-layout-top);
  width: 100%;
  height: var(--vp-layout-top-height);
  color: #ffffff;
  background: #7c2d12;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.sp-migration-banner__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 8px 24px;
}

.sp-migration-banner p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  text-align: center;
}

.sp-migration-banner a {
  flex: none;
  padding: 6px 12px;
  color: #7c2d12;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  text-decoration: none;
  background: #ffffff;
  border-radius: 999px;
}

.sp-migration-banner a:hover,
.sp-migration-banner a:focus-visible {
  color: #431407;
  background: #ffedd5;
}

.sp-migration-banner a:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .sp-migration-banner__inner {
    gap: 10px;
    padding: 6px 12px;
  }

  .sp-migration-banner p {
    font-size: 12px;
    text-align: left;
  }

  .sp-migration-banner a {
    padding: 6px 10px;
    font-size: 12px;
    text-align: center;
  }
}
</style>
