import { requestClient } from '#/api/request';

export type SystemStatus = 'DISABLED' | 'ENABLED';

export interface SystemDepartment {
  children?: SystemDepartment[];
  createdAt: string;
  id: number;
  name: string;
  parentId: null | number;
  remark: string;
  sort: number;
  status: SystemStatus;
}

export interface SystemMenu {
  children?: SystemMenu[];
  component: string;
  icon: string;
  i18nKey: null | string;
  id: number;
  name: string;
  parentId: null | number;
  path: string;
  permission: string;
  sort: number;
  status: SystemStatus;
  type: 'BUTTON' | 'DIRECTORY' | 'MENU';
}

export interface SystemRole {
  code: string;
  createdAt: string;
  id: number;
  name: string;
  permissionIds: number[];
  remark: string;
  status: SystemStatus;
}

export interface SystemUser {
  createdAt: string;
  departmentId: null | number;
  email: string;
  id: string;
  name: string;
  phone: string;
  roleIds: number[];
  status: SystemStatus;
  username: string;
}

export type SystemDepartmentInput = Omit<
  SystemDepartment,
  'children' | 'createdAt' | 'id'
>;
export type SystemMenuInput = Omit<SystemMenu, 'children' | 'id'>;
export type SystemRoleInput = Omit<SystemRole, 'createdAt' | 'id'>;
export type SystemRoleUpdateInput = Omit<Partial<SystemRoleInput>, 'code'>;
export type SystemUserInput = Omit<SystemUser, 'createdAt' | 'id'> & {
  password?: string;
};

const basePath = '/admin/system';

export function listSystemDepartments() {
  return requestClient.get<SystemDepartment[]>(`${basePath}/departments`);
}

export function createSystemDepartment(data: SystemDepartmentInput) {
  return requestClient.post<SystemDepartment>(`${basePath}/departments`, data);
}

export function updateSystemDepartment(
  id: number,
  data: Partial<SystemDepartmentInput>,
) {
  return requestClient.request<SystemDepartment>(
    `${basePath}/departments/${id}`,
    {
      data,
      method: 'PATCH',
    },
  );
}

export function deleteSystemDepartment(id: number) {
  return requestClient.delete<boolean>(`${basePath}/departments/${id}`);
}

export function listSystemMenus() {
  return requestClient.get<SystemMenu[]>(`${basePath}/menus`);
}

export function createSystemMenu(data: SystemMenuInput) {
  return requestClient.post<SystemMenu>(`${basePath}/menus`, data);
}

export function updateSystemMenu(id: number, data: Partial<SystemMenuInput>) {
  return requestClient.request<SystemMenu>(`${basePath}/menus/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteSystemMenu(id: number) {
  return requestClient.delete<boolean>(`${basePath}/menus/${id}`);
}

export function listSystemRoles() {
  return requestClient.get<SystemRole[]>(`${basePath}/roles`);
}

export function createSystemRole(data: SystemRoleInput) {
  return requestClient.post<SystemRole>(`${basePath}/roles`, data);
}

export function updateSystemRole(id: number, data: SystemRoleUpdateInput) {
  return requestClient.request<SystemRole>(`${basePath}/roles/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteSystemRole(id: number) {
  return requestClient.delete<boolean>(`${basePath}/roles/${id}`);
}

export function listSystemUsers() {
  return requestClient.get<SystemUser[]>(`${basePath}/users`);
}

export function createSystemUser(data: SystemUserInput) {
  return requestClient.post<SystemUser>(`${basePath}/users`, data);
}

export function updateSystemUser(id: string, data: Partial<SystemUserInput>) {
  return requestClient.request<SystemUser>(`${basePath}/users/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteSystemUser(id: string) {
  return requestClient.delete<boolean>(`${basePath}/users/${id}`);
}

export function updateProfileApi(data: {
  email?: string;
  phone?: string;
  realName: string;
}) {
  return requestClient.request('/user/profile', { data, method: 'PATCH' });
}

export function uploadProfileAvatarApi(file: File) {
  return requestClient.upload<{ avatar: string }>('/user/avatar', { file });
}

export function changePasswordApi(data: {
  newPassword: string;
  oldPassword: string;
}) {
  return requestClient.request('/user/password', { data, method: 'PATCH' });
}
