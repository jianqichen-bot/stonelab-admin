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
import { $t } from '#/locales';

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
const editingProduct = ref<null | Product>(null);

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
const columns = computed(() => [
  { title: $t('catalog.product.fields.image'), key: 'image', width: 76 },
  { title: $t('catalog.product.fields.product'), key: 'product' },
  { title: $t('catalog.product.fields.category'), key: 'category', width: 130 },
  { title: $t('catalog.product.fields.shape'), key: 'shape', width: 90 },
  { title: $t('catalog.product.fields.variants'), key: 'variants', width: 160 },
  { title: $t('catalog.product.fields.status'), key: 'status', width: 90 },
  { title: $t('catalog.product.fields.actions'), key: 'actions', width: 240 },
]);
const shapeLabels = computed<Record<BeadShape, string>>(() => ({
  ROUND: $t('catalog.product.shapes.ROUND'),
  CUBE: $t('catalog.product.shapes.CUBE'),
  CHARM: $t('catalog.product.shapes.CHARM'),
  CHIP: $t('catalog.product.shapes.CHIP'),
}));

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
    message.success(
      $t(
        editingProduct.value
          ? 'catalog.product.updated'
          : 'catalog.product.created',
      ),
    );
    productModalOpen.value = false;
    await loadProducts();
  } finally {
    saving.value = false;
  }
}

async function removeProduct(id: number) {
  await deleteProductApi(id);
  message.success($t('catalog.product.deleted'));
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
          remark: $t('catalog.product.inventoryAdjustmentRemark'),
          type: 'ADJUSTMENT',
        });
      }
    } else {
      await createVariantApi(activeProduct.value.id, {
        ...payload,
        stock: value.stock,
      });
    }
    message.success(
      $t(
        editingVariant.value
          ? 'catalog.product.variant.updated'
          : 'catalog.product.variant.created',
      ),
    );
    variantModalOpen.value = false;
    await refreshActiveProduct();
  } finally {
    saving.value = false;
  }
}

async function removeVariant(id: number) {
  await deleteVariantApi(id);
  message.success($t('catalog.product.variant.deleted'));
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
    :description="$t('catalog.product.description')"
    :title="$t('catalog.product.title')"
  >
    <Card :bordered="false">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <Input
            v-model:value="filters.keyword"
            allow-clear
            :placeholder="$t('catalog.product.searchPlaceholder')"
            style="width: 200px"
            @press-enter="loadProducts(true)"
          />
          <Select
            v-model:value="filters.categoryId"
            allow-clear
            :placeholder="$t('catalog.product.allCategories')"
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
            :placeholder="$t('catalog.product.allStatuses')"
            style="width: 120px"
          >
            <SelectOption value="ENABLED">
{{
              $t('common.enabled')
            }}
</SelectOption><SelectOption value="DISABLED">
{{
              $t('common.disabled')
            }}
</SelectOption>
          </Select>
          <Button type="primary" @click="loadProducts(true)">
{{
            $t('common.query')
          }}
</Button>
        </Space>
        <Button type="primary" @click="openCreateProduct">
{{
          $t('catalog.product.create')
        }}
</Button>
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
            {{
              $t('catalog.product.variantSummary', {
                count: record.variants.length,
                stock: record.variants.reduce(
                  (sum: number, item: Variant) => sum + item.stock,
                  0,
                ),
              })
            }}
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
                @click="openEditProduct(asProduct(record))"
              >
                {{ $t('common.edit') }}
</Button><Button
                size="small"
                type="link"
                @click="openVariants(asProduct(record))"
              >
                {{ $t('catalog.product.variantInventory') }}
</Button><Popconfirm
                :title="$t('catalog.product.deleteConfirm')"
                @confirm="removeProduct(record.id)"
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
