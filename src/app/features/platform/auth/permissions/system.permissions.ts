export enum SystemPermission {
  TOGGLE_ACTIVE = 'SYSTEM_TOGGLE_ACTIVE',
}

export const SYSTEM_PERMISSIONS = [
  {
    code: SystemPermission.TOGGLE_ACTIVE,
    labelKey: 'platform.auth.permissions.system.toggleActive',
  },
] as const;
