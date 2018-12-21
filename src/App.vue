<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"/>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    getJSSDK () {
      this.$api.user.getjsapi()
        .then((data) => {
          let appid = this.$common.getShareParamter('appid')
          if (!appid) {
            appid = 'wx54b7efc6223c6973'
          }
          const permissions = ['updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'getLocation', 'startRecord', 'translateVoice', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'uploadImage', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow']
          let wxConfig = {
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: appid, // 必填，公众号的唯一标识
            timestamp: data.timestamp, // 必填，生成签名的时间戳
            nonceStr: data.nonceStr, // 必填，生成签名的随机串
            signature: data.signature, // 必填，签名
            jsApiList: permissions // 必填，需要使用的JS接口列表
          }
          this.$wechat.config(wxConfig)
        })
        .catch(() => {
        })
    }
  },
  watch: {
    '$route': function (val) {
      this.getJSSDK()
    }
  }
}
</script>

<style lang="less">
  #app {
    height: 100%;
    width: 100%;
  }
  @import '~vux/src/styles/close.less';
  @import '~vux/src/styles/1px.less';
</style>
