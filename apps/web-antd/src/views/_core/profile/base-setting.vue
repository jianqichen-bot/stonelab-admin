<script setup lang="ts">
import type { Recordable } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { getUserInfoApi, updateProfileApi } from '#/api';
import { $t } from '#/locales';

const profileBaseSettingRef = ref();
const userStore = useUserStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'Input',
      componentProps: { placeholder: $t('page.profile.placeholders.realName') },
      fieldName: 'realName',
      label: $t('page.profile.fields.realName'),
    },
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        placeholder: $t('page.profile.placeholders.username'),
      },
      fieldName: 'username',
      label: $t('page.profile.fields.username'),
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('page.profile.placeholders.phone') },
      fieldName: 'phone',
      label: $t('page.profile.fields.phone'),
    },
    {
      component: 'Input',
      componentProps: { placeholder: $t('page.profile.placeholders.email') },
      fieldName: 'email',
      label: $t('page.profile.fields.email'),
    },
  ];
});
async function handleSubmit(values: Recordable<any>) {
  await updateProfileApi({
    realName: values.realName,
    phone: values.phone,
    email: values.email,
  });
  if (userStore.userInfo) {
    userStore.setUserInfo({ ...userStore.userInfo, realName: values.realName });
  }
  message.success($t('page.profile.updated'));
}

onMounted(async () => {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
