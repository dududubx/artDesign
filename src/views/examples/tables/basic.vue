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
          <div class="operation-buttons">
            <ArtButtonTable type="edit" :row="row" text="编辑" />
            <ArtButtonTable type="delete" :row="row" text="删除" />
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

  defineOptions({ name: 'UserMixedUsageExample' })
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
    daterange: ['2025-01-01', '2025-02-10'],
    orderType: '',
    phone: '',
    customerName: '',
    payType: ''
  })
  const searchItems = computed(() => [
    {
      key: 'orderType',
      label: '订单类型',
      type: 'select',
      labelWidth: 90,
      props: {
        placeholder: '请选择订单类型',
        options: [
          {
            label: '租赁订单',
            value: 'rent'
          }
        ]
      }
    },
    {
      key: 'name',
      label: '商品名称',
      labelWidth: 90,
      type: 'input',
      props: {
        placeholder: '请输入商品名称'
      }
    },
    {
      key: 'orderNo',
      label: '订单号',
      labelWidth: 90,
      type: 'input',
      props: {
        placeholder: '请输入订单号'
      }
    },
    {
      key: 'daterange',
      label: '创建时间',
      labelWidth: 90,
      type: 'daterange',
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD'
      }
    },
    {
      key: 'customerName',
      label: '收货人姓名',
      labelWidth: 90,
      type: 'input',
      props: {
        placeholder: '请输入收货人姓名',
        maxlength: '11'
      }
    },
    {
      key: 'phone',
      label: '收货人电话',
      labelWidth: 90,
      type: 'input',
      props: {
        placeholder: '请输入收货人电话',
        maxlength: '11'
      }
    },
    {
      key: 'payType',
      label: '交易状态',
      labelWidth: 90,
      type: 'select',
      props: {
        placeholder: '请选择交易状态',
        options: [
          {
            label: '待发货',
            value: '1'
          }
        ]
      }
    },
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
          // width: 530,
          useSlot: true,
          disabled: true
          // fixed: 'left'
        },
        {
          prop: 'price',
          label: '单价',
          width: 145,
          useSlot: true,
          align: 'center'
        },
        {
          prop: 'number',
          label: '数量',
          width: 145,
          align: 'center'
        },
        {
          prop: 'orderType',
          label: '订单类型',
          useSlot: true,
          width: 170,
          align: 'center'
        },
        {
          prop: 'status',
          label: '交易状态',
          width: 170,
          align: 'center'
        },
        {
          prop: 'totalPrice',
          label: '实收款',
          width: 160,
          align: 'center',
          useSlot: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          useSlot: true
          // fixed: 'right'
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
      if (columnIndex == 6) {
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
        if (tabBody?.scrollHeight === tabBody?.scrollTop + tabBody?.clientHeight) {
          pagination?.setAttribute('style', 'transform: translateY(0)')
        } else {
          pagination?.setAttribute('style', 'transform: translateY(-10000px)')
        }
      })
    })
  })
</script>

<style lang="scss" scoped>
  .user-page {
    gap: 16px;
  }
  :deep(.el-table th.el-table__cell.is-leaf, .el-table td.el-table__cell) {
    border-bottom: 0;
  }
  :deep(.el-checkbox--default .el-checkbox__inner) {
    width: 19px !important;
    height: 19px !important;
    &::before {
      top: 7px !important;
    }
  }
  :deep(.art-search-bar) {
    padding: 0;
    border: none !important;
    // .el-form-item--default {
    //   margin-bottom: 0;
    // }
    .action-buttons-wrapper {
      margin-bottom: 0 !important;
      justify-content: flex-start !important;
    }
  }
  :deep(.el-table) {
    color: #111;
    thead {
      color: #404040;
    }
    [class*='el-table__row--level'] .el-table__expand-icon {
      display: none;
    }
    .parent-row {
      .el-table-column--selection > .cell {
        width: 60px;
      }
      .el-table__cell {
        // padding: 0;
        .cell {
          background-color: var(--el-table-row-hover-bg-color);
          border-radius: 9px;
          height: 45px;
        }
        .order-info_top {
          display: flex;
          align-items: center;
          gap: 30px;
          font-size: 12px;
          // position: absolute;
          // top: 10px;
          // left: 42px;
          width: 100%;
          padding: 11px 0;
          box-sizing: border-box;
          border-radius: 0 9px 9px 0;
        }
      }
    }
    .child-row {
      .el-table__placeholder {
        display: none;
      }
      .el-table__indent {
        display: none;
      }
    }
    .total-price {
      .other-price {
        display: flex;
        flex-direction: column;
        font-size: 12px;
        color: #999;
      }
    }
    .el-table_hidden-before::before {
      display: none;
    }
    .click_text {
      color: #3d7fff;
      cursor: pointer;
    }
  }
  :deep(
    .el-table__body tr.hover-row > td.el-table__cell,
    .el-table__body tr.hover-row.current-row > td.el-table__cell,
    .el-table__body tr.hover-row.el-table__row--striped > td.el-table__cell,
    .el-table__body tr.hover-row.el-table__row--striped.current-row > td.el-table__cell
  ) {
    background-color: transparent;
  }
  :deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
    background-color: transparent;
  }
  :deep(.el-table__body tr > td.hover-cell) {
    background-color: transparent;
  }
  :deep(.el-table__row) {
    position: relative;
    .el-table__cell {
      // padding-top: 80px;
      // position: static !important;
      border-bottom: 0;
    }
  }
  :deep(.order-info) {
    .order-info_bottom {
      display: flex;
      gap: 10px;
      padding: 10px 0;
      img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 9px;
      }
      .order-info_bottom--info--name {
        color: #3d7fff;
        font-size: 12px;
      }
      .order-info_bottom--info--other {
        color: #999;
        font-size: 12px;
      }
    }
  }
  :deep(.table-header) {
    .right {
      align-items: flex-start;
    }
    .art-table-header-bottom {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 14px;
      .total-data_num {
        color: #3d7fff;
        padding: 0 5px;
      }
    }
  }
</style>
