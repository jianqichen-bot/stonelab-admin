<script lang="ts" setup>
import { computed } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { useI18n } from '@vben/locales';

import {
  Alert,
  Card,
  Col,
  Row,
  Space,
  Tag,
  TypographyParagraph,
  TypographyTitle,
} from 'ant-design-vue';

const { t } = useI18n();

const modules = computed(() => [
  {
    description: t('page.home.modules.catalog.description'),
    icon: 'lucide:gem',
    name: t('page.home.modules.catalog.name'),
    ready: true,
  },
  {
    description: t('page.home.modules.inventory.description'),
    icon: 'lucide:boxes',
    name: t('page.home.modules.inventory.name'),
    ready: true,
  },
  {
    description: t('page.home.modules.content.description'),
    icon: 'lucide:images',
    name: t('page.home.modules.content.name'),
    ready: false,
  },
  {
    description: t('page.home.modules.order.description'),
    icon: 'lucide:shopping-bag',
    name: t('page.home.modules.order.name'),
    ready: false,
  },
]);
</script>

<template>
  <Page :description="t('page.home.description')" :title="t('page.home.overview')">
    <div class="mb-5">
      <Alert
        :message="t('page.home.connectedMessage')"
        :description="t('page.home.connectedDescription')"
        show-icon
        type="info"
      />
    </div>

    <Row :gutter="[16, 16]">
      <Col v-for="item in modules" :key="item.name" :lg="6" :md="12" :xs="24">
        <Card class="h-full" :bordered="false">
          <Space align="start" :size="16">
            <div class="module-icon">
              <IconifyIcon :icon="item.icon" />
            </div>
            <div>
              <Space>
                <TypographyTitle :level="5" class="!mb-0">
                  {{ item.name }}
                </TypographyTitle>
                <Tag :color="item.ready ? 'green' : 'default'">
                  {{ item.ready ? t('page.home.ready') : t('page.home.pending') }}
                </Tag>
              </Space>
              <TypographyParagraph class="!mt-3 !mb-0" type="secondary">
                {{ item.description }}
              </TypographyParagraph>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  </Page>
</template>

<style scoped>
.module-icon {
  display: grid;
  flex: 0 0 44px;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 22px;
  color: #f4f2ed;
  background: #30483a;
  border-radius: 14px;
}
</style>
