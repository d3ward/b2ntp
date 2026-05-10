export function migrateSidebarConfig(config) {
  if (config && config.left !== undefined) return config;

  const old = config || {};
  const leftPanels = {};
  const rightPanels = {};
  for (const [id, state] of Object.entries(old.panels || {})) {
    if (id === 'weather') rightPanels[id] = state;
    else leftPanels[id] = state;
  }

  return {
    left:  { enabled: old.enabled !== false, collapsed: old.collapsed || false, order: ['tabs'],    panels: leftPanels },
    right: { enabled: true,                  collapsed: false,                  order: ['weather'], panels: rightPanels },
  };
}
