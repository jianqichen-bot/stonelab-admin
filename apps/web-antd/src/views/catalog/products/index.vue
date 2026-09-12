<script lang="ts" setup>
import type {
  BeadShape,
  Category,
  Product,
  ProductInput,
  RecordStatus,
  Variant,
} from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Image,
  Input,
  message,
  Popconfirm,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import {
  adjustInventoryApi,
  createProductApi,
  createVariantApi,
  deleteProductApi,
  deleteVariantApi,
  getProductApi,
  listCategoriesApi,
  listProductsApi,
  updateProductApi,
  updateVariantApi,
} from '#/api';
import ProductFormModal from './components/product-form-modal.vue';
import VariantFormModal from './components/variant-form-modal.vue';
import VariantListModal from './components/variant-list-modal.vue';

const loading = ref(false);
const saving = ref(false);
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const total = ref(0);
const filters = reactive({
  categoryId: undefined as number | undefined,
  keyword: '',
  status: undefined as RecordStatus | undefined,
});
const pager = reactive({ current: 1, pageSize: 20 });

const productModalOpen = ref(false);
const editingProduct = ref<Product | null>(null);

const variantsModalOpen = ref(false);
const activeProduct = ref<null | Product>(null);
const variantModalOpen = ref(false);
const editingVariant = ref<null | Variant>(null);

const categoryOptions = computed(() =>
  categories.value.filter((item) => item.parentId !== null),
);
const categoryName = computed(
  () => new Map(categories.value.map((item) => [item.id, item.name])),
);
const columns = [
  { title: '图片', key: 'image', width: 76 },
  { title: '商品', key: 'product' },
  { title: '分类', key: 'category', width: 130 },
  { title: '形状', key: 'shape', width: 90 },
  { title: '规格', key: 'variants', width: 160 },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'actions', width: 240 },
];
const shapeLabels: Record<BeadShape, string> = {
  ROUND: '圆珠',
  CUBE: '方形',
  CHARM: '吊坠',
  CHIP: '碎石',
};

