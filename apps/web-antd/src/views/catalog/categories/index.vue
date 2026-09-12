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

const columns = [
  { title: '分类名称', dataIndex: 'name', key: 'name' },
  { title: '上级分类', key: 'parent' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 90 },
  { title: '状态', key: 'status', width: 100 },
  { title: '操作', key: 'actions', width: 180 },
];

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
    message.success(editingCategory.value ? '分类已更新' : '分类已创建');
    modalOpen.value = false;
    await loadCategories();
  } finally {
    saving.value = false;
  }
}

async function removeCategory(id: number) {
  await deleteCategoryApi(id);
  message.success('分类已删除');
  await loadCategories();
}

onMounted(loadCategories);
</script>

<template>
  <Page description="维护 DIY 素材使用的一级和二级分类" title="分类管理">
    <Card :bordered="false">
      <div class="mb-4 flex justify-between">
        <Button :loading="loading" @click="loadCategories">刷新</Button>
        <Button type="primary" @click="openCreate">新建分类</Button>
      </div>
      <Table
        :columns="columns"
        :data-source="categoryTree"
        v-model:expanded-row-keys="expandedRowKeys"
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
              {{ record.status === 'ENABLED' ? '启用' : '停用' }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="openEdit(asCategory(record))"
              >
                编辑
              </Button>
              <Popconfirm
                title="确定删除这个分类？"
                @confirm="removeCategory(record.id)"
              >
                <Button danger size="small" type="link">删除</Button>
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
