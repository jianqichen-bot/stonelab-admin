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

import ImagePickerModal from './image-picker-modal.vue';

const props = defineProps<{
  categories: Category[];
  confirmLoading: boolean;
  open: boolean;
  product: Product | null;
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
const shapeLabels: Record<BeadShape, string> = {
  ROUND: '圆珠',
  CUBE: '方形',
  CHARM: '吊坠',
  CHIP: '碎石',
};

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
    message.warning('请填写分类和商品名称');
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
    :title="product ? '编辑商品' : '新建商品'"
    width="620px"
    @ok="submit"
    @update:open="emit('update:open', $event)"
  >
    <Form class="pt-4" :label-col="{ span: 5 }" :model="form">
      <FormItem label="商品名称" required>
        <Input v-model:value="form.name" />
      </FormItem>
      <FormItem label="分类" required>
        <Select v-model:value="form.categoryId">
          <SelectOption
            v-for="item in categoryOptions"
            :key="item.id"
            :value="item.id"
          >
            {{ item.name }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem label="商品图片">
        <div class="flex items-center gap-3">
          <div class="product-image-preview">
            <Image
              v-if="form.imageUrl"
              :height="88"
              :src="form.imageUrl"
              :width="88"
              class="rounded-lg object-cover"
            />
            <span v-else class="text-gray-400">暂无图片</span>
          </div>
          <Space direction="vertical">
            <Button @click="imagePickerOpen = true">选择图片</Button>
            <Button
              v-if="form.imageKey"
              danger
              size="small"
              type="link"
              @click="removeImage"
            >
              移除图片
            </Button>
          </Space>
        </div>
      </FormItem>
      <FormItem label="形状">
        <Select v-model:value="form.shape">
          <SelectOption
            v-for="(label, value) in shapeLabels"
            :key="value"
            :value="value"
          >
            {{ label }}
          </SelectOption>
        </Select>
      </FormItem>
      <FormItem label="排序">
        <InputNumber v-model:value="form.sort" class="w-full" />
      </FormItem>
      <FormItem label="状态">
        <Select v-model:value="form.status">
          <SelectOption value="ENABLED">启用</SelectOption>
          <SelectOption value="DISABLED">停用</SelectOption>
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
