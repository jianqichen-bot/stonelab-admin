<script lang="ts" setup>
import type { Product, Variant } from '#/api';

import { Button, Modal, Popconfirm, Table } from 'ant-design-vue';

defineProps<{
  open: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  add: [];
  delete: [id: number];
  edit: [variant: Variant];
  'update:open': [value: boolean];
}>();

const columns = [
  { title: '珠径', key: 'size', width: 120 },
  { title: '单价', key: 'price', width: 100 },
  { title: '库存', key: 'stock', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'actions', width: 150 },
];

function asVariant(record: Record<string, unknown>) {
  return record as unknown as Variant;
}
</script>

<template>
  <Modal
    :footer="null"
    :open="open"
    :title="`${product?.name ?? ''} · 规格库存`"
    width="850px"
    @update:open="emit('update:open', $event)"
  >
    <div class="mb-3 flex justify-end">
      <Button type="primary" @click="emit('add')">添加规格</Button>
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
          {{ record.status === 'ENABLED' ? '启用' : '停用' }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <Button
            size="small"
            type="link"
            @click="emit('edit', asVariant(record))"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个规格？"
            @confirm="emit('delete', record.id)"
          >
            <Button danger size="small" type="link">删除</Button>
          </Popconfirm>
        </template>
      </template>
    </Table>
  </Modal>
</template>
