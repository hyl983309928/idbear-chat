
export function isUrl (value) {
  var re = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/
  if (re.test(value)) {
    return {
      valid: true,
      msg: '必须为合法域名'
    }
  } else {
    return {
      valid: false,
      msg: '必须为合法域名'
    }
  }
}
