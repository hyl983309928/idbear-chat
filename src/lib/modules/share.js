'use strict'

import Vue from 'vue'

function setShareInfo (title, desc, imgUrl, url, callback) {
  var shareInterval = setInterval(function () {
    Vue.wechat.updateAppMessageShareData({
      title: title, // 分享标题
      desc: desc,
      link: url,
      imgUrl: imgUrl,
      success: function (res) {
        console.log('success')
        // WechatPlugin.$wechat.closeWindow()
        callback && callback()
      },
      cancel: function (res) {
        console.log('cancel')
      }
    })
    Vue.wechat.updateTimelineShareData({
      title: title, // 分享标题
      desc: desc,
      link: url,
      imgUrl: imgUrl,
      success: function (res) {
        // WechatPlugin.$wechat.closeWindow()
        callback && callback()
      }
    })
  }, 1000)
  setTimeout(function () {
    clearInterval(shareInterval)
  }, 5000)
}

function setAppMessageShareInfo (title, desc, imgUrl, url, callback) {
  Vue.wechat.onMenuShareAppMessage({
    title: title, // 分享标题
    desc: desc,
    link: url,
    imgUrl: imgUrl,
    success: function (res) {
      // WechatPlugin.$wechat.closeWindow()
      callback && callback()
    },
    cancel: function () {
    }
  })
  var shareInterval = setInterval(function () {

  }, 1000)
  setTimeout(function () {
    clearInterval(shareInterval)
  }, 5000)
}
function setTimelineShareInfo (title, desc, imgUrl, url, callback) {
  Vue.wechat.onMenuShareTimeline({
    title: title, // 分享标题
    desc: desc,
    link: url,
    imgUrl: imgUrl,
    success: function (res) {
      // WechatPlugin.$wechat.closeWindow()
      callback && callback()
    }
  })
  var shareInterval = setInterval(function () {
  }, 1000)
  setTimeout(function () {
    clearInterval(shareInterval)
  }, 5000)
}

export default {
  setShareInfo,
  setAppMessageShareInfo,
  setTimelineShareInfo
}
