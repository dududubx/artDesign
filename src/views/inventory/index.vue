<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :is-expand="false"
      :span="3.4"
      :show-expand="true"
      :show-reset-button="true"
      :show-search-button="true"
      :disabled-search-button="false"
      @search="handleSearch"
      @reset="handleReset"
    />
    <!-- 搜索区域 -->
    <ElCard class="art-table-card" shadow="never" style="margin-top: 0">
      <ArtTabs :panes="tabs" v-model:active-name="activeName" />
      <!-- 表格工具栏 -->
      <!-- fullClass 属性用于设置全屏区域，如果需要设置全屏区域，请使用此属性 -->
      <ArtTableHeader
        layout="refresh,columns"
        fullClass="art-table-card"
        v-model:columns="columnChecks"
        :showRemoveToBottom="true"
        @refresh="handleReset"
      >
        <template #bottom>
          <div class="art-table-header-bottom">
            <div class="add-button">
              <ElButton @click="handleBatchDelete" v-ripple> 创建商品 </ElButton>
            </div>
          </div>
        </template>
      </ArtTableHeader>
      <!-- 表格 -->
      <ArtTable
        rowKey="id"
        :show-table-header="true"
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
            <div class="order-info_top" v-if="!row.isChild">
              <div class="order-info_top--id"> 订单号: {{ row.orderId }} </div>
              <div class="order-info_top--time"> 创建时间: {{ row.createTime }} </div>
            </div>
            <div class="order-info_bottom" v-else>
              <div class="order-info_bottom--img">
                <img :src="row.imgUrl" alt="" />
              </div>
              <div class="order-info_bottom--info">
                <div class="order-info_bottom--info--name click_text"> {{ row.name }} </div>
                <div class="order-info_bottom--info--other"> {{ 'ID' + row.id }} </div>
              </div>
            </div>
          </div>
        </template>
        <template #price="{ row }">
          <span class="price">¥{{ row.price }}</span>
        </template>
        <template #status="{ row }">
          <el-switch
            v-model="row.status"
            class="ml-2"
            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
            :active-value="1"
            :inactive-value="0"
          />
        </template>
        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="status-one">
            <div class="status-btn">
              <span class="click_text">编辑商品</span>
              <!-- <div class="status-one" v-if="row.operationType === 1">
                <span class="click_text">打单</span>
                <span class="click_text">延长收货时间</span>
              </div> -->
              <span class="click_text">删除商品</span>
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
  import type { TabsConfig } from '@/types/component'
  import { useWindowSize } from '@vueuse/core'

  enum orderStatus {
    '卖家已发货' = 1,
    '已归还',
    '待发货'
  }

  defineOptions({ name: 'goodsMenu' })
  //tabs
  const tabs = ref<TabsConfig[]>([
    {
      name: 'allOrder',
      label: '全部订单'
    },
    {
      name: 'waitPayOrder',
      label: '待付款'
    },
    {
      name: 'waitSendOrder',
      label: '待发货'
    },
    {
      name: 'waitReceiveOrder',
      label: '待收货'
    },
    {
      name: 'receiveOrder',
      label: '已发货'
    },
    {
      name: 'sentOrder',
      label: '租赁中'
    },
    {
      name: 'notReturnOrder',
      label: '待归还'
    },
    {
      name: 'returnOrder',
      label: '归还中'
    },
    {
      name: 'succeedOrder',
      label: '已完成'
    }
  ])
  const { width } = useWindowSize()
  const activeName = ref('allOrder')
  // 表单搜索初始值
  const searchFormState = ref({
    name: '',
    orderNo: '',
    daterange: [],
    orderType: 'all',
    phone: '',
    customerName: '',
    payType: 'all',
    goodsId: '',
    logisticsId: ''
  })
  const searchItems = computed(() => [
    {
      key: 'payType',
      label: '商品状态',
      type: 'select',
      span: 4,
      props: {
        placeholder: '',
        options: [
          {
            label: '全部商品',
            value: 'all'
          },
          {
            label: '出售中',
            value: '1'
          },
          {
            label: '已下架',
            value: '2'
          }
        ],
        clearable: true
      }
    },
    {
      key: 'name',
      label: '商品名称',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        clearable: true
      }
    },
    {
      key: 'goodsId',
      label: '商品编码',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        clearable: true
      }
    }
  ])
  const selectedRows = ref<any[]>([])
  const data = ref([
    {
      id: '233331',
      name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
      orderId: '4401438264980299820',
      createTime: '2025-08-15 00:37:48',
      price: 1,
      number: '15',
      status: 1,
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
      orderType: '租赁订单',
      isChild: true,
      kuaidi: '0.00',
      yajin: '300.00',
      operationType: 1,
      colSpan: 2,
      totalSales: 18
    },
    {
      id: '588881',
      name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
      orderId: '2927503562673969294',
      createTime: '2025-09-12 10:34:12',
      price: 2,
      number: '15',
      status: 0,
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
      orderType: '租赁订单',
      isChild: true,
      kuaidi: '0.00',
      yajin: '300.00',
      operationType: 2,
      colSpan: 1,
      totalSales: 15
    }
  ])
  for (let i = 0; i < 18; i++) {
    data.value.push({
      id: '100001' + i,
      name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
      orderId: '2927503562673969294' + i,
      createTime: '2025-09-12 10:34:12',
      price: i,
      number: '15',
      status: i % 2,
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
      orderType: '租赁订单',
      isChild: true,
      kuaidi: '0.00',
      yajin: '300.00',
      operationType: 3,
      colSpan: 1,
      totalSales: i
    })
  }
  const allData = ref<any[]>([...data.value])
  const pagination = ref({
    current: 1,
    size: 10,
    total: data.value.length
  })
  const handleSizeChange = (size: number) => {
    pagination.value.size = size
    data.value = allData.value.slice(
      (pagination.value.current - 1) * size,
      pagination.value.current * size
    )
  }
  const handleCurrentChange = (current: number) => {
    pagination.value.current = current
    console.log(
      'current change:',
      current,
      allData.value,
      allData.value.slice(
        (pagination.value.current - 1) * pagination.value.size,
        pagination.value.current * pagination.value.size
      )
    )
    data.value = allData.value.slice(
      (pagination.value.current - 1) * pagination.value.size,
      pagination.value.current * pagination.value.size
    )
  }
  const { columns, columnChecks, loading } = useTable({
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
          label: '商品名称',
          width: 500,
          useSlot: true,
          disabled: true
          // fixed: 'left'
        },
        {
          prop: 'price',
          label: '价格',
          useSlot: true,
          align: 'center',
          sortable: true
        },
        {
          prop: 'number',
          label: '库存',
          align: 'center',
          sortable: true
        },
        {
          prop: 'totalSales',
          label: '累计销量',
          align: 'center',
          minWidth: 120,
          sortable: true
        },
        {
          prop: 'status',
          label: '商品状态',
          // width: 170,
          align: 'center',
          useSlot: true
        },
        {
          prop: 'createTime',
          label: '创建时间',
          // width: 160,
          minWidth: 150,
          align: 'center'
        },
        {
          prop: 'operation',
          label: '操作',
          useSlot: true,
          align: 'center',
          fixed: 'right'
        }
      ]
    }
  })
  // 事件处理函数
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection.filter((item: any) => item.isChild)
    console.log('选择变更:', selection)
  }
  const handleSearch = () => {}
  const handleReset = () => {}
  const handleBatchDelete = () => {}
  watch(
    () => width.value,
    () => {
      resizeTablePagination()
    }
  )
  const resizeTablePagination = () => {
    const pagination = document.querySelector('.pagination')
    if (width.value <= 500) {
      pagination?.setAttribute('style', 'transform: translateY(0)')
      return false
    }
    const tabBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
    const tableInner = document.querySelector('.el-table__inner-wrapper')
    tableInner?.classList.add('el-table_hidden-before')
    pagination?.setAttribute('style', 'transform: translateY(-10000px)')
    tabBody?.addEventListener('scroll', () => {
      console.log('scroll:', tabBody?.scrollHeight, tabBody?.scrollTop + tabBody?.clientHeight)
      if (tabBody?.scrollHeight <= Math.floor(tabBody?.scrollTop + tabBody?.clientHeight + 1)) {
        pagination?.setAttribute('style', 'transform: translateY(0)')
      } else {
        pagination?.setAttribute('style', 'transform: translateY(-10000px)')
      }
    })
  }
  onMounted(() => {
    nextTick(() => {
      resizeTablePagination()
    })
  })
</script>

<style lang="scss" scoped>
  @use '@styles/basicTable.scss' as *;
  :deep(.art-table) {
    .el-table__row .el-table__cell {
      position: relative;
      border-bottom: 0.5px solid rgba(168, 171, 178, 0.26);
    }
    .el-table__body-wrapper .el-table-column--selection > .cell {
      transform: translateY(-140%);
    }
    .order-info .order-info_bottom {
      padding: 0;
    }
  }
</style>
