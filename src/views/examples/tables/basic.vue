<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索区域 -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :is-expand="false"
      :show-expand="true"
      :show-reset-button="true"
      :show-search-button="true"
      :disabled-search-button="false"
      @search="handleSearch"
      @reset="handleReset"
    />
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <!-- 表格工具栏 -->
      <!-- fullClass 属性用于设置全屏区域，如果需要设置全屏区域，请使用此属性 -->
      <ArtTableHeader layout="" fullClass="art-table-card">
        <template #left>
          <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
            批量发货 ({{ selectedRows.length }})
          </ElButton>
        </template>
      </ArtTableHeader>
      <!-- 表格 -->
      <ArtTable
        rowKey="id"
        :show-table-header="false"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #name="{ row }">
          <div class="order-info">
            <div class="order-info_top">
              <div class="order-info_top--id"> 订单号: {{ row.orderId }} </div>
              <div class="order-info_top--time"> 创建时间: {{ row.createTime }} </div>
            </div>
            <div class="order-info_bottom">
              <div class="order-info_bottom--img">
                <img :src="row.imgUrl" alt="" />
              </div>
              <div class="order-info_bottom--info">
                <div class="order-info_bottom--info--name"> {{ row.name }} </div>
                <div class="order-info_bottom--info--other"> 发货时间: {{ row.other }} </div>
              </div>
            </div>
          </div>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { fetchGetUserList } from '@/api/system-manage'

  defineOptions({ name: 'UserMixedUsageExample' })
   // 表单搜索初始值
  const searchFormState = ref({
    name: '',
    orderNo: '',
    daterange: ['2025-01-01', '2025-02-10']
  })
  const searchItems = computed(() => [
    {
      key: 'name',
      label: '商品名称',
      type: 'input',
      props: {
        placeholder: '请输入商品名称'
      }
    },
    {
      key: 'orderNo',
      label: '订单号',
      type: 'input',
      props: {
        placeholder: '请输入订单号',
      }
    },
    {
      key: 'daterange',
      label: '日期范围',
      type: 'daterange',
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  ])
  const selectedRows = ref<any[]>([])
  const data = ref([{
      name: '小红楼电玩运费差价邮费差价补拍',
      orderId: '2927503562673969294',
      createTime: '2025-09-12 10:34:12',
      price: '1',
      number: '15',
      status: '待发货',
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '09月13日 06:47前发货'
    },
    {
      name: '小红楼电玩运费差价邮费差价补拍',
      orderId: '2927503562673969294',
      createTime: '2025-09-12 10:34:12',
      price: '1',
      number: '15',
      status: '待发货',
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '09月13日 06:47前发货'
    }
  ])
  const { columns, loading, pagination, handleSizeChange, handleCurrentChange } = useTable({
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        userName: '',
        userPhone: '',
        userEmail: ''
      },
      columnsFactory: () => [
        { type: 'selection', width: 50 },
        {
          prop: 'name',
          label: '宝贝',
          width: 400,
          useSlot: true
        },
        {
          prop: 'price',
          label: '单价'
        },
        {
          prop: 'number',
          label: '数量'
        },
        {
          prop: 'status',
          label: '交易状态'
        },
        {
          prop: 'totalPrice',
          label: '实收款'
        }
      ]
    }
  })
  // 事件处理函数
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
    console.log('选择变更:', selection)
  }
  const handleSearch = () => {

  }
  const handleReset = () => {

  }
  const handleBatchDelete = () => {
    
  }
</script>

<style lang="scss" scoped>
  .user-page {
    gap: 16px;
  }

  :deep(.el-table__row) {
    position: relative;
    .el-table__cell {
      padding-top: 60px;
      position: static !important;
    }
    .el-checkbox {
      position: absolute;
      left: 0px;
      top: 10px;
      background-color: var(--el-table-row-hover-bg-color);
      padding: 8px;
      border-radius: 9px 0px 0px 9px;
      width: 50px;
      height: 39px;
      box-sizing: border-box;
      padding-left: 12px;
    }
  }
  :deep(.order-info) {
    .order-info_top {
      display: flex;
      align-items: center;
      gap: 30px;
      position: absolute;
      top: 10px;
      left: 42px;
      width: calc(100% - 42px);
      background-color: var(--el-table-row-hover-bg-color);
      padding: 8px;
      padding-left: 20px;
      box-sizing: border-box;
      border-radius: 0 9px 9px 0;
    }
    .order-info_bottom {
      display: flex;
      gap: 10px;
      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 9px;
      }
      .order-info_bottom--info--name {
        color: #5d87ff;
      }
    }
  }
</style>
