<script lang="ts" setup>
import type { SystemMenu, SystemMenuInput } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

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
  createSystemMenu,
  deleteSystemMenu,
  getMenuTranslationsApi,
  listSystemMenus,
  updateSystemMenu,
} from '#/api';
import { $t, i18n, registerDynamicMenuTranslations } from '#/locales';

import MenuFormModal from './components/menu-form-modal.vue';

const rows = ref<SystemMenu[]>([]);
const loading = ref(false);
const saving = ref(false);
const open = ref(false);
const editing = ref<null | SystemMenu>(null);
const parentId = ref<null | number>(null);
const columns = computed(() => [
  {
    title: $t('system.menu.fields.name'),
    key: 'name',
    width: 180,
  },
  { title: $t('system.menu.fields.type'), key: 'type', width: 90 },
  { title: $t('system.menu.fields.path'), dataIndex: 'path', key: 'path' },
  {
    title: $t('system.menu.fields.permission'),
    dataIndex: 'permission',
    key: 'permission',
  },
  {
    title: $t('system.common.sort'),
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
  },
  { title: $t('system.common.status'), key: 'status', width: 90 },
  { title: $t('system.common.actions'), key: 'actions', width: 210 },
]);

async function load() {
  loading.value = true;
  try {
    rows.value = await listSystemMenus();
  } finally {
    loading.value = false;
  }
}
function create(pid: null | number = null) {
  editing.value = null;
  parentId.value = pid;
  open.value = true;
}
function edit(row: SystemMenu) {
  editing.value = row;
  parentId.value = null;
  open.value = true;
}
function asMenu(row: Record<string, unknown>) {
  return row as unknown as SystemMenu;
}
function menuTypeLabel(type: SystemMenu['type']) {
  return $t(`system.menu.types.${type}`);
}
function menuName(menu: SystemMenu) {
  return i18n.global.locale.value === 'en-US'
    ? menu.nameEn || menu.name
    : menu.name;
}
async function save(input: SystemMenuInput) {
  saving.value = true;
  try {
    await (editing.value
      ? updateSystemMenu(editing.value.id, input)
      : createSystemMenu(input));
    message.success(
      $t(editing.value ? 'system.menu.updated' : 'system.menu.created'),
    );
    open.value = false;
    await load();
    registerDynamicMenuTranslations(await getMenuTranslationsApi());
  } finally {
    saving.value = false;
  }
}
async function remove(id: number) {
  await deleteSystemMenu(id);
  message.success($t('system.menu.deleted'));
  await load();
}
onMounted(load);
</script>

<template>
  <Page
    :description="$t('system.menu.description')"
    :title="$t('system.menu.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex justify-between">
        <Button :loading="loading" @click="load">
          {{ $t('common.refresh') }}
</Button><Button
          v-access:code="'system:menu:create'"
          type="primary"
          @click="create()"
        >
          {{ $t('system.menu.create') }}
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
          <template v-if="column.key === 'name'">
            {{ menuName(asMenu(record)) }}
          </template>
          <template v-else-if="column.key === 'type'">
            <Tag>{{ menuTypeLabel(record.type) }}</Tag>
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
                v-access:code="'system:menu:create'"
                v-if="record.type !== 'BUTTON'"
                size="small"
                type="link"
                @click="create(record.id)"
              >
                {{ $t('system.menu.addChild') }}
</Button><Button
                v-access:code="'system:menu:update'"
                size="small"
                type="link"
                @click="edit(asMenu(record))"
              >
                {{ $t('common.edit') }}
</Button><Popconfirm
                :disabled="!!record.children?.length"
                :title="
                  record.children?.length
                    ? $t('system.menu.deleteChildrenFirst')
                    : $t('system.menu.deleteConfirm')
                "
                @confirm="remove(record.id)"
              >
                <Button
                  v-access:code="'system:menu:delete'"
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
    <MenuFormModal
      v-model:open="open"
      :confirm-loading="saving"
      :menu="editing"
      :menus="rows"
      :parent-id="parentId"
      @submit="save"
    />
  </Page>
</template>
