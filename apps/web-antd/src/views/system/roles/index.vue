<script lang="ts" setup>
import type { SystemMenu, SystemRole, SystemRoleInput } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Button,
  Card,
  InputSearch,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createSystemRole,
  deleteSystemRole,
  listSystemMenus,
  listSystemRoles,
  updateSystemRole,
} from '#/api';
import { $t } from '#/locales';

import RoleFormModal from './components/role-form-modal.vue';

const rows = ref<SystemRole[]>([]);
const menus = ref<SystemMenu[]>([]);
const keyword = ref('');
const loading = ref(false);
const saving = ref(false);
const open = ref(false);
const editing = ref<null | SystemRole>(null);
const filteredRows = computed(() =>
  rows.value.filter((item) => {
    const query = keyword.value.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query)
    );
  }),
);
const columns = computed(() => [
  { title: $t('system.role.fields.name'), dataIndex: 'name', key: 'name' },
  { title: $t('system.role.fields.code'), dataIndex: 'code', key: 'code' },
  {
    title: $t('system.role.fields.permissionCount'),
    key: 'permissions',
    width: 120,
  },
  { title: $t('system.common.status'), key: 'status', width: 100 },
  {
    title: $t('system.common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  { title: $t('system.common.remark'), dataIndex: 'remark', key: 'remark' },
  { title: $t('system.common.actions'), key: 'actions', width: 140 },
]);
async function load() {
  loading.value = true;
  try {
    [rows.value, menus.value] = await Promise.all([
      listSystemRoles(),
      listSystemMenus(),
    ]);
  } finally {
    loading.value = false;
  }
}
function create() {
  editing.value = null;
  open.value = true;
}
function edit(row: SystemRole) {
  editing.value = row;
  open.value = true;
}
function asRole(row: Record<string, unknown>) {
  return row as unknown as SystemRole;
}
async function save(input: SystemRoleInput) {
  saving.value = true;
  try {
    await (editing.value
      ? updateSystemRole(editing.value.id, input)
      : createSystemRole(input));
    message.success(
      $t(editing.value ? 'system.role.updated' : 'system.role.created'),
    );
    open.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
async function remove(id: number) {
  await deleteSystemRole(id);
  message.success($t('system.role.deleted'));
  await load();
}
onMounted(load);
</script>

<template>
  <Page
    :description="$t('system.role.description')"
    :title="$t('system.role.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex justify-between gap-4">
        <InputSearch
          v-model:value="keyword"
          allow-clear
          class="max-w-sm"
          :placeholder="$t('system.role.searchPlaceholder')"
        /><Button
          v-access:code="'system:role:create'"
          type="primary"
          @click="create"
        >
          {{ $t('system.role.create') }}
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
          <template v-else-if="column.key === 'permissions'">
            {{ record.permissionIds.length }}
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
                v-access:code="'system:role:update'"
                size="small"
                type="link"
                @click="edit(asRole(record))"
              >
                {{ $t('common.edit') }}
</Button><Popconfirm
                :title="$t('system.role.deleteConfirm')"
                @confirm="remove(record.id)"
              >
                <Button
                  v-access:code="'system:role:delete'"
                  danger
                  :disabled="record.id === 1"
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
    <RoleFormModal
      v-model:open="open"
      :confirm-loading="saving"
      :menus="menus"
      :role="editing"
      @submit="save"
    />
  </Page>
</template>
