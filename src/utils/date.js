/**
 * desc: 格式化时间函数封装
 * */
import dayjs from 'dayjs'

export function formatDate (time = '', format = 'YYYY-MM-DD HH:mm:ss') {
  if (time) {
    if (Object.prototype.toString.call(time) === '[object String]') {
      time = time.replace(/T/g, ' ')
      time = time.replace(/-/g, '/')
      time = time.substring(0, 18)
    }
    return dayjs(time).format(format)
  } else {
    return ''
  }
}
