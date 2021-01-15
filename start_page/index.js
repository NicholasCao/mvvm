// https://cdn.jsdelivr.net/gh/MobiusBeta/assets/images/BG_A_Default_1.jpg
const bgBaseUrl = 'https://cdn.jsdelivr.net/gh/MobiusBeta/assets/images/BG_A_Default_'
// https://cdn.jsdelivr.net/gh/MobiusBeta/assets/videos/Live_Wallpaper_1.mp4
const bgLiveBaseUrl = 'https://cdn.jsdelivr.net/gh/MobiusBeta/assets/videos/Live_Wallpaper_'

const suggestionUrl = 'http://suggestion.baidu.com/su?wd='

const getTime = function () {
  const d = new Date()
  let h = d.getHours()
  let m = d.getMinutes()
  if (h < 10) h = '0' + h
  if (m < 10) m = '0' + m
  return `${h}:${m}`
}

const vm = new VM({
  el: '#app',
  data: {
    status: 'nothing', // nothing searching setting
    settingStyle: '',
    greeting: '',
    greetingStyle: '',
    coverStyle: '',
    isLiveBg: false,
    isImgBg: true,
    bgIndex: null,
    bgsPewview: ['bgPreview1', 'bgPreview2', 'bgPreview3', 'bgPreview4', 'bgPreview5', 'bgPreview6'],
    bgPreviewClass: ['bgPreview', 'bgPreview', 'bgPreview', 'bgPreview', 'bgPreview', 'bgPreview', 'bgPreview', 'bgPreview'],
    bgsLivePewview: ['bgPreviewLive1', 'bgPreviewLive2'],
    bgLink: '',
    liveBgLink: '',
    bgStyle: '',
    searchUrl: 'https://www.baidu.com/s?ie=utf-8&word=',
    time: '',
    word: ''
  },
  methods: {
    search () {
      this.status = 'searching'
    },
    blur () {
      this.status = 'nothing'
    },
    setting () {
      this.status = 'setting'
    },
    input (e) {
      if (e.keyCode === 13) {
        window.open(this.searchUrl + this.word)
      }
    },
    changeBg (index) {
      // hangdle '0+6'
      this.bgIndex = eval(index)
    }
  },
  watch: {
    status(val, oldVal) {
      if (oldVal === 'setting') this.settingStyle = ''

      if (val === 'nothing') {
        this.coverStyle = ''
        this.bgStyle = ''
      } else if (val === 'searching') {
        this.coverStyle = 'background-color: rgba(0,0,0,0.3);'
        this.bgStyle = 'transform: scale(1.1);'
      } else if (val === 'setting') {
        this.settingStyle = 'opacity: 1; height: 500px;'
        this.coverStyle = 'background-color: rgba(0,0,0,0.3);'
      }
    },
    bgIndex(val, oldVal) {
      localStorage.setItem('start_page_bgIndex', val)

      if (oldVal !== null) this.$set('bgPreviewClass', oldVal, 'bgPreview')
      this.$set('bgPreviewClass', val, 'bgPreview selected')
      if (val >= 6) {
        this.isLiveBg = true
        this.liveBgLink = `${bgLiveBaseUrl}${val - 5}.mp4`
        this.isImgBg = false
        this.bgLink = ''
      } else {
        this.isLiveBg = false
        this.liveBgLink = ''
        this.isImgBg = true
        this.bgLink = `${bgBaseUrl}${val + 1}.jpg`
      }
    }
  }
})

vm.bgIndex = Number(localStorage.getItem('start_page_bgIndex')) || 0

const now = new Date()
const hour = now.getHours()
if (hour < 6) vm.greeting = '早上好！'
else if (hour < 12) vm.greeting = '上午好！'
else if (hour < 14) vm.greeting = '中午好！'
else if (hour < 18) vm.greeting = '下午好！'
else vm.greeting = '晚上好！'

vm.greetingStyle = 'opacity: 1; top: 0;'
setTimeout(() => {
  vm.greetingStyle = 'opacity: 0; top: -100px;'
}, 3000)

const oldTime = getTime()
vm.time = oldTime

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

// 性能优化
window.onfocus = () => {
  if (vm.isLiveBg) document.querySelector('video').play()
}

window.onblur = () => {
  document.querySelector('video').pause()
}

// console
console.log('网页仅用于学习用途')
console.log('网页样式来自%cLime Start Page %c青柠起始页 https://a.maorx.cn/', 'color: #70C000;', 'color: #000;')
