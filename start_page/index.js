// use Mobius's cdn
// https://cdn.jsdelivr.net/gh/MobiusBeta/assets/images/BG_A_Default_1.jpg
const bgBaseUrl = 'https://cdn.jsdelivr.net/gh/MobiusBeta/assets/images/BG_A_Default_'
// https://cdn.jsdelivr.net/gh/MobiusBeta/assets/videos/Live_Wallpaper_1.mp4
const bgLiveBaseUrl = 'https://cdn.jsdelivr.net/gh/MobiusBeta/assets/videos/Live_Wallpaper_'

const suggestionUrl = 'http://suggestion.baidu.com/su?wd='

const searchUrl = {
  '百度': 'https://www.baidu.com/s?ie=utf-8&word=',
  '必应': 'https://cn.bing.com/search?q=',
  '谷歌': 'https://www.google.com/search?q='
}

const vm = new VM({
  el: '#app',
  data: {
    status: 'nothing', // nothing searching setting
    greeting: '',
    greetingStyle: '',
    nickName: null,
    birthday: null,
    isLiveBg: false,
    bgIndex: null,
    bgsPewview: ['bgPreview1', 'bgPreview2', 'bgPreview3', 'bgPreview4', 'bgPreview5', 'bgPreview6'],
    bgsLivePewview: ['bgPreviewLive1', 'bgPreviewLive2'],
    bgLink: '',
    liveBgLink: '',
    searchEngine: null,
    searchEngines: ['百度', '必应', '谷歌'],
    searchEnginesClass: ['', '', ''],
    searchUrl: '',
    time: '',
    word: '',
    suggestion: []
  },
  methods: {
    focus (e) {
      e.stopPropagation()
      this.status = 'searching'
    },
    changeStatus () {
      if (this.status === 'searching') {
        this.suggestion = []
        this.word = ''
      }
      this.status = 'nothing'
    },
    setting () {
      this.status = 'setting'
    },
    close () {
      this.status = 'nothing'
    },
    input (e) {
      // enter
      if (e.keyCode === 13) {
        this.search(this.word)
      }
    },
    search (word) {
      this.suggestion = []
      this.word = ''
      window.open(this.searchUrl + word)
    },
    changeSearchEngine (searchEngine) {
      this.searchEngine = searchEngine
    },
    changeBg (index) {
      this.bgIndex = index
    }
  },
  watch: {
    bgIndex (val) {
      localStorage.setItem('start_page_bgIndex', val)

      if (val >= 6) {
        this.isLiveBg = true
        this.liveBgLink = `${bgLiveBaseUrl}${val - 5}.mp4`
      } else {
        this.isLiveBg = false
        this.bgLink = `${bgBaseUrl}${val + 1}.jpg`
      }
    },
    word (val) {
      if (val) jsonp(suggestionUrl + val)
    },
    searchEngine (val) {
      localStorage.setItem('start_page_searchEngine', val)

      this.searchUrl = searchUrl[val]
    },
    nickName (val) {
      localStorage.setItem('start_page_nickName', val)
    },
    birthday (val) {
      localStorage.setItem('start_page_birthday', val)
    }
  }
})

// Init
vm.bgIndex = Number(localStorage.getItem('start_page_bgIndex')) || 0
vm.searchEngine = localStorage.getItem('start_page_searchEngine') || '百度'
vm.nickName = localStorage.getItem('start_page_nickName') || ''
vm.birthday = localStorage.getItem('start_page_birthday') || ''

function getTime () {
  const d = new Date()
  let h = d.getHours()
  let m = d.getMinutes()
  if (h < 10) h = '0' + h
  if (m < 10) m = '0' + m
  return `${h}:${m}`
}

function isBirthday (now, birthday) {
  let month = String(now.getMonth() + 1)
  let date = String(now.getDate())

  const birArray = birthday.split('-')
  return equal(month, birArray[0]) && equal(date, birArray[1])
}

function equal (str, str2) {
  if (str.length === 1) str = '0' + str
  if (str2.length === 1) str2 = '0' + str2

  return str === str2
}

const now = new Date()
const hour = now.getHours()
let greeting
if (hour < 6) greeting = '早上好'
else if (hour < 12) greeting = '上午好'
else if (hour < 14) greeting = '中午好'
else if (hour < 18) greeting = '下午好'
else greeting = '晚上好'

if (isBirthday(now, vm.birthday)) greeting = '生日快乐'
if (vm.nickName) greeting += '，' + vm.nickName
else greeting += '！'

vm.greeting = greeting

vm.greetingStyle = 'opacity: 1; top: 0;'
setTimeout(() => {
  vm.greetingStyle = 'opacity: 0; top: -100px;'
}, 3000)

const oldTime = getTime()
vm.time = oldTime

/* 
 * 定时更新时间
 * 每秒监听时间，直至时间变化，改为每分钟更新时间
 */
const secInterval = setInterval(() => {
  const newTime = getTime()
  if (newTime !== oldTime) {
    vm.time = newTime
    setInterval(() => {
      vm.time = getTime()
    }, 60000)
    clearInterval(secInterval)
  }
}, 1000)

// 禁用右键
document.oncontextmenu = () => false

// 动态壁纸性能优化
window.onfocus = () => {
  if (vm.isLiveBg) document.querySelector('video').play()
}

window.onblur = () => {
  document.querySelector('video').pause()
}

// 使用jsonp解决跨域
function jsonp (url) {
  const JSONP = document.createElement('script')
  JSONP.type = 'text/javascript'
  JSONP.src = url
  document.getElementsByTagName('head')[0].appendChild(JSONP)
  setTimeout(() => {
    document.getElementsByTagName('head')[0].removeChild(JSONP)
  }, 500)
}

// 伪装一个baidu对象
// 接收baidu的jsonp
window.baidu = {
  sug (val) {
    vm.suggestion = val.s
  }
}

// console
console.log('网页仅用于学习用途')
console.log('网页样式来自%cLime Start Page %c青柠起始页 https://a.maorx.cn/', 'color: #70C000;', 'color: #000;')
