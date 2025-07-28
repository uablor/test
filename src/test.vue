<template>
  <a-layout style="min-height: 100vh">
    <!-- Mobile Overlay for Sidebar -->
    <div v-if="!collapsed && isMobile" class="mobile-overlay" @click="collapsed = true"></div>

    <!-- Sidebar -->
    <a-layout-sider v-model:collapsed="collapsed" :collapsed-width="0" :width="isMobile ? 280 : 200"
      @breakpoint="onBreakpoint" :class="{ 'mobile-sidebar': isMobile }">
      <div class="logo">
        <span v-if="!collapsed || isMobile">LOGO</span>
        <span v-else>L</span>
      </div>

      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline" :inline-collapsed="collapsed && !isMobile">
        <a-menu-item key="1">
          <PieChartOutlined />
          <span>Dashboard</span>
        </a-menu-item>

        <a-menu-item key="2">
          <DesktopOutlined />
          <span>Projects</span>
        </a-menu-item>

        <a-sub-menu key="sub1">
          <template #title>
            <span>
              <UserOutlined />
              <span>Users</span>
            </span>
          </template>
          <a-menu-item key="3">Tom</a-menu-item>
          <a-menu-item key="4">Bill</a-menu-item>
          <a-menu-item key="5">Alex</a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="sub2">
          <template #title>
            <span>
              <TeamOutlined />
              <span>Teams</span>
            </span>
          </template>
          <a-menu-item key="6">Team Alpha</a-menu-item>
          <a-menu-item key="8">Team Beta</a-menu-item>
        </a-sub-menu>

        <a-menu-item key="9">
          <FileOutlined />
          <span>Documents</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Main layout -->
    <a-layout class="site-layout">
      <!-- Header -->
      <a-layout-header class="site-layout-background header">
        <div class="header-left">
          <MenuUnfoldOutlined v-if="collapsed" class="trigger" @click="toggleSidebar" />
          <MenuFoldOutlined v-if="!collapsed" class="trigger" @click="toggleSidebar" />

          <!-- Mobile Title -->
          <h3 v-if="isMobile" class="mobile-title">Dashboard</h3>
        </div>

        <!-- Header Actions -->
        <div class="header-actions">
          <a-button type="text" class="action-btn">
            <UserOutlined />
          </a-button>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="content-wrapper">
        <!-- Breadcrumb - Hidden on very small screens -->
        <a-breadcrumb v-if="!isVerySmall" class="breadcrumb">
          <a-breadcrumb-item>
            <HomeOutlined />
          </a-breadcrumb-item>
          <a-breadcrumb-item>User</a-breadcrumb-item>
          <a-breadcrumb-item>Bill</a-breadcrumb-item>

        </a-breadcrumb>

        <!-- Main Content -->
        <div class="site-content">
          <a-card :bordered="false" class="content-card">

 
            <template #title>
              <CheckOutIn />
            </template>

            <div class="content-body">
              <a-row :gutter="[16, 16]">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-statistic title="Total Users" :value="1128" />
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-statistic title="Active" :value="93" suffix="%" />
                </a-col>
                <a-col :xs="24" :sm="24" :md="8">
                  <a-statistic title="Revenue" :value="112893" prefix="$" />
                </a-col>
              </a-row>

              <a-divider />

              <p class="user-info">
                <strong>Bill</strong> is a cat who loves to explore and play.
                This user has been active for over 2 years and is one of our
                most engaged community members.
              </p>

              <!-- Mobile-friendly action buttons -->
              <div class="action-buttons">
                <a-button type="primary" class="action-btn-mobile">
                  Edit Profile
                </a-button>
                <a-button class="action-btn-mobile">
                  View Details
                </a-button>
              </div>
            </div>

          </a-card>
        </div>
      </a-layout-content>

      <!-- Footer -->
      <a-layout-footer class="footer">
        Ant Design ©2025 Created by Ant UED
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup>
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
} from '@ant-design/icons-vue'
import { ref, onMounted, onUnmounted } from 'vue'
import CheckOutIn from './CheckOut-In.vue'
const collapsed = ref<boolean>(false)
const selectedKeys = ref<string[]>(['1'])
const isMobile = ref<boolean>(false)
const isVerySmall = ref<boolean>(false)

const checkScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 992
  isVerySmall.value = width < 576

  // Auto-collapse on mobile
  if (isMobile.value) {
    collapsed.value = true
  }
}

