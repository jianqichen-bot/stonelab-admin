<script lang="ts" setup>
import type { SystemDepartment, SystemDepartmentInput } from '#/api';

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
  TreeSelect,
} from 'ant-design-vue';

import { $t } from '#/locales';

const props = defineProps<{
  confirmLoading: boolean;
  department: null | SystemDepartment;
  departments: SystemDepartment[];
  open: boolean;
  parentId?: null | number;
}>();
const emit = defineEmits<{
  submit: [value: SystemDepartmentInput];
  'update:open': [value: boolean];
}>();
const form = reactive<SystemDepartmentInput>({
  name: '',
  parentId: null,
  remark: '',
  sort: 0,
  status: 'ENABLED',
});
const parentTree = computed(() =>
  props.departments.filter((item) => item.id !== props.department?.id),
);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      name: props.department?.name ?? '',
      parentId: props.department?.parentId ?? props.parentId ?? null,
      remark: props.department?.remark ?? '',
      sort: props.department?.sort ?? 0,
      status: props.department?.status ?? 'ENABLED',
    });
  },
);
function submit() {
  if (!form.name.trim())
    return void message.warning($t('system.department.validation.name'));
  emit('submit', {
    ...form,
    name: form.name.trim(),
    remark: form.remark.trim(),
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="
      $t(department ? 'system.department.edit' : 'system.department.create')
    "
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('system.department.fields.name')" required>
        <Input
          v-model:value="form.name"
          :maxlength="50"
          :placeholder="$t('system.department.placeholders.name')"
        />
      </FormItem>
      <FormItem :label="$t('system.department.fields.parent')">
        <TreeSelect
          v-model:value="form.parentId"
          allow-clear
          :placeholder="$t('system.department.placeholders.parent')"
          :field-names="{ children: 'children', label: 'name', value: 'id' }"
          :tree-data="parentTree"
          tree-default-expand-all
        />
      </FormItem>
      <FormItem :label="$t('system.common.sort')">
        <InputNumber
          v-model:value="form.sort"
          class="w-full"
          :min="0"
          :placeholder="$t('system.common.sortPlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('system.common.status')">
        <Select
          v-model:value="form.status"
          :placeholder="$t('system.common.statusPlaceholder')"
        >
          <SelectOption value="ENABLED">{{ $t('common.enabled') }}</SelectOption><SelectOption value="DISABLED">
{{
            $t('common.disabled')
          }}
</SelectOption>
        </Select>
      </FormItem>
      <FormItem :label="$t('system.common.remark')">
        <Input.TextArea
          v-model:value="form.remark"
          :placeholder="$t('system.common.remarkPlaceholder')"
          :maxlength="100"
          :rows="3"
          show-count
        />
      </FormItem>
    </Form>
  </Modal>
</template>
