<script lang="ts" setup>
import type { Category, CategoryInput } from '#/api';

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
  createCategoryApi,
  deleteCategoryApi,
  listCategoriesApi,
  updateCategoryApi,
} from '#/api';
import { $t } from '#/locales';

import CategoryFormModal from './components/category-form-modal.vue';

const loading = ref(false);
const saving = ref(false);
const modalOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const categories = ref<Category[]>([]);
const expandedRowKeys = ref<number[]>([]);
const parentNames = computed(
  () => new Map(categories.value.map((item) => [item.id, item.name])),
);
const categoryTree = computed(() =>
  categories.value
    .filter((item) => item.parentId === null)
    .map((parent) => {
      const children = categories.value.filter(
        (item) => item.parentId === parent.id,
      );
      return children.length > 0 ? { ...parent, children } : parent;
    }),
);

const columns = computed(() => [
  { title: $t('catalog.category.fields.name'), dataIndex: 'name', key: 'name' },
  { title: $t('catalog.category.fields.parent'), key: 'parent' },
  {
    title: $t('catalog.common.sort'),
    dataIndex: 'sort',
    key: 'sort',
    width: 90,
  },
  { title: $t('catalog.common.status'), key: 'status', width: 100 },
  { title: $t('catalog.common.actions'), key: 'actions', width: 180 },
]);

async function loadCategories() {
  loading.value = true;
  try {
    const items = await listCategoriesApi();
    const byOrder = (left: Category, right: Category) =>
      left.sort - right.sort || left.id - right.id;
    const roots = items
      .filter((item) => item.parentId === null)
      .toSorted(byOrder);
    const ordered = roots.flatMap((root) => [
      root,
      ...items.filter((item) => item.parentId === root.id).toSorted(byOrder),
    ]);
    const orderedIds = new Set(ordered.map((item) => item.id));

    categories.value = [
      ...ordered,
      ...items.filter((item) => !orderedIds.has(item.id)).toSorted(byOrder),
    ];
    expandedRowKeys.value = roots.map((item) => item.id);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingCategory.value = null;
  modalOpen.value = true;
}

function openEdit(category: Category) {
  editingCategory.value = category;
  modalOpen.value = true;
}

function asCategory(record: Record<string, unknown>) {
  return record as unknown as Category;
}

async function saveCategory(payload: CategoryInput) {
  saving.value = true;
  try {
    await (editingCategory.value
      ? updateCategoryApi(editingCategory.value.id, payload)
      : createCategoryApi(payload));
    message.success(
      $t(
        editingCategory.value
          ? 'catalog.category.updated'
          : 'catalog.category.created',
      ),
    );
    modalOpen.value = false;
    await loadCategories();
  } finally {
    saving.value = false;
  }
}

async function removeCategory(id: number) {
  await deleteCategoryApi(id);
  message.success($t('catalog.category.deleted'));
  await loadCategories();
}

onMounted(loadCategories);
</script>

<template>
  <Page
    :description="$t('catalog.category.description')"
    :title="$t('catalog.category.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex justify-between">
        <Button :loading="loading" @click="loadCategories">
          {{ $t('common.refresh') }}
        </Button>
        <Button type="primary" @click="openCreate">
          {{ $t('catalog.category.create') }}
        </Button>
      </div>
      <Table
        v-model:expanded-row-keys="expandedRowKeys"
        :columns="columns"
        :data-source="categoryTree"
        :loading="loading"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'parent'">
            {{ record.parentId ? parentNames.get(record.parentId) : '-' }}
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
                size="small"
                type="link"
                @click="openEdit(asCategory(record))"
              >
                {{ $t('common.edit') }}
              </Button>
              <Popconfirm
                :title="$t('catalog.category.deleteConfirm')"
                @confirm="removeCategory(record.id)"
              >
                <Button danger size="small" type="link">
                  {{ $t('common.delete') }}
                </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <CategoryFormModal
      v-model:open="modalOpen"
      :categories="categories"
      :category="editingCategory"
      :confirm-loading="saving"
      @submit="saveCategory"
    />
  </Page>
</template>
