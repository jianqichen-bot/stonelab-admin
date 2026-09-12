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

interface VariantFormValue {
  diameterMm: number;
  price: number;
  status: RecordStatus;
  stock: number;
}

const props = defineProps<{
  confirmLoading: boolean;
  open: boolean;
  variant: Variant | null;
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
    message.warning('请填写正确的珠径、单价和库存数量');
    return;
  }
  emit('submit', { ...form });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="variant ? '编辑规格' : '添加规格'"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 6 }" :model="form">
      <FormItem label="珠径" required>
        <InputNumber
          v-model:value="form.diameterMm"
          :min="0"
          :precision="2"
          class="w-full"
          addon-after="mm"
        />
      </FormItem>
      <FormItem label="单价">
        <InputNumber
          v-model:value="form.price"
          :min="0"
          :precision="2"
          class="w-full"
          addon-before="¥"
        />
      </FormItem>
      <FormItem label="库存数量" required>
        <InputNumber
          v-model:value="form.stock"
          :min="0"
          :precision="0"
          class="w-full"
        />
      </FormItem>
      <FormItem label="状态">
        <Select v-model:value="form.status">
          <SelectOption value="ENABLED">启用</SelectOption>
          <SelectOption value="DISABLED">停用</SelectOption>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>
