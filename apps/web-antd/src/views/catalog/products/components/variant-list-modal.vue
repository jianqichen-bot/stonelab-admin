<script lang="ts" setup>
import type { Product, Variant } from '#/api';

import { computed } from 'vue';

import { Button, Modal, Popconfirm, Table } from 'ant-design-vue';

import { $t } from '#/locales';

defineProps<{
  open: boolean;
  product: null | Product;
}>();

const emit = defineEmits<{
  add: [];
  delete: [id: number];
  edit: [variant: Variant];
  'update:open': [value: boolean];
}>();

const columns = computed(() => [
  { title: $t('catalog.product.variant.diameter'), key: 'size', width: 120 },
  { title: $t('catalog.product.variant.price'), key: 'price', width: 100 },
  { title: $t('catalog.product.variant.stock'), key: 'stock', width: 100 },
  { title: $t('catalog.product.variant.status'), key: 'status', width: 80 },
  { title: $t('catalog.product.variant.actions'), key: 'actions', width: 150 },
]);

function asVariant(record: Record<string, unknown>) {
  return record as unknown as Variant;
}
</script>

<template>
  <Modal
    :footer="null"
    :open="open"
    :title="$t('catalog.product.variant.title', { name: product?.name ?? '' })"
    width="850px"
    @update:open="emit('update:open', $event)"
  >
    <div class="mb-3 flex justify-end">
      <Button type="primary" @click="emit('add')">
{{
        $t('catalog.product.variant.create')
      }}
</Button>
    </div>
    <Table
      :columns="columns"
      :data-source="product?.variants ?? []"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'size'">
          {{ record.diameterMm ?? '-' }} mm
        </template>
        <template v-else-if="column.key === 'price'">
          ¥{{ (record.unitPriceCents / 100).toFixed(2) }}
        </template>
        <template v-else-if="column.key === 'stock'">
          {{ record.stock }}
        </template>
        <template v-else-if="column.key === 'status'">
          {{
            $t(
              record.status === 'ENABLED'
                ? 'common.enabled'
                : 'common.disabled',
            )
          }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <Button
            size="small"
            type="link"
            @click="emit('edit', asVariant(record))"
          >
            {{ $t('common.edit') }}
          </Button>
          <Popconfirm
            :title="$t('catalog.product.variant.deleteConfirm')"
            @confirm="emit('delete', record.id)"
          >
            <Button danger size="small" type="link">
{{
              $t('common.delete')
            }}
</Button>
          </Popconfirm>
        </template>
      </template>
    </Table>
  </Modal>
</template>
