<template>
  <div class="container">
    <div class="store-option">
      <div class="store-option-title">优选店铺</div>
      <div class="store-option-info">
        <div class="store-option-info-text">提示</div>
        <div class="store-option-info-content">
          <div v-for="(item,index) in storeList" :key="index">
            <div class="store-option-info-content-item" @click="goStore(item.name)">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {
      storeList: [{ name: '相依生活馆', id: 1 }, { name: '幸福西饼', id: 1 }, { name: '初兰官方商城', id: 1 }, { name: '悦诗风吟', id: 1 }]
    }
  },
  computed: {},
  created () {
  },
  methods: {
    goStore (id) {
      this.$router.push('/storeChat/' + id)
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  .container{
    width: 7.5rem;
    min-height: 100%;
    background-image: linear-gradient(170deg,
      rgba(20, 135, 178, 1) 0%,
      rgba(34, 170, 165, 1) 100%);
    background-attachment:fixed;
    padding: 0.5rem 0.3rem;
    color: #fff;
  }
  .store-option {
    .store-option-title{
      font-size: 0.62rem;
      text-align: center;
      margin-bottom: 0.28rem;
      font-weight: 200;
    }
    .store-option-info-text{
      font-size: 0.26rem;
    }
    .store-option-info-content{
      margin-top: 0.26rem;
      display: flex;
      flex-direction: column;
    }
    .store-option-info-content-item{
      padding: 0 0.3rem;
      line-height: 0.54rem;
      height: 0.54rem;
      background: #178398;
      font-size: 0.26rem;
      border-radius: 0.27rem;
      display: inline-block;
      margin-bottom: 0.3rem;
      flex-grow: 0;
      &:active{
        background: #097B98;
      }
    }
  }
  .disabled{
    color: #b2b5bf;
  }
</style>
