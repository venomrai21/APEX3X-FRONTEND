import { User } from '../types';

export type APEXRole = 'platform_owner' | 'owner' | 'admin' | 'manager' | 'operator' | 'specialist' | 'marketing' | 'sales' | 'finance' | 'support' | 'viewer';
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'assign' | 'publish' | 'execute' | 'configure' | 'approve' | 'export' | 'send' | 'record' | 'refund' | 'disconnect';
export type PermissionResource = 'command_center' | 'inbox' | 'leads' | 'customers' | 'bookings' | 'sales' | 'invoices' | 'payments' | 'campaigns' | 'creatives' | 'social' | 'forms' | 'workflows' | 'tasks' | 'integrations' | 'ai' | 'team' | 'permissions' | 'audit' | 'billing' | 'workspace';

const full: PermissionAction[] = ['view','create','update','delete','assign','publish','execute','configure','approve','export','send','record','refund','disconnect'];
const readOnly: PermissionAction[] = ['view'];
const allWorkspaceResources: PermissionResource[] = ['command_center','inbox','leads','customers','bookings','sales','invoices','payments','campaigns','creatives','social','forms','workflows','tasks','integrations','ai','team','permissions','audit','billing','workspace'];
const ROLE_PERMISSIONS: Record<APEXRole, Partial<Record<PermissionResource, PermissionAction[]>>> = {
  platform_owner: Object.fromEntries(allWorkspaceResources.map(resource => [resource, full])) as Partial<Record<PermissionResource, PermissionAction[]>>,
  owner: Object.fromEntries(allWorkspaceResources.map(resource => [resource, full])) as Partial<Record<PermissionResource, PermissionAction[]>>,
  admin: Object.fromEntries(allWorkspaceResources.map(resource => [resource, full])) as Partial<Record<PermissionResource, PermissionAction[]>>,
  manager: { command_center: full, inbox: full, leads: ['view','create','update','assign'], customers: ['view','create','update','assign'], bookings: ['view','create','update','assign'], sales: ['view','create','update','assign'], invoices: ['view','create','update','send'], payments: ['view','record'], campaigns: ['view','create','update','publish'], creatives: ['view','create','update'], social: ['view','create','update','publish'], forms: ['view','create','update'], workflows: ['view','create','update','execute'], tasks: full, integrations: ['view'], ai: ['view'], team: ['view'], permissions: [], audit: ['view'], billing: [], workspace: ['view','update'] },
  operator: { command_center: ['view'], inbox: ['view','send','assign'], leads: ['view','create','update'], customers: ['view','update'], bookings: ['view','create','update'], sales: ['view','create','update'], invoices: ['view','create','send'], payments: ['view'], campaigns: ['view'], creatives: ['view'], social: ['view'], forms: ['view'], workflows: ['view','execute'], tasks: full, integrations: [], ai: [], team: [], permissions: [], audit: [], billing: [], workspace: [] },
  specialist: { command_center: ['view'], inbox: ['view','send'], leads: ['view','update'], customers: ['view','update'], bookings: ['view','create','update'], sales: ['view','update'], invoices: ['view'], payments: ['view'], campaigns: ['view','create','update'], creatives: ['view','create','update'], social: ['view','create','update','publish'], forms: ['view','create','update'], workflows: ['view','execute'], tasks: full, integrations: ['view'], ai: [], team: [], permissions: [], audit: [], billing: [], workspace: [] },
  marketing: { command_center: ['view'], inbox: ['view'], leads: ['view'], customers: ['view'], bookings: ['view'], sales: ['view'], campaigns: full, creatives: full, social: full, forms: full, workflows: ['view','execute'], tasks: full, integrations: ['view'], ai: [], team: [], permissions: [], audit: ['view'], billing: [], workspace: [] },
  sales: { command_center: ['view'], inbox: ['view','send'], leads: ['view','create','update','assign'], customers: ['view','update'], bookings: ['view','create','update'], sales: full, invoices: ['view','create','send'], payments: ['view'], campaigns: ['view'], creatives: ['view'], social: [], forms: ['view'], workflows: ['view','execute'], tasks: full, integrations: ['view'], ai: [], team: [], permissions: [], audit: [], billing: [], workspace: [] },
  finance: { command_center: ['view'], inbox: ['view'], leads: [], customers: ['view'], bookings: ['view'], sales: ['view'], invoices: full, payments: ['view','record','refund'], campaigns: [], creatives: [], social: [], forms: [], workflows: ['view'], tasks: ['view','create','update'], integrations: ['view'], ai: [], team: [], permissions: [], audit: ['view'], billing: ['view'], workspace: [] },
  support: { command_center: ['view'], inbox: ['view','send','assign'], leads: ['view'], customers: ['view','update'], bookings: ['view','create','update'], sales: ['view'], invoices: ['view'], payments: [], campaigns: [], creatives: [], social: [], forms: ['view'], workflows: ['view'], tasks: full, integrations: [], ai: [], team: [], permissions: [], audit: ['view'], billing: [], workspace: [] },
  viewer: Object.fromEntries(['command_center','inbox','leads','customers','bookings','sales','invoices','payments','campaigns','creatives','social','forms','workflows','tasks','integrations','audit'].map(resource => [resource, readOnly])) as Partial<Record<PermissionResource, PermissionAction[]>>,
};

export function normalizeRole(user: User | null): APEXRole | null {
  if (!user?.role) return null;
  const role = String(user.role).toLowerCase() as APEXRole;
  return role in ROLE_PERMISSIONS ? role : null;
}

export function can(user: User | null, resource: PermissionResource | string, action: PermissionAction = 'view'): boolean {
  const role = normalizeRole(user);
  if (!role || !(resource in ROLE_PERMISSIONS[role])) return false;
  const permissions = ROLE_PERMISSIONS[role][resource as PermissionResource] ?? [];
  return permissions.includes(action);
}

export function effectivePermissions(user: User | null): Partial<Record<PermissionResource, PermissionAction[]>> {
  const role = normalizeRole(user);
  return role ? ROLE_PERMISSIONS[role] : {};
}

export const APEX_ROLE_DESCRIPTIONS: Record<APEXRole, string> = {
  platform_owner: 'Platform administration with explicit, auditable customer-support pathways.', owner: 'Highest normal authority inside the customer workspace.', admin: 'Operational and workspace configuration authority.', manager: 'Team and operational leadership within permitted scope.', operator: 'Assigned day-to-day business execution.', specialist: 'Functional execution within an assigned specialty.', marketing: 'Campaign, advertising, creative and social operations.', sales: 'Lead, opportunity, booking and sales execution.', finance: 'Authorized financial operations and collections.', support: 'Customer communication and support operations.', viewer: 'Read-only visibility within permitted scope.',
};
