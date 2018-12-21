export default {
  components: {},
  mixins: [],
  data () {
    return {}
  },
  computed: {},
  created () {},
  mounted () {},
  methods: {
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
    }
  },
  watch: {}
}