const onBreakpoint = (broken: boolean) => {
  isMobile.value = broken
  if (broken) {
    collapsed.value = true
  }
}

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped lang="scss">
// Variables
$primary-color: #1890ff;
$sidebar-bg: #001529;
$mobile-breakpoint: 992px;
$small-breakpoint: 576px;

.logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: bold;
  text-align: center;
  line-height: 32px;
  border-radius: 6px;
  transition: all 0.3s;

  @media (max-width: $mobile-breakpoint) {
    margin: 12px;
    font-size: 16px;
  }
}

// Mobile overlay for sidebar
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 99;
  backdrop-filter: blur(4px);
}

// Mobile sidebar
.mobile-sidebar {
  position: fixed !important;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.site-layout-background {
  background: #fff;
}

// Header improvements
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;

  @media (max-width: $mobile-breakpoint) {
    padding: 0 12px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trigger {
  font-size: 20px;
  padding: 0 12px;
  cursor: pointer;
  line-height: 64px;
  transition: color 0.3s;
  border-radius: 4px;

  &:hover {
    color: $primary-color;
    background: rgba(0, 0, 0, 0.025);
  }

  @media (max-width: $mobile-breakpoint) {
    font-size: 18px;
    padding: 0 8px;
    line-height: 56px;
  }

  @media (max-width: $small-breakpoint) {
    font-size: 16px;
    line-height: 48px;
  }
}

.mobile-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);

  @media (max-width: $small-breakpoint) {
    font-size: 16px;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  @media (max-width: $small-breakpoint) {
    width: 36px;
    height: 36px;
  }
}

// Content improvements
.content-wrapper {
  margin: 0 16px;

  @media (max-width: $mobile-breakpoint) {
    margin: 0 12px;
  }

  @media (max-width: $small-breakpoint) {
    margin: 0 8px;
  }
}

.breadcrumb {
  margin: 16px 0;

  @media (max-width: $mobile-breakpoint) {
    margin: 12px 0;
  }
}

.site-content {
  padding: 0;
  min-height: calc(100vh - 200px);
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02);

  @media (max-width: $small-breakpoint) {
    border-radius: 6px;
    margin: 0 -8px;
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;

  @media (max-width: $small-breakpoint) {
    font-size: 16px;
  }
}

.title-icon {
  color: $primary-color;
}

.content-body {
  .user-info {
    font-size: 16px;
    line-height: 1.6;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 24px;

    @media (max-width: $small-breakpoint) {
      font-size: 14px;
      margin-bottom: 20px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: $small-breakpoint) {
    gap: 8px;
  }
}

.action-btn-mobile {
  @media (max-width: $small-breakpoint) {
    flex: 1;
    min-width: 120px;
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;
  }
}

// Footer
.footer {
  text-align: center;
  padding: 12px 24px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  border-top: 1px solid #f0f0f0;

  @media (max-width: $mobile-breakpoint) {
    padding: 10px 16px;
    font-size: 12px;
  }
}

// Responsive adjustments for Ant Design components
:deep(.ant-layout-header) {
  height: 64px;

  @media (max-width: $mobile-breakpoint) {
    height: 56px;
  }

  @media (max-width: $small-breakpoint) {
    height: 48px;
  }
}

:deep(.ant-menu-dark) {
  @media (max-width: $mobile-breakpoint) {

    .ant-menu-item,
    .ant-menu-submenu-title {
      padding-left: 16px !important;
      font-size: 15px;
    }
  }
}

:deep(.ant-card-head) {
  @media (max-width: $small-breakpoint) {
    padding: 12px 16px;
  }
}

:deep(.ant-card-body) {
  @media (max-width: $small-breakpoint) {
    padding: 16px;
  }
}

:deep(.ant-statistic) {
  @media (max-width: $small-breakpoint) {
    text-align: center;

    .ant-statistic-title {
      font-size: 13px;
    }

    .ant-statistic-content {
      font-size: 20px;
    }
  }
}

// Touch-friendly improvements
@media (max-width: $mobile-breakpoint) {

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    height: 48px;
    line-height: 48px;
    margin: 2px 0;
  }

  :deep(.ant-btn) {
    min-height: 44px;
    padding: 8px 16px;
  }
}

// Smooth transitions
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Scrollbar styling for mobile
@media (max-width: $mobile-breakpoint) {
  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }
}
</style>