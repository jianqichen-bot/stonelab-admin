<script lang="ts" setup>
import type { SystemDepartment, SystemDepartmentInput } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  createSystemDepartment,
  deleteSystemDepartment,
  listSystemDepartments,
  updateSystemDepartment,
} from '#/api';
import { $t } from '#/locales';

import DepartmentFormModal from './components/department-form-modal.vue';

const rows = ref<SystemDepartment[]>([]);
const loading = ref(false);
const saving = ref(false);
const open = ref(false);
const editing = ref<null | SystemDepartment>(null);
const parentId = ref<null | number>(null);
const columns = computed(() => [
  {
    title: $t('system.department.fields.name'),
    dataIndex: 'name',
    key: 'name',
    width: 240,
  },
  {
    title: $t('system.common.sort'),
    dataIndex: 'sort',
    key: 'sort',
    width: 90,
  },
  { title: $t('system.common.status'), key: 'status', width: 90 },
  {
    title: $t('system.common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  { title: $t('system.common.remark'), dataIndex: 'remark', key: 'remark' },
  { title: $t('system.common.actions'), key: 'actions', width: 210 },
]);
async function load() {
  loading.value = true;
  try {
    rows.value = await listSystemDepartments();
  } finally {
    loading.value = false;
  }
}
function create(pid: null | number = null) {
  editing.value = null;
  parentId.value = pid;
  open.value = true;
}
function edit(row: SystemDepartment) {
  editing.value = row;
  parentId.value = null;
  open.value = true;
}
function asDepartment(row: Record<string, unknown>) {
  return row as unknown as SystemDepartment;
}
async function save(input: SystemDepartmentInput) {
  saving.value = true;
  try {
    await (editing.value
      ? updateSystemDepartment(editing.value.id, input)
      : createSystemDepartment(input));
    message.success(
      $t(
        editing.value
          ? 'system.department.updated'
          : 'system.department.created',
      ),
    );
    open.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}
async function remove(id: number) {
  await deleteSystemDepartment(id);
  message.success($t('system.department.deleted'));
  await load();
}
onMounted(load);
</script>

<template>
  <Page
    :description="$t('system.department.description')"
    :title="$t('system.department.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex justify-between">
        <Button :loading="loading" @click="load">
{{
          $t('common.refresh')
        }}
</Button><Button
          v-access:code="'system:department:create'"
          type="primary"
          @click="create()"
        >
          {{ $t('system.department.create') }}
        </Button>
      </div>
      <Table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        row-key="id"
        default-expand-all-rows
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'createdAt'">
            {{ formatDateTime(record.createdAt) }}
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
                v-access:code="'system:department:create'"
                size="small"
                type="link"
                @click="create(record.id)"
              >
                {{ $t('system.department.addChild') }}
</Button><Button
                v-access:code="'system:department:update'"
                size="small"
                type="link"
                @click="edit(asDepartment(record))"
              >
                {{ $t('common.edit') }}
</Button><Popconfirm
                :disabled="!!record.children?.length"
                :title="
                  record.children?.length
                    ? $t('system.department.deleteChildrenFirst')
                    : $t('system.department.deleteConfirm')
                "
                @confirm="remove(record.id)"
              >
                <Button
                  v-access:code="'system:department:delete'"
                  danger
                  :disabled="!!record.children?.length"
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
    <DepartmentFormModal
      v-model:open="open"
      :confirm-loading="saving"
      :department="editing"
      :departments="rows"
      :parent-id="parentId"
      @submit="save"
    />
  </Page>
</template>
