<script lang="ts" setup>
import type {
  SystemDepartment,
  SystemRole,
  SystemUser,
  SystemUserInput,
} from '#/api';

import { reactive, watch } from 'vue';

import {
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Modal,
  Select,
  SelectOption,
  TreeSelect,
} from 'ant-design-vue';

import { $t } from '#/locales';

const props = defineProps<{
  confirmLoading: boolean;
  departments: SystemDepartment[];
  open: boolean;
  roles: SystemRole[];
  user: null | SystemUser;
}>();
const emit = defineEmits<{
  submit: [value: SystemUserInput];
  'update:open': [value: boolean];
}>();
const form = reactive<SystemUserInput>({
  username: '',
  password: '',
  name: '',
  departmentId: null,
  roleIds: [],
  phone: '',
  email: '',
  status: 'ENABLED',
});
watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      username: props.user?.username ?? '',
      password: '',
      name: props.user?.name ?? '',
      departmentId: props.user?.departmentId ?? null,
      roleIds: [...(props.user?.roleIds ?? [])],
      phone: props.user?.phone ?? '',
      email: props.user?.email ?? '',
      status: props.user?.status ?? 'ENABLED',
    });
  },
);
function submit() {
  if (!form.username.trim() || !form.name.trim())
    return void message.warning($t('system.user.validation.identity'));
  if (!props.user && (!form.password || form.password.length < 6))
    return void message.warning($t('system.user.validation.password'));
  if (!form.departmentId)
    return void message.warning($t('system.user.validation.department'));
  if (!form.roleIds.length)
    return void message.warning($t('system.user.validation.role'));
  const value = {
    ...form,
    username: form.username.trim(),
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    roleIds: [...form.roleIds],
  };
  if (!value.password) delete value.password;
  emit('submit', value);
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="$t(user ? 'system.user.edit' : 'system.user.create')"
    width="620px"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('system.user.fields.username')" required>
        <Input
          v-model:value="form.username"
          :disabled="!!user"
          :maxlength="50"
          :placeholder="$t('system.user.placeholders.username')"
        />
      </FormItem>
      <FormItem :label="$t('system.user.fields.name')" required>
        <Input
          v-model:value="form.name"
          :maxlength="50"
          :placeholder="$t('system.user.placeholders.name')"
        />
      </FormItem>
      <FormItem
        v-if="!user"
        :label="$t('system.user.fields.password')"
        required
      >
        <InputPassword
          v-model:value="form.password"
          :maxlength="72"
          autocomplete="new-password"
          :placeholder="$t('system.user.placeholders.password')"
        />
      </FormItem>
      <FormItem :label="$t('system.user.fields.department')" required>
        <TreeSelect
          v-model:value="form.departmentId"
          :placeholder="$t('system.user.placeholders.department')"
          :field-names="{ children: 'children', label: 'name', value: 'id' }"
          :tree-data="departments"
          tree-default-expand-all
        />
      </FormItem>
      <FormItem :label="$t('system.user.fields.roles')" required>
        <Select
          v-model:value="form.roleIds"
          mode="multiple"
          :placeholder="$t('system.user.placeholders.roles')"
        >
          <SelectOption v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem :label="$t('system.user.fields.phone')">
        <Input
          v-model:value="form.phone"
          :maxlength="20"
          :placeholder="$t('system.user.placeholders.phone')"
        />
      </FormItem>
      <FormItem :label="$t('system.user.fields.email')">
        <Input
          v-model:value="form.email"
          :maxlength="100"
          :placeholder="$t('system.user.placeholders.email')"
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
    </Form>
  </Modal>
</template>
