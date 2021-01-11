// const baseUrl = 'https://cdn.jsdelivr.net/gh/NicholasCao/assets/start_page/'

const getTime = function() {
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
    greeting: '',
    greetingStyle: '',
    coverStyle: '',
    isLiveBg: false,
    isImgBg: true,
    bgIndex: 1,
    bgLink: 'https://cdn.jsdelivr.net/gh/NicholasCao/assets/start_page/bg1.jpg',
    liveBgLink: 'https://cdn.jsdelivr.net/gh/NicholasCao/assets/start_page/bg_live_1.mp4',
    bgStyle: '',
    searchUrl: 'https://www.baidu.com/s?ie=utf-8&word=',
    suggestionUrl: 'http://suggestion.baidu.com/su?wd=',
    time: '',
    word: ''
  },
  methods: {
    change() {
      this.isLiveBg = !this.isLiveBg
      this.isImgBg = !this.isImgBg
      // if (this.isLiveBg) this.liveBgLink = 'https://cdn.jsdelivr.net/gh/NicholasCao/assets/start_page/bg_live_1.mp4'
    //   this.bgIndex++
    //   if (this.bgIndex > bgNum) {
    //     this.bgIndex = 1
    //   }
    //   this.bgLink = `${baseUrl}bg${this.bgIndex}.jpg`
    },
    search() {
      this.coverStyle = 'background-color: rgba(0,0,0,0.3);'
      // this.bgStyle = 'transform: scale(1.1);'
    },
    blur() {
      this.coverStyle = ''
      this.bgStyle = ''
    },
    input(e) {
      if (e.keyCode === 13) {
        window.open(this.searchUrl + this.word)
      }
    }
  }
  // },
  // watch: {
  //   isLiveBg() {

  //   }
  // }
})

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
// window.onfocus = () => {
//   if (vm.isLiveBg) document.querySelector('video').play()
// }

// window.onblur = () => {
//   document.querySelector('video').pause()
// }

// console
console.log('Welcome To My Math Class')
let s = ''
for (let x = 1; x <= 9; x++) {
  for (let y = 1; y <= x; y++) {
    s = s + y + 'x' + x + '=' + x * y + ' '
  }
  s = s + '\n'
}
console.log(s)
