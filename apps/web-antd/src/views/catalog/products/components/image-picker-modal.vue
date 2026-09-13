<script lang="ts" setup>
import type { UploadProps } from 'ant-design-vue';

import type { ImageAsset } from '#/api';

import { ref, watch } from 'vue';

import {
  Button,
  Empty,
  Image,
  message,
  Modal,
  Spin,
  Upload,
} from 'ant-design-vue';

import { listImageAssetsApi, uploadImageAssetApi } from '#/api';
import { $t } from '#/locales';

const props = defineProps<{
  currentKey: string;
  open: boolean;
}>();

const emit = defineEmits<{
  select: [asset: ImageAsset];
  'update:open': [value: boolean];
}>();

const loading = ref(false);
const uploading = ref(false);
const assets = ref<ImageAsset[]>([]);
const selectedKey = ref('');

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    selectedKey.value = props.currentKey;
    loading.value = true;
    try {
      assets.value = await listImageAssetsApi();
    } finally {
      loading.value = false;
    }
  },
);

const upload: NonNullable<UploadProps['customRequest']> = async (options) => {
  uploading.value = true;
  try {
    const asset = await uploadImageAssetApi(options.file as File);
    assets.value.unshift(asset);
    selectedKey.value = asset.key;
    options.onSuccess?.(asset);
    message.success($t('catalog.product.imagePicker.uploaded'));
  } catch (error) {
    options.onError?.(error as Error);
  } finally {
    uploading.value = false;
  }
};

function confirm() {
  const asset = assets.value.find((item) => item.key === selectedKey.value);
  if (!asset) {
    message.warning($t('catalog.product.imagePicker.selectRequired'));
    return;
  }
  emit('select', asset);
  emit('update:open', false);
}

function formatFileSize(size: number) {
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
  <Modal
    :open="open"
    :title="$t('catalog.product.imagePicker.title')"
    width="880px"
    @ok="confirm"
    @update:open="emit('update:open', $event)"
  >
    <div class="mb-4 flex items-center justify-between">
      <span class="text-gray-500">{{
        $t('catalog.product.imagePicker.source')
      }}</span>
      <Upload
        accept="image/jpeg,image/png,image/webp,image/gif"
        :custom-request="upload"
        :show-upload-list="false"
      >
        <Button :loading="uploading" type="primary">
{{
          $t('catalog.product.imagePicker.upload')
        }}
</Button>
      </Upload>
    </div>
    <Spin :spinning="loading">
      <div v-if="assets.length" class="asset-grid">
        <button
          v-for="asset in assets"
          :key="asset.key"
          class="asset-card"
          :class="{ 'asset-card-selected': selectedKey === asset.key }"
          type="button"
          @click="selectedKey = asset.key"
        >
          <Image
            :height="112"
            :preview="false"
            :src="asset.url"
            :width="112"
            class="asset-image"
          />
          <span class="asset-name" :title="asset.name">{{ asset.name }}</span>
          <span class="asset-size">{{ formatFileSize(asset.size) }}</span>
        </button>
      </div>
      <Empty
        v-else-if="!loading"
        :description="$t('catalog.product.imagePicker.empty')"
      />
    </Spin>
  </Modal>
</template>

<style scoped>
.asset-grid {
  display: grid;
  max-height: 520px;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding: 2px;
}

.asset-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 9px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: #fafafa;
  text-align: left;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.asset-card:hover {
  border-color: #91caff;
}

.asset-card-selected {
  border-color: #1677ff;
  background: #e6f4ff;
}

.asset-image {
  border-radius: 7px;
  object-fit: cover;
}

.asset-name {
  width: 100%;
  overflow: hidden;
  color: #262626;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-size {
  width: 100%;
  color: #8c8c8c;
  font-size: 12px;
}
</style>
