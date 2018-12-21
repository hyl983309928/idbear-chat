<template>
<div class="container" @click="cancelInput">

  <div class="store-option" v-if="chatList.length == 0">
    <div class="store-option-welcome">
      {{robotInfo.content}}
    </div>
    <div class="store-option-info">
      <!--<div class="store-option-info-text">提示</div>-->
      <div class="store-option-info-content">
        <div v-for="(item,index) in hintList" :key="index">
          <div class="store-option-info-content-item" @click="sendHotspot(item)">
            {{ item.title }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="chat-box cube" @scroll="monitorScroll" v-show="chatList.length != 0">
    <div class="chatBox">
    <load-more v-if="chatList.length > 10" :show-loading="showLoading" :tip="showLoading?'加载中':'没有更多数据了'"></load-more>
    <template v-for="(item,index) in chatList">
      <div class="chat-oneself" v-if="item.type == 'oneself'" :key="index">
        <template v-if="item.ask_type == 'text'">
          <div class="chat-text">{{item.content}}</div>
          <img class="head-img" v-if="userInfo && userInfo.headimgurl" :src="userInfo.headimgurl" />
        </template>
        <!--<template v-else-if="item.ask_type == 'sound'">-->
          <!--<div class="chat-audio-box" @click="playAudio(item)" v-if="!item.isHistory">-->
            <!--<div class="duration">{{Math.ceil(item.duration/1000)}}"</div>-->
            <!--<div :class="[item.isPlay?'chat-audio-play':'chat-audio-pause']"></div>-->
            <!--&lt;!&ndash;<audio :src="item.content"></audio>&ndash;&gt;-->
          <!--</div>-->
          <!--<div class="chat-text" v-else>{{item.content}}</div>-->
          <!--<img class="head-img" v-if="userInfo && userInfo.headimgurl" :src="userInfo.headimgurl" />-->
        <!--</template>-->
      </div>

      <div v-if="item.type == 'robot'" :key="index">
        <div class="chat-other" v-if="item.reply_type == 'text'">
          <img class="head-img" :src="robotInfo.avatar ? robotInfo.avatar : '/static/imgs/logo1.jpg'" />
          <div class="chat-text" v-html="handleTextNewline(extractTextAHtml(item.content))"></div>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'img'">
          <img class="head-img" :src="robotInfo.avatar ? robotInfo.avatar : '/static/imgs/logo1.jpg'" />
          <img class="chat-img" @load="imageLoaded" v-lazy="item.content" @click="previewImage(item.content)" />
        </div>
        <div class="chat-card" v-if="item.reply_type == 'material'" :key="index">
          <template v-if="item.content">
            <div class="chat-card-less">
              <div class="chat-card-less-item" v-for="(cardItem,cardIndex) in item.content" :key="cardIndex" @click="openWindow(cardItem.url)">
                <div class="chat-card-less-item-img">
                  <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x340/gravity/Center/crop/340x340'" />
                </div>
                <div class="chat-card-less-item-info">
                  <div class="chat-card-less-item-title">
                    {{cardItem.title}}
                  </div>
                  <template v-if="cardItem.type === 'store'">
                    <div class="chat-card-less-item-label">
                      <div class="chat-card-less-item-label-item" v-for="tag in formatLabel(cardItem.tags)" :key="tag">
                        {{tag}}
                      </div>
                    </div>
                  </template>
                  <div class="chat-card-less-item-other">
                    <template v-if="cardItem.type === 'good'">
                      <div class="chat-card-less-item-price">
                        <span>￥</span>{{cardItem.price/100}}
                      </div>
                      <div class="chat-card-less-item-sold">
                        已售 <span>{{cardItem.sold_num?cardItem.sold_num:0}}</span> 件
                      </div>
                    </template>
                    <template v-if="cardItem.type === 'article'">
                      <div class="chat-card-less-item-time">
                        文章发表时间<br />
                        {{formatDate(cardItem.send_date)}}
                      </div>
                    </template>
                    <template v-if="cardItem.type === 'store'">
                      <div class="chat-card-less-item-avg-price">
                        人均 <span>{{cardItem.avg_price}}</span> 元
                      </div>
                      <div class="chat-card-less-item-location">
                        {{ formatterLocation(cardItem) }}
                      </div>
                    </template>
                    <div class="chat-card-less-item-icon" :style="{ borderColor: materialType[cardItem.type].color }">
                      <i :class="materialType[cardItem.type].icon" :style="{ color: materialType[cardItem.type].color }"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <!--<template v-else>-->
            <!--<div class="chat-card-much" v-if="item.content">-->
              <!--<div class="chat-card-much-item-box">-->
                <!--<div class="chat-card-much-item" v-for="(cardItem,cardIndex) in item.content" :key="cardIndex" @click="openWindow(cardItem.url)">-->
                  <!--<div class="chat-card-much-item-img">-->
                    <!--<img v-lazy="cardItem.image" />-->
                  <!--</div>-->
                  <!--<div class="chat-card-much-item-info">-->
                    <!--<div class="chat-card-much-item-info-title">{{cardItem.title}}</div>-->
                  <!--</div>-->
                <!--</div>-->
              <!--</div>-->
            <!--</div>-->
          <!--</template>-->

        </div>
      </div>

    </template>
    </div>
  </div>
  <div class="page-footer" @click.stop="() => {}">

   <!--<div class="hotspot-hint">-->
     <!--<div class="hotspot-hint-item-box"-->
          <!--v-if="chatList.length != 0 && !showGuide"-->
          <!--:style="{'transform': 'translateX(' + hotspotMoveInfo.disX + 'px)', 'transition': hotspotMoveInfo.isMoveing ? '0s' : '0.3s' + ' all'}">-->
       <!--<div class="hotspot-hint-item" @click="sendHotspot(item)" v-for="(item,index) in hintList" :key="index">{{item.title}}</div>-->
     <!--</div>-->
   <!--</div>-->

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

     <div @click="goto('/idbearDesc')" class="footer-record-gy-box">
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
  <!--<div class="share-and-home" v-if="sharePageInfo.enable_share_bonus && !showPickStore && chatList.length != 0 && !showGuide">-->
    <!--<div class="home-icon-box" @click="goStoreHome">-->
      <!--<div class="home-icon">-->
        <!--<img src="/static/imgs/home.png" />-->
        <!--<div class="home-icon-mark"></div>-->
      <!--</div>-->
    <!--</div>-->
    <!--<div class="share-text"  @click="showShare = true">-->
      <!--<img src="/static/imgs/text.png" />-->
      <!--<div class="share-text-mark"></div>-->
    <!--</div>-->
  <!--</div>-->
  <!--<img class="share-AD" v-if="sharePageInfo.enable_share_bonus && !showPickStore" @click="showShare = true" src="/static/imgs/share.png" />-->
  <!--<popup v-model="showShare" position="top" class="popup-share-box">-->
    <!--<div class="popup-share">-->
      <!--<div class="share-text">-->
        <!--<img src="/static/imgs/sharetop.png" />-->
      <!--</div>-->
      <!--<div class="user-num-box">-->
        <!--<div class="user-num border-1px-top">-->
          <!--<div class="label " @click="goto('/shareUser', sharePageInfo.children_users)">已经有<span>{{sharePageInfo.click_num}}</span>个好友点击过您的分享</div>-->
          <!--<x-button v-if="!userInfo.mobile" @click.native="goto('/bindPhone')" class="btn" mini>去领取</x-button>-->
        <!--</div>-->
        <!--<div class="store-info border-1px-top">-->
          <!--{{sharePageInfo.bonus_instruction}}-->
        <!--</div>-->
      <!--</div>-->
    <!--</div>-->
  <!--</popup>-->
</div>
</template>

<script>
// import utils from '@/utils/common'
import { LoadMore, throttle, Popup, XButton } from 'vux'
import common from '@/utils/common'
import dayjs from 'dayjs'
import { base64Emoji } from '@/lib/config/base64Emoji'
import { colorCompany } from '@/style/variate'
import { formatDate } from '../../utils/date'

export default {
  components: {
    LoadMore,
    Popup,
    XButton
  },
  data () {
    return {
      robotId: 0, // 机器人id
      isAndroid: true, // 是否为Android
      openid: '', // 用户openid
      loaded: false, // 历史聊天记录是否加载完成
      userInfo: {}, // 当前用户信息
      robotInfo: {},
      addReplyImg: true, // 是否本次回复中有图片回复，处理图片高度未知导致无法跳转至页面底部
      materialType: {
        'good': {
          label: '商品',
          icon: 'iconfont icon-gouwuche1',
          color: colorCompany.red
        },
        'article': {
          label: '文章',
          icon: 'iconfont icon-1',
          color: colorCompany.blue
        },
        'store': {
          label: '店铺',
          icon: 'iconfont icon-dianpu-',
          color: colorCompany.yellow
        }
      },
      sendInfo: { // 聊天信息
        isTextInput: false, // 是否是文本输入
        inputValue: '', // 当前文本输入的值
        recording: false, // 是否再录音状态
        isCancelSend: false, // 是否取消录音
        stY: 0
      },
      hintList: [{ title: '有什么优惠', requestUrl: '/api_hf/new' }, { title: '最近有什么活动', requestUrl: '/api_hf/discount' }, { title: '有什么推荐', requestUrl: '' }, { title: '我想抽奖', requestUrl: '/api_hf/hot' }, { title: '随便看看', requestUrl: '/api_hf/random' }],
      historyChatList: [], // 历史聊天信息
      chatList: [] // 当前聊天信息
    }
  },
  computed: {
    showLoading () {
      return this.historyChatList.length !== 0
    }
  },
  created () {
    // this.extractTextAHtml('打游戏<a href="http://www.baidu.com">链接</a>伤身www.baidu.com体，<a href="http://www.baidu.com">链接18720969415</a>[色]的法术18720969415等级')
    this.robotId = common.getShareParamter('robot_id')
    this.openid = common.getShareParamter('openid')

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
          this.goScollBottom()
        }
      }
    }
    document.oncontextmenu = function (e) {
      // 阻止全局长按出现菜单事件
      e.preventDefault()
    }
    this.$http.all([this.getUserInfo(this.openid), this.getRobotInfo()])
      .then(() => {
        this.setShare()
      })
  },
  mounted () {
    this.getChatFromLocalstorage()
    this.goScollBottom()
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
    formatDate,
    getUserInfo (openid) {
      // 得到当前微信用户信息
      return this.$api.user.getUserInfo(openid)
        .then((data) => {
          this.userInfo = data.results[0] || {}
        })
        .catch((e) => {
          console.log(e)
        })
    },
    getRobotInfo () {
      return this.$api.user.getRobotInfo(this.robotId)
        .then((data) => {
          this.robotInfo = data
          let wechatname = data.wechataccount_name || '谷熊科技'
          this.$common.setWechatTitle(`${wechatname}-${data.title}`)
        })
    },
    countShowGuide () {
      // 计算是否需要展示guide页
      let preTime = window.localStorage.getItem('guide-' + this.robotId)
      let nowDate = new Date()
      if (preTime) {
        try {
          let preDate = new Date(preTime)
          let preYear = preDate.getFullYear()
          let preMonth = preDate.getMonth()
          let preDay = preDate.getDate()

          let nowYear = nowDate.getFullYear()
          let nowMonth = nowDate.getMonth()
          let nowDay = nowDate.getDate()

          if (preYear !== nowYear || preMonth !== nowMonth || preDay !== nowDay) {
            this.showGuide = true
          }
        } catch (e) {
          this.showGuide = true
        }
      } else {
        this.showGuide = true
      }
    },
    saveVisitTime () {
      // 保存当前用户访问时间
      this.showGuide = false
      window.localStorage.setItem('guide-' + this.robotId, dayjs().format('YYYY/MM/DD'))
    },
    goScollBottom () {
      // 跳转至页面底部
      var el = document.getElementsByClassName('chat-box')[0]
      el.scrollTop = el.scrollHeight
    },
    saveChatToLocalStorage () {
      // 保存聊天记录到缓存里
      let tempList = this.historyChatList.concat(this.chatList)
      if (tempList.length > 60) {
        tempList.splice(0, 20)
      }
      console.log(tempList.length)
      window.localStorage.setItem('chat-' + this.robotId, JSON.stringify(tempList))
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
      // 历史聊天记录加载进当前聊天记录
      if (!this.historyFlag) {
        this.historyFlag = true
        let oldHeight = document.getElementsByClassName('chatBox')[0].offsetHeight
        if (this.historyChatList.length >= 10) {
          this.chatList = this.historyChatList.splice(-10, 10).concat(this.chatList)
          console.log('加载10条历史记录')
        } else if (this.historyChatList.length > 0) {
          this.chatList = this.historyChatList.concat(this.chatList)
          this.historyChatList = []
          console.log('加载到最后')
        }
        this.$nextTick(() => {
          if (!this.loaded) {
            this.goScollBottom()
            this.loaded = true
          } else {
            let nowHeight = document.getElementsByClassName('chatBox')[0].offsetHeight
            var el = document.getElementsByClassName('chat-box')[0]
            el.scrollTop = nowHeight - oldHeight
          }
          this.historyFlag = false
        })
      }
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
    // playAudio (item) {
    //   // 播放录音
    //   let stopName = 'stopVoice'
    //   var _this = this
    //   if (!item.isPlay) {
    //     if (_this.preVoiceItem) {
    //       _this.$wechat[stopName]({
    //         localId: _this.preVoiceItem.localId,
    //         complete () {
    //           _this.preVoiceItem.isPlay = false
    //           _this.$wechat.onVoicePlayEnd({
    //             success: function (res) {
    //               _this.preVoiceItem = ''
    //               item.isPlay = false
    //             }
    //           })
    //           _this.$wechat.playVoice({
    //             localId: item.localId,
    //             success () {
    //               item.isPlay = true
    //               _this.preVoiceItem = item
    //             }
    //           })
    //         }
    //       })
    //     } else {
    //       _this.$wechat.onVoicePlayEnd({
    //         success: function (res) {
    //           _this.preVoiceItem = ''
    //           item.isPlay = false
    //         }
    //       })
    //       this.$wechat.playVoice({
    //         localId: item.localId,
    //         success () {
    //           item.isPlay = true
    //           _this.preVoiceItem = item
    //         }
    //       })
    //     }
    //   } else {
    //     _this.$wechat[stopName]({
    //       localId: item.localId,
    //       complete () {
    //         item.isPlay = false
    //       }
    //     })
    //   }
    // },
    cancelInput () {
      // 使文本输入input失去焦点
      document.getElementsByClassName('footer-input')[0].blur()
    },
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
          // let chatItem = {
          //   type: 'oneself',
          //   ask_type: 'sound',
          //   content: data.translateResult,
          //   duration: duration,
          //   isPlay: false,
          //   localId: localId
          // }
          let chatItem = {
            type: 'oneself',
            ask_type: 'text',
            content: data.translateResult
          }
          _this.chatList.push(chatItem)
          _this.$nextTick(() => {
            _this.goScollBottom()
          })
          _this.storeSearch(data.translateResult, 3)
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
      let chatItem = {
        type: 'oneself',
        ask_type: 'text',
        content: content
      }
      this.chatList.push(chatItem)
      this.$nextTick(() => {
        this.goScollBottom()
      })
      this.sendInfo.inputValue = ''
      document.getElementsByClassName('footer-input')[0].blur()
      this.storeSearch(content, 1)
    },
    sendHotspot (item) {
      // 点击热词，发送文本
      let chatItem = {
        type: 'oneself',
        ask_type: 'text',
        content: item.title
      }
      this.chatList.push(chatItem)
      this.saveVisitTime()
      this.$nextTick(() => {
        this.goScollBottom()
      })
      this.storeSearch(item.title, 1)
    },
    storeSearch (content, type = 1) {
      // 通过文本（语音也转为文本）去查询商品
      this.saveVisitTime()
      this.$api.store.robotSearch(content, this.robotId, this.openid, type)
        .then((data) => {
          if (!data.is_reply) {
            return
          }
          if (data.reply_text) {
            let chatItem = {
              type: 'robot',
              reply_type: 'text',
              content: data.reply_text
            }
            this.chatList.push(chatItem)
          }
          if (data.reply_img && data.reply_img.url) {
            this.addReplyImg = true
            let chatItem = {
              type: 'robot',
              reply_type: 'img',
              content: data.reply_img.url
            }
            this.chatList.push(chatItem)
          }
          if (data.reply_material && data.reply_material.length > 0) {
            let chatItem = {
              type: 'robot',
              reply_type: 'material',
              content: data.reply_material
            }
            this.chatList.push(chatItem)
          }
          this.$nextTick(() => {
            this.goScollBottom()
            this.saveChatToLocalStorage()
          })
        })
        .catch((e) => {
        })
    },
    handleTextNewline (text) {
      return text.replace(/(\n)|(\r\n)/g, '<br />')
    },
    showFooterInput (event) {
      // 点击键盘，展示文本输入框
      this.sendInfo.inputValue = ''
      this.sendInfo.isTextInput = true
      setTimeout(() => {
        document.getElementsByClassName('footer-input')[0].focus()
      }, 100)
    },
    setShare () {
      // 设置分享信息
      this.$wechat.ready(() => {
        this.$share.setAppMessageShareInfo(`${this.userInfo.nickname}正在撩${this.robotInfo.title}AI机器人，快来围观！`, '我和这个机器人聊的很嗨哦，它有点意思，你要不要来体验一下？', this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), window.location.href + '&share=1', this.addOperationRecord)
        this.$share.setTimelineShareInfo(`${this.userInfo.nickname}正在撩${this.robotInfo.title}AI机器人，快来围观！`, '我和这个机器人聊的很嗨哦，它有点意思，你要不要来体验一下？', this.userInfo.headimgurl || (window.location.origin + '/static/imgs/logo1.jpg'), window.location.href + '&share=1', this.addOperationRecord)
      })
    },
    addOperationRecord () {
      // 添加分享统计钩子
      this.$api.stat.addOperationRecord(this.openid, this.mallId)
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
    extractTextAHtml (text) {
      let discernText = ''
      let reg = /<a[\s\S]*?<\/a>/g
      let linkList = text.match(reg)
      let otherList = text.split(reg)
      let discernOtherList = []
      for (let i = 0; i < otherList.length; i++) {
        discernOtherList.push(this.discernTextLinkOrPhoneOrEmoji(otherList[i]))
      }
      if (linkList) {
        for (let i = 0; i < linkList.length; i++) {
          discernText += discernOtherList[i] + linkList[i]
        }
        discernText += discernOtherList[discernOtherList.length - 1]
      } else {
        discernText = discernOtherList[0]
      }
      return discernText
    },
    discernTextLinkOrPhoneOrEmoji (text) {
      let linkReg = /((http|https):\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/g
      let phoneReg = /([1][3,4,5,6,7,8,9][0-9]{9})|((\d{3,4}-)?\d{7,8})/g
      let emojiReg = /\[[^[]+]/g
      let reg = /(((http|https):\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?)|(([1][3,4,5,6,7,8,9][0-9]{9})|((\d{3,4}-)?\d{7,8}))|(\[[^[]+])/g
      return text.replace(reg, (matchText) => {
        if (matchText.match(linkReg)) {
          return `<a href="${matchText.replace(/^[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/, 'http://$&')}" target="_blank">${matchText}</a>`
        } else if (matchText.match(phoneReg)) {
          return `<a href="tel:${matchText}" target="_blank">${matchText}</a>`
        } else if (matchText.match(emojiReg)) {
          return `<span class="chat-text-emoji"><img class="emoji" src="${base64Emoji[matchText.replace(/\[|]/g, '')]}" style="vertical-align: middle" /></span>`
        } else {
          return matchText
        }
      })
    },
    discernTextLink (text) {
      // 识别文本中的链接并替换成标签
      let reg = /((http|https):\/\/)?[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/g
      return text.replace(reg, (matchText) => {
        let index = text.indexOf(matchText)
        if (index > 0 && text.charAt(index - 1) === '"') {
          return matchText
        }
        return `<a href="${matchText.replace(/^[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/, 'http://$&')}" target="_blank">${matchText}</a>`
      })
    },
    discernTextPhone (text) {
      // 识别文本中的电话号码并替换成标签
      let reg = /([1][3,4,5,6,7,8,9][0-9]{9})|((\d{3,4}-)?\d{7,8})/g // eslint-disable-line
      return text.replace(reg, (matchText) => {
        return `<a href="tel:${matchText}" target="_blank">${matchText}</a>`
      })
    },
    parseEmojiCode (text) {
      if (!text) {
        return ''
      }
      let temp = text.replace(/\[[^[]+]/g, function (matchText) {
        return `<span class="chat-text-emoji"><img class="emoji" src="${base64Emoji[matchText.replace(/\[|]/g, '')]}" style="vertical-align: middle" /></span>`
      })
      return temp
    },
    previewImage (url) {
      this.$wechat.previewImage({
        current: url,
        urls: [url]
      })
    },
    formatterLocation (data) {
      let location = ''
      try {
        let areaList = data.area.split('-')
        location = areaList[1] + areaList[2] + data.location
      } catch (e) {
        location = ''
      }
      return location
    },
    formatLabel (tags) {
      let list = []
      try {
        list = JSON.parse(tags)
      } catch (e) {
        list = []
      }
      return list.splice(0, 3)
    },
    imageLoaded () {
      if (this.addReplyImg) {
        this.addReplyImg = false
        this.goScollBottom()
      }
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
  .store-option {
    position: absolute;
    z-index: 493;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #f2f2f2;
    padding-top: 0.5rem;
    .store-option-welcome{
      background: url("/static/imgs/welcome.png") #fff no-repeat;
      background-size: 100% 100%;
      width: 6.7rem;
      min-height: 2.5rem;
      border-radius: 2px; /*no*/
      margin: 0 auto;
      color: #fff;
      font-size: 0.28rem;
      padding: 0.56rem 0.3rem;
      text-align: justify;
    }
    .store-option-info-text{
      font-size: 0.26rem;
    }
    .store-option-info-content{
      margin-top: 0.8rem;
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .store-option-info-content-item{
      color: $blue;
      font-size: 0.28rem;
      display: inline-block;
      margin-bottom: 0.7rem;
      flex-grow: 0;
      &:active{
        color: #999;
      }
    }
  }
  .disabled{
    color: #b2b5bf;
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
  .chat-oneself{
    padding: 0 0.18rem;
    text-align: right;
    margin-bottom: 0.4rem;
    font-size: 0;
    .head-img{
      width:0.7rem;
      height: 0.7rem;
      margin-left: 0.1rem;
      vertical-align: top;
      border-radius: 2px 2px; /*no*/
    }
    .chat-text{
      word-break: break-all;
      color: #fff;
      max-width: 5rem;
      display: inline-block;
      font-size: 0.28rem;
      line-height: 0.40rem;
      background-image: linear-gradient(180deg,
      #5FBAF4 0%,
      #3D97F6 100%);
      padding: 0.15rem 0.3rem;
      text-align: justify;
      position: relative;
      border-top-right-radius: 2px; /*no*/
      border-top-left-radius: 0.36rem;
      border-bottom-left-radius: 0.36rem;
      border-bottom-right-radius: 0.36rem;
    }

    /*.chat-audio-box{*/
      /*text-align: right;*/
      /*width:2rem;*/
      /*display: inline-block;*/
      /*height: 0.72rem;*/
      /*background-image: linear-gradient(0deg,*/
        /*rgba(18, 115, 232, 1) 0%,*/
        /*rgba(40, 163, 241, 1) 100%);*/
      /*border-top-right-radius: 2px; !*no*!*/
      /*border-top-left-radius: 0.36rem;*/
      /*border-bottom-left-radius: 0.36rem;*/
      /*border-bottom-right-radius: 0.36rem;*/
      /*position: relative;*/
      /*.chat-audio-play{*/
        /*width:0.15rem;*/
        /*height:0.3rem;*/
        /*display: inline-block;*/
        /*margin-top: 0.22rem;*/
        /*background-image: url('../../../static/imgs/3.png');*/
        /*background-size: 100% 100%;*/
        /*margin-right: 0.3rem;*/
        /*animation: audioPlay 1.5s steps(1) infinite;*/
      /*}*/
      /*.chat-audio-pause{*/
        /*width:0.15rem;*/
        /*height:0.3rem;*/
        /*display: inline-block;*/
        /*margin-top: 0.22rem;*/
        /*background-image: url('../../../static/imgs/3.png');*/
        /*background-size: 100% 100%;*/
        /*margin-right: 0.3rem;*/
      /*}*/
    /*}*/
    /*.duration{*/
      /*position: absolute;*/
      /*right: 2.17rem;*/
      /*display: inline-block;*/
      /*vertical-align: bottom;*/
      /*height: 0.72rem;*/
      /*line-height: 0.72rem;*/
      /*font-size: 0.26rem;*/
      /*color: #999;*/
    /*}*/
  }

  .chat-other{
    padding: 0 0.2rem;
    text-align: left;
    margin-bottom: 0.4rem;
    font-size: 0;
    .head-img{
      width:0.70rem;
      height: 0.70rem;
      margin-right: 0.1rem;
      vertical-align: top;
      border-radius: 2px 2px; /*no*/
    }
    .chat-text{
      word-break: break-all;
      max-width: 5rem;
      display: inline-block;
      font-size: 0.28rem;
      line-height: 0.4rem;
      color: #333;
      background: #fff;
      padding: 0.15rem 0.3rem;
      text-align: justify;
      position: relative;
      border-top-left-radius: 2px; /*no*/
      border-top-right-radius: 0.36rem;
      border-bottom-left-radius: 0.36rem;
      border-bottom-right-radius: 0.36rem;

    }
    .chat-img{
      width: 3.6rem;
      border-radius: 2px; /*no*/
    }
  }
  /*@keyframes audioPlay {*/
    /*0%{*/
      /*background-image: url('../../../static/imgs/3.png');*/
    /*}*/
    /*33%{*/
      /*background-image: url('../../../static/imgs/1.png');*/
    /*}*/
    /*66%{*/
      /*background-image: url('../../../static/imgs/2.png');*/
    /*}*/
    /*100%{*/
      /*background-image: url('../../../static/imgs/3.png');*/
    /*}*/
  /*}*/

  .chat-card{
    margin-bottom: 0.4rem;
  }
  .chat-card-less{
    background: #fff;
    width:6.9rem;
    margin: 0 auto;
    padding: 0 0.2rem;
    border-radius: 4px; /*no*/
    .chat-card-less-item{
      box-sizing: content-box;
      border-bottom: 1px solid #E4E7ED; /*no*/
      white-space: nowrap;
      display: flex;
      padding: 0.2rem 0rem;
      &:last-child{
        margin-bottom: 0;
        border-bottom: 0px solid #E4E7ED;
      }
      .chat-card-less-item-img{
        flex-grow: 0;
        width:1.7rem;
        height: 1.7rem;
        font-size: 0;
        margin-right: 0.1rem;
        img{
          width: 1.7rem;
          height: 1.7rem;
          border-radius: 0.04px; /*no*/
        }
      }

      .chat-card-less-item-info{
        flex-grow: 1;
        position: relative;
        width:5rem;
        height: 1.7rem;
        white-space: normal;
        .chat-card-less-item-title{
          font-size: 0.28rem;
          color: #000000;
          line-height: 0.35rem;
          height: 0.65rem;
          box-sizing: content-box;
          overflow:hidden;
          text-overflow:ellipsis;
          display:-webkit-box;
          -webkit-box-orient:vertical;
          -webkit-line-clamp:2;
          margin-bottom: 0.1rem;
        }
        .chat-card-less-item-label{
          font-size: 0;
          white-space: nowrap;
          overflow: hidden;
          .chat-card-less-item-label-item{
            font-size: 0.2rem;
            line-height: 1;
            height: 0.34rem;
            line-height: 0.34rem;
            margin-right: 0.1rem;
            display: inline-block;
            padding: 0rem 0.1rem;
            border-radius: 5px; /*no*/
            border: 1px solid #E4E7ED; /*no*/
            color: $text-minor;
          }
        }
        .chat-card-less-item-other{
          display: inline-block;
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          line-height: 1;
          .chat-card-less-item-price{
            font-size: 0.3rem;
            color: $red;
            margin-bottom: 0.1rem;
            span{
              font-size: 0.24rem;
            }
          }
          .chat-card-less-item-sold, .chat-card-less-item-location{
            font-size: 0.2rem;
            color: $text-minor;
            span{
              color: $red;
            }
          }
          .chat-card-less-item-time{
            font-size: 0.2rem;
            line-height: 0.3rem;
            color: $text-minor;
          }
          .chat-card-less-item-avg-price{
            font-size: 0.2rem;
            color: $text-minor;
            margin-bottom: 0.1rem;
            span{
              color: $red;
            }
          }
          .chat-card-less-item-icon{
            position: absolute;
            right: 0;
            bottom: 0;
            width: 0.5rem;
            height: 0.5rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% 50%;
            border: 1px solid $blue; /*no*/
            i{
              font-size: 0.28rem;
              color: $blue;
            }
          }
        }
      }
    }
  }
  .chat-card-much{
    width: 100%;
    /*overflow: hidden;*/
    height: 5.12rem;
    -webkit-overflow-scrolling: touch;
    position: relative;
    overflow-x: auto;
    &:-webkit-scrollbar {/*隐藏滚轮*/
      display: none;
    }
    .chat-card-much-item-box{
      white-space: nowrap;
      display: inline-block;
      line-height: 1;
      position: absolute;
      .chat-card-much-item{
        position: relative;
        display: inline-block;
        background: #ffffff;
        border: 1px solid #f0f0f0; /*no*/
        width: 3.12rem;
        height: 5rem;
        overflow: hidden;
        border-radius: 0.1rem;
        margin-right: 0.2rem;
        &:last-child{
          margin-right: 0.26rem;
        }
        &:first-child{
          margin-left: 0.26rem;
        }
        .chat-card-much-item-img{
          width:3.12rem;
          height: 3.12rem;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .chat-card-much-item-info{
          padding: 0.18rem 0.18rem 0rem 0.18rem;
          .chat-card-much-item-info-title{
            font-size: 0.26rem;
            color: #333;
            /*white-space: nowrap;*/
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            height: 0.6rem;
            margin-bottom: 0.12rem;
            line-height: 0.32rem;
            white-space: normal;
            box-sizing: content-box;
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-box-orient:vertical;
            -webkit-line-clamp:2;
          }
          .chat-card-much-item-info-price{
            color: #ff0000;
            font-size: 0.16rem;
            margin-bottom: 0.2rem;
            span{
              font-size: 0.22rem;
            }
          }
          .chat-card-much-item-info-sellNum{
            font-size: 0.2rem;
            color: #9c9c9c;
            span{
              color: #fe4444;
            }
          }
          .chat-card-much-item-info-shopBtn{
            position: absolute;
            right: 0.18rem;
            bottom: 0.18rem;
            width: 0.44rem;
            height:0.44rem;
            img{
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
  }

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
            background: url("/static/imgs/gy-off.png");
            background-size: 100% 100%;
            &:active{
              background: url("/static/imgs/gy-on.png");
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
  .share-and-home{
    width: 1.54rem;
    height: 0.44rem;
    position: fixed;
    top: 0.22rem;
    right: 0.18rem;
    z-index: 500;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 0.22rem 0.22rem;
    line-height: 0.44rem;
    overflow: hidden;
    box-shadow: 0px 0px 4px 0px rgba(99, 99, 99, 0.2); /*no*/
    .home-icon-box{
      width: 0.54rem;
      height: 0.44rem;
      display: flex;
      align-items: center;
      .home-icon{
        height: 0.3rem;
        width: 0.54rem;
        border-right: 1px solid #c8c8c8; /*no*/
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0;
        position: relative;
        img{
          width: 0.27rem;
          height: 0.27rem;
        }
        .home-icon-mark{
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }
      }
      &:active{
        background: #c8c8c8;
      }
    }
    .share-text{
      flex-grow: 1;
      height: 0.44rem;
      position: relative;
      img{
        width: 100%;
        height: 100%;
      }
      .share-text-mark{
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
      }
      &:active{
        background: #c8c8c8;
      }
    }
  }
  .popup-share-box{
    overflow-y: hidden;
  }
  .popup-share{
    box-sizing: border-box;
    .share-text{
      width: 100%;
      font-size: 0;
      img{
        width: 100%;
      }
    }
    .user-num-box{
      color: #333;
      background: #fff;
      .user-num{
        padding: 0 0.28rem;
        font-size: 0.28rem;
        height: 0.86rem;
        display: flex;
        align-items: center;
        .label{
          flex-grow: 1;
          span{
            color: #ff4743;
          }
        }
        .btn{
          flex-grow: 0;
          width: 1.2rem;
          height: 0.5rem;
          line-height: 0.5rem;
          color: #fff;
          padding: 0;
          font-size: 0.24rem;
          font-weight: normal;
          background-image: linear-gradient(0deg,
            rgba(18, 115, 232, 1) 0%,
            rgba(40, 163, 241, 1) 100%),
          linear-gradient(
              rgba(32, 144, 231, 1),
              rgba(32, 144, 231, 1));
          &:active{
            background: #66b1ff;
          }
        }
      }
      .store-info{
        padding: 0.32rem 0.28rem;
        color: #999;
        font-size: 0.24rem;
        line-height: 1;
      }
    }
  }
  .header-address{
    z-index: 497;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: #ffffff;
    height: 0.9rem;
    line-height: 0.9rem;
    padding: 0 0.22rem;
    .header-address-label{
      font-size: 0.28rem;
      color: #111111;
    }
    .header-address-btn{
      font-size: 0.24rem;
      color: #666666;
    }
  }
  .popup-store-box{
    padding-top: 0.9rem;
    background: #ffffff;
    font-size: 0;
    overflow-x: hidden;
    overflow-y: auto;
    .popup-store-list-item{
      padding: 0.3rem 0.22rem;
      .store-item-title{
        margin-bottom: 0.2rem;
        position: relative;
        display: flex;
        align-items: center;
        .store-item-title-icon{
          font-size: 0.3rem;
          color: #999;
          margin-right: 0.1rem;
        }
        .store-item-title-name{
          display: inline-block;
          font-size: 0.3rem;
          color: #333;
          line-height: 1;
        }
        .item-title-distance{
          font-size: 0.24rem;
          color: #999;
          display: inline-block;
          line-height: 1;
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      }
      .item-address{
        display: flex;
        font-size: 0.24rem;
        color: #999;
        span{
          flex-grow: 1;
        }
        .item-address-icon{
          font-size: 0.3rem;
          flex-grow: 0;
        }
      }
    }
  }
</style>
