<template>
  <div>
    <div class="page-footer" @click.stop="() => {}">
      <div class="footer-text" v-show="sendInfo.isTextInput">
        <div class="footer-icon-box">
          <div class="footer-icon-wrap" @click="onblur">
            <div class="footer-icon"></div>
          </div>
        </div>
        <form action="" class="footer-input-form">
          <input v-model="sendInfo.inputValue" type="search" @blur="onblur" @focus="onfocus"  @keydown.enter="sendText" class="footer-input" placeholder="请输入文本" />
        </form>
        <div class="footer-text-btn">
          <button @click="sendText" class="idbear-btn btn-blue" style="line-height: 0.58rem;height: 0.58rem;">发送</button>
        </div>
      </div>
      <div class="footer-record" v-if="!sendInfo.isTextInput">
        <div class="footer-icon-box">
          <div class="footer-record-icon-box" @click="showFooterInput">
            <div class="footer-record-icon"></div>
          </div>
        </div>
        <div class="footer-record-btn"
             @touchstart="footertouchstart"
             @touchmove.prevent="footertouchmove"
             @touchend="footertouchend">
          <div class="img-mask"></div>
          <img :src="[sendInfo.recording?'/static/imgs/mike-off.png':'/static/imgs/mike-on.png']" />
        </div>
        <div @click="handleFollowWechat" class="footer-record-gy-box">
          <div class="footer-record-gy">
            <div class="footer-record-gy-icon"></div>
          </div>
        </div>
      </div>
    </div>
    <transition name="fade">
      <div class="record-hint" v-show="sendInfo.recording">
        <div class="record-hint-confim" v-show="!sendInfo.isCancelSend">
          <div class="lineBox">
            <div class="lineBoxLeft">
              <div v-for="item in 9" :key="item" class="line"></div>
            </div>
            <img class="mike" src="/static/imgs/maikefeng.png" />
            <div class="lineBoxRight">
              <div v-for="item in 9" :key="item" class="line"></div>
            </div>
          </div>
          <div class="label">手指上滑，取消发送</div>
        </div>
        <div class="record-hint-cancel" v-show="sendInfo.isCancelSend">
          <img class="back" src="/static/imgs/back.png"/>
          <div class="label">松开手指，取消发送</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { throttle } from 'vux'
