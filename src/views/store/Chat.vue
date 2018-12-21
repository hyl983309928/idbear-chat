<template>
<div class="container" @click="cancelInput">
  <div class="chat-box cube">
    <!--<load-more v-if="chatList.length > 10" :show-loading="showLoading" :tip="showLoading?'加载中':'没有更多数据了'" style="margin: 0 auto;margin-top: 0.1rem;"></load-more>-->
    <BasicChat
      @on-send-message="sendMessage"
      @on-click-guide="handleClickGuideOption"
      @on-robot-image-loaded="imageLoaded"
      @on-click-evaluate="handleClickEvaluate"
      :chatList="chatList"
      :userInfo="userInfo"
      :guideList="guideList"
      :welcomeMessage="`hi～我是${robotInfo.wechataccount_name || '你'}的${industryInfoMap[robotInfo.industry] ? industryInfoMap[robotInfo.industry].robotProfession : 'AI语音助手'}${robotInfo.title}，有什么需求和问题，您都可以在这里问我噢。`"
    ></BasicChat>
  </div>
  <ChatFooter @on-send-message="sendMessage" @click-wechat="handleClickGuideOption({label: '关注公众号',type: 'wechat'})"></ChatFooter>

  <div class="share-buoy" @click="showShare = true" v-if="shareInfo.id">
    <i class="iconfont icon-donate" />
  </div>
  <popup v-model="showShare" position="top" class="popup-share-box">
    <div class="popup-share">
      <div class="share-img">
        <img src="http://storage.id-bear.com/21/Fshf-bxUOf9gVLBcel7llFMKmZrkGroup%205%20Copy.png" />
      </div>
      <div class="user-num">
        <div class="label" @click="goto('/shareUser')">已经有<a>{{shareInfo.visitor_count}}</a>个好友访问过您的分享</div>
        <x-button @click.native.stop="goto('/bindPhone')" class="btn" mini>领取礼品</x-button>
      </div>
      <div class="share-content">
         <div class="share-content-item">
          <div class="share-content-item-label">
            激励时间
          </div>
          <div class="share-content-item-content">
            {{formatDate(shareInfo.start_time, 'YYYY年MM月DD日 HH:mm:ss')}}
            -
            {{formatDate(shareInfo.end_time, 'YYYY年MM月DD日 HH:mm:ss')}}
          </div>
        </div>
        <div class="share-content-item">
          <div class="share-content-item-label">
            激励说明
          </div>
          <div class="share-content-item-content">
            {{shareInfo.descp}}
          </div>
        </div>
      </div>
    </div>
  </popup>
  <div class="back-top" @click="backTop" v-if="chatList.length > 12">
    <i class="iconfont icon-zhiding" />
  </div>
</div>
</template>

<script>
// import utils from '@/utils/common'
import { LoadMore, throttle, Popup, XButton } from 'vux'
import common from '@/utils/common'
import dayjs from 'dayjs'
import { formatDate } from '../../utils/date'
import { industryInfoMap } from '../../lib/config'
import { mapActions, mapGetters } from 'vuex'
import BusinessCard from '@/components/BusinessCard'
import ChatFooter from '@/components/ChatFooter'
import BasicChat from '@/components/BasicChat'
import commonMixin from '@/mixins/common'
import { copyString } from '../../utils/copy'

