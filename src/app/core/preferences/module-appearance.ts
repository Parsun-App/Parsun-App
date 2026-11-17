export const MODULE_APPEARANCE = {
  sales: { light: '#1e40af', dark: '#93c5fd' },
  procurement: { light: '#b91c2c', dark: '#fca5a5' },
  catalog: { light: '#2563eb', dark: '#bfdbfe' },
  inventory: { light: '#1d4ed8', dark: '#60a5fa' },
  finance: { light: '#dc2626', dark: '#f87171' },
  partners: { light: '#1e3a8a', dark: '#fda4af' },
  analytics: { light: '#3b82f6', dark: '#7dd3fc' },
  platform: { light: '#991b1b', dark: '#fecaca' },
} as const;

export type ModuleGroup = keyof typeof MODULE_APPEARANCE;

export function moduleGroupFromUrl(url: string): ModuleGroup {
  const segment = url.split(/[?#]/, 1)[0].split('/').filter(Boolean)[0];
  return segment && Object.hasOwn(MODULE_APPEARANCE, segment)
    ? (segment as ModuleGroup)
    : 'platform';
}

export function moduleColor(group: ModuleGroup, dark: boolean): string {
  return MODULE_APPEARANCE[group][dark ? 'dark' : 'light'];
}

export function chartPalette(length: number, dark: boolean): string[] {
  const colors = Object.values(MODULE_APPEARANCE).map((entry) => entry[dark ? 'dark' : 'light']);
  return Array.from({ length }, (_, index) => colors[index % colors.length]);
}
