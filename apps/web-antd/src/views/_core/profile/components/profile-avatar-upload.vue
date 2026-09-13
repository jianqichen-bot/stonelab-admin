<script lang="ts" setup>
import type { UploadProps } from 'ant-design-vue';

import { computed, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { preferences } from '@vben/preferences';

import { Avatar, message, Upload } from 'ant-design-vue';

import { uploadProfileAvatarApi } from '#/api';
import { $t } from '#/locales';

const props = defineProps<{ avatar?: string }>();
const emit = defineEmits<{ uploaded: [avatar: string] }>();

const uploading = ref(false);
const displayAvatar = computed(
  () => props.avatar || preferences.app.defaultAvatar,
);

const upload: NonNullable<UploadProps['customRequest']> = async (options) => {
  uploading.value = true;
  try {
    const result = await uploadProfileAvatarApi(options.file as File);
    options.onSuccess?.(result);
    emit('uploaded', result.avatar);
    message.success($t('page.profile.avatar.updated'));
  } catch (error) {
    options.onError?.(error as Error);
  } finally {
    uploading.value = false;
  }
};
</script>

<template>
  <Upload
    accept="image/jpeg,image/png,image/webp,image/gif"
    :custom-request="upload"
    :disabled="uploading"
    :show-upload-list="false"
  >
    <button
      :aria-label="$t('page.profile.avatar.change')"
      class="avatar-upload"
      type="button"
    >
      <Avatar :size="80" :src="displayAvatar" />
      <span class="avatar-upload-mask">
        <IconifyIcon
          :icon="uploading ? 'lucide:loader-circle' : 'lucide:camera'"
          :class="{ 'animate-spin': uploading }"
          class="size-5"
        />
        <span>{{ $t('page.profile.avatar.change') }}</span>
      </span>
    </button>
  </Upload>
</template>

<style scoped>
.avatar-upload {
  position: relative;
  display: block;
  overflow: hidden;
  border: 0;
  padding: 0;
  border-radius: 9999px;
  cursor: pointer;
}

.avatar-upload-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: white;
  font-size: 12px;
  background: rgb(0 0 0 / 55%);
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-upload:hover .avatar-upload-mask,
.avatar-upload:focus-visible .avatar-upload-mask {
  opacity: 1;
}
</style>
