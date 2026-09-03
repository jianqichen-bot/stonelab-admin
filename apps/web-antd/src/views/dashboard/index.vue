<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

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

const modules = [
  {
    description: '维护分类、珠子、尺寸、价格与上下架状态',
    icon: 'lucide:gem',
    name: '商品中心',
  },
  {
    description: '管理库存数量、变动记录与库存预警',
    icon: 'lucide:boxes',
    name: '库存中心',
  },
  {
    description: '配置首页 Banner、定制流程和灵感作品',
    icon: 'lucide:images',
    name: '内容运营',
  },
  {
    description: '处理订单、发货、取消与售后状态',
    icon: 'lucide:shopping-bag',
    name: '订单中心',
  },
];
</script>

<template>
  <Page
    description="StoneLab 商品、内容、库存与订单的统一运营入口"
    title="业务概览"
  >
    <Alert
      class="mb-5"
      message="后台基础框架已就绪"
      description="当前使用临时 Mock 登录。业务模块将在 StoneLab Server 接口完成后逐项接入。"
      show-icon
      type="info"
    />

    <Row :gutter="[16, 16]">
      <Col
        v-for="item in modules"
        :key="item.name"
        :lg="6"
        :md="12"
        :xs="24"
      >
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
                <Tag color="default">待接入</Tag>
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
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  place-items: center;
  color: #f4f2ed;
  font-size: 22px;
  border-radius: 14px;
  background: #30483a;
}
</style>