async function loadProducts(reset = false) {
  if (reset) pager.current = 1;
  loading.value = true;
  try {
    const result = await listProductsApi({
      page: pager.current,
      pageSize: pager.pageSize,
      ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    });
    products.value = result.items;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

function openCreateProduct() {
  editingProduct.value = null;
  productModalOpen.value = true;
}

function openEditProduct(product: Product) {
  editingProduct.value = product;
  productModalOpen.value = true;
}

function asProduct(record: Record<string, unknown>) {
  return record as unknown as Product;
}

async function saveProduct(payload: ProductInput) {
  saving.value = true;
  try {
    await (editingProduct.value
      ? updateProductApi(editingProduct.value.id, payload)
      : createProductApi(payload));
    message.success(editingProduct.value ? '商品已更新' : '商品已创建');
    productModalOpen.value = false;
    await loadProducts();
  } finally {
    saving.value = false;
  }
}

async function removeProduct(id: number) {
  await deleteProductApi(id);
  message.success('商品已删除');
  await loadProducts();
}

async function openVariants(product: Product) {
  activeProduct.value = await getProductApi(product.id);
  variantsModalOpen.value = true;
}

function openVariantEditor(variant?: Variant) {
  editingVariant.value = variant ?? null;
  variantModalOpen.value = true;
}

async function refreshActiveProduct() {
  if (activeProduct.value)
    activeProduct.value = await getProductApi(activeProduct.value.id);
  await loadProducts();
}

async function saveVariant(value: {
  diameterMm: number;
  price: number;
  status: RecordStatus;
  stock: number;
}) {
  if (!activeProduct.value) return;
  saving.value = true;
  try {
    const payload = {
      diameterMm: value.diameterMm,
      status: value.status,
      unitPriceCents: Math.round(value.price * 100),
    };
    if (editingVariant.value) {
      await updateVariantApi(editingVariant.value.id, payload);
      const stockChange = value.stock - editingVariant.value.stock;
      if (stockChange !== 0) {
        await adjustInventoryApi(editingVariant.value.id, {
          change: stockChange,
          remark: '编辑规格时调整库存',
          type: 'ADJUSTMENT',
        });
      }
    } else {
      await createVariantApi(activeProduct.value.id, {
        ...payload,
        stock: value.stock,
      });
    }
    message.success(editingVariant.value ? '规格已更新' : '规格已添加');
    variantModalOpen.value = false;
    await refreshActiveProduct();
  } finally {
    saving.value = false;
  }
}

async function removeVariant(id: number) {
  await deleteVariantApi(id);
  message.success('规格已删除');
  await refreshActiveProduct();
}

async function changePage(page: number, pageSize: number) {
  pager.current = page;
  pager.pageSize = pageSize;
  await loadProducts();
}

onMounted(async () => {
  categories.value = await listCategoriesApi();
  await loadProducts();
});
</script>

<template>
  <Page
    description="维护小程序 DIY 使用的珠子、规格、价格和库存"
    title="珠子商品"
  >
    <Card :bordered="false">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <Input
            v-model:value="filters.keyword"
            allow-clear
            placeholder="搜索商品名称"
            style="width: 200px"
            @press-enter="loadProducts(true)"
          />
          <Select
            v-model:value="filters.categoryId"
            allow-clear
            placeholder="全部分类"
            style="width: 150px"
          >
            <SelectOption
              v-for="item in categoryOptions"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </SelectOption>
          </Select>
          <Select
            v-model:value="filters.status"
            allow-clear
            placeholder="全部状态"
            style="width: 120px"
          >
            <SelectOption value="ENABLED">启用</SelectOption
            ><SelectOption value="DISABLED">停用</SelectOption>
          </Select>
          <Button type="primary" @click="loadProducts(true)">查询</Button>
        </Space>
        <Button type="primary" @click="openCreateProduct">新建商品</Button>
      </div>

      <Table
        :columns="columns"
        :data-source="products"
        :loading="loading"
        :pagination="{
          current: pager.current,
          pageSize: pager.pageSize,
          total,
          showSizeChanger: true,
        }"
        row-key="id"
        @change="(page) => changePage(page.current ?? 1, page.pageSize ?? 20)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <Image
              v-if="record.imageUrl"
              :src="record.imageUrl"
              :width="60"
              :height="60"
              class="rounded-lg"
            />
          </template>
          <template v-else-if="column.key === 'product'">
            <div class="font-medium">{{ record.name }}</div>
          </template>
          <template v-else-if="column.key === 'category'">
            {{ categoryName.get(record.categoryId) ?? record.category?.name }}
          </template>
          <template v-else-if="column.key === 'shape'">
            {{ shapeLabels[record.shape as BeadShape] }}
          </template>
          <template v-else-if="column.key === 'variants'">
            {{ record.variants.length }} 个规格 · 库存
            {{
              record.variants.reduce(
                (sum: number, item: Variant) => sum + item.stock,
                0,
              )
            }}
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
                @click="openEditProduct(asProduct(record))"
              >
                编辑 </Button
              ><Button
                size="small"
                type="link"
                @click="openVariants(asProduct(record))"
              >
                规格库存 </Button
              ><Popconfirm
                title="确定删除这个商品？"
                @confirm="removeProduct(record.id)"
              >
                <Button danger size="small" type="link"> 删除 </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <ProductFormModal
      v-model:open="productModalOpen"
      :categories="categories"
      :confirm-loading="saving"
      :product="editingProduct"
      @submit="saveProduct"
    />

    <VariantListModal
      v-model:open="variantsModalOpen"
      :product="activeProduct"
      @add="openVariantEditor()"
      @delete="removeVariant"
      @edit="openVariantEditor"
    />

    <VariantFormModal
      v-model:open="variantModalOpen"
      :confirm-loading="saving"
      :variant="editingVariant"
      @submit="saveVariant"
    />
  </Page>
</template>
