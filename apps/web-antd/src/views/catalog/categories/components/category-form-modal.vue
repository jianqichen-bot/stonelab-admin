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

import { $t } from '#/locales';

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
    message.warning($t('catalog.category.nameRequired'));
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
    :title="$t(category ? 'catalog.category.edit' : 'catalog.category.create')"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('catalog.category.fields.name')" required>
        <Input
          v-model:value="form.name"
          :maxlength="100"
          :placeholder="$t('catalog.category.namePlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.category.fields.parent')">
        <Select
          v-model:value="form.parentId"
          allow-clear
          :placeholder="$t('catalog.category.rootPlaceholder')"
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
      <FormItem :label="$t('catalog.common.sort')">
        <InputNumber
          v-model:value="form.sort"
          class="w-full"
          :placeholder="$t('catalog.common.sortPlaceholder')"
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
