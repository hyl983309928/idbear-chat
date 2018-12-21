import { apiRequest } from '@/utils/request.js'

/*
* /api 转到http://test.id-bear.com:6002 正式http://aip.id-bear.com:8000
* /wxapi 转到当前域名
* 其余为API_ROOT
*/

export default {
  user: {
    /*
    * desc: 得到微信jssdk授权相关信息
    * */
    getjsapi () {
      var appid = 'wx54b7efc6223c6973'
      if (process.env.NODE_ENV === 'production') {
        appid = 'wx54b7efc6223c6973'
      } else {
        appid = 'wxc59b077d6c26e6ff'
      }
      var params = {
        app_url: window.location.href,
        appid: appid
      }
      return apiRequest('/wxapi/wechat/jsapi', 'get', params)
    },
    /*
    * desc: 得到访客用户信息
    * params openid: 访客用户openid
    * */
    getUserInfo (openid) {
      let params = { openid, format: 'json', third_part_platform: 1 }
      // if (process.env.NODE_ENV === 'production') {
      //   params.third_part_platform = 1
      // } else {
      //   params.third_part_platform = 2
      // }
      params.third_part_platform = 2
      return apiRequest('/wechatuser/', 'get', params)
    },
    getRobotInfo (robotId) {
      return apiRequest('/robot/detail/', 'get', { robot_id: robotId })
    },
    smscode (mobile, type) {
      let params = {
        mobile
      }
      if (type === 'bind') {
        params.template_code = 'SMS_135029793'
      }
      return apiRequest('/smscode/', 'post', params)
    },
    /*
    * desc: 绑定手机号到微信用户上
    * */
    bindMobileToWechat (params) {
      return apiRequest('/bindmobiletowechat/', 'post', params)
    }
  },
  share: {
    getShareInfo (params) {
      return apiRequest('/h5share/', 'get', params)
    },
    addShareUserStat (params) {
      return apiRequest('/h5shareuser/', 'get', params)
    }
  },
  salesman: {
    getSalesmanInfo (params) {
      return apiRequest('/h5aicard/', 'get', params)
    },
    addSalesmanStat (params) {
      return apiRequest('/aicarduser/', 'post', params)
    }
  },
  chat: {
    updateChatRecord (params) {
      return apiRequest(`/h5chatrecord/${params.id}/`, 'put', params)
    },
    addChatRecord (params) {
      return apiRequest(`/h5chatrecord/?robot=${params.robot}`, 'post', params)
    }
  },
  stat: { // 统计接口
    /*
    * desc: 分享统计接口
    * params openid: 用户openid
    * params mallid: 店铺mallid
    * */
    addOperationRecord (openid, mallid) {
      return apiRequest('/hfiveoperationrecord/', 'post', { operate_user_openid: openid, mall: mallid, operation_type: 1 })
    }
  },
  store: {
    robotSearch (params) {
      return apiRequest('/search/h5/', 'get', params)
    }
  }
}
