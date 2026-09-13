<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Alert, Card, Descriptions, DescriptionsItem, Tag } from 'ant-design-vue';

const frontendStack = ['Vue 3', 'Vite', 'Vben Admin', 'Ant Design Vue', 'TypeScript'];
const backendStack = ['NestJS', 'Prisma', 'PostgreSQL', 'Alibaba Cloud OSS'];
</script>

<template>
  <Page :description="$t('page.about.description')" :title="$t('page.about.title')">
    <div class="space-y-4">
      <Card :bordered="false" :title="$t('page.about.projectInfo')">
        <Descriptions :column="2" bordered>
          <DescriptionsItem :label="$t('page.about.appName')">
            {{ $t('page.app.name') }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('page.about.version')"> 0.1.0 </DescriptionsItem>
          <DescriptionsItem :label="$t('page.about.positioning')">
            {{ $t('page.about.positioningValue') }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('page.about.stage')">
            {{ $t('page.about.stageValue') }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('page.about.frontend')" :span="2">
            <div class="flex flex-wrap gap-2">
              <Tag v-for="item in frontendStack" :key="item" color="blue">
                {{ item }}
              </Tag>
            </div>
          </DescriptionsItem>
          <DescriptionsItem :label="$t('page.about.backend')" :span="2">
            <div class="flex flex-wrap gap-2">
              <Tag v-for="item in backendStack" :key="item" color="green">
                {{ item }}
              </Tag>
            </div>
          </DescriptionsItem>
        </Descriptions>
      </Card>

      <div class="mt-5">
        <Alert
          :description="$t('page.about.developmentDescription')"
          :message="$t('page.about.developmentStatus')"
          show-icon
          type="info"
        />
      </div>
    </div>
  </Page>
</template>
