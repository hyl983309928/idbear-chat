import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/store',
      hidden: true,
      meta: { title: '选择商店' }
    },
    {
      path: '/store',
      name: 'Store',
      hidden: true,
      meta: { title: '商户导购', keepAlive: true },
      component: () => import('@/views/store/Chat.vue')
    },
    {
      path: '/salesmanChat/:id',
      hidden: true,
      meta: { title: '商户导购', keepAlive: false },
      component: () => import('@/views/store/SalesmanChat.vue')
    },
    {
      path: '/test',
      name: 'Test',
      hidden: true,
      meta: { title: '测试页面' },
      component: () => import('@/views/test/test.vue')
    },
    {
      path: '/storeHome',
      name: 'StoreHome',
      hidden: true,
      meta: { title: '关于本店', keepAlive: false },
      component: () => import('@/views/store/StoreHome.vue')
    },
    {
      path: '/idbearDesc',
      name: 'IdbearDesc',
      hidden: true,
      meta: { title: '关于熊小秘', keepAlive: false },
      component: () => import('@/views/user/IdbearDesc.vue')
    },
    {
      path: '/bindPhone',
      name: 'BindPhone',
      hidden: true,
      meta: { title: '绑定手机号', keepAlive: true },
      component: () => import('@/views/store/BindPhone.vue')
    },
    {
      path: '/shareUser',
      name: 'ShareUser',
      hidden: true,
      meta: { title: '被我分享的好友', keepAlive: false },
      component: () => import('@/views/store/ShareUser.vue')
    }
  ]
})
