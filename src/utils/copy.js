import ClipboardJS from 'clipboard'

export function copyString (str) {
  let el = document.createElement('button')
  el.id = 'copy-box'
  el.style.display = 'none'
  el.dataset.clipboardText = str
  document.body.appendChild(el)
  let clipboard = new ClipboardJS('#copy-box')
  clipboard.on('success', (e) => {
    let copyEl = document.getElementById('copy-box')
    copyEl && document.body.removeChild(copyEl)
  })
  el.click()
}
