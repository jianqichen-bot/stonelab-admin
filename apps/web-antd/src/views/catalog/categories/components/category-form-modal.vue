<script lang="ts" setup>
import type { Category, CategoryInput, RecordStatus } from '#/api';

import { computed, reactive, watch } from 'vue';

import {
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
} from 'ant-design-vue';

const props = defineProps<{
  categories: Category[];
  category: Category | null;
  confirmLoading: boolean;
  open: boolean;
}>();

const emit = defineEmits<{
  submit: [value: CategoryInput];
  'update:open': [value: boolean];
}>();

const form = reactive({
  name: '',
  parentId: undefined as number | undefined,
  sort: 0,
  status: 'ENABLED' as RecordStatus,
});

const parentOptions = computed(() =>
  props.categories.filter(
    (item) => item.parentId === null && item.id !== props.category?.id,
  ),
);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      name: props.category?.name ?? '',
      parentId: props.category?.parentId ?? undefined,
      sort: props.category?.sort ?? 0,
      status: props.category?.status ?? 'ENABLED',
    });
  },
);

function submit() {
  if (!form.name.trim()) {
    message.warning('请填写分类名称');
    return;
  }
  emit('submit', {
    name: form.name.trim(),
    sort: form.sort,
    status: form.status,
    ...(form.parentId ? { parentId: form.parentId } : {}),
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="category ? '编辑分类' : '新建分类'"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem label="分类名称" required>
        <Input v-model:value="form.name" :maxlength="100" />
      </FormItem>
      <FormItem label="上级分类">
        <Select
          v-model:value="form.parentId"
          allow-clear
          placeholder="不选择则为根目录"
        >
          <SelectOption
            v-for="item in parentOptions"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem label="排序">
        <InputNumber v-model:value="form.sort" class="w-full" />
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
