<template>
  <div id="component-poster">
    <div ref="businessCardPoster" class="business-card-poster">
      <div class="wechat-name">
        {{robotInfo.wechataccount_name ? `${robotInfo.wechataccount_name}的`:''}}AI名片
      </div>
      <div class="poster-info">
        <div class="poster-head-img">
          <img :src="robotInfo.avatar" />
        </div>
        <div class="poster-info-name-box">
          <span class="poster-name">{{salesmanInfo.real_name}}</span>
          <span class="separator">|</span>
          <span class="poster-position">{{salesmanInfo.position}}</span>
        </div>
        <div class="poster-info-item-box">
          <div class="poster-info-item">
            <!--<div class="poster-info-item-icon">-->
              <!--&lt;!&ndash;<i class="iconfont icon-shouji1" />&ndash;&gt;-->
              <!--<img src="/static/imgs/phone.png" height="16"/>-->
            <!--</div>-->
            <img  class="poster-info-item-img" src="/static/imgs/phone.png"/>
            <div class="poster-info-item-content">
              {{salesmanInfo.mobile}}
            </div>
          </div>
          <div class="poster-info-item" v-if="salesmanInfo.email">
            <!--<div class="poster-info-item-icon">-->
              <!--&lt;!&ndash;<i class="iconfont icon-email" />&ndash;&gt;-->
              <!--<img src="/static/imgs/email.png" width="16" />-->
            <!--</div>-->
            <img  class="poster-info-item-img" src="/static/imgs/email.png"/>
            <div class="poster-info-item-content">
              {{salesmanInfo.email}}
            </div>
          </div>
        </div>
        <div class="poster-qrcode">
          <div class="qrcode-box">
            <div class="qrcode-bg">
              <div ref="qrcode" class="qrcode card-poster-qrcode"></div>
            </div>
          </div>
          <div class="label">
            我的名片会说话<br />不信扫码问问
          </div>
        </div>
      </div>
    </div>
    <img class="poster-img" :src="img" />
    <div  class="poster-mask"></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode2'
import common from '@/utils/common'
export default {
  components: {},
  mixins: [],
  data () {
    return {
      robotId: '',
      appid: '',
      img: ''
    }
  },
  props: {
    salesmanInfo: Object
  },
  computed: {
    ...mapGetters(['robotInfo'])
  },
  created () {
    this.robotId = common.getShareParamter('robot_id')
    this.appid = common.getShareParamter('appid')
  },
  mounted () {
    let rem = parseInt(document.documentElement.style.fontSize)
    this.qrcode = new QRCode(this.$refs.qrcode, {
      text: `${window.location.origin}/wechat/web_auth?robot_id=${this.robotId}&appid=${this.appid}&business_card=${this.salesmanInfo.id}`,
      width: 1.2 * rem,
      height: 1.2 * rem,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.L
    })
    setTimeout(() => {
      this.getImg()
    }, 100)
  },
  methods: {
    getImg () {
      html2canvas(this.$refs.businessCardPoster, { useCORS: true })
        .then((canvas) => {
          // this.$refs.businessCardPoster.appendChild(canvas)
          this.img = canvas.toDataURL()
        })
        .catch((e) => {
        })
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
@import "../style/variate.scss";
#component-poster{
  position: relative;
  display: inline-block;
  z-index: 999;
  box-shadow:0px 10px 12px 0px rgba(192,196,204,1);
  width: 3.5rem;
  height: 5.6rem;
  overflow: hidden;
}
.poster-mask{
  background: #fff;
  position: absolute;
  z-index: 998;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.poster-img{
  width: 3.5rem;
  height: 5.6rem;
  border: 0;
  z-index: 999;
  position: absolute;
  left: 0;
  top: 0;
}
.business-card-poster{
  width: 3.5rem;
  height: 5.6rem;
  padding-top: 2.3rem;
  padding-left: 0.7rem;
  background: #fff;
  display: inline-block;
  z-index: -1;
  background: url("http://storage.id-bear.com/21/FrxYrbl2hj5aSydkgGAb3ZbhcMmHcard-poster-bg.jpg") no-repeat;
  background-size: 100% 100%;
  position: relative;
  .wechat-name{
    position: absolute;
    right: 0.3rem;
    left: 0.3rem;
    top: 0.2rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #fff;
    font-size: 0.16rem;
    font-style: italic;
  }
  .poster-info{
    line-height: 1;
    color: #fff;
    .poster-head-img{
      width: 0.6rem;
      height: 0.6rem;
      border-radius: 50% 50%;
      margin-bottom: 0.18rem;
      img{
        width: 0.6rem;
        height: 0.6rem;
        border-radius: 50% 50%;
      }
    }
    .poster-info-name-box{
      margin-bottom: 0.06rem;
      .poster-name{
        font-size: 0.3rem;
        font-weight: 600;
      }
      .separator{
        font-size: 0.14rem;
        padding: 0 0.05rem;
      }
      .poster-position{
        font-size: 0.16rem;
      }
    }
    .poster-info-item-box{
      margin-bottom: 0.12rem;
    }
    .poster-info-item{
      font-size: 0;
      margin-bottom: 0.06rem;
      display: flex;
      align-items: center;
      &:last-child{
        margin-bottom: 0rem;
      }
      .poster-info-item-img{
        width: 0.16rem;
        height: 0.16rem;
        margin-right: 0.1rem;
      }
      .poster-info-item-icon{
        display: inline-block;
        margin-right: 0.1rem;
        width: 0.16rem;
        height: 0.16rem;
        text-align: center;
        font-size: 0;
        .iconfont{
          font-size: 0.16rem;
        }
        img{
        }
      }
      .poster-info-item-content{
        font-size: 0.16rem;
        display: inline-block;
        font-weight:600;
      }
    }
  }

  .poster-qrcode{
    .qrcode-box{
      display: inline-block;
      padding: 0.05rem;
      background: url("http://storage.id-bear.com/21/FvUSg0_JlfDctc16Hu18Ciq7fJlGqecode-bg.png") no-repeat;
      background-size: 100% 100%;
      margin-bottom: 0.1rem;
      .qrcode-bg{
        background: #fff;
        padding: 0.05rem;
      }
      .qrcode{
        width: 0.6rem;
        height: 0.6rem;
        /deep/ img{
          width: 0.6rem;
          height: 0.6rem;
        }
      }
    }
    .label{
      font-size: 0.16rem;
      line-height: 0.24rem;
      font-style: italic;
    }
  }
}
</style>
