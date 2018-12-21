<template>
<div class="page">
  <div v-if="shareInfo.shareuser_visitor && shareInfo.shareuser_visitor.length != 0">
    <div class="user-length">{{`已有${shareInfo.shareuser_visitor.length}个好友访问过我的分享`}}</div>
    <div class="user-item border-1px-bottom" v-for="(item,index) in shareInfo.shareuser_visitor" :key="index">
      <img :src="item.user.headimgurl" />
      <span class="nickname">{{item.user.nickname}}</span>
      <span class="time">{{formatDate(item.create_time)}}</span>
    </div>
  </div>
  <p class="null-text" v-else>
    无分享好友信息
  </p>
</div>
</template>

<script>
import { formatDate } from '../../utils/date'
import common from '@/utils/common'
export default {
  components: {},
  data () {
    return {
      shareInfo: {}
    }
  },
  computed: {},
  created () {
    this.robotId = common.getShareParamter('robot_id')
    this.openid = common.getShareParamter('openid')
    this.getShareInfo()
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$common.setWechatTitle(to.meta.title)
    })
  },
  methods: {
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
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
.page{
  background: #fff;
  min-height: 100%;
  position: relative;
  padding: 0 0.24rem;
  padding-top: 0.2rem;
}
.user-length{
  font-size: 0.28rem;
  color: #303132;
  padding: 0.2rem 0;
}
  .user-item{
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0.2rem 0;
    border-bottom: 1px solid #DCDFE6;
    img{
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50% 50%;
      margin-right: 0.2rem;
      flex-grow: 0;
    }
    span{
      font-size: 0.28rem;
    }
    .nickname{
      flex-grow: 1;
    }
    .time{
      flex-grow: 0;
      font-size: 0.2rem;
      color: #909399;
    }
  }
  .null-text{
    padding: 0.3rem;
    text-align: center;
    font-size: 0.3rem;
  }
</style>
