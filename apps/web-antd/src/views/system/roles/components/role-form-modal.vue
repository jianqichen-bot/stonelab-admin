<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { SystemMenu, SystemRole, SystemRoleInput } from '#/api';

import { computed, reactive, watch } from 'vue';

import {
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  SelectOption,
  Tree,
} from 'ant-design-vue';

import { $t, i18n } from '#/locales';

const props = defineProps<{
  confirmLoading: boolean;
  menus: SystemMenu[];
  open: boolean;
  role: null | SystemRole;
}>();
const emit = defineEmits<{
  submit: [value: SystemRoleInput];
  'update:open': [value: boolean];
}>();
const permissionTree = computed<DataNode[]>(() => {
  const toNode = (menu: SystemMenu): DataNode => ({
    key: menu.id,
    title:
      i18n.global.locale.value === 'en-US'
        ? menu.nameEn || menu.name
        : menu.name,
    ...(menu.children?.length
      ? { children: menu.children.map(toNode) }
      : {}),
  });
  return props.menus.map(toNode);
});
const form = reactive<SystemRoleInput>({
  code: '',
  name: '',
  permissionIds: [],
  remark: '',
  status: 'ENABLED',
});
watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      code: props.role?.code ?? '',
      name: props.role?.name ?? '',
      permissionIds: [...(props.role?.permissionIds ?? [])],
      remark: props.role?.remark ?? '',
      status: props.role?.status ?? 'ENABLED',
    });
  },
);
function submit() {
  if (!form.code.trim())
    return void message.warning($t('system.role.validation.code'));
  if (!/^[a-z][a-z0-9_]*$/.test(form.code.trim())) {
    return void message.warning($t('system.role.validation.codeFormat'));
  }
  if (!form.name.trim())
    return void message.warning($t('system.role.validation.name'));
  emit('submit', {
    ...form,
    code: form.code.trim(),
    name: form.name.trim(),
    permissionIds: [...form.permissionIds],
    remark: form.remark.trim(),
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="$t(role ? 'system.role.edit' : 'system.role.create')"
    width="620px"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('system.role.fields.code')" required>
        <Input
          v-model:value="form.code"
          :maxlength="50"
          :readonly="Boolean(role)"
          :placeholder="$t('system.role.placeholders.code')"
        />
      </FormItem>
      <FormItem :label="$t('system.role.fields.name')" required>
        <Input
          v-model:value="form.name"
          :maxlength="50"
          :placeholder="$t('system.role.placeholders.name')"
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
      <FormItem :label="$t('system.role.fields.menuPermissions')">
        <div class="max-h-72 overflow-auto rounded-md border p-3">
          <Tree
            v-model:checked-keys="form.permissionIds"
            checkable
            default-expand-all
            :tree-data="permissionTree"
          />
        </div>
      </FormItem>
      <FormItem :label="$t('system.common.remark')">
        <Input
          v-model:value="form.remark"
          :maxlength="100"
          :placeholder="$t('system.common.remarkPlaceholder')"
        />
      </FormItem>
    </Form>
  </Modal>
</template>
