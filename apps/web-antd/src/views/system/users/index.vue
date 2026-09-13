<script lang="ts" setup>
import type {
  SystemDepartment,
  SystemRole,
  SystemUser,
  SystemUserInput,
} from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Button,
  Card,
  InputSearch,
  message,
  Popconfirm,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createSystemUser,
  deleteSystemUser,
  listSystemDepartments,
  listSystemRoles,
  listSystemUsers,
  updateSystemUser,
} from '#/api';
import { $t } from '#/locales';

import UserFormModal from './components/user-form-modal.vue';

const rows = ref<SystemUser[]>([]);
const departments = ref<SystemDepartment[]>([]);
const roles = ref<SystemRole[]>([]);
const keyword = ref('');
const departmentFilter = ref<number>();
const loading = ref(false);
const saving = ref(false);
const open = ref(false);
const editing = ref<null | SystemUser>(null);
function flattenDepartments(items: SystemDepartment[]): SystemDepartment[] {
  return items.flatMap((item) => [
    item,
    ...flattenDepartments(item.children ?? []),
  ]);
}
const departmentOptions = computed(() => flattenDepartments(departments.value));
const departmentNames = computed(
  () => new Map(departmentOptions.value.map((item) => [item.id, item.name])),
);
const roleNames = computed(
  () => new Map(roles.value.map((item) => [item.id, item.name])),
);
const filteredRows = computed(() =>
  rows.value.filter((item) => {
    const word = keyword.value.trim().toLowerCase();
    return (
      (!word ||
        item.username.toLowerCase().includes(word) ||
        item.name.toLowerCase().includes(word)) &&
      (!departmentFilter.value || item.departmentId === departmentFilter.value)
    );
  }),
);
const columns = computed(() => [
  {
    title: $t('system.user.fields.username'),
    dataIndex: 'username',
    key: 'username',
  },
  { title: $t('system.user.fields.name'), dataIndex: 'name', key: 'name' },
  {
    title: $t('system.user.fields.departmentShort'),
    key: 'department',
    width: 140,
  },
  { title: $t('system.user.fields.roles'), key: 'roles', width: 180 },
  {
    title: $t('system.user.fields.phone'),
    dataIndex: 'phone',
    key: 'phone',
    width: 140,
  },
  { title: $t('system.common.status'), key: 'status', width: 90 },
  {
    title: $t('system.common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  { title: $t('system.common.actions'), key: 'actions', width: 140 },
]);
async function load() {
  loading.value = true;
  try {
    [rows.value, departments.value, roles.value] = await Promise.all([
      listSystemUsers(),
      listSystemDepartments(),
      listSystemRoles(),
    ]);
  } finally {
    loading.value = false;
  }
}
function create() {
  editing.value = null;
  open.value = true;
}
function edit(row: SystemUser) {
  editing.value = row;
  open.value = true;
}
function asUser(row: Record<string, unknown>) {
  return row as unknown as SystemUser;
}
async function save(input: SystemUserInput) {
  saving.value = true;
  try {
    await (editing.value
      ? updateSystemUser(editing.value.id, input)
      : createSystemUser(input));
    message.success(
      $t(editing.value ? 'system.user.updated' : 'system.user.created'),
    );
    open.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
async function remove(id: string) {
  await deleteSystemUser(id);
  message.success($t('system.user.deleted'));
  await load();
}
onMounted(load);
</script>

<template>
  <Page
    :description="$t('system.user.description')"
    :title="$t('system.user.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex justify-between gap-4">
        <Space>
          <InputSearch
            v-model:value="keyword"
            allow-clear
            class="w-64"
            :placeholder="$t('system.user.searchPlaceholder')"
          /><Select
            v-model:value="departmentFilter"
            allow-clear
            class="w-44"
            :placeholder="$t('system.user.allDepartments')"
          >
            <SelectOption
              v-for="item in departmentOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </SelectOption>
          </Select>
</Space><Button
          v-access:code="'system:user:create'"
          type="primary"
          @click="create"
        >
          {{ $t('system.user.create') }}
        </Button>
      </div>
      <Table
        :columns="columns"
        :data-source="filteredRows"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'createdAt'">
            {{ formatDateTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'department'">
            {{ departmentNames.get(record.departmentId) ?? '-' }}
          </template>
          <template v-else-if="column.key === 'roles'">
            <Space :size="4" wrap>
              <Tag v-for="roleId in record.roleIds" :key="roleId" color="blue">
                {{ roleNames.get(roleId) ?? roleId }}
              </Tag>
            </Space>
          </template>
          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 'ENABLED' ? 'green' : 'default'">
              {{
                $t(
                  record.status === 'ENABLED'
                    ? 'common.enabled'
                    : 'common.disabled',
                )
              }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Button
                v-access:code="'system:user:update'"
                size="small"
                type="link"
                @click="edit(asUser(record))"
              >
                {{ $t('common.edit') }}
</Button><Popconfirm
                :title="$t('system.user.deleteConfirm')"
                @confirm="remove(record.id)"
              >
                <Button
                  v-access:code="'system:user:delete'"
                  danger
                  :disabled="record.username === 'admin'"
                  size="small"
                  type="link"
                >
                  {{ $t('common.delete') }}
                </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
    <UserFormModal
      v-model:open="open"
      :confirm-loading="saving"
      :departments="departments"
      :roles="roles"
      :user="editing"
      @submit="save"
    />
  </Page>
</template>
