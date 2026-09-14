<script lang="ts" setup>
import type {
  OrderDetail,
  OrderListItem,
  OrderStatus,
  UpdateOrderStatusInput,
} from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { formatDateTime } from '@vben/utils';

import {
  Button,
  Card,
  InputSearch,
  message,
  Select,
  SelectOption,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { getOrderApi, listOrdersApi, updateOrderStatusApi } from '#/api';
import { $t } from '#/locales';

import OrderDetailModal from './components/order-detail-modal.vue';
import OrderStatusModal from './components/order-status-modal.vue';

const loading = ref(false);
const saving = ref(false);
const rows = ref<OrderListItem[]>([]);
const total = ref(0);
const pager = reactive({ current: 1, pageSize: 20 });
const filters = reactive({
  keyword: '',
  status: undefined as OrderStatus | undefined,
});
const detailOpen = ref(false);
const detailLoading = ref(false);
const detail = ref<null | OrderDetail>(null);
const statusOpen = ref(false);
const activeOrder = ref<null | OrderListItem>(null);

const columns = computed(() => [
  { title: $t('order.fields.orderNo'), dataIndex: 'orderNo', width: 190 },
  { title: $t('order.fields.recipient'), key: 'recipient', width: 180 },
  { title: $t('order.fields.items'), key: 'items', width: 100 },
  { title: $t('order.fields.totalAmount'), key: 'amount', width: 130 },
  { title: $t('order.fields.status'), key: 'status', width: 120 },
  { title: $t('order.fields.createdAt'), key: 'createdAt', width: 180 },
  { title: $t('order.fields.actions'), key: 'actions', width: 170 },
]);
const statuses: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
];
const statusColors: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'orange',
  PAID: 'blue',
  PROCESSING: 'cyan',
  SHIPPED: 'purple',
  COMPLETED: 'green',
  CANCELLED: 'default',
};
const terminalStatuses = new Set<OrderStatus>(['CANCELLED', 'COMPLETED']);

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

async function load(reset = false) {
  if (reset) pager.current = 1;
  loading.value = true;
  try {
    const result = await listOrdersApi({
      page: pager.current,
      pageSize: pager.pageSize,
      ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    });
    rows.value = result.items;
    total.value = result.total;
  } finally {
    loading.value = false;
  }
}

async function openDetail(order: OrderListItem) {
  detailOpen.value = true;
  detailLoading.value = true;
  try {
    detail.value = await getOrderApi(order.id);
  } finally {
    detailLoading.value = false;
  }
}

function openStatus(order: OrderListItem) {
  activeOrder.value = order;
  statusOpen.value = true;
}

async function updateStatus(input: UpdateOrderStatusInput) {
  if (!activeOrder.value) return;
  saving.value = true;
  try {
    await updateOrderStatusApi(activeOrder.value.id, input);
    message.success($t('order.statusUpdate.updated'));
    statusOpen.value = false;
    await load();
  } finally {
    saving.value = false;
  }
}

async function changePage(page: number, pageSize: number) {
  pager.current = page;
  pager.pageSize = pageSize;
  await load();
}

onMounted(load);
</script>

<template>
  <Page :description="$t('order.description')" :title="$t('order.title')">
    <Card :bordered="false">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <InputSearch
            v-model:value="filters.keyword"
            allow-clear
            class="w-72"
            :placeholder="$t('order.placeholders.search')"
            @press-enter="load(true)"
            @search="load(true)"
          />
          <Select
            v-model:value="filters.status"
            allow-clear
            class="w-40"
            :placeholder="$t('order.placeholders.status')"
          >
            <SelectOption
              v-for="status in statuses"
              :key="status"
              :value="status"
            >
              {{ $t(`order.statuses.${status}`) }}
            </SelectOption>
          </Select>
          <Button type="primary" @click="load(true)">
{{
            $t('common.query')
          }}
</Button>
        </Space>
        <Button @click="load()">{{ $t('common.refresh') }}</Button>
      </div>
      <Table
        :columns="columns"
        :data-source="rows"
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
          <template v-if="column.key === 'recipient'">
            <div>{{ record.recipientName }}</div>
            <div class="text-xs text-gray-500">{{ record.recipientPhone }}</div>
          </template>
          <template v-else-if="column.key === 'items'">
            {{ $t('order.itemCount', { count: record.itemCount }) }}
          </template>
          <template v-else-if="column.key === 'amount'">
            {{ money(record.totalAmountCents) }}
          </template>
          <template v-else-if="column.key === 'status'">
            <Tag :color="statusColors[record.status as OrderStatus]">
              {{ $t(`order.statuses.${record.status}`) }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDateTime(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="openDetail(record as OrderListItem)"
              >
                {{ $t('common.view') }}
              </Button>
              <Button
                v-access:code="'order:update'"
                :disabled="terminalStatuses.has(record.status as OrderStatus)"
                size="small"
                type="link"
                @click="openStatus(record as OrderListItem)"
              >
                {{ $t('order.statusUpdate.action') }}
              </Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
    <OrderDetailModal
      v-model:open="detailOpen"
      :loading="detailLoading"
      :order="detail"
    />
    <OrderStatusModal
      v-model:open="statusOpen"
      :confirm-loading="saving"
      :order="activeOrder"
      @submit="updateStatus"
    />
  </Page>
</template>
