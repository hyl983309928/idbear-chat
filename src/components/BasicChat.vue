<template>
  <div class="chatBox">
    <template v-for="(item,index) in chatList">
      <div class="chat-oneself" v-if="item.type == 'oneself'" :key="index">
        <template v-if="item.ask_type == 'text'">
          <div class="chat-text">{{item.content}}</div>
          <img class="head-img" :src="oneselfHead || userInfo.headimgurl" />
        </template>
      </div>

      <div v-if="item.type == 'robot'" :key="index" class="chat-other-wrap">
        <div class="chat-other" v-if="item.reply_type == 'guide'">
          <img class="head-img" :src="otherHead ? otherHead : robotInfo.avatar" />
          <div class="chat-text">
            <div>
              {{welcomeMessage}}
            </div>
            <div class="chat-guide-option">
              <div @click="handleClickGuideOption(item)" class="chat-guide-option-item" v-for="(item, index) in guideList" :key="index">
                <div class="chat-guide-option-item-icon" :style="{background: guideIconColor[index % 3]}">
                  <i :class="item.icon" />
                </div>
                <div class="chat-guide-option-item-title">
                  {{item.label}}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'businessCard'">
          <div class="chat-business-card">
          </div>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'text'">
          <img class="head-img" :src="otherHead ? otherHead : robotInfo.avatar" />
          <div @click="handleClickChatLink" class="chat-text" v-html="handleTextNewline(extractTextAHtml(item.content))"></div>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'img'">
          <img class="head-img" :src="otherHead ? otherHead : robotInfo.avatar" />
          <img class="chat-img" @load="imageLoaded" :src="item.content" @click="previewImage(item.content)" />
        </div>
        <div class="chat-card" v-if="item.reply_type == 'material'">
          <div class="chat-card-item chat-card-store" v-if="item.content.store_reply && item.content.store_reply.length > 0">
            <div class="chat-card-item-label text-color-common">
              这些可能是您要找的店
            </div>
            <div class="chat-card-item-content">
              <div class="chat-card-less" v-if="item.content.store_reply.length < 3">
                <div class="chat-card-less-item" v-for="(cardItem,cardIndex) in item.content.store_reply" :key="cardIndex" @click="openStore(cardItem)">
                  <div class="chat-card-less-item-img">
                    <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x340/gravity/Center/crop/340x340'" />
                  </div>
                  <div class="chat-card-less-item-info">
                    <div class="chat-card-less-item-title">
                      {{cardItem.title}}
                    </div>
                    <div class="chat-card-less-item-label">
                      <div class="chat-card-less-item-label-item" v-for="tag in formatLabel(cardItem.tags)" :key="tag">
                        {{tag}}
                      </div>
                    </div>
                    <div class="chat-card-less-item-other">
                      <div class="item-left">
                        <div class="chat-card-less-item-avg-price">
                          人均 <span>{{cardItem.avg_price}}</span> 元
                        </div>
                        <div class="chat-card-less-item-location">
                          {{ formatterLocation(cardItem) }}
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-less-item-icon" :style="{ borderColor: materialType.store.color }">
                          <i :class="materialType.store.icon" :style="{ color: materialType.store.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-card-much" v-else>
                <div class="chat-card-much-item-box">
                  <div class="chat-card-much-item" v-for="(cardItem,cardIndex) in item.content.store_reply" :key="cardIndex" @click="openStore(cardItem)">
                    <div class="chat-card-much-item-img">
                      <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x550/gravity/Center/crop/550x550'" />
                    </div>
                    <div class="chat-card-much-item-info">
                      <div class="store-info-title">{{cardItem.title}}</div>
                      <div class="chat-card-much-item-label-item" v-for="tag in formatLabel(cardItem.tags)" :key="tag">
                        {{tag}}
                      </div>
                    </div>
                    <div class="chat-card-much-item-other">
                      <div class="item-left">
                        <div class="chat-card-much-item-avg-price">
                          人均 <span>{{cardItem.avg_price}}</span> 元
                        </div>
                        <div class="chat-card-much-item-location">
                          {{ formatterLocation(cardItem) }}
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-much-item-icon" :style="{ borderColor: materialType.store.color }">
                          <i :class="materialType.store.icon" :style="{ color: materialType.store.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-card-item chat-card-goods" v-if="item.content.goods_reply && item.content.goods_reply.length > 0">
            <div class="chat-card-item-label text-color-common">
              这些可能是您需要找的商品
            </div>
            <div class="chat-card-item-content">
              <div class="chat-card-less" v-if="item.content.goods_reply.length < 3">
                <div class="chat-card-less-item" v-for="(cardItem,cardIndex) in item.content.goods_reply" :key="cardIndex" @click="openWindow(cardItem.url)">
                  <div class="chat-card-less-item-img">
                    <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x340/gravity/Center/crop/340x340'" />
                  </div>
                  <div class="chat-card-less-item-info">
                    <div class="chat-card-less-item-title">
                      {{cardItem.title}}
                    </div>
                    <div class="chat-card-less-item-other">
                      <div class="item-left">
                        <div class="chat-card-less-item-price">
                          <span>￥</span>{{cardItem.price/100}}
                        </div>
                        <div class="chat-card-less-item-sold">
                          已售 <span>{{cardItem.sold_num?cardItem.sold_num:0}}</span> 件
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-less-item-icon" :style="{ borderColor: materialType.good.color }">
                          <i :class="materialType.good.icon" :style="{ color: materialType.good.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-card-much" v-else>
                <div class="chat-card-much-item-box">
                  <div class="chat-card-much-item" v-for="(cardItem,cardIndex) in item.content.goods_reply" :key="cardIndex" @click="openWindow(cardItem.url)">
                    <div class="chat-card-much-item-img">
                      <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x550/gravity/Center/crop/550x550'" />
                    </div>
                    <div class="chat-card-much-item-info">
                      <div class="chat-card-much-item-info-title">{{cardItem.title}}</div>
                    </div>
                    <div class="chat-card-much-item-other">
                      <div class="item-left">
                        <div class="chat-card-much-item-price">
                          <span>￥{{cardItem.price/100}}</span>
                        </div>
                        <div class="chat-card-much-item-sold">
                          已售 <span>{{cardItem.sold_num?cardItem.sold_num:0}}</span> 件
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-much-item-icon" :style="{ borderColor: materialType.good.color }">
                          <i :class="materialType.good.icon" :style="{ color: materialType.good.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="chat-card-item chat-card-article" v-if="item.content.article_reply && item.content.article_reply.length > 0">
            <div class="chat-card-item-label text-color-common">
              这些可能是您感兴趣的文章
            </div>
            <div class="chat-card-item-content">
              <div class="chat-card-less" v-if="item.content.article_reply.length < 3">
                <div class="chat-card-less-item" v-for="(cardItem,cardIndex) in item.content.article_reply" :key="cardIndex" @click="openWindow(cardItem.url)">
                  <div class="chat-card-less-item-img">
                    <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x340/gravity/Center/crop/340x340'" />
                  </div>
                  <div class="chat-card-less-item-info">
                    <div class="chat-card-less-item-title">
                      {{cardItem.title}}
                    </div>
                    <div class="chat-card-less-item-other">
                      <div class="item-left">
                        <div class="chat-card-less-item-time">
                          文章发表时间<br />
                          {{formatDate(cardItem.send_date)}}
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-less-item-icon" :style="{ borderColor: materialType.article.color }">
                          <i :class="materialType.article.icon" :style="{ color: materialType.article.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-card-much" v-else>
                <div class="chat-card-much-item-box">
                  <div class="chat-card-much-item" v-for="(cardItem,cardIndex) in item.content.article_reply" :key="cardIndex" @click="openWindow(cardItem.url)">
                    <div class="chat-card-much-item-img">
                      <img v-lazy="cardItem.image + '?imageMogr2/auto-orient/thumbnail/x550/gravity/Center/crop/550x550'" />
                    </div>
                    <div class="chat-card-much-item-info">
                      <div class="chat-card-much-item-info-title">{{cardItem.title}}</div>
                    </div>
                    <div class="chat-card-much-item-other">
                      <div class="item-left">
                        <div class="chat-card-much-item-time">
                          文章发表时间<br />
                          {{formatDate(cardItem.send_date)}}
                        </div>
                      </div>
                      <div class="item-right">
                        <div class="chat-card-much-item-icon" :style="{ borderColor: materialType.article.color }">
                          <i :class="materialType.article.icon" :style="{ color: materialType.article.color }"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'businessCard'">
          <BusinessCard :salesmanInfo="item.content" isLink></BusinessCard>
        </div>
        <div class="chat-other" v-if="item.reply_type == 'businessCardPoster'">
          <span class="head-img" style="display: inline-block"></span>
          <BusinessCardPoster :salesmanInfo="item.content" v-if="item.content.real_name"></BusinessCardPoster>
        </div>
      </div>
      <div class="chat-other-wrap" :key="index" v-if="item.type === 'evaluate'">
        <div class="chat-other">
          <span class="head-img" style="display: inline-block;height: 0;"></span>
          <div class="evaluate-box">
            <div @click="handleClickEvaluate(1, item)" class="evaluate-satisfaction" v-if="item.content != 2" :style="{color: item.content == 1 ? colorCompany.green : ''}">
              <i class="iconfont icon-smile" />满意
            </div>
            <div @click="handleClickEvaluate(2, item)" class="evaluate-yawp" v-if="item.content != 1" :style="{color: item.content == 2 ? colorCompany.red : ''}">
              <i class="iconfont icon-bukaixin" />不满意
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script>
// import utils from '@/utils/common'
import { base64Emoji } from '@/lib/config/base64Emoji'
import { colorCompany } from '@/style/variate'
import { formatDate } from '@/utils/date'
import BusinessCard from '@/components/BusinessCard'
import BusinessCardPoster from '@/components/BusinessCardPoster'
import { industryInfoMap } from '../lib/config'
import { mapGetters } from 'vuex'
import { copyString } from '../utils/copy'
import common from '@/utils/common'

