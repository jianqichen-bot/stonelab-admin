<script setup lang="ts">
import { computed } from 'vue';

import { ProfileSecuritySetting } from '@vben/common-ui';
import { $t } from '@vben/locales';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.security.password'),
      description: $t('page.profile.security.passwordDescription'),
    },
    {
      value: true,
      fieldName: 'securityPhone',
      label: $t('page.profile.security.phone'),
      description: $t('page.profile.security.phoneDescription'),
    },
    {
      value: true,
      fieldName: 'securityQuestion',
      label: $t('page.profile.security.question'),
      description: $t('page.profile.security.questionDescription'),
    },
    {
      value: true,
      fieldName: 'securityEmail',
      label: $t('page.profile.security.email'),
      description: $t('page.profile.security.emailDescription'),
    },
    {
      value: false,
      fieldName: 'securityMfa',
      label: $t('page.profile.security.mfa'),
      description: $t('page.profile.security.mfaDescription'),
    },
  ];
});
</script>
<template>
  <ProfileSecuritySetting :form-schema="formSchema" />
</template>
