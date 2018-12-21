<template>
  <div class="business-card" @click="clickBusinessCard">
    <div class="business-card-head">
      <div class="img-box">
        <img :src="salesmanInfo.sex == 1 ? 'http://storage.id-bear.com/21/FujvJdmL6I9pW9kEUkMND3ip8w1N%E5%A4%B4%E5%83%8F1%20copy%203.png' : 'http://storage.id-bear.com/21/Fmpt7F-kGqlSHU4KrIRH8t4uWCI1%E5%A4%B4%E5%83%8F2%20copy.png'" />
      </div>
    </div>
    <div class="business-card-info">
      <div class="business-card-primary-info">
        <div class="business-card-right" v-if="isLink">
          <i class="iconfont icon-jiantou2" />
        </div>
        <div class="primary-info-name-position">
          <span class="info-name">
            {{salesmanInfo.real_name}}
          </span>
          <span class="separator">|</span>
          <span class="info-position">
            {{salesmanInfo.position}}
          </span>
        </div>
        <div class="primary-info-company">
          {{salesmanInfo.company}}
        </div>
      </div>
      <div class="business-card-common-info">
        <div class="common-info-item common-info-mobile">
          <div class="common-info-item-icon">
            <i class="iconfont icon-shouji1" />
          </div>
          <div class="separator"><span>|</span></div>
          <div class="common-info-item-content">
            <a :href="`tel:${salesmanInfo.mobile}`">{{salesmanInfo.mobile}}</a>
          </div>
        </div>
        <div class="common-info-item common-info-phone">
          <div class="common-info-item-icon">
            <i class="iconfont icon-shouji" />
          </div>
          <div class="separator"><span>|</span></div>
          <div class="common-info-item-content">
            <a :href="`tel:${salesmanInfo.phone}`">{{salesmanInfo.phone}}</a>
          </div>
        </div>
        <div class="common-info-item common-info-email" v-if="salesmanInfo.email">
          <div class="common-info-item-icon">
            <i class="iconfont icon-email" />
          </div>
          <div class="separator"><span>|</span></div>
          <div class="common-info-item-content">
            <a class="copy-email" :data-clipboard-text="salesmanInfo.email">{{salesmanInfo.email}}</a>
          </div>
        </div>
        <div class="common-info-item common-info-address">
          <div class="common-info-item-icon">
            <i class="iconfont icon-dizhi" />
          </div>
          <div class="separator"><span>|</span></div>
          <div class="common-info-item-content">
            <a :href="`https://apis.map.qq.com/uri/v1/routeplan?to=${salesmanInfo.address}&referer=idbear`">{{salesmanInfo.address}}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import commonMixin from '@/mixins/common'
import ClipboardJS from 'clipboard'
export default {
  components: {},
  mixins: [commonMixin],
  data () {
    return {}
  },
  props: {
    salesmanInfo: Object,
    isLink: Boolean
  },
  computed: {},
  created () {},
  mounted () {
    this.createCopy()
  },
  methods: {
    createCopy () {
      let clipboard = new ClipboardJS('.copy-email')
      clipboard.on('success', (e) => {
        this.$vux.toast.show({
          text: '复制成功',
          type: 'text'
        })
      })
    },
    clickBusinessCard (e) {
      if (e.target.nodeName !== 'A' && this.isLink) {
        this.goto(`/salesmanChat/${this.salesmanInfo.id}`)
      }
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  @import "../style/variate.scss";
  .business-card{
    position: relative;
    width: 7.02rem;
    height: 3.8rem;
    border-radius: 0.1rem;
    background: url("http://storage.id-bear.com/21/FpZo756y9KYbpsnoF6X_TuzwsHPPcard-bg.jpg") #fff;
    background-size: 100% 100%;
    box-shadow:0px 10px 12px 0px rgba(192,196,204,1);
    display: flex;
    .business-card-head{
      flex-grow: 0;
      flex-shrink: 0;
      padding: 0 0.34rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 100%;
      box-sizing: content-box;
      .img-box{
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid $text-minor;
        border-radius: 50% 50%;
        img{
          width: 1.8rem;
          height: 1.8rem;
          border-radius: 50% 50%;
        }
      }
    }
    .business-card-info{
      flex-grow: 1;
      padding-right: 0.34rem;
      line-height: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .business-card-primary-info{
        padding: 0rem 0 0.24rem 0;
        color: $text-primary;
        border-bottom: 1px solid #DCDFE6; /*no*/
        position: relative;
        .business-card-right{
          position: absolute;
          top: 0;
          bottom: 0.24rem;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          .iconfont{
            font-size: 0.36rem;
            color: $text-minor;
          }
        }
        .primary-info-name-position{
          margin-bottom: 0.24rem;
          .info-name{
            display: inline-block;
            font-size: 0.36rem;
          }
          .separator{
            display: inline-block;
            font-size: 0.2rem;
            color: $text-common;
            margin: 0 0.08rem;
          }
          .info-position{
            font-size: 0.2rem;
            display: inline-block;
            color: $text-common;
          }
        }
        .primary-info-company{
          font-size: 0.2rem;
          color: $text-common;
        }
      }
      .business-card-common-info{
        padding-top: 0.24rem;
        .common-info-item{
          display: flex;
          color: $blue;
          font-size: 0rem;
          line-height: 1;
          margin-bottom: 0.16rem;
          &:last-child{
            margin-bottom: 0;
          }
          .common-info-item-icon{
            display: inline-block;
            flex-grow: 0;
            flex-shrink: 0;
            .iconfont{
              font-size: 0.2rem;
              line-height: 0.28rem;
            }
          }
          .separator{
            display: inline-block;
            flex-grow: 0;
            flex-shrink: 0;
            margin: 0 0.08rem;
            font-size: 0.18rem;
            line-height: 0.28rem;
            span{
            }
          }
          .common-info-item-content{
            display: inline-block;
            flex-grow: 1;
            text-align: justify;
            font-size: 0.2rem;
            line-height: 0.28rem;
          }
        }
        .common-info-address{
          .common-info-item-content{
            line-height: 0.28rem;
          }
        }
      }
    }
  }
</style>
