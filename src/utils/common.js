/* eslint-disable */
var version = ''
function getShareParamter (key) {
  var arr = window.location.href.split('?')
  var param = ''
  if (arr.length > 2) {
    param = arr[2]
  } else if (arr.length > 1) {
    param = arr[1]
  }
  var regExp = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i')
  var match = param.match(regExp)
  return match ? decodeURIComponent(match[2]) : ''
}

function setWechatTitle (title, img) {
  if (title === undefined || window.document.title === title) {
    return
  }
  document.title = title
  var mobile = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(mobile)) {
    var iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    // 替换成站标favicon路径或者任意存在的较小的图片即可
    iframe.setAttribute('src', img || '')
    var iframeCallback = function () {
      setTimeout(function () {
        iframe.removeEventListener('load', iframeCallback)
        document.body.removeChild(iframe)
      }, 0)
    }
    iframe.addEventListener('load', iframeCallback)
    document.body.appendChild(iframe)
  }
}

function get_ios_version(){
  if (version) {
    return version
  }
  var ua = navigator.userAgent.toLowerCase()
  version = ''
  if (ua.indexOf("like mac os x") > 0) {
    var reg = /os [\d._]+/gi
    var v_info = ua.match(reg)
    version = (v_info + "").replace(/[^0-9|_.]/ig, "").replace(/_/ig, ".") // 得到版本号9.3.2或者9.0
    version = parseInt(version.split('.')[0]) // 得到版本号第一位
  }
  return version
}

export function list2map (list, key = 'value', value) {
  if (Object.prototype.toString.call(list) !== '[object Array]') {
    console.log(new Error('list2map：list必须为数组'))
    return {}
  }
  let map = {}
  list.forEach((item) => {
    if (value) {
      map[item[key]] = item[value]
    } else {
      map[item[key]] = item
    }
  })
  return map
}

export default {
  getShareParamter,
  setWechatTitle,
  get_ios_version
}