export default {
  components: {
    BusinessCard,
    BusinessCardPoster
  },
  data () {
    return {
      colorCompany,
      industryInfoMap,
      robotId: '',
      guideIconColor: ['linear-gradient(180deg,rgba(95,186,244,1) 0%,rgba(61,151,246,1) 100%)', 'linear-gradient(180deg,rgba(109,229,180,1) 0%,rgba(54,192,136,1) 100%)', 'linear-gradient(180deg,rgba(255,216,156,1) 0%,rgba(250,178,66,1) 100%)'],
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
      }
    }
  },
  props: {
    chatList: Array,
    guideList: Array,
    oneselfHead: {
      type: String,
      default: ''
    },
    otherHead: {
      type: String,
      default: ''
    },
    welcomeMessage: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'robotInfo', 'is_miniprogram'])
  },
  created () {
    this.robotId = common.getShareParamter('robot_id')
  },
  mounted () {
  },
  methods: {
    formatDate,
    handleClickGuideOption (item) {
      this.$emit('on-click-guide', item)
    },
    handleClickChatLink (e) {
      if (e.target.nodeName === 'A' && e.target.dataset.type === 'chat') {
        this.$emit('on-send-message', { message: e.target.innerHTML, type: 1 })
      }
    },
    openWindow (url) {
      // 调至有赞商品页
      if (this.is_miniprogram) {
        copyString(url)
        this.$vux.alert.show({
          title: '链接已复制',
          content: '您可打开浏览器粘贴链接查看啦！'
        })
      } else {
        window.location.href = url
      }
    },
    openStore (item) {
      // 跳转中间页
      if (this.is_miniprogram) {
        this.$wechat.miniProgram.navigateTo({url: `/pages/store/store?id=${item.id}&robot=${this.robotId}`})
      } else {
        window.location.href = item.url
      }
    },
    handleTextNewline (text) {
      return text.replace(/(\n)|(\r\n)/g, '<br />')
    },
    extractTextAHtml (text) {
      if (!text) {
        return ''
      }
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
      this.$emit('on-robot-image-loaded')
    },
    handleClickEvaluate (evaluate, item) {
      if (!item.content) {
        this.$emit('on-click-evaluate', { evaluate: evaluate, item: item })
      }
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  @import "../style/variate.scss";
  .chat-other-wrap + .chat-oneself{
    padding-top: 0.2rem;
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
  }

  .chat-other{
    padding: 0 0.24rem;
    text-align: left;
    margin-bottom: 0.2rem;
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
      color: $text-primary;
      background: #fff;
      padding: 0.15rem 0.3rem;
      text-align: justify;
      position: relative;
      border-top-left-radius: 2px; /*no*/
      border-top-right-radius: 0.36rem;
      border-bottom-left-radius: 0.36rem;
      border-bottom-right-radius: 0.36rem;
      .chat-guide-option{
        display: flex;
        flex-wrap: wrap;
        .chat-guide-option-item{
          width: 33.3333%;
          display: flex;
          flex-direction: column;
          justify-items: center;
          align-items: center;
          padding: 0.2rem 0;
          .chat-guide-option-item-icon{
            width: 0.6rem;
            height: 0.6rem;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% 50%;
            color: #fff;
            margin-bottom: 0.2rem;
          }
          .chat-guide-option-item-title{
            color: $text-common;
            font-size: 0.24rem;
            line-height: 1;
          }
        }
      }
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
    margin-bottom: 0.2rem;
    .chat-card-item{
      margin-bottom: 0.2rem;
      &:last-child{
        margin-bottom: 0;
      }
    }
    .chat-card-item-label{
      padding: 0 0.24rem;
      line-height: 1;
      margin-bottom: 0.1rem;
      font-size: 0.2rem;
    }
  }
  .chat-card-less{
    background: #fff;
    width:7.02rem;
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
          max-height: 0.68rem;
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
          overflow-x: hidden;
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
          display: flex;
          align-items: center;
          .item-left{
            flex-grow: 1;
            width: 100%;
            overflow-x: hidden;
            margin-right: 0.2rem;
          }
          .item-right{
            flex-grow: 0;
            flex-shrink: 0;
          }

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
            line-height: 0.24rem;
            color: $text-minor;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
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
            line-height: 0.24rem;
            color: $text-minor;
            margin-bottom: 0.08rem;
            span{
              color: $red;
            }
          }
          .chat-card-less-item-icon{
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
    height: 4.4rem;
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
        width: 2.74rem;
        height: 4.32rem;
        overflow: hidden;
        border-radius: 0.1rem;
        margin-right: 0.2rem;
        &:last-child{
          margin-right: 0.24rem;
        }
        &:first-child{
          margin-left: 0.24rem;
        }
        .chat-card-much-item-img{
          width:2.74rem;
          height: 2.74rem;
          img{
            width: 100%;
            height: 100%;
          }
        }
        .chat-card-much-item-info{
          padding: 0.08rem 0.12rem 0rem 0.12rem;
          .chat-card-much-item-info-title{
            font-size: 0.26rem;
            color: #333;
            /*white-space: nowrap;*/
            /*overflow: hidden;*/
            /*text-overflow: ellipsis;*/
            max-height: 0.68rem;
            margin-bottom: 0.04rem;
            line-height: 0.36rem;
            white-space: normal;
            box-sizing: content-box;
            overflow:hidden;
            text-overflow:ellipsis;
            display:-webkit-box;
            -webkit-box-orient:vertical;
            -webkit-line-clamp:2;
          }
          .store-info-title{
            font-size: 0.26rem;
            line-height: 0.36rem;
            color: #333;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-bottom: 0.03rem;
            margin-top: 0.04rem;
          }
          .chat-card-much-item-label-item{
            font-size: 0.18rem;
            height: 0.28rem;
            line-height: 0.28rem;
            margin-right: 0.1rem;
            display: inline-block;
            padding: 0rem 0.1rem;
            border-radius: 5px; /*no*/
            border: 1px solid #E4E7ED; /*no*/
            color: $text-minor;
          }
        }
        .chat-card-much-item-other{
          display: flex;
          align-items: center;
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          line-height: 1;
          padding: 0 0.12rem;
          padding-bottom: 0.14rem;
          width: 100%;
          .item-left{
            flex-grow: 1;
            flex-shrink: 1;
            overflow-x: hidden;
            margin-right: 0.2rem;
          }
          .item-right{
            flex-shrink: 0;
            flex-grow: 0;
          }
          .chat-card-much-item-location{
            font-size: 0.18rem;
            line-height: 0.22rem;
            color: $text-minor;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .chat-card-much-item-avg-price, .chat-card-much-item-price, .chat-card-much-item-sold{
            font-size: 0.18rem;
            line-height: 0.22rem;
            color: $text-minor;
            span{
              color: $red;
            }
          }
          .chat-card-much-item-avg-price, .chat-card-much-item-price{
            margin-bottom: 0.08rem;
          }
          .chat-card-much-item-time{
            font-size: 0.18rem;
            line-height: 0.26rem;
            color: $text-minor;
          }
          .chat-card-much-item-icon{
            width: 0.44rem;
            height: 0.44rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50% 50%;
            border: 1px solid $blue; /*no*/
            i{
              font-size: 0.26rem;
              color: $blue;
            }
          }
        }
      }
    }
  }
  .evaluate-box{
    display: inline-block;
    font-size: 0.28rem;
    color: $text-common;
    line-height: 0.3rem;
    .iconfont{
      font-size: 0.3rem;
      margin-right: 0.1rem;
    }
    .evaluate-satisfaction, .evaluate-yawp{
      display: inline-block;
    }
    .evaluate-satisfaction + .evaluate-yawp{
      margin-left: 0.4rem;
    }
  }
</style>
