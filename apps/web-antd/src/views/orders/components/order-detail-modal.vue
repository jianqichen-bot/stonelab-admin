<script lang="ts" setup>
import type { OrderDetail, OrderStatus } from '#/api';

import { computed } from 'vue';

import { formatDateTime } from '@vben/utils';

import {
  Descriptions,
  DescriptionsItem,
  Image,
  Modal,
  Spin,
  Table,
  Tag,
} from 'ant-design-vue';

import { $t } from '#/locales';

const props = defineProps<{
  loading: boolean;
  open: boolean;
  order: null | OrderDetail;
}>();
const emit = defineEmits<{ 'update:open': [value: boolean] }>();

const columns = computed(() => [
  { title: $t('order.fields.product'), key: 'product' },
  { title: $t('order.fields.unitPrice'), key: 'unitPrice', width: 110 },
  { title: $t('order.fields.quantity'), dataIndex: 'quantity', width: 80 },
  { title: $t('order.fields.subtotal'), key: 'subtotal', width: 110 },
]);
const statusLabels = computed<Record<OrderStatus, string>>(() => ({
  PENDING_PAYMENT: $t('order.statuses.PENDING_PAYMENT'),
  PAID: $t('order.statuses.PAID'),
  PROCESSING: $t('order.statuses.PROCESSING'),
  SHIPPED: $t('order.statuses.SHIPPED'),
  COMPLETED: $t('order.statuses.COMPLETED'),
  CANCELLED: $t('order.statuses.CANCELLED'),
}));

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}
</script>

<template>
  <Modal
    :footer="null"
    :open="open"
    :title="$t('order.detail.title')"
    width="900px"
    @update:open="emit('update:open', $event)"
  >
    <Spin :spinning="loading">
      <template v-if="order">
        <div class="mb-5">
          <Descriptions :column="2" bordered size="small">
            <DescriptionsItem :label="$t('order.fields.orderNo')">
              {{ order.orderNo }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.status')">
              <Tag color="blue">{{ statusLabels[order.status] }}</Tag>
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.recipient')">
              {{ order.recipientName }} · {{ order.recipientPhone }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.createdAt')">
              {{ formatDateTime(order.createdAt) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.address')" :span="2">
              {{ order.recipientProvince }}{{ order.recipientCity
              }}{{ order.recipientDistrict }}{{ order.recipientAddress }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.totalAmount')">
              {{ money(order.totalAmountCents) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.shippingFee')">
              {{ money(order.shippingFeeCents) }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.tracking')" :span="2">
              {{ order.trackingCompany || '-' }} {{ order.trackingNo || '' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.buyerRemark')" :span="2">
              {{ order.buyerRemark || '-' }}
            </DescriptionsItem>
            <DescriptionsItem :label="$t('order.fields.adminRemark')" :span="2">
              {{ order.adminRemark || '-' }}
            </DescriptionsItem>
          </Descriptions>
        </div>
        <Table
          :columns="columns"
          :data-source="order.items"
          :pagination="false"
          row-key="id"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'product'">
              <div class="flex items-center gap-3">
                <Image
                  v-if="record.imageUrl"
                  :height="48"
                  :src="record.imageUrl"
                  :width="48"
                  class="rounded"
                />
                <div>
                  <div>{{ record.productName }}</div>
                  <div class="text-xs text-gray-500">
                    {{ record.variantName }}
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'unitPrice'">
              {{ money(record.unitPriceCents) }}
            </template>
            <template v-else-if="column.key === 'subtotal'">
              {{ money(record.totalPriceCents) }}
            </template>
          </template>
        </Table>
      </template>
    </Spin>
  </Modal>
</template>
