<!-- 基础表格 -->
<template>
  <div class="user-page art-full-height">
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
        <template #left>
          <!-- <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              批量发货 ({{ selectedRows.length }})
            </ElButton> -->
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
        </template>
        <template #bottom>
          <div class="art-table-header-bottom">
            <div class="total-data">
              共查询到<span class="total-data_num">{{ allData.length }}</span
              >个订单
            </div>
            <div class="add-button">
              <ElButton @click="handleBatchDelete" v-ripple> 新增订单 </ElButton>
            </div>
          </div>
        </template>
      </ArtTableHeader>
      <!-- 表格 -->
      <ArtTable
        rowKey="id"
        :show-table-header="true"
        :loading="loading"
        :default-expand-all="true"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        :span-method="objectSpanMethod"
        :row-class-name="rowClassName"
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
                <div class="order-info_bottom--info--other"> {{ row.other }} </div>
              </div>
            </div>
          </div>
        </template>
        <template #price="{ row }">
          <span class="price">¥{{ row.price }}</span>
        </template>
        <template #totalPrice="{ row }">
          <div class="total-price">
            <span class="price">¥{{ row.totalPrice }}</span>
            <div class="other-price">
              <span>(含快递:¥{{ row.kuaidi }})</span>
              <span>(含押金:¥{{ row.yajin }})</span>
              <span class="click_text">查看物流</span>
            </div>
          </div>
        </template>
        <template #orderType="{ row }">
          <ElTag effect="light">
            {{ row.orderType }}
          </ElTag>
        </template>
        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="status-one">
            <div class="price">{{ orderStatus[row.operationType] }}</div>
            <div class="status-btn">
              <span class="click_text">详情</span>
              <div class="status-one" v-if="row.operationType === 1">
                <span class="click_text">打单</span>
                <span class="click_text">延长收货时间</span>
              </div>
              <span class="click_text" v-else>关闭交易</span>
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

  enum orderStatus {
    '卖家已发货' = 1,
    '已归还',
    '待发货'
  }

  defineOptions({ name: 'orderMenu' })
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
      key: 'orderType',
      label: '订单类型',
      type: 'select',
      span: 4,
      props: {
        placeholder: '',
        options: [
          {
            label: '全部',
            value: 'all'
          },
          {
            label: '租赁订单',
            value: 'rent'
          }
        ],
        clearable: true
      }
    },
    {
      key: 'payType',
      label: '订单状态',
      type: 'select',
      span: 4,
      props: {
        placeholder: '',
        options: [
          {
            label: '全部',
            value: 'all'
          },
          {
            label: '待发货',
            value: '1'
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
      key: 'orderNo',
      label: '订单号',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        clearable: true
      }
    },
    {
      key: 'goodsId',
      label: '商品id',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        clearable: true
      }
    },
    {
      key: 'logisticsId',
      label: '物流单号',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        clearable: true
      }
    },
    {
      key: 'daterange',
      label: '创建时间',
      type: 'daterange',
      span: 8,
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
        format: 'YYYY-MM-DD HH:mm:ss',
        prefixIcon: 'none',
        clearable: true
      }
    },
    {
      key: 'endTime',
      label: '结束时间',
      type: 'daterange',
      span: 8,
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD',
        prefixIcon: 'none',
        format: 'YYYY-MM-DD HH:mm:ss',
        clearable: true
      }
    },
    {
      key: 'customerName',
      label: '收货人姓名',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        maxlength: '',
        clearable: true
      }
    },
    {
      key: 'phone',
      label: '收货人电话',
      type: 'input',
      span: 4,
      props: {
        placeholder: '',
        maxlength: '11',
        clearable: true
      }
    }
  ])
  const selectedRows = ref<any[]>([])
  const data = ref([
    {
      id: '23333',
      name: '',
      orderId: '4401438264980299820',
      createTime: '2025-06-23 00:37:48',
      price: '',
      number: '15',
      status: '待发货',
      totalPrice: 15,
      imgUrl: '',
      other: '',
      orderType: '',
      children: [
        {
          id: '233331',
          name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
          orderId: '',
          createTime: '',
          price: '1',
          number: '15',
          status: '待发货',
          totalPrice: 15,
          imgUrl:
            'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
          other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
          orderType: '租赁订单',
          isChild: true,
          kuaidi: '0.00',
          yajin: '300.00',
          operationType: 1,
          colSpan: 2
        },
        {
          id: '233332',
          name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
          orderId: '4401438264980299820',
          createTime: '2025-06-23 00:37:48',
          price: '1',
          number: '15',
          status: '待发货',
          totalPrice: 15,
          imgUrl:
            'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
          other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
          orderType: '租赁订单',
          isChild: true,
          kuaidi: '0.00',
          operationType: 1,
          yajin: '300.00'
        }
      ]
    },
    {
      id: '58888',
      name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
      orderId: '2927503562673969294',
      createTime: '2025-09-12 10:34:12',
      price: '1',
      number: '15',
      status: '待发货',
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
      orderType: '租赁订单',
      children: [
        {
          id: '588881',
          name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
          orderId: '2927503562673969294',
          createTime: '2025-09-12 10:34:12',
          price: '1',
          number: '15',
          status: '待发货',
          totalPrice: 15,
          imgUrl:
            'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
          other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
          orderType: '租赁订单',
          isChild: true,
          kuaidi: '0.00',
          yajin: '300.00',
          operationType: 2,
          colSpan: 1
        }
      ]
    }
  ])
  for (let i = 0; i < 18; i++) {
    data.value.push({
      id: '10000' + i,
      name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
      orderId: '2927503562673969294' + i,
      createTime: '2025-09-12 10:34:12',
      price: '1',
      number: '15',
      status: '待发货',
      totalPrice: 15,
      imgUrl:
        'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
      other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
      orderType: '租赁订单',
      children: [
        {
          id: '100001' + i,
          name: 'switch游戏卡带租赁港日版租借NS游戏卡带出租马里奥塞尔达宝可梦',
          orderId: '2927503562673969294' + i,
          createTime: '2025-09-12 10:34:12',
          price: '1',
          number: '15',
          status: '待发货',
          totalPrice: 15,
          imgUrl:
            'https://img.alicdn.com/imgextra/i3/2207518337863/O1CN018R1Dm327xJLz88euJ_!!2207518337863.jpg_.webp',
          other: '内存容量：无版本类型：海外版套餐：套餐一颜色分类：游戏卡带（30天租期）',
          orderType: '租赁订单',
          isChild: true,
          kuaidi: '0.00',
          yajin: '300.00',
          operationType: 3,
          colSpan: 1
        }
      ]
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
        { type: 'selection', width: 38 },
        {
          prop: 'name',
          label: '宝贝',
          width: 500,
          useSlot: true,
          disabled: true
          // fixed: 'left'
        },
        {
          prop: 'price',
          label: '单价',
          useSlot: true,
          align: 'center'
        },
        {
          prop: 'number',
          label: '数量',
          align: 'center'
        },
        {
          prop: 'orderType',
          label: '订单类型',
          useSlot: true,
          // width: 170,
          align: 'center',
          showOverflowTooltip: false
        },
        {
          prop: 'status',
          label: '交易状态',
          // width: 170,
          align: 'center'
        },
        {
          prop: 'operation',
          label: '订单操作',
          useSlot: true,
          align: 'center'
        },
        {
          prop: 'totalPrice',
          label: '实收款',
          // width: 160,
          align: 'center',
          fixed: 'right',
          useSlot: true
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
  const objectSpanMethod = ({ row, columnIndex }: any) => {
    if (!row.isChild) {
      if (columnIndex === 1) {
        return [1, 7]
      } else if (columnIndex == 0) {
        return [1, 1]
      }
      return [0, 0]
    } else {
      if (columnIndex === 1) {
        return [1, 2]
      } else if (columnIndex == 0) {
        return [0, 0]
      }
      if (columnIndex == 6 || columnIndex == 7) {
        if (row.colSpan) {
          return [row.colSpan, 1]
        } else {
          return [0, 0]
        }
      }
      return [1, 1]
    }
  }
  const rowClassName = ({ row }: any) => {
    if (!row.isChild) {
      return 'parent-row'
    }
    return 'child-row'
  }

  onMounted(() => {
    nextTick(() => {
      const tabBody = document.querySelector('.el-table__body-wrapper .el-scrollbar__wrap')
      const tableInner = document.querySelector('.el-table__inner-wrapper')
      tableInner?.classList.add('el-table_hidden-before')
      const pagination = document.querySelector('.pagination')
      pagination?.setAttribute('style', 'transform: translateY(-10000px)')
      tabBody?.addEventListener('scroll', () => {
        if (tabBody?.scrollHeight <= Math.floor(tabBody?.scrollTop + tabBody?.clientHeight + 1)) {
          pagination?.setAttribute('style', 'transform: translateY(0)')
        } else {
          pagination?.setAttribute('style', 'transform: translateY(-10000px)')
        }
      })
    })
  })
</script>

<style lang="scss" scoped>
  @use '@styles/basicTable.scss' as *;
</style>
