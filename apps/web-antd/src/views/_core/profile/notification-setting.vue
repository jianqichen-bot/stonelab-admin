<script setup lang="ts">
import { computed } from 'vue';

import { ProfileNotificationSetting } from '@vben/common-ui';
import { $t } from '@vben/locales';

const formSchema = computed(() => {
  return [
    {
      value: true,
      fieldName: 'accountPassword',
      label: $t('page.profile.notification.account'),
      description: $t('page.profile.notification.accountDescription'),
    },
    {
      value: true,
      fieldName: 'systemMessage',
      label: $t('page.profile.notification.system'),
      description: $t('page.profile.notification.systemDescription'),
    },
    {
      value: true,
      fieldName: 'todoTask',
      label: $t('page.profile.notification.todo'),
      description: $t('page.profile.notification.todoDescription'),
    },
  ];
});
</script>
<template>
  <ProfileNotificationSetting :form-schema="formSchema" />
</template>
