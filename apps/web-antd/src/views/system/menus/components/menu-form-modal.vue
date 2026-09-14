<script lang="ts" setup>
import type { SystemMenu, SystemMenuInput } from '#/api';

import { computed, reactive, watch } from 'vue';

import { IconPicker } from '@vben/common-ui';

import {
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  RadioGroup,
  Select,
  SelectOption,
  TreeSelect,
} from 'ant-design-vue';

import { $t, i18n } from '#/locales';

const props = defineProps<{
  confirmLoading: boolean;
  menu: null | SystemMenu;
  menus: SystemMenu[];
  open: boolean;
  parentId?: null | number;
}>();
const emit = defineEmits<{
  submit: [value: SystemMenuInput];
  'update:open': [value: boolean];
}>();

const form = reactive<SystemMenuInput>({
  name: '',
  nameEn: '',
  parentId: null,
  type: 'MENU',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  status: 'ENABLED',
});
type ParentMenuOption = {
  children?: ParentMenuOption[];
  id: number;
  name: string;
};

const parentTree = computed<ParentMenuOption[]>(() => {
  const toOption = (menu: SystemMenu): null | ParentMenuOption => {
    if (menu.id === props.menu?.id) return null;

    const children = (menu.children ?? [])
      .map(toOption)
      .filter((item): item is ParentMenuOption => item !== null);

    return {
      id: menu.id,
      name:
        i18n.global.locale.value === 'en-US'
          ? menu.nameEn || menu.name
          : menu.name,
      ...(children.length ? { children } : {}),
    };
  };

  return props.menus
    .map(toOption)
    .filter((item): item is ParentMenuOption => item !== null);
});

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      name: props.menu?.name ?? '',
      nameEn: props.menu?.nameEn ?? '',
      parentId: props.menu?.parentId ?? props.parentId ?? null,
      type: props.menu?.type ?? 'MENU',
      path: props.menu?.path ?? '',
      component: props.menu?.component ?? '',
      permission: props.menu?.permission ?? '',
      icon: props.menu?.icon ?? '',
      sort: props.menu?.sort ?? 0,
      status: props.menu?.status ?? 'ENABLED',
    });
  },
);

function submit() {
  if (!form.name.trim())
    return void message.warning($t('system.menu.validation.nameZh'));
  if (!form.nameEn.trim())
    return void message.warning($t('system.menu.validation.nameEn'));
  if (form.type !== 'BUTTON' && !form.path.trim())
    return void message.warning($t('system.menu.validation.path'));
  emit('submit', {
    ...form,
    name: form.name.trim(),
    nameEn: form.nameEn.trim(),
    path: form.path.trim(),
    component: form.component.trim(),
    permission: form.permission.trim(),
    icon: form.icon.trim(),
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="$t(menu ? 'system.menu.edit' : 'system.menu.create')"
    width="680px"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('system.menu.fields.type')" required>
        <RadioGroup
          v-model:value="form.type"
          :options="[
            { label: $t('system.menu.types.DIRECTORY'), value: 'DIRECTORY' },
            { label: $t('system.menu.types.MENU'), value: 'MENU' },
            { label: $t('system.menu.types.BUTTON'), value: 'BUTTON' },
          ]"
          option-type="button"
        />
      </FormItem>
      <FormItem :label="$t('system.menu.fields.nameZh')" required>
        <Input
          v-model:value="form.name"
          :maxlength="50"
          :placeholder="$t('system.menu.placeholders.nameZh')"
        />
      </FormItem>
      <FormItem :label="$t('system.menu.fields.nameEn')" required>
        <Input
          v-model:value="form.nameEn"
          :maxlength="100"
          :placeholder="$t('system.menu.placeholders.nameEn')"
        />
      </FormItem>
      <FormItem :label="$t('system.menu.fields.parent')">
        <TreeSelect
          v-model:value="form.parentId"
          allow-clear
          :placeholder="$t('system.menu.placeholders.parent')"
          :field-names="{ children: 'children', label: 'name', value: 'id' }"
          :tree-data="parentTree"
          tree-default-expand-all
        />
      </FormItem>
      <FormItem
        v-if="form.type !== 'BUTTON'"
        :label="$t('system.menu.fields.path')"
        required
      >
        <Input
          v-model:value="form.path"
          :placeholder="$t('system.menu.placeholders.path')"
        />
      </FormItem>
      <FormItem
        v-if="form.type === 'MENU'"
        :label="$t('system.menu.fields.component')"
      >
        <Input
          v-model:value="form.component"
          :placeholder="$t('system.menu.placeholders.component')"
        />
      </FormItem>
      <FormItem
        v-if="form.type !== 'DIRECTORY'"
        :label="$t('system.menu.fields.permission')"
      >
        <Input
          v-model:value="form.permission"
          :placeholder="$t('system.menu.placeholders.permission')"
        />
      </FormItem>
      <FormItem
        v-if="form.type !== 'BUTTON'"
        :label="$t('system.menu.fields.icon')"
      >
        <IconPicker v-model="form.icon" prefix="lucide" />
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
          <SelectOption value="ENABLED">
            {{ $t('common.enabled') }}
          </SelectOption>
          <SelectOption value="DISABLED">
            {{ $t('common.disabled') }}
          </SelectOption>
        </Select>
      </FormItem>
    </Form>
  </Modal>
</template>
