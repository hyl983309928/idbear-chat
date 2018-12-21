<template>
  <div class="container" @click="cancelInput">
    <div class="chat-box-wrap">
      <div class="business-card-box">
        <BusinessCard :salesmanInfo="salesmanInfo"></BusinessCard>
      </div>
      <BasicChat
        @on-send-message="sendMessage"
        @on-click-guide="handleClickGuideOption"
        @on-robot-image-loaded="imageLoaded"
        @on-click-evaluate="handleClickEvaluate"
        :chatList="chatList"
        :userInfo="userInfo"
        :guideList="guideList"
        :otherHead="salesmanInfo.sex == 1 ? 'http://storage.id-bear.com/21/FujvJdmL6I9pW9kEUkMND3ip8w1N%E5%A4%B4%E5%83%8F1%20copy%203.png' : 'http://storage.id-bear.com/21/Fmpt7F-kGqlSHU4KrIRH8t4uWCI1%E5%A4%B4%E5%83%8F2%20copy.png'"
        :welcomeMessage="`hi～我是${robotInfo.wechataccount_name ? robotInfo.wechataccount_name + '的' : ''}${salesmanInfo.position}${salesmanInfo.real_name}，有什么需求和问题，您都可以在这里问我噢。`"
      ></BasicChat>
      <button id="copyBtn" :data-clipboard-text="salesmanInfo.wx_num" style="display: none;">{{salesmanInfo.wx_num}}</button>
    </div>
    <ChatFooter @on-send-message="sendMessage" @click-wechat="handleClickGuideOption({label: '关注公众号',type: 'wechat'})"></ChatFooter>
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
  data () {
    return {
      robotId: 0, // 机器人id
      openid: '', // 用户openid
      appid: '',
      salesmanId: '',
      loaded: false, // 历史聊天记录是否加载完成
      addReplyImg: true, // 是否本次回复中有图片回复，处理图片高度未知导致无法跳转至页面底部
      guideList: [],
      historyChatList: [], // 历史聊天信息
      chatList: [], // 当前聊天信息
      salesmanInfo: {}
    }
  },
  computed: {
    showLoading () {
      return this.historyChatList.length !== 0
    },
    ...mapGetters(['userInfo', 'robotInfo'])
  },
  created () {
    this.robotId = common.getShareParamter('robot_id')
    this.openid = common.getShareParamter('openid')
    this.appid = common.getShareParamter('appid')
    this.salesmanId = this.$route.params.id
    this.addSalesmanStat()
    document.oncontextmenu = function (e) {
      // 阻止全局长按出现菜单事件
      e.preventDefault()
    }
    this.$http.all([this.getUserInfo(this.openid), this.getRobotInfo(this.robotId)])
      .then(([userInfo, robotInfo]) => {
        this.getSalesmanInfo()
        this.countShowGuide()
        // this.createCopy()
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
    addSalesmanStat () {
      let params = {
        robot: this.robotId,
        business_card: this.salesmanId,
        open_id: this.openid
      }
      this.$api.salesman.addSalesmanStat(params)
        .then(() => {
        })
        .catch(() => {})
    },
    getSalesmanInfo () {
      let params = {
        robot: this.robotId,
        aicard: this.salesmanId
      }
      this.$api.salesman.getSalesmanInfo(params)
        .then((data) => {
          this.salesmanInfo = data
          let wechatname = this.robotInfo.wechataccount_name || '谷熊科技'
          this.$common.setWechatTitle(`${wechatname}-${this.salesmanInfo.real_name}`)
        })
    },
    // createCopy () {
    //   let clipboard = new ClipboardJS('#copyBtn')
    //   clipboard.on('success', (e) => {
    //   })
    // },
    countShowGuide () {
      try {
        this.guideList = industryInfoMap[this.robotInfo.industry].guideList.concat(industryInfoMap[this.robotInfo.industry].salesmanGuide)
      } catch (e) {
        this.guideList = []
      }
      // 计算是否需要展示引导
      let preDate = window.localStorage.getItem(`salesman-guide-${this.robotId}-${this.salesmanId}`)
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
      window.localStorage.removeItem(`salesman-chat-${this.robotId}-${this.salesmanId}`)
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
      window.localStorage.setItem(`salesman-guide-${this.robotId}-${this.salesmanId}`, dayjs().format('YYYY/MM/DD HH:mm:ss'))
    },
    saveChatToLocalStorage () {
      // 保存聊天记录到缓存里
      // if (this.chatList.length > 60) {
      //   this.chatList.splice(0, 20)
      // }
      window.localStorage.setItem(`salesman-chat-${this.robotId}-${this.salesmanId}`, JSON.stringify(this.chatList))
    },
    getChatFromLocalstorage () {
      // 从缓存里读取聊天记录
      try {
        let list = window.localStorage.getItem(`salesman-chat-${this.robotId}-${this.salesmanId}`)
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
      // 历史聊天记录加载进当前聊天记录
      this.chatList = this.historyChatList
      this.goScollBottom()
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
        case 'copyWechatNum':
          let copyChatOneself = {
            type: 'oneself',
            ask_type: 'text',
            content: item.label
          }
          this.chatList.push(copyChatOneself)
          this.goScollBottom()
          copyString(this.salesmanInfo.wx_num)
          let copyChatRobot = {
            type: 'robot',
            reply_type: 'text',
            content: `我的微信号：${this.salesmanInfo.wx_num}已复制，您可以到微信添加好友粘贴账号，加我为好友啦！`
          }
          this.chatList.push(copyChatRobot)
          this.goScollBottom()
          break
        case 'saveBusinessCard':
          let saveChatOneself = {
            type: 'oneself',
            ask_type: 'text',
            content: item.label
          }
          this.chatList.push(saveChatOneself)
          this.goScollBottom()
          let saveChatRobot = {
            type: 'robot',
            reply_type: 'text',
            content: `这是我的AI电子名片，长按图片保存，欢迎分享！`
          }
          this.chatList.push(saveChatRobot)
          this.goScollBottom()
          let posterSalesmanInfo = this.salesmanInfo
          let posterChat = {
            type: 'robot',
            reply_type: 'businessCardPoster',
            content: posterSalesmanInfo
          }
          this.chatList.push(posterChat)
          this.goScollBottom()
          let chatRecordReplyMsg = {
            content_reply: ['这是我的AI电子名片，长按图片保存，欢迎分享！'],
            img_reply: [],
            goods_reply: [],
            card_reply: [],
            store_reply: [],
            article_reply: [],
            card_poster_reply: [posterSalesmanInfo],
            is_reply: true
          }
          let chatRecord = {
            carduser: posterSalesmanInfo.id,
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
        var el = document.getElementsByClassName('chat-box-wrap')[0]
        el.scrollTop = el.scrollHeight
      })
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
        this.$share.setAppMessageShareInfo(title, desc, this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), `${window.location.origin}/wechat/web_auth?robot_id=${this.robotId}&appid=${this.appid}&business_card=${this.salesmanId}`)
        this.$share.setTimelineShareInfo(title, desc, this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), `${window.location.origin}/wechat/web_auth?robot_id=${this.robotId}&appid=${this.appid}&business_card=${this.salesmanId}`)
      })
    },
    goto (url, obj) {
      // 跳转路由
      var arr = window.location.href.split('?')
      var param = ''
      if (arr.length > 2) {
        param = arr[2]
      } else if (arr.length > 1) {
        param = arr[1]
      }
      if (obj) {
        param += `&obj=${encodeURIComponent(JSON.stringify(obj))}`
      }
      this.$router.push(`${url}?${param}`)
    },
    sendMessage (data) {
      console.log(data)
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
        to: process.env.TO,
        business_card: this.salesmanId
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
      var el = document.getElementsByClassName('chat-box-wrap')[0]
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
  .chat-box-wrap{
    z-index: 100;
    position: absolute;
    width: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 1.6rem;
  }
  .business-card-box{
    width: 100%;
    z-index: 103;
    display: flex;
    justify-content: center;
    padding: 0.4rem 0;
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