import { mapGetters } from 'vuex'
export default {
  components: {},
  mixins: [],
  data () {
    return {
      sendInfo: { // 聊天信息
        isTextInput: false, // 是否是文本输入
        inputValue: '', // 当前文本输入的值
        recording: false, // 是否再录音状态
        isCancelSend: false, // 是否取消录音
        stY: 0
      }
    }
  },
  computed: {
    ...mapGetters(['robotInfo'])
  },
  created () {
    this.windowHeight = document.body.clientHeight
    var u = navigator.userAgent
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
    this.isAndroid = isAndroid
    window.onresize = (event) => {
      // 在收起小键盘时取消文本输入
      if (isAndroid) {
        let h = document.body.clientHeight
        if (h === this.windowHeight) {
          this.sendInfo.isTextInput = false
        } else {
          this.sendInfo.isTextInput = true
        }
      }
    }
  },
  mounted () {},
  methods: {
    onblur () {
      // 文本输入失去焦点回调
      this.sendInfo.isTextInput = false
      clearInterval(this.focusTimer)
      clearTimeout(this.focusTimerTwo)
    },
    onfocus () {
      // 文本输入得到焦点回调
      this.sendInfo.isTextInput = true
      if (!this.isAndroid && this.$common.get_ios_version() >= 11) {
        // ios11修改了scrollTop的计算机制，暂时不做处理
      } else {
        this.focusTimer = setInterval(() => {
          document.body.scrollTop = document.body.scrollHeight
        }, 200)
      }
    },
    footertouchstart (event) {
      var _this = this
      this.isTouchend = false
      let stY = event.changedTouches[0].clientY
      this.sendInfo.stY = stY
      this.sendInfo.isCancelSend = false

      this.$wechat.startRecord({
        success () {
          // _this.$vux.toast.hide()
          if (_this.isTouchend) {
            _this.sendInfo.recording = false
            _this.recordTimer = setInterval(() => {
              _this.$wechat.stopRecord({
                success () {
                  _this.sendInfo.recording = false
                  clearInterval(_this.recordTimer)
                }
              })
            }, 300)
          } else {
            _this.sendInfo.recording = true
            _this.recordStartTime = new Date().getTime()
          }
        },
        cancel: function () {
          _this.$wechat.stopRecord()
          alert('用户拒绝授权录音')
        }
      })
      this.$wechat.onVoiceRecordEnd({
        complete: function (res) {
          let localId = res.localId
          _this.sendInfo.recording = false
          let duration = 60000
          _this.$vux.toast.show({
            text: '录音时间已超过60S，已自动结束',
            type: 'text',
            time: 1000,
            onHide () {
              console.log(localId + duration)
            }
          })
        }
      })
    },
    footertouchmove: throttle(function (event) {
      // 手指滑动中
      if (!this.sendInfo.recording) {
        return
      }
      let nowY = event.changedTouches[0].clientY
      if (nowY < document.body.clientHeight - document.body.clientWidth / 3.75 * 0.49 - 30) {
        this.sendInfo.isCancelSend = true
      } else {
        this.sendInfo.isCancelSend = false
      }
    }, 100),
    footertouchend (event) {
      // 手指松开，录音结束
      // this.$vux.toast.hide()
      this.isTouchend = true
      if (!this.sendInfo.recording) {
        return
      }
      var _this = this
      let nowY = event.changedTouches[0].clientY
      let localId
      let duration = new Date().getTime() - _this.recordStartTime
      if (duration < 500) {
        _this.sendInfo.recording = false
        _this.$vux.toast.show({
          text: '录音过短',
          type: 'warn',
          time: 1000
        })
        _this.recordTimer = setInterval(() => {
          _this.$wechat.stopRecord({
            success () {
              _this.sendInfo.recording = false
              clearInterval(_this.recordTimer)
            }
          })
        }, 300)
        return
      }

      _this.$wechat.stopRecord({
        success (res) {
          clearInterval(_this.recordTimer)
          localId = res.localId
          _this.sendInfo.recording = false
          let duration = new Date().getTime() - _this.recordStartTime
          if (nowY < document.body.clientHeight - document.body.clientWidth / 3.75 * 0.49 - 30) {
            return
          }
          _this.addRecodeChat(localId, duration)
        }
      })
    },
    addRecodeChat (localId, duration) {
      // 发送语音后添加至聊天
      var _this = this
      _this.$wechat.translateVoice({
        localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得
        isShowProgressTips: 1,
        success: function (data) {
          if (!data.translateResult) {
            _this.$vux.alert.show({
              title: '提示',
              content: '未检测到语音输入，请重新输入'
            })
            return
          }
          _this.$emit('on-send-message', { message: data.translateResult, type: 3 })
          // let chatItem = {
          //   type: 'oneself',
          //   ask_type: 'sound',
          //   content: data.translateResult,
          //   duration: duration,
          //   isPlay: false,
          //   localId: localId
          // }
          // let chatItem = {
          //   type: 'oneself',
          //   ask_type: 'text',
          //   content: data.translateResult
          // }
          // _this.chatList.push(chatItem)
          // _this.goScollBottom()
          // _this.storeSearch(data.translateResult, 3)
        },
        fail (e) {
          _this.$vux.alert.show({
            title: '提示',
            content: '未检测到语音输入，请重新输入'
          })
        }
      })
    },
    sendText () {
      if (!this.sendInfo.inputValue) {
        return
      }
      // 发送文本
      var content = this.sendInfo.inputValue ? this.sendInfo.inputValue : ''
      this.$emit('on-send-message', { message: content, type: 1 })
      // let chatItem = {
      //   type: 'oneself',
      //   ask_type: 'text',
      //   content: content
      // }
      // this.chatList.push(chatItem)
      // this.goScollBottom()
      this.sendInfo.inputValue = ''
      document.getElementsByClassName('footer-input')[0].blur()
      // this.storeSearch(content, 1)
    },
    showFooterInput (event) {
      // 点击键盘，展示文本输入框
      this.sendInfo.inputValue = ''
      this.sendInfo.isTextInput = true
      setTimeout(() => {
        document.getElementsByClassName('footer-input')[0].focus()
      }, 100)
    },
    handleFollowWechat () {
      this.$emit('click-wechat')
      // if (this.robotInfo.biz) {
      //   window.location.href = this.robotInfo.biz
      // }
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  @import "../style/variate.scss";
  .page-footer{
    width:100%;
    height: 0.98rem;
    background-color: #fff;
    z-index: 494;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    .hotspot-hint{
      position: absolute;
      white-space: nowrap;
      top: -1.3rem;
      left: 0;
      width:100%;
      .hotspot-hint-item-box{
        padding: 0.4rem 0;
        display: inline-block;
      }
      .hotspot-hint-item{
        padding: 0rem 0.3rem;
        display: inline-block;
        color: #666;
        background: #f0f0f9;
        border: solid 1px rgba(153, 153, 153, 0.8);
        font-size: 0.22rem;
        height: 0.44rem;
        line-height: 0.44rem;
        border-radius: 0.22rem;
        margin-right: 0.2rem;
        &:first-child{
          margin-left: 0.26rem;
        }
        &:last-child{
          margin-right: 0.26rem;
        }
        &:active{
          background: #ccc;
        }
      }
    }
    .footer-text{
      display: flex;
      align-items: center;
      width: 100%;
      height: 0.98rem;
      .footer-icon-box{
        flex-grow: 0;
        height: 0.98rem;
        padding: 0 0.15rem 0 0.3rem;
        display: inline-flex;
        align-items: center;
        z-index: 99;
        .footer-icon-wrap{
          width: 0.58rem;
          font-size: 0;
          display: inline-block;
          .footer-icon{
            width: 0.58rem;
            height: 0.58rem;
            overflow: hidden;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% 50%;
            background: url("/static/imgs/yy-off.png");
            background-size: 100% 100%;
            &:active{
              background: url("/static/imgs/yy-on.png");
              background-size: 100% 100%;
            }
          }
        }
      }
      .footer-text-btn{
        flex-grow: 0;
        padding: 0 0.2rem 0 0.15rem;
      }
      .footer-input-form{
        flex-grow: 1;
      }
      .footer-input{
        width: 100%;
        font-size: 0.28rem;
        height: 0.58rem;
        background-color: #fff;
        border: 0;
        border-bottom: solid 1px #3D97F6; /*no*/
        outline:none;
        color: #333;
        padding: 0 0.1rem;
        -webkit-appearance: none;
      }
      .footer-input::-webkit-search-cancel-button {
        display: none;
      }
      .footer-input::-webkit-input-placeholder {
        color: #999;
      }
    }

    .footer-record{
      z-index: 999;
      display: flex;
      .footer-icon-box{
        flex-grow: 0;
        width: 1.18rem;
        height: 0.98rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 99;
        .footer-record-icon-box{
          width: 0.58rem;
          display: inline-block;
          font-size: 0;
          .footer-record-icon{
            width: 0.58rem;
            height: 0;
            padding-bottom: 100%;
            display: inline-block;
            position: relative;
            overflow:hidden;
            background: url("/static/imgs/jp-off.png");
            background-size: 100% 100%;
            &:active{
              background: url("/static/imgs/jp-on.png");
              background-size: 100% 100%;
            }
          }
        }
      }
      .footer-record-btn{
        flex-grow: 1;
        height: 0.98rem;
        position: relative;
        text-align: center;
        .img-mask{
          width: 1.24rem;
          height: 1.24rem;
          position: absolute;
          right: 50%;
          bottom: 0.1rem;
          transform: translateX(50%);
          display: inline-block;
          z-index: 100;
        }
        img{
          width: 1.24rem;
          height: 1.24rem;
          position: absolute;
          right: 50%;
          bottom: 0.1rem;
          transform: translateX(50%);
        }
      }

      .footer-record-gy-box{
        flex-grow: 0;
        width: 1.18rem;
        height: 0.98rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 99;
        color: #fff;
        .footer-record-gy{
          width: 0.58rem;
          display: inline-block;
          font-size: 0;
          .footer-record-gy-icon{
            width: 0.58rem;
            height: 0;
            padding-bottom: 100%;
            display: inline-block;
            overflow:hidden;
            background: url("/static/imgs/guanzhu.png");
            background-size: 100% 100%;
            &:active{
              background: url("/static/imgs/guanzhu-on.png");
              background-size: 100% 100%;
            }
          }
        }
      }
    }
  }
  [data-dpr="1"] .line {
    width: 2px; /*no*/
    margin-right: 2px; /*no*/
    border-radius: 1px; /*no*/
  }
  [data-dpr="2"] .line {
    width: 3px; /*no*/
    margin-right: 3px; /*no*/
    border-radius: 1.5px; /*no*/
  }

  [data-dpr="3"] .line {
    width: 4px; /*no*/
    margin-right: 4px; /*no*/
    border-radius: 2px; /*no*/
  }
  .record-hint{
    padding: 0 0.2rem;
    min-width: 2.4rem;
    height: 2.4rem;
    background: #5f6064;
    border: solid 1px rgba(91, 91, 91, 0.7);
    border-radius: 0.1rem;
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%,-50%);
    transition: 0.3s all;
    z-index: 2000;
    text-align: center;
    .lineBox{
      margin-top: 0.7rem;
      margin-bottom: 0.5rem;
      display: flex;
      height: 0.5rem;
      justify-content: center;
      .lineBoxLeft{
        display: flex;
        align-items: center;
        flex-grow: 0;
        height: 0.5rem;

        .line{
          animation: equalize 3s 0s infinite;
          background: #fff;
          display: inline-block;
          &:nth-child(1){
            height: 0.08rem;
            animation-delay: 1.2s;
          }
          &:nth-child(2){
            height: 0.16rem;
            animation-delay: 1.1s;
          }
          &:nth-child(3){
            height: 0.24rem;
            animation-delay: 1s;
          }
          &:nth-child(4){
            height: 0.16rem;
            animation-delay: 0.9s;
          }
          &:nth-child(5){
            height: 0.08rem;
            animation-delay: 0.8s;
          }
          &:nth-child(6){
            height: 0.16rem;
            animation-delay: 0.7s;
          }
          &:nth-child(7){
            height: 0.24rem;
            animation-delay: 0.6s;
          }
          &:nth-child(8){
            height: 0.16rem;
            animation-delay: 0.5s;
          }
          &:nth-child(9){
            height: 0.08rem;
            animation-delay: 0.4s;
          }
        }
      }
      .lineBoxRight {
        display: flex;
        align-items: center;
        flex-grow: 0;
        height: 0.5rem;

        .line{
          animation: equalize 3s 0s infinite;
          background: #fff;
          display: inline-block;
          &:nth-child(9){
            height: 0.08rem;
            animation-delay: 1.2s;
          }
          &:nth-child(8){
            height: 0.16rem;
            animation-delay: 1.1s;
          }
          &:nth-child(7){
            height: 0.24rem;
            animation-delay: 1s;
          }
          &:nth-child(6){
            height: 0.16rem;
            animation-delay: 0.9s;
          }
          &:nth-child(5){
            height: 0.08rem;
            animation-delay: 0.8s;
          }
          &:nth-child(4){
            height: 0.16rem;
            animation-delay: 0.7s;
          }
          &:nth-child(3){
            height: 0.24rem;
            animation-delay: 0.6s;
          }
          &:nth-child(2){
            height: 0.16rem;
            animation-delay: 0.5s;
          }
          &:nth-child(1){
            height: 0.08rem;
            animation-delay: 0.4s;
          }
        }
      }
      .mike{
        width: 0.34rem;
        height: 0.58rem;
        margin: 0 0.14rem;
      }
    }
    .back{
      width:0.8rem;
      height: 0.98rem;
      margin-top: 0.38rem;
    }
    .label{
      font-size: 0.24rem;
      position: absolute;
      bottom: 0.30rem;
      display: block;
      text-align: center;
      width: 100%;
      left: 0;
    }
  }
  @keyframes equalize {
    0%{
      transform: scaleY(1);
    }
    10%{
      transform: scaleY(1.2);
    }
    20%{
      transform: scaleY(1);
    }
    30%{
      transform: scaleY(1.2);
    }
    40%{
      transform: scaleY(1);
    }
    45%{
      transform: scaleY(1.5);
    }
    50%{
      transform: scaleY(1);
    }
    60%{
      transform: scaleY(1);
    }
    70%{
      transform: scaleY(1);
    }
    80%{
      transform: scaleY(1.5);
    }
    90%{
      transform: scaleY(1);
    }
    95%{
      transform: scaleY(1.2);
    }
    100%{
      transform: scaleY(1);
    }
  }
</style>
