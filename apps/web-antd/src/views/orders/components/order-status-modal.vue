<script lang="ts" setup>
import type { OrderListItem, OrderStatus, UpdateOrderStatusInput } from '#/api';

import { computed, reactive, watch } from 'vue';

import {
  Form,
  FormItem,
  Input,
  Modal,
  Select,
  SelectOption,
} from 'ant-design-vue';

import { $t } from '#/locales';

const props = defineProps<{
  confirmLoading: boolean;
  open: boolean;
  order: null | OrderListItem;
}>();
const emit = defineEmits<{
  submit: [value: UpdateOrderStatusInput];
  'update:open': [value: boolean];
}>();

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
const form = reactive<UpdateOrderStatusInput>({
  status: 'PENDING_PAYMENT',
  trackingCompany: '',
  trackingNo: '',
  adminRemark: '',
});
const statusOptions = computed(() =>
  props.order ? transitions[props.order.status] : [],
);

watch(
  () => props.open,
  (open) => {
    if (!open || !props.order) return;
    Object.assign(form, {
      status: transitions[props.order.status][0] ?? props.order.status,
      trackingCompany: props.order.trackingCompany,
      trackingNo: props.order.trackingNo,
      adminRemark: props.order.adminRemark,
    });
  },
);

function submit() {
  emit('submit', {
    status: form.status,
    trackingCompany: form.trackingCompany?.trim(),
    trackingNo: form.trackingNo?.trim(),
    adminRemark: form.adminRemark?.trim(),
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="$t('order.statusUpdate.title')"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 6 }" :model="form">
      <FormItem :label="$t('order.fields.orderNo')">
        <Input
          :value="order?.orderNo"
          disabled
          :placeholder="$t('order.placeholders.orderNo')"
        />
      </FormItem>
      <FormItem :label="$t('order.statusUpdate.nextStatus')" required>
        <Select
          v-model:value="form.status"
          :placeholder="$t('order.statusUpdate.statusPlaceholder')"
        >
          <SelectOption
            v-for="status in statusOptions"
            :key="status"
            :value="status"
          >
            {{ $t(`order.statuses.${status}`) }}
          </SelectOption>
        </Select>
      </FormItem>
      <template v-if="form.status === 'SHIPPED'">
        <FormItem :label="$t('order.fields.trackingCompany')">
          <Input
            v-model:value="form.trackingCompany"
            :placeholder="$t('order.placeholders.trackingCompany')"
          />
        </FormItem>
        <FormItem :label="$t('order.fields.trackingNo')">
          <Input
            v-model:value="form.trackingNo"
            :placeholder="$t('order.placeholders.trackingNo')"
          />
        </FormItem>
      </template>
      <FormItem :label="$t('order.fields.adminRemark')">
        <Input.TextArea
          v-model:value="form.adminRemark"
          :maxlength="500"
          :placeholder="$t('order.placeholders.adminRemark')"
          :rows="3"
          show-count
        />
      </FormItem>
    </Form>
  </Modal>
</template>
