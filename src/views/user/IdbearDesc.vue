<template>
<div class="page">
  <div class="idbear-logo">
    <div class="img-box">
      <img src="/static/imgs/logo.jpg" />
    </div>
    <div class="idbear-logo-title">
      熊小秘AI营销机器人
    </div>
  </div>
  <div class="idbear-desc">
    <div class="idbear-desc-item" v-for="(item, index) in descList" :key="index">
      <div class="idbear-desc-label">
        <span class="idbear-desc-label-marker"></span>
        <span class="idbear-desc-label-title">{{item.title}}</span>
      </div>
      <div class="idbear-desc-content" v-html="item.desc">
      </div>
    </div>
  </div>
  <div class="desc-btn">
    <x-button class="btn" @click.native="goIdbear">获得服务</x-button>
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
      descList: [
        { title: '服务介绍', desc: '熊小秘AI营销机器人，是谷熊科技出品的一款基于人工智能技术的高科技产品，主要服务于住宅地产和商业地产客户，致力于为每个楼盘和商城打造专属的云端SIRI，提升客户微信粉丝的互动率和线下销售转化率' },
        // { title: '适用范围', desc: '目前仅支持有赞店铺' },
        { title: '联系我们', desc: '<a href="tel:82559229" style="color: #666666;">0755-82559229</a>' }
      ]
    }
  },
  computed: {},
  created () {
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$common.setWechatTitle(to.meta.title)
    })
  },
  methods: {
    goIdbear () {
      window.location.href = 'http://koudaigou.net/web/formview/5bace1c575a03c273c8f0f8d'
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
.page{
  width: 100%;
  min-height: 100%;
  background: #F5F4F9;
}
  .idbear-logo{
    text-align: center;
    margin-bottom: 1rem;
    .img-box{
      display: inline-block;
      font-size: 0;
      width: 1.82rem;
      border-radius: 0.36rem;
      overflow: hidden;
      margin-top: 0.6rem;
      margin-bottom: 0.3rem;
      img{
        width: 100%;
      }
    }
    .idbear-logo-title{
      font-size: 0.34rem;
      color: #101010;
    }
  }

  .idbear-desc{
    .idbear-desc-item{
      padding: 0 0.2rem;
      margin-bottom: 0.5rem;
      .idbear-desc-label{
        display: flex;
        align-items: center;
        margin-bottom: 0.2rem;
        .idbear-desc-label-marker{
          display: inline-block;
          width: 0.2rem;
          height: 0.2rem;
          background: #118eea;
          margin-right: 0.2rem;
        }
        .idbear-desc-label-title{
          display: inline-block;
          font-size: 0.28rem;
          color: #333333;
        }
      }
      .idbear-desc-content{
        padding-left: 0.4rem;
        padding-right: 0.2rem;
        color: #666666;
        line-height: 0.36rem;
      }
    }
  }
.desc-btn{
  padding: 0.3rem 0 0.8rem 0;
  text-align: center;
  .btn{
    background-image: linear-gradient(180deg,
      #5FBAF4 0%,
      #3D97F6 100%);
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

</style>
