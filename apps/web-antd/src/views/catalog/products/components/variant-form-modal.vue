<script lang="ts" setup>
import type { RecordStatus, Variant } from '#/api';

import { reactive, watch } from 'vue';

import {
  Form,
  FormItem,
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
} from 'ant-design-vue';

import { $t } from '#/locales';

interface VariantFormValue {
  diameterMm: number;
  price: number;
  status: RecordStatus;
  stock: number;
}

const props = defineProps<{
  confirmLoading: boolean;
  open: boolean;
  variant: null | Variant;
}>();

const emit = defineEmits<{
  submit: [value: VariantFormValue];
  'update:open': [value: boolean];
}>();

const form = reactive<VariantFormValue>({
  diameterMm: 8,
  price: 0,
  status: 'ENABLED',
  stock: 0,
});

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(
      form,
      props.variant
        ? {
            diameterMm: Number(props.variant.diameterMm ?? 0),
            price: props.variant.unitPriceCents / 100,
            status: props.variant.status,
            stock: props.variant.stock,
          }
        : { diameterMm: 8, price: 0, status: 'ENABLED', stock: 0 },
    );
  },
);

function submit() {
  if (
    form.diameterMm <= 0 ||
    form.price < 0 ||
    !Number.isInteger(form.stock) ||
    form.stock < 0
  ) {
    message.warning($t('catalog.product.variant.validation'));
    return;
  }
  emit('submit', { ...form });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="
      $t(
        variant
          ? 'catalog.product.variant.edit'
          : 'catalog.product.variant.create',
      )
    "
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 6 }" :model="form">
      <FormItem :label="$t('catalog.product.variant.diameter')" required>
        <InputNumber
          v-model:value="form.diameterMm"
          :min="0"
          :precision="2"
          class="w-full"
          addon-after="mm"
          :placeholder="$t('catalog.product.variant.diameterPlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.product.variant.price')">
        <InputNumber
          v-model:value="form.price"
          :min="0"
          :precision="2"
          class="w-full"
          addon-before="¥"
          :placeholder="$t('catalog.product.variant.pricePlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.product.variant.stockQuantity')" required>
        <InputNumber
          v-model:value="form.stock"
          :min="0"
          :precision="0"
          class="w-full"
          :placeholder="$t('catalog.product.variant.stockPlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.common.status')">
        <Select
          v-model:value="form.status"
          :placeholder="$t('catalog.common.statusPlaceholder')"
        >
          <SelectOption value="ENABLED">
{{
            $t('common.enabled')
          }}
</SelectOption>
          <SelectOption value="DISABLED">
{{
            $t('common.disabled')
          }}
</SelectOption>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>