export default {
  components: {
    LoadMore,
    Popup,
    XButton,
    BusinessCard,
    ChatFooter,
    BasicChat
  },
  mixins: [commonMixin],
  data () {
    return {
      industryInfoMap,
      robotId: 0, // 机器人id
      openid: '', // 用户openid
      appid: '',
      loaded: false, // 历史聊天记录是否加载完成
      showShare: false, // 是否展示分享激励
      shareInfo: {},
      addReplyImg: true, // 是否本次回复中有图片回复，处理图片高度未知导致无法跳转至页面底部
      guideList: [],
      historyChatList: [], // 历史聊天信息
      chatList: [] // 当前聊天信息
    }
  },
  computed: {
    showLoading () {
      return this.historyChatList.length !== 0
    },
    ...mapGetters(['userInfo', 'robotInfo', 'is_miniprogram'])
  },
  created () {
    this.robotId = common.getShareParamter('robot_id')
    this.openid = common.getShareParamter('openid')
    this.appid = common.getShareParamter('appid')
    document.oncontextmenu = function (e) {
      // 阻止全局长按出现菜单事件
      e.preventDefault()
    }
    this.$http.all([this.getUserInfo(this.openid), this.getRobotInfo(this.robotId), this.getShareInfo()])
      .then(([userInfo, robotInfo]) => {
        let wechatname = robotInfo.wechataccount_name || '谷熊科技'
        this.$common.setWechatTitle(`${wechatname}-${robotInfo.title}`)
        this.countShowGuide()
        this.setShare()
      })
  },
  mounted () {
  },
  beforeRouteEnter (to, from, next) {
    // 在路由进入前时修改标题
    next(vm => {
      vm.goScollBottom()
      let wechatname = vm.robotInfo.wechataccount_name || '谷熊科技'
      vm.$common.setWechatTitle(`${wechatname}-${vm.robotInfo.title || ''}`)
    })
  },
  methods: {
    ...mapActions(['getUserInfo', 'getRobotInfo']),
    formatDate,
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
    countShowGuide () {
      try {
        this.guideList = industryInfoMap[this.robotInfo.industry].guideList.concat(industryInfoMap[this.robotInfo.industry].commonGuide)
      } catch (e) {
        this.guideList = []
      }
      // 计算是否需要展示引导
      let preDate = window.localStorage.getItem('guide-' + this.robotId)
      let nowTime = new Date().getTime()
      if (preDate) {
        let preTime = new Date(preDate).getTime()
        if (preTime + 15 * 60 * 1000 > nowTime) {
          this.getChatFromLocalstorage()
        } else {
          this.createGuide()
        }
      } else {
        this.createGuide()
      }
    },
    createGuide () {
      window.localStorage.removeItem('chat-' + this.robotId)
      let chatItem = {
        type: 'robot',
        reply_type: 'text',
        content: `欢迎光临，${this.userInfo.nickname}`
      }
      this.chatList.push(chatItem)
      let guideChat = {
        type: 'robot',
        reply_type: 'guide'
      }
      this.chatList.push(guideChat)
      this.saveChatToLocalStorage()
      this.saveVisitTime()
    },
    saveVisitTime () {
      // 保存当前用户访问时间
      this.showGuide = false
      window.localStorage.setItem('guide-' + this.robotId, dayjs().format('YYYY/MM/DD HH:mm:ss'))
    },
    handleClickGuideOption (item) {
      switch (item.type) {
        case 'text':
          let sendChat = {
            type: 'oneself',
            ask_type: 'text',
            content: item.label
          }
          this.chatList.push(sendChat)
          this.goScollBottom()
          let replyChat = {
            type: 'robot',
            reply_type: 'text',
            content: item.reply_content
          }
          this.chatList.push(replyChat)
          this.goScollBottom()
          break
        case 'businessCard':
          let oneselfChat = {
            type: 'oneself',
            ask_type: 'text',
            content: item.label
          }
          this.chatList.push(oneselfChat)
          this.goScollBottom()
          this.$api.salesman.getSalesmanInfo({robot: this.robotId})
            .then((data) => {
              let salesmanInfo = data
              let replyTextChat = {
                type: 'robot',
                reply_type: 'text',
                content: `谢谢您关注我们，欢迎随时联系我们的${salesmanInfo.position}～`
              }
              let businessCardChat = {
                type: 'robot',
                reply_type: 'businessCard',
                content: salesmanInfo
              }
              this.chatList.push(replyTextChat)
              this.goScollBottom()
              this.chatList.push(businessCardChat)
              this.goScollBottom()
              let chatRecordReplyMsg = {
                content_reply: [`谢谢您关注我们，欢迎随时联系我们的${salesmanInfo.position}～`],
                img_reply: [],
                goods_reply: [],
                card_reply: [salesmanInfo],
                store_reply: [],
                article_reply: [],
                is_reply: true
              }
              let chatRecord = {
                chat_type: '2',
                to_username: String(process.env.TO),
                from_username: this.openid,
                from_wechat_user: this.userInfo.id,
                ask_msg: item.label,
                ask_type: 1,
                is_ok: true,
                is_satisfy: '0',
                robot: this.robotId,
                reply_msg: JSON.stringify(chatRecordReplyMsg)
              }
              this.saveChatRecord2database(chatRecord)
              this.saveChatToLocalStorage()
            })
            .catch(() => {
              let replyTextChat = {
                type: 'robot',
                reply_type: 'text',
                content: `暂时获取不到名片，请稍后再试！`
              }
              this.chatList.push(replyTextChat)
              this.goScollBottom()
              this.saveChatToLocalStorage()
            })
          break
        case 'wechat':
          if (this.is_miniprogram) {
            copyString(this.robotInfo.wechataccount_name)
            this.$vux.alert.show({
              title: '公众号名称已复制',
              content: '您可到微信粘贴公众号名称搜索关注啦！'
            })
          } else {
            let sendWechatChat = {
              type: 'oneself',
              ask_type: 'text',
              content: item.label
            }
            this.chatList.push(sendWechatChat)
            this.goScollBottom()
            if (this.robotInfo.qr_code) {
              // window.location.href = this.robotInfo.biz
              let replyChat = {
                type: 'robot',
                reply_type: 'text',
                content: `您好！这是${this.robotInfo.wechataccount_name || ''}公众号二维码，长按识别关注公众号，了解更多！`
              }
              this.chatList.push(replyChat)
              this.goScollBottom()
              let replyImgChat = {
                type: 'robot',
                reply_type: 'img',
                content: this.robotInfo.qr_code
              }
              this.chatList.push(replyImgChat)
              this.goScollBottom()
            } else {
              let replyChat = {
                type: 'robot',
                reply_type: 'text',
                content: `暂时未找到该公众号！`
              }
              this.chatList.push(replyChat)
              this.goScollBottom()
            }
          }
          break
        default:
          break
      }
      this.saveChatToLocalStorage()
    },
    saveChatRecord2database (params) {
      this.$api.chat.addChatRecord(params)
    },
    handleClickChatLink (e) {
      if (e.target.nodeName === 'A' && e.target.dataset.type === 'chat') {
        let sendChat = {
          type: 'oneself',
          ask_type: 'text',
          content: e.target.innerHTML
        }
        this.chatList.push(sendChat)
        this.goScollBottom()
        this.storeSearch(e.target.innerHTML, 1)
      }
    },
    goScollBottom () {
      // 跳转至页面底部
      this.$nextTick(() => {
        var el = document.getElementsByClassName('chat-box')[0]
        el.scrollTop = el.scrollHeight
      })
    },
    saveChatToLocalStorage () {
      // 保存聊天记录到缓存里
      window.localStorage.setItem('chat-' + this.robotId, JSON.stringify(this.chatList))
    },
    getChatFromLocalstorage () {
      // 从缓存里读取聊天记录
      try {
        let list = window.localStorage.getItem('chat-' + this.robotId)
        if (list && list.length !== 0) {
          this.historyChatList = JSON.parse(list)
          this.historyChatList.map((item) => {
            item.isHistory = true
            return item
          })
        }
      } catch (e) {
        this.historyChatList = []
      }
      this.historyChatToNowChat()
    },
    historyChatToNowChat () {
      this.chatList = this.historyChatList
      this.goScollBottom()
      // 历史聊天记录加载进当前聊天记录
      // if (!this.historyFlag) {
      //   this.historyFlag = true
      //   let oldHeight = document.getElementsByClassName('chatBox')[0].offsetHeight
      //   if (this.historyChatList.length >= 15) {
      //     this.chatList = this.historyChatList.splice(-15, 15).concat(this.chatList)
      //     console.log('加载15条历史记录')
      //   } else if (this.historyChatList.length > 0) {
      //     this.chatList = this.historyChatList.concat(this.chatList)
      //     this.historyChatList = []
      //     console.log('加载到最后')
      //   }
      //   this.$nextTick(() => {
      //     if (!this.loaded) {
      //       this.goScollBottom()
      //       this.loaded = true
      //     } else {
      //       let nowHeight = document.getElementsByClassName('chatBox')[0].offsetHeight
      //       var el = document.getElementsByClassName('chat-box')[0]
      //       el.scrollTop = nowHeight - oldHeight
      //     }
      //     // setTimeout(() => { this.historyFlag = false; console.log(22222222) }, 1000)
      //     this.historyFlag = false
      //   })
      // }
    },
    monitorScroll: throttle(function (event) {
      // 监控当前滚动条位置，加载历史聊天记录
      var _this = this
      var t = event.target.scrollTop
      if (t <= 20 && _this.historyChatList.length > 0 && _this.loaded) {
        _this.historyChatToNowChat()
      } else {
      }
    }, 100),
    openWindow (url) {
      // 调至有赞商品页
      window.location.href = url
    },
    cancelInput () {
      // 使文本输入input失去焦点
      document.getElementsByClassName('footer-input')[0].blur()
    },
    setShare () {
      // 设置分享信息
      this.$wechat.ready(() => {
        let title = ''
        if (this.robotInfo.industry === 1) {
          title = `您的好友${this.userInfo.nickname}要在${this.robotInfo.wechataccount_name || '这里'}买房了，推荐您一起来看看！`
        } else {
          title = `${this.userInfo.nickname}正在撩${this.robotInfo.title}AI机器人，快来围观！`
        }
        let desc = ''
        if (this.robotInfo.industry === 1) {
          desc = `${this.userInfo.nickname}觉得这个楼盘很不错，想让您提点意见！`
        } else {
          desc = `我和这个机器人聊的很嗨哦，它有点意思，您要不要来体验一下？`
        }
        this.$share.setAppMessageShareInfo(title, desc, this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), `${window.location.origin}/wechat/web_auth?robot_id=${this.robotId}&openid=${this.openid}&appid=${this.appid}${this.shareInfo.id ? `&share=${this.shareInfo.id}` : ''}`, this.addOperationRecord)
        this.$share.setTimelineShareInfo(title, desc, this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), `${window.location.origin}/wechat/web_auth?robot_id=${this.robotId}&openid=${this.openid}&appid=${this.appid}${this.shareInfo.id ? `&share=${this.shareInfo.id}` : ''}`, this.addOperationRecord)
      })
    },
    addOperationRecord () {
      // 添加分享统计钩子
      if (!this.shareInfo.id) {
        return
      }
      let params = {
        robot: this.robotId,
        open_id: this.openid,
        share: this.shareInfo.id
      }
      this.$api.share.addShareUserStat(params)
    },

    sendMessage (data) {
      let chatItem = {
        type: 'oneself',
        ask_type: 'text',
        content: data.message,
        message_type: data.type
      }
      this.chatList.push(chatItem)
      this.goScollBottom()
      this.storeSearch(data.message, data.type)
    },
    storeSearch (content, type = 1) {
      // 通过文本（语音也转为文本）去查询商品
      this.saveVisitTime()
      let params = {
        ask_msg: content,
        robot_id: this.robotId,
        ask_type_id: type,
        from: this.openid,
        to: process.env.TO
      }
      if (this.is_miniprogram) {
        params.chat_type = 3
      } else {
        params.chat_type = 2
      }
      this.$api.store.robotSearch(params)
        .then((data) => {
          if (!data.is_reply) {
            return
          }
          if (data.content_reply && data.content_reply.length > 0) {
            data.content_reply.forEach((item) => {
              if (item) {
                let chatItem = {
                  id: data.chatrecord_id,
                  type: 'robot',
                  reply_type: 'text',
                  content: item
                }
                this.chatList.push(chatItem)
              }
            })
          }
          if (data.img_reply && data.img_reply.length > 0) {
            this.addReplyImg = true
            data.img_reply.forEach((item) => {
              if (item.url) {
                let chatItem = {
                  id: data.chatrecord_id,
                  type: 'robot',
                  reply_type: 'img',
                  content: item.url
                }
                this.chatList.push(chatItem)
              }
            })
          }
          if ((data.store_reply && data.store_reply.length > 0) || (data.article_reply && data.article_reply.length > 0) || (data.goods_reply && data.goods_reply.length > 0)) {
            let replyMaterial = {
              store_reply: data.store_reply,
              article_reply: data.article_reply,
              goods_reply: data.goods_reply
            }
            let chatItem = {
              id: data.chatrecord_id,
              type: 'robot',
              reply_type: 'material',
              content: replyMaterial
            }
            this.chatList.push(chatItem)
          }
          // 只要添加了回答，则添加一个评价
          if ((data.content_reply && data.content_reply.length > 0) || (data.img_reply && data.img_reply.length > 0) || (data.store_reply && data.store_reply.length > 0) || (data.article_reply && data.article_reply.length > 0) || (data.goods_reply && data.goods_reply.length > 0)) {
            let replyEvaluateItem = {
              id: data.chatrecord_id,
              type: 'evaluate',
              content: ''
            }
            this.chatList.push(replyEvaluateItem)
          }
          if (data.card_reply.length > 0) {
            data.card_reply.forEach((item) => {
              let businessCardChat = {
                type: 'robot',
                reply_type: 'businessCard',
                content: item
              }
              this.chatList.push(businessCardChat)
            })
          }
          this.goScollBottom()
          this.saveChatToLocalStorage()
        })
        .catch((e) => {
          console.log(e)
        })
    },
    imageLoaded () {
      if (this.addReplyImg) {
        this.addReplyImg = false
        this.goScollBottom()
      }
    },
    handleClickEvaluate ({ evaluate, item }) {
      let params = {
        is_satisfy: evaluate,
        id: item.id
      }
      this.$api.chat.updateChatRecord(params)
        .then(() => {
          item.content = evaluate
          this.saveChatToLocalStorage()
        })
    },
    backTop () {
      var el = document.getElementsByClassName('chat-box')[0]
      el.scrollTop = 0
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  @import "../../style/variate.scss";
  .container{
    width: 100%;
    /*background-image: linear-gradient(170deg,*/
      /*rgba(20, 135, 178, 1) 0%,*/
      /*rgba(34, 170, 165, 1) 100%);*/
    background-color: #f2f2f2;
    background-attachment:fixed;
    background-size: 100% 100%;
    height: 100%;
    overflow: hidden;
    color: #fff;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }

  .chat-box{
    z-index: 100;
    position: absolute;
    width: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-top: 0.3rem;
    padding-bottom: 1.6rem;
  }

  .share-buoy{
    z-index: 400;
    position: fixed;
    top: 0.2rem;
    right: 0.2rem;
    width: 0.7rem;
    height: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50% 50%;
    background:linear-gradient(168deg,rgba(255,255,255,1) 0%,rgba(235,238,245,1) 100%);
    box-shadow:0px 6px 10px 0px rgba(220,223,230,1);
    .iconfont{
      color: $red;
      font-size: 0.36rem;
    }
  }
  .popup-share-box{
    overflow-y: hidden;
    background: #fff;
    border-radius:0px 0px 0.1rem 0.1rem;
  }
  .popup-share{
    box-sizing: border-box;
    .share-img{
      width: 100%;
      font-size: 0;
      img{
        width: 100%;
      }
    }
    .user-num{
      color: $text-primary;
      border-bottom: 1px solid #DCDFE6; /*no*/
      font-size: 0.28rem;
      height: 1.18rem;
      display: flex;
      align-items: center;
      padding: 0 0.24rem;
      .label{
        flex-grow: 1;
        span{
          color: #ff4743;
        }
      }
      .btn{
        flex-grow: 0;
        padding: 0.15rem 0.2rem;
        line-height: 1;
        border-radius: 0.58rem;
        color: #fff;
        font-size: 0.28rem;
        font-weight: normal;
        background:linear-gradient(180deg,rgba(95,186,244,1) 0%,rgba(61,151,246,1) 100%);
        &:active{
          background: #66b1ff;
        }
        &:after{
          border: 0 !important;
        }
      }
    }
    .share-content{
      padding: 0.24rem;
      line-height: 1;
      font-size: 0.28rem;
      .share-content-item{
        margin-bottom: 0.26rem;
        color: $text-primary;
        &:last-child{
          margin-bottom: 0;
        }
        .share-content-item-label{
          margin-bottom: 0.1rem;
        }
        .share-content-item-content{
          color: $text-minor;
        }
      }
    }
  }
  .back-top{
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50% 50%;
    border: 1px solid #C0C4CC;
    background: rgba(255, 255, 255, 0.75);
    position: fixed;
    right: 0.2rem;
    bottom: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 400;
    .iconfont{
      color: #333;
      font-size: 0.36rem;
    }
  }
</style>
