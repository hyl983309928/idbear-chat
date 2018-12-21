<template>
<div class="page">
  <!--<div>-->
    <!--当前选中类别：<span>{{selectTag.name}}</span>-->
  <!--</div>-->
  <div class="picker-box">
    <group title="请选择分类">
      <popup-picker :title="'当前类型'" :data="tagList" v-model="tagListValue" show-name :columns="1" @on-change="onChange" :placeholder="'请选择分类'"></popup-picker>
    </group>
  </div>
  <div style="margin: 30px 15px;">
    <x-button type="primary" @click.native="gotoStore">跳转至导购页</x-button>
  </div>
</div>

</template>

<script>
import { PopupPicker, Group, XButton } from 'vux'
export default {
  components: {
    PopupPicker,
    Group,
    XButton
  },
  data () {
    return {
      tagListValue: [''],
      tagList: [
        {
          value: '',
          name: '全品类'
        },
        {
          value: '99724471',
          name: '厨具'
        },
        {
          value: '100662372',
          name: '零食'
        },
        {
          value: '100713219',
          name: '护肤品'
        },
        {
          value: '100769535',
          name: '彩妆'
        },
        {
          value: '100769806',
          name: '茗茶'
        },
        {
          value: '100770306',
          name: '面部护理'
        },
        {
          value: '100815014',
          name: '内衣'
        },
        {
          value: '100818971',
          name: '家纺'
        },
        {
          value: '100899548',
          name: '灯具'
        }
      ]
    }
  },
  computed: {},
  created () {
    var selectTag = ''
    try {
      selectTag = window.localStorage.getItem('item_tags')
      if (selectTag) {
        this.tagListValue[0] = selectTag
      } else {
        this.tagListValue[0] = ''
      }
    } catch (e) {
      this.tagListValue[0] = ''
    }
  },
  methods: {
    onChange (data) {
      let selectTag = data[0]
      window.localStorage.setItem('item_tags', selectTag)
    },
    gotoStore (data) {
      var arr = window.location.href.split('?')
      var param = ''
      if (arr.length > 2) {
        param = arr[2]
      } else if (arr.length > 1) {
        param = arr[1]
      }
      this.$router.push('/store?' + param)
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
  .page{
    width: 100%;
    position: absolute;
    top: 0;
  }
.picker-box{
  font-size: 0.32rem;
}
</style>
