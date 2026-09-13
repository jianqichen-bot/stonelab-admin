<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { changePasswordApi } from '#/api';
import { $t } from '#/locales';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: $t('page.profile.password.old'),
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('page.profile.password.oldPlaceholder'),
      },
    },
    {
      fieldName: 'newPassword',
      label: $t('page.profile.password.new'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.password.newPlaceholder'),
      },
    },
    {
      fieldName: 'confirmPassword',
      label: $t('page.profile.password.confirm'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('page.profile.password.confirmPlaceholder'),
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ error: $t('page.profile.password.confirmPlaceholder') })
            .min(1, { message: $t('page.profile.password.confirmPlaceholder') })
            .refine((value) => value === newPassword, {
              message: $t('page.profile.password.mismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

async function handleSubmit(values: Record<string, string>) {
  await changePasswordApi({
    oldPassword: values.oldPassword ?? '',
    newPassword: values.newPassword ?? '',
  });
  message.success($t('page.profile.password.updated'));
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-1/3"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
