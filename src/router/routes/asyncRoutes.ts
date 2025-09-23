import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'
import { WEB_LINKS } from '@/utils/constants'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * 注意事项：
 * 1、RoutesAlias.Layout 指向的是布局容器，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 2、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 */
export const asyncRoutes: AppRouteRecord[] = [
  // 主页一级菜单配置示例：
  // {
  //   name: 'Home',
  //   path: '/home',
  //   component: RoutesAlias.Dashboard,
  //   meta: {
  //     title: 'menus.dashboard.console',
  //     icon: '&#xe733;',
  //     keepAlive: false
  //   }
  // },
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.dashboard.title',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    },
    children: [
      // {
      //   path: 'console',
      //   name: 'Console',
      //   component: RoutesAlias.Dashboard,
      //   meta: {
      //     title: 'menus.dashboard.console',
      //     keepAlive: false,
      //     fixedTab: true
      //   }
      // },
      {
        path: 'analysis',
        name: 'Analysis',
        component: RoutesAlias.Analysis,
        meta: {
          title: 'menus.dashboard.analysis',
          keepAlive: false
        }
      }
      // {
      //   path: 'ecommerce',
      //   name: 'Ecommerce',
      //   component: RoutesAlias.Ecommerce,
      //   meta: {
      //     title: 'menus.dashboard.ecommerce',
      //     keepAlive: false
      //   }
      // }
    ]
  },
  // {
  //   path: '/template',
  //   name: 'Template',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.template.title',
  //     icon: '&#xe860;'
  //   },
  //   children: [
  //     {
  //       path: 'cards',
  //       name: 'Cards',
  //       component: RoutesAlias.Cards,
  //       meta: {
  //         title: 'menus.template.cards',
  //         keepAlive: false
  //       }
  //     },
  //     {
  //       path: 'banners',
  //       name: 'Banners',
  //       component: RoutesAlias.Banners,
  //       meta: {
  //         title: 'menus.template.banners',
  //         keepAlive: false
  //       }
  //     },
  //     {
  //       path: 'charts',
  //       name: 'Charts',
  //       component: RoutesAlias.Charts,
  //       meta: {
  //         title: 'menus.template.charts',
  //         keepAlive: false
  //       }
  //     },
  //     {
  //       path: 'map',
  //       name: 'Map',
  //       component: RoutesAlias.Map,
  //       meta: {
  //         title: 'menus.template.map',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'chat',
  //       name: 'Chat',
  //       component: RoutesAlias.Chat,
  //       meta: {
  //         title: 'menus.template.chat',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'calendar',
  //       name: 'Calendar',
  //       component: RoutesAlias.Calendar,
  //       meta: {
  //         title: 'menus.template.calendar',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'pricing',
  //       name: 'Pricing',
  //       component: RoutesAlias.Pricing,
  //       meta: {
  //         title: 'menus.template.pricing',
  //         keepAlive: true,
  //         isFullPage: true // 是否全屏显示
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/widgets',
  //   name: 'Widgets',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.widgets.title',
  //     icon: '&#xe81a;'
  //   },
  //   children: [
  //     {
  //       path: 'icon-list',
  //       name: 'IconList',
  //       component: RoutesAlias.IconList,
  //       meta: {
  //         title: 'menus.widgets.iconList',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'icon-selector',
  //       name: 'IconSelector',
  //       component: RoutesAlias.IconSelector,
  //       meta: {
  //         title: 'menus.widgets.iconSelector',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'image-crop',
  //       name: 'ImageCrop',
  //       component: RoutesAlias.ImageCrop,
  //       meta: {
  //         title: 'menus.widgets.imageCrop',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'excel',
  //       name: 'Excel',
  //       component: RoutesAlias.Excel,
  //       meta: {
  //         title: 'menus.widgets.excel',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'video',
  //       name: 'Video',
  //       component: RoutesAlias.Video,
  //       meta: {
  //         title: 'menus.widgets.video',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'count-to',
  //       name: 'CountTo',
  //       component: RoutesAlias.CountTo,
  //       meta: {
  //         title: 'menus.widgets.countTo',
  //         keepAlive: false
  //       }
  //     },
  //     {
  //       path: 'wang-editor',
  //       name: 'WangEditor',
  //       component: RoutesAlias.WangEditor,
  //       meta: {
  //         title: 'menus.widgets.wangEditor',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'watermark',
  //       name: 'Watermark',
  //       component: RoutesAlias.Watermark,
  //       meta: {
  //         title: 'menus.widgets.watermark',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'context-menu',
  //       name: 'ContextMenu',
  //       component: RoutesAlias.ContextMenu,
  //       meta: {
  //         title: 'menus.widgets.contextMenu',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'qrcode',
  //       name: 'Qrcode',
  //       component: RoutesAlias.Qrcode,
  //       meta: {
  //         title: 'menus.widgets.qrcode',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'drag',
  //       name: 'Drag',
  //       component: RoutesAlias.Drag,
  //       meta: {
  //         title: 'menus.widgets.drag',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'text-scroll',
  //       name: 'TextScroll',
  //       component: RoutesAlias.TextScroll,
  //       meta: {
  //         title: 'menus.widgets.textScroll',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'fireworks',
  //       name: 'Fireworks',
  //       component: RoutesAlias.Fireworks,
  //       meta: {
  //         title: 'menus.widgets.fireworks',
  //         keepAlive: true,
  //         showTextBadge: 'Hot'
  //       }
  //     },
  //     {
  //       path: '/outside/iframe/elementui',
  //       name: 'ElementUI',
  //       component: '',
  //       meta: {
  //         title: 'menus.widgets.elementUI',
  //         keepAlive: false,
  //         link: 'https://element-plus.org/zh-CN/component/overview.html',
  //         isIframe: true,
  //         showBadge: true
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/examples',
  //   name: 'Examples',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.examples.title',
  //     icon: '&#xe8d4;',
  //     showBadge: true
  //   },
  //   children: [
  //     {
  //       path: 'permission',
  //       name: 'Permission',
  //       component: '',
  //       meta: {
  //         title: 'menus.examples.permission.title',
  //         showBadge: true
  //       },
  //       children: [
  //         {
  //           path: RoutesAlias.PermissionSwitchRole,
  //           name: 'PermissionSwitchRole',
  //           component: RoutesAlias.PermissionSwitchRole,
  //           meta: {
  //             title: 'menus.examples.permission.switchRole',
  //             keepAlive: true
  //           }
  //         },
  //         {
  //           path: RoutesAlias.PermissionButtonAuth,
  //           name: 'PermissionButtonAuth',
  //           component: RoutesAlias.PermissionButtonAuth,
  //           meta: {
  //             title: 'menus.examples.permission.buttonAuth',
  //             keepAlive: true,
  //             authList: [
  //               {
  //                 title: '新增',
  //                 authMark: 'add'
  //               },
  //               {
  //                 title: '编辑',
  //                 authMark: 'edit'
  //               },
  //               {
  //                 title: '删除',
  //                 authMark: 'delete'
  //               },
  //               {
  //                 title: '导出',
  //                 authMark: 'export'
  //               },
  //               {
  //                 title: '查看',
  //                 authMark: 'view'
  //               },
  //               {
  //                 title: '发布',
  //                 authMark: 'publish'
  //               },
  //               {
  //                 title: '配置',
  //                 authMark: 'config'
  //               },
  //               {
  //                 title: '管理',
  //                 authMark: 'manage'
  //               }
  //             ]
  //           }
  //         },
  //         {
  //           path: RoutesAlias.PermissionPageVisibility,
  //           name: 'PermissionPageVisibility',
  //           component: RoutesAlias.PermissionPageVisibility,
  //           meta: {
  //             title: 'menus.examples.permission.pageVisibility',
  //             keepAlive: true,
  //             roles: ['R_SUPER'] // 仅超级管理员可访问
  //           }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'tabs',
  //       name: 'Tabs',
  //       component: RoutesAlias.ExamplesTabs,
  //       meta: {
  //         title: 'menus.examples.tabs'
  //       }
  //     },
  //     {
  //       path: 'tables/basic',
  //       name: 'TablesBasic',
  //       component: RoutesAlias.ExamplesTablesBasic,
  //       meta: {
  //         title: 'menus.examples.tablesBasic',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'tables',
  //       name: 'Tables',
  //       component: RoutesAlias.ExamplesTables,
  //       meta: {
  //         title: 'menus.examples.tables',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'form/search-bar',
  //       name: 'SearchBar',
  //       component: RoutesAlias.ExamplesSearchBar,
  //       meta: {
  //         title: 'menus.examples.searchBar',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'tables/tree',
  //       name: 'TablesTree',
  //       component: RoutesAlias.ExamplesTablesTree,
  //       meta: {
  //         title: 'menus.examples.tablesTree',
  //         keepAlive: true,
  //         showBadge: true
  //       }
  //     }
  //   ]
  // },
  {
    name: 'order',
    path: '/order',
    component: RoutesAlias.OrderMenu,
    meta: {
      title: 'menus.order.title',
      icon: '&#xe721;',
      keepAlive: true,
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    }
  },
  {
    name: 'goods',
    path: '/goods',
    component: RoutesAlias.Layout,
    meta: {
      title: '商品管理',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    },
    children: [
      {
        path: '/goodsTable',
        name: 'goodsTable',
        component: RoutesAlias.GoodsMenu,
        meta: {
          title: '商品列表',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      }
    ]
  },
  {
    name: 'category',
    path: '/category',
    component: RoutesAlias.Layout,
    meta: {
      title: '分类管理',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    },
    children: [
      {
        path: '/categoryMenu',
        name: 'categoryMenu',
        component: RoutesAlias.Menu,
        meta: {
          title: 'menus.system.menu',
          keepAlive: true,
          roles: ['R_SUPER'],
          showBadge: true,
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      }
    ]
  },
  {
    name: 'inventory',
    path: '/inventory',
    component: RoutesAlias.Layout,
    meta: {
      title: '库存管理',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    },
    children: [
      {
        path: '/inventoryTable',
        name: 'inventoryTable',
        component: RoutesAlias.InventoryMenu,
        meta: {
          title: '库存列表',
          keepAlive: true,
          roles: ['R_SUPER', 'R_ADMIN']
        }
      }
    ]
  },
  {
    name: 'warehouse',
    path: '/warehouse',
    component: RoutesAlias.NestedMenu21,
    meta: {
      title: '仓库管理',
      icon: '&#xe721;',
      roles: ['R_SUPER', 'R_ADMIN'] // 角色权限，前端控制模式（只有拥有这些角色的用户才能访问）
    }
  },
  {
    path: '/system',
    name: 'System',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.title',
      icon: '&#xe7b9;',
      showBadge: true,
      roles: ['R_SUPER', 'R_ADMIN']
    },
    children: [
      // {
      //   path: 'user',
      //   name: 'User',
      //   component: RoutesAlias.User,
      //   meta: {
      //     title: 'menus.system.user',
      //     keepAlive: true,
      //     roles: ['R_SUPER', 'R_ADMIN']
      //   }
      // },
      // {
      //   path: 'role',
      //   name: 'Role',
      //   component: RoutesAlias.Role,
      //   meta: {
      //     title: 'menus.system.role',
      //     keepAlive: true,
      //     showBadge: true,
      //     roles: ['R_SUPER']
      //   }
      // },
      {
        path: 'user-center',
        name: 'UserCenter',
        component: RoutesAlias.UserCenter,
        meta: {
          title: 'menus.system.userCenter',
          isHide: true,
          keepAlive: true,
          isHideTab: true
        }
      },
      {
        path: 'menu',
        name: 'Menus',
        component: RoutesAlias.Menu,
        meta: {
          title: 'menus.system.menu',
          keepAlive: true,
          roles: ['R_SUPER'],
          showBadge: true,
          authList: [
            {
              title: '新增',
              authMark: 'add'
            },
            {
              title: '编辑',
              authMark: 'edit'
            },
            {
              title: '删除',
              authMark: 'delete'
            }
          ]
        }
      },
      {
        path: '/site',
        name: 'site',
        component: RoutesAlias.SiteSetting,
        meta: {
          title: '站点设置',
          keepAlive: true,
          roles: ['R_SUPER']
        }
      }
    ]
  }
  // {
  //   path: '/article',
  //   name: 'Article',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.article.title',
  //     icon: '&#xe7ae;',
  //     roles: ['R_SUPER', 'R_ADMIN']
  //   },
  //   children: [
  //     {
  //       path: 'article-list',
  //       name: 'ArticleList',
  //       component: RoutesAlias.ArticleList,
  //       meta: {
  //         title: 'menus.article.articleList',
  //         keepAlive: true,
  //         authList: [
  //           {
  //             title: '新增',
  //             authMark: 'add'
  //           },
  //           {
  //             title: '编辑',
  //             authMark: 'edit'
  //           }
  //         ]
  //       }
  //     },

  //     {
  //       path: 'detail/:id',
  //       name: 'ArticleDetail',
  //       component: RoutesAlias.ArticleDetail,
  //       meta: {
  //         title: 'menus.article.articleDetail',
  //         isHide: true,
  //         keepAlive: true,
  //         activePath: '/article/article-list' // 激活菜单路径
  //       }
  //     },
  //     {
  //       path: 'comment',
  //       name: 'ArticleComment',
  //       component: RoutesAlias.Comment,
  //       meta: {
  //         title: 'menus.article.comment',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'publish',
  //       name: 'ArticlePublish',
  //       component: RoutesAlias.ArticlePublish,
  //       meta: {
  //         title: 'menus.article.articlePublish',
  //         keepAlive: true,
  //         authList: [
  //           {
  //             title: '发布',
  //             authMark: 'add'
  //           }
  //         ]
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/result',
  //   name: 'Result',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.result.title',
  //     icon: '&#xe715;'
  //   },
  //   children: [
  //     {
  //       path: 'success',
  //       name: 'ResultSuccess',
  //       component: RoutesAlias.Success,
  //       meta: {
  //         title: 'menus.result.success',
  //         keepAlive: true
  //       }
  //     },
  //     {
  //       path: 'fail',
  //       name: 'ResultFail',
  //       component: RoutesAlias.Fail,
  //       meta: {
  //         title: 'menus.result.fail',
  //         keepAlive: true
  //       }
  //     }
  //   ]
  // },
  // {
  //   path: '/exception',
  //   name: 'Exception',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.exception.title',
  //     icon: '&#xe820;'
  //   },
  //   children: [
  //     {
  //       path: '403',
  //       name: '403',
  //       component: RoutesAlias.Exception403,
  //       meta: {
  //         title: 'menus.exception.forbidden',
  //         keepAlive: true,
  //         isFullPage: true
  //       }
  //     },
  //     {
  //       path: '404',
  //       name: '404',
  //       component: RoutesAlias.Exception404,
  //       meta: {
  //         title: 'menus.exception.notFound',
  //         keepAlive: true,
  //         isFullPage: true
  //       }
  //     },
  //     {
  //       path: '500',
  //       name: '500',
  //       component: RoutesAlias.Exception500,
  //       meta: {
  //         title: 'menus.exception.serverError',
  //         keepAlive: true,
  //         isFullPage: true
  //       }
  //     }
  //   ]
  // },

  // {
  //   path: '/safeguard',
  //   name: 'Safeguard',
  //   component: RoutesAlias.Layout,
  //   meta: {
  //     title: 'menus.safeguard.title',
  //     icon: '&#xe816;',
  //     keepAlive: false
  //   },
  //   children: [
  //     {
  //       path: 'server',
  //       name: 'SafeguardServer',
  //       component: RoutesAlias.Server,
  //       meta: {
  //         title: 'menus.safeguard.server',
  //         keepAlive: true
  //       }
  //     }
  //   ]
  // },
  // {
  //   name: 'Document',
  //   path: '',
  //   component: '',
  //   meta: {
  //     title: 'menus.help.document',
  //     icon: '&#xe73e;',
  //     link: WEB_LINKS.DOCS,
  //     isIframe: false,
  //     keepAlive: false
  //   }
  // },
  // {
  //   name: 'LiteVersion',
  //   path: '',
  //   component: '',
  //   meta: {
  //     title: 'menus.help.liteVersion',
  //     icon: '&#xe7ff;',
  //     link: WEB_LINKS.LiteVersion,
  //     isIframe: false,
  //     keepAlive: false
  //   }
  // },
  // // 一级菜单
  // {
  //   name: 'ChangeLog',
  //   path: '/change/log',
  //   component: RoutesAlias.ChangeLog,
  //   meta: {
  //     title: 'menus.plan.log',
  //     showTextBadge: `v${__APP_VERSION__}`,
  //     icon: '&#xe712;',
  //     keepAlive: false
  //   }
  // }
]
