<template>
<div class="page">
  <div>
    <div v-if="!isBindMobile" class="bind-phone-input">
      <div class="title">绑定手机号</div>
      <group class="input-box">
        <x-input ref="mobile" required v-model="mobile" class="weui-vcode" :max="13" is-type="china-mobile" placeholder="请输入手机号">
        </x-input>
        <x-input ref="code" required v-model="code" class="weui-vcode" placeholder="请输入验证码">
          <template slot="right">
            <a class="send-code" v-if="!sendMsgInfo.isSend" @click="sendCode">获取验证码</a>
            <span class="send-code" style="color: #666;" v-if="sendMsgInfo.isSend">{{`已发送(${sendMsgInfo.time}秒)`}}</span>
          </template>
        </x-input>
      </group>
      <div class="confim-btn">
        <x-button @click.native="submitMobile" class="btn">确定</x-button>
      </div>
    </div>
    <div class="success-bind-phone" v-else>
      <img src="http://storage.id-bear.com/21/Fmq_75Kbvlx2a2Qe_Y5ZBu01ZcXVGroup%204%20Copy.png" />
    </div>
  </div>
  <div class="info-box">
    <div class="info-desc">
      {{shareInfo.descp}}
    </div>
    <div class="info-phone">
      咨询电话：（一键拨打）<br />
      <a :href="`tel:${shareInfo.mobile}`">{{shareInfo.mobile}}</a>
    </div>
  </div>
  <!--<div class="bind-success-box" v-else>-->
    <!--<div>-->
      <!--<icon class="success-icon" type="success" is-msg></icon>-->
    <!--</div>-->
    <!--<div class="success-text">-->
      <!--验证成功-->
    <!--</div>-->
    <!--<div class="success-desc">-->
      <!--{{ type=='express' ? '绑定成功，请返回重新查询！' : '满足条件后，店主会尽快联系您领取！' }}-->
    <!--</div>-->
    <!--<div class="back-btn">-->
      <!--<x-button @click.native="back" class="btn">返回</x-button>-->
    <!--</div>-->
  <!--</div>-->
</div>
</template>

<script>
import { XInput, Group, XButton, Icon } from 'vux'
import { mapActions, mapGetters } from 'vuex'
import common from '@/utils/common'
export default {
  components: {
    Group,
    XInput,
    XButton,
    Icon
  },
  data () {
    return {
      robotId: 0, // 机器人id
      openid: '', // 用户openid
      isBindMobile: false,
      mobile: '',
      code: '',
      sendMsgInfo: {
        isSend: false,
        time: 60
      },
      shareInfo: {}
    }
  },
  computed: {
    ...mapGetters(['userInfo'])
  },
  created () {
    this.robotId = common.getShareParamter('robot_id')
    this.openid = common.getShareParamter('openid')
    this.$http.all([this.getUserInfo(this.openid), this.getShareInfo()])
      .then(([data]) => {
        if (data.mobile) {
          this.$common.setWechatTitle('激励说明')
          this.isBindMobile = true
        }
      })
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$common.setWechatTitle(to.meta.title)
    })
  },
  methods: {
    ...mapActions(['getUserInfo']),
    getShareInfo () {
      let params = {
        robot: this.robotId,
        open_id: this.openid
      }
      return this.$api.share.getShareInfo(params)
        .then((data) => {
          this.shareInfo = data
        })
        .catch(() => {
          this.shareInfo = {}
        })
    },
    back () {
      if (this.type) {
        this.$wechat.closeWindow()
      } else {
        this.$router.go(-1)
      }
    },
    submitMobile () {
      this.$refs.mobile.onBlur()
      this.$refs.code.onBlur()
      if (this.mobile && this.code) {
        let params = {
          mobile: this.mobile,
          code: this.code,
          openid: this.$common.getShareParamter('openid')
        }
        this.$api.user.bindMobileToWechat(params)
          .then(() => {
            this.isBindMobile = true
          })
          .catch((err) => {
            if (err.message.toString().indexOf('timeout') === -1 && err.message !== 'Network Error') {
              let errMsg = '添加失败，请重试'
              Object.keys(err.response.data).forEach((key) => {
                if (Object.prototype.toString.call(err.response.data[key]) === '[object Array]') {
                  errMsg = err.response.data[key][0]
                } else {
                  errMsg = err.response.data[key]
                }
                return ''
              })
              this.$vux.toast.show({
                text: errMsg,
                type: 'text',
                width: '14em'
              })
            }
          })
      }
    },
    sendCode () {
      this.$api.user.smscode(this.mobile, 'bind')
        .then((data) => {
          this.$vux.toast.show({
            text: '发送成功',
            type: 'text'
          })
          this.sendMsgInfo.isSend = true
          this.sendMsgInfo.time = 60
          let timer = setInterval(() => {
            this.sendMsgInfo.time -= 1
            if (this.sendMsgInfo.time === 0) {
              this.sendMsgInfo.isSend = false

              clearInterval(timer)
            }
          }, 1000)
        })
        .catch((err) => {
          if (err.message.toString().indexOf('timeout') === -1 && err.message !== 'Network Error') {
            let errMsg = '发送失败，请重试'
            Object.keys(err.response.data).forEach((key) => {
              errMsg = err.response.data[key][0]
              return ''
            })
            this.$vux.toast.show({
              text: errMsg,
              type: 'text',
              width: '14em'
            })
          }
        })
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  @import "../../style/variate.scss";
  .page{
    background: #fff;
    min-height: 100%;
    position: relative;
    overflow: hidden;
    font-size: 0.28rem;
    /deep/ .weui-cells{
      font-size: 0.28rem;
    }
    /deep/ .weui-cells:before{
      height: 0;
      border-top: 0;
    }
    /deep/ .weui-cells:after{
      bottom: 1px; /*no*/
    }
    .title{
      text-align: center;
      margin-top: 0.6rem;
    }
  }
  .bind-phone-input{
    width: 5.5rem;
    margin: 0 auto;
    .input-box{
    }
    .send-code{
      font-size: 0.24rem;
    }
    .confim-btn{
      margin-top: 0.6rem;
      text-align: center;
      padding: 0 0.2rem;
      .btn{
        font-size: 0.28rem;
        height: 0.7rem;
        line-height: 0.7rem;
        border-radius: 0.35rem;
        background:linear-gradient(180deg,rgba(95,186,244,1) 0%,rgba(61,151,246,1) 100%);
        color: #fff;
        border: 0;
        &:active{
          background: #66b1ff;
          color: #fff;
        }
      }
    }
  }
  .success-bind-phone{
    text-align: center;
    margin-top: 0.87rem;
    img{
      width: 2.48rem;
    }
  }
  .info-box{
    color: $text-common;
    font-size: 0.24rem;
    line-height:0.34rem;
    width: 5.5rem;
    margin: 0 auto;
    margin-top: 0.6rem;
    .info-desc{
      margin-bottom: 0.2rem;
    }
    .info-phone{}
  }

</style>
