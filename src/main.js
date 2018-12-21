// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import api from 'lib/api/api.js'
import axios from 'axios'
import common from './utils/common'
import share from 'lib/modules/share.js'
import '@/style/index.scss'
import '@/assets/font/iconfont.css'
import VueLazyload from 'vue-lazyload'
import '@/utils/flexible.js'
import wx from 'weixin-js-sdk'
import { ToastPlugin, LoadingPlugin, AlertPlugin } from 'vux'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
NProgress.configure()// NProgress Configuration
// import _ from 'lodash'
Vue.prototype.$wechat = wx
Vue.wechat = wx

Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(LoadingPlugin)
Vue.use(VueLazyload)
router.beforeEach((to, from, next) => {
  NProgress.start()
  next()
})
router.afterEach(() => {
  NProgress.done() // finish progress bar
})
// let isShare = common.getShareParamter('share')
// let appid = common.getShareParamter('appid')
// let robotId = common.getShareParamter('robot_id')
// let openId = common.getShareParamter('openid')
// if (isShare && robotId && appid) {
//   if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//     window.location.replace(`http://test.id-bear.com/wechat/web_auth?appid=${appid}&robot_id=${robotId}&openid=${openId}`)
//   } else {
//     window.location.replace(`http://wechat.xxm3.id-bear.com/wechat/web_auth?appid=${appid}&robot_id=${robotId}&openid=${openId}`)
//   }
// }

Vue.$vux.loading.show({
  text: '加载中'
})
Vue.config.productionTip = false
Vue.prototype.$api = api
Vue.prototype.$http = axios
Vue.prototype.$share = share
Vue.prototype.$common = common
// Vue.prototype.$util = axios

window.authUser = function () {
  window.localStorage.removeItem('token')
  router.push('/')
}
Vue.wechat.ready(() => {
  console.log('jssdkReady')
  Vue.wechat.startRecord({
    success: function () {
      var recordTimer = setInterval(() => {
        Vue.wechat.stopRecord({
          success () {
            Vue.$vux.loading.hide()
            clearInterval(recordTimer)
          }
        })
      }, 300)
    },
    cancel: function () {
      Vue.wechat.stopRecord()
      alert('用户拒绝授权录音')
    }
  })
  wx.miniProgram.getEnv(function (res) {
    console.log(res.miniprogram) // true
    store.commit('SET_IS_MINIPROGRAM', res.miniprogram)
  })
  // Vue.$vux.loading.hide()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
