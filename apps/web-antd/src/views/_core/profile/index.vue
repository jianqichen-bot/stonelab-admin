<script setup lang="ts">
import { computed, ref } from 'vue';

import { Profile } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import ProfileBase from './base-setting.vue';
import ProfileAvatarUpload from './components/profile-avatar-upload.vue';
import ProfilePasswordSetting from './password-setting.vue';

const userStore = useUserStore();

const tabsValue = ref<string>('basic');

const tabs = computed(() => [
  {
    label: $t('page.profile.tabs.basic'),
    value: 'basic',
  },
  {
    label: $t('page.profile.tabs.password'),
    value: 'password',
  },
]);

function handleAvatarUploaded(avatar: string) {
  if (!userStore.userInfo) return;
  userStore.setUserInfo({ ...userStore.userInfo, avatar });
}
</script>
<template>
  <Profile
    v-model:model-value="tabsValue"
    :title="$t('page.profile.title')"
    :user-info="userStore.userInfo"
    :tabs="tabs"
  >
    <template #avatar>
      <ProfileAvatarUpload
        :avatar="userStore.userInfo?.avatar"
        @uploaded="handleAvatarUploaded"
      />
    </template>
    <template #content>
      <ProfileBase v-if="tabsValue === 'basic'" />
      <ProfilePasswordSetting v-if="tabsValue === 'password'" />
    </template>
  </Profile>
</template>
