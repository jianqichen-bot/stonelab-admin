<script lang="ts" setup>
import type {
  BeadShape,
  Category,
  ImageAsset,
  Product,
  ProductInput,
  RecordStatus,
} from '#/api';

import { computed, reactive, ref, watch } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Image,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  SelectOption,
  Space,
} from 'ant-design-vue';

import { $t } from '#/locales';

import ImagePickerModal from './image-picker-modal.vue';

const props = defineProps<{
  categories: Category[];
  confirmLoading: boolean;
  open: boolean;
  product: null | Product;
}>();

const emit = defineEmits<{
  submit: [value: ProductInput];
  'update:open': [value: boolean];
}>();

const imagePickerOpen = ref(false);
const form = reactive({
  categoryId: undefined as number | undefined,
  imageKey: '',
  imageUrl: '',
  name: '',
  shape: 'ROUND' as BeadShape,
  sort: 0,
  status: 'ENABLED' as RecordStatus,
});

const categoryOptions = computed(() =>
  props.categories.filter((item) => item.parentId !== null),
);
const shapeLabels = computed<Record<BeadShape, string>>(() => ({
  ROUND: $t('catalog.product.shapes.ROUND'),
  CUBE: $t('catalog.product.shapes.CUBE'),
  CHARM: $t('catalog.product.shapes.CHARM'),
  CHIP: $t('catalog.product.shapes.CHIP'),
}));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      categoryId: props.product?.categoryId,
      imageKey: props.product?.imageKey ?? '',
      imageUrl: props.product?.imageUrl ?? '',
      name: props.product?.name ?? '',
      shape: props.product?.shape ?? 'ROUND',
      sort: props.product?.sort ?? 0,
      status: props.product?.status ?? 'ENABLED',
    });
  },
);

function selectImage(asset: ImageAsset) {
  form.imageKey = asset.key;
  form.imageUrl = asset.url;
}

function removeImage() {
  form.imageKey = '';
  form.imageUrl = '';
}

function submit() {
  if (!form.categoryId || !form.name.trim()) {
    message.warning($t('catalog.product.formRequired'));
    return;
  }
  const imagePayload: Pick<ProductInput, 'imageKey'> = {};
  if (form.imageKey.trim()) imagePayload.imageKey = form.imageKey.trim();
  else if (props.product) imagePayload.imageKey = null;

  emit('submit', {
    categoryId: form.categoryId,
    ...imagePayload,
    name: form.name.trim(),
    shape: form.shape,
    sort: form.sort,
    status: form.status,
  });
}
</script>

<template>
  <Modal
    :confirm-loading="confirmLoading"
    :open="open"
    :title="$t(product ? 'catalog.product.edit' : 'catalog.product.create')"
    width="620px"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem :label="$t('catalog.product.fields.name')" required>
        <Input
          v-model:value="form.name"
          :placeholder="$t('catalog.product.namePlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.product.fields.category')" required>
        <Select
          v-model:value="form.categoryId"
          :placeholder="$t('catalog.product.allCategories')"
        >
          <SelectOption
            v-for="item in categoryOptions"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem :label="$t('catalog.product.fields.image')">
        <div class="flex items-center gap-3">
          <div class="product-image-preview">
            <Image
              v-if="form.imageUrl"
              :height="88"
              :src="form.imageUrl"
              :width="88"
              class="rounded-lg object-cover"
            />
            <span v-else class="text-gray-400">{{
              $t('catalog.product.noImage')
            }}</span>
          </div>
          <Space direction="vertical">
            <Button @click="imagePickerOpen = true">
{{
              $t('catalog.product.selectImage')
            }}
</Button>
            <Button
              v-if="form.imageKey"
              danger
              size="small"
              type="link"
              @click="removeImage"
            >
              {{ $t('catalog.product.removeImage') }}
            </Button>
          </Space>
        </div>
      </FormItem>
      <FormItem :label="$t('catalog.product.fields.shape')">
        <Select
          v-model:value="form.shape"
          :placeholder="$t('catalog.product.fields.shape')"
        >
          <SelectOption
            v-for="(label, value) in shapeLabels"
            :key="value"
            :value="value"
          >
            {{ label }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem :label="$t('catalog.common.sort')">
        <InputNumber
          v-model:value="form.sort"
          class="w-full"
          :placeholder="$t('catalog.common.sortPlaceholder')"
        />
      </FormItem>
      <FormItem :label="$t('catalog.common.status')">
        <Select
          v-model:value="form.status"
          :placeholder="$t('catalog.common.statusPlaceholder')"
        >
          <SelectOption value="ENABLED">
{{
            $t('common.enabled')
          }}
</SelectOption>
          <SelectOption value="DISABLED">
{{
            $t('common.disabled')
          }}
</SelectOption>
        </Select>
      </FormItem>
    </Form>

    <ImagePickerModal
      v-model:open="imagePickerOpen"
      :current-key="form.imageKey"
      @select="selectImage"
    />
  </Modal>
</template>

<style scoped>
.product-image-preview {
  display: flex;
  width: 90px;
  height: 90px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed #d9d9d9;
  border-radius: 10px;
  background: #fafafa;
}
</style>
