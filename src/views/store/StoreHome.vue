<template>
<div class="page">
  <div class="store-content">
    <div class="img-box">
      <img :src="info.logo" />
    </div>
    <div class="store-info">
      <div class="store-info-title">{{info.name}}</div>
      <div class="store-info-sub">{{info.intro}}</div>
      <div v-if="wechatInfo.nick_name" class="store-info-wehcat">公众号：<span @click="goWechat">{{wechatInfo.nick_name}}</span></div>
    </div>
    <div class="store-btn">
      <x-button class="btn" @click.native="goStore">进入店铺</x-button>
    </div>
  </div>
  <div class="footer">
    <div class="idbear">
      <router-link to="/idbearDesc">熊小秘AI电商机器人v1.0.2</router-link>
    </div>
    <div>
      <span>本服务由谷熊科技提供</span>
    </div>
  </div>
</div>
</template>

<script>
import { XButton } from 'vux'
export default {
  components: {
    XButton
  },
  data () {
    return {
      sid: 0,
      info: {},
      wechatInfo: ''
    }
  },
  computed: {},
  created () {
    this.sid = this.$common.getShareParamter('sid')
    this.getStoreHomeInfo()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$common.setWechatTitle(to.meta.title)
    })
  },
  mounted () {
  },
  methods: {
    getStoreHomeInfo () {
      this.$api.user.getStoreHomeInfo(this.sid)
        .then((data) => {
          this.info = data.data
          this.wechatInfo = data.wechat_info
        })
    },
    goStore () {
      window.location.href = this.info.url
    },
    goWechat () {
      if (this.wechatInfo.concern_url) {
        window.location.href = this.wechatInfo.concern_url
      }
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
.page{
  box-sizing: border-box;
  background: #F5F4F9;
  min-height: 100%;
  padding: 0.2rem;
  position: relative;
}
  .store-content{
    background: #fff;
    text-align: center;
    border-radius: 0.048rem;
    .img-box{
      margin: 0.5rem 0;
      width: 1.8rem;
      border-radius: 50% 50%;
      overflow: hidden;
      display: inline-block;
      font-size: 0;
      img{
        width: 100%;
      }
    }
    .store-info{
      .store-info-title{
        color: #101010;
        font-size: 0.34rem;
        margin-bottom: 0.2rem;
      }
      .store-info-sub, .store-info-wehcat{
        color: #999;
        font-size: 0.28rem;
        margin-bottom: 0.2rem;
      }
      .store-info-wehcat{
        color: #1273e8;
        &:active{
          color: #999;
        }
      }
    }
    .store-btn{
      padding: 1.4rem 0 1.6rem 0;
      text-align: center;
      .btn{
        background-image: linear-gradient(0deg,
          rgba(18, 115, 232, 1) 0%,
          rgba(40, 163, 241, 1) 100%);
        color: #fff;
        border-radius: 0.04rem;
        width: 3.6rem;
        height: 0.86rem;
        font-size: 0.34rem;
        &:active{
          background: #66b1ff;
          color: #fff;
        }
      }
    }
  }
  .footer{
    font-size: 0.2rem;
    text-align: center;
    position: absolute;
    bottom: 0.5rem;
    width: 100%;
    left: 0;
    .idbear{
      margin-bottom: 0.2rem;
    }
  }
</style>
