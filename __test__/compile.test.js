import ViewModel from '../src/index.js'
import Compile from '../src/compile.js'

describe('ViewModel', () => {
  test('01_on', () => {
    const options = {
      data: { count: 1 },
      methods: {
        add () {
          this.count++
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p> {{ count }} </p>
      <button @click="add">add</button>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p> 1 </p>
      <button @click="add">add</button>
    `)

    vm.add()
    expect(vm.$el.innerHTML).toBe(`
      <p> 2 </p>
      <button @click="add">add</button>
    `)
  })

  test('02_bind', () => {
    const options = {
      data: { style: 'display: block' },
      methods: {
        hide () {
          this.style = 'display: none'
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <div :style="style">1</div>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <div style="display: block">1</div>
    `)

    vm.hide()
    expect(vm.$el.innerHTML).toBe(`
      <div style="display: none">1</div>
    `)
  })

  test('03_text', () => {
    const options = {
      data: {
        user: {
          name: 'Jack',
          age: 18
        },
        cities: ['ShangHai', 'ShenZhen']
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p> {{ user.name }} {{ user.age }} </p>
      <p> {{ cities[0] }} {{ cities[1] }} </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p> Jack 18 </p>
      <p> ShangHai ShenZhen </p>
    `)

    vm.user.name = 'Jack'
    expect(vm.$el.innerHTML).toBe(`
      <p> Jack 18 </p>
      <p> ShangHai ShenZhen </p>
    `)

    vm.user = {
      name: 'Tom',
      age: 20
    }
    expect(vm.$el.innerHTML).toBe(`
      <p> Tom 20 </p>
      <p> ShangHai ShenZhen </p>
    `)
  })

  test('04_model', () => {
    const options = {
      data: { count: 1 },
      methods: {
        add () {
          this.count++
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p> {{ count }} </p>
      <input vm-model="count"></input>
      <button @click="add">add</button>
    `

    new Compile(vm, vm.$el)

    const input = vm.$el.querySelector('input')
    const e = new InputEvent('input', {
      inputType: 'insertText',
      data: 2,
      dataTransfer: null,
      isComposing: false
    })
    input.value = 2
    input.dispatchEvent(e)

    expect(vm.$el.innerHTML).toBe(`
      <p> 2 </p>
      <input vm-model="count">
      <button @click="add">add</button>
    `)

    vm.add()
    expect(input.value).toBe('3')
  })

  test('05_for', () => {
    const options = {
      data: {
        user: {
          name: 'Jack',
          age: 18
        },
        cities: ['ShangHai', 'ShenZhen']
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-for="(city, index) in cities"> cities[{{index}}]: {{city}} </p>
      <p vm-for="(val, key) in user"> user[{{key}}]: {{val}} </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p> cities[0]: ShangHai </p><p> cities[1]: ShenZhen </p>
      <p> user[name]: Jack </p><p> user[age]: 18 </p>
    `)

    vm.cities.push('BeiJing')
    vm.cities.shift()
    expect(vm.$el.innerHTML).toBe(`
      <p> cities[0]: ShenZhen </p><p> cities[1]: BeiJing </p>
      <p> user[name]: Jack </p><p> user[age]: 18 </p>
    `)
  })

  test('06_for_error', () => {
    const options = {
      data: {
        count: 1
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-for="i in count"> {{i}} </p>
    `

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => { })

    new Compile(vm, vm.$el)
    expect(consoleError).toHaveBeenCalledWith('count必须为对象或数组')
  })

  test('07_compile_in_vm-for', () => {
    const options = {
      data: {
        cities: ['ShangHai', 'ShenZhen'],
        count: 1
      },
      methods: {
        add () {
          this.count++
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <ul vm-for="(city, index) in cities">
        <li> cities[{{index}}]: {{city}} </li>
        <span> {{ count }} </span>
      </ul>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <ul>
        <li> cities[0]: ShangHai </li>
        <span> 1 </span>
      </ul><ul>
        <li> cities[1]: ShenZhen </li>
        <span> 1 </span>
      </ul>
    `)

    vm.add()
    vm.cities.push('BeiJing')
    expect(vm.$el.innerHTML).toBe(`
      <ul>
        <li> cities[0]: ShangHai </li>
        <span> 2 </span>
      </ul><ul>
        <li> cities[1]: ShenZhen </li>
        <span> 2 </span>
      </ul><ul>
        <li> cities[2]: BeiJing </li>
        <span> 2 </span>
      </ul>
    `)
  })

  test('08_compile_on_bind_in_vm-for', () => {
    let result
    const options = {
      data: {
        cities: ['ShangHai', 'ShenZhen']
      },
      methods: {
        click (e, val, index) {
          result = [e, val, index]
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-for="(city, index) in cities" :class="city" @click="click($event, city, index)">
        {{ city }}
      </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p class="ShangHai">
        ShangHai
      </p><p class="ShenZhen">
        ShenZhen
      </p>
    `)

    vm.$el.querySelector('p').click()
    expect(result[0] instanceof MouseEvent).toBe(true)
    expect(result[1]).toBe('ShangHai')
    expect(result[2]).toBe('0')
  })

  test('08_2_deep_compile_on_bind_in_vm-for', () => {
    let result
    const options = {
      data: {
        cities: ['ShangHai', 'ShenZhen']
      },
      methods: {
        click (e, val, index) {
          result = [e, val, index]
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-for="(city, index) in cities">
        <span :class="city" @click="click($event, city, index)"> {{ city }} </span>
      </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p>
        <span @click="click($event, cities[0], 0)" class="ShangHai"> ShangHai </span>
      </p><p>
        <span @click="click($event, cities[1], 1)" class="ShenZhen"> ShenZhen </span>
      </p>
    `)

    vm.$el.querySelector('span').click()
    expect(result[0] instanceof MouseEvent).toBe(true)
    expect(result[1]).toBe('ShangHai')
    expect(result[2]).toBe('0')
  })

  test('09_obverse_twice', () => {
    const options = {
      data: {
        user: {
          name: 'Jack',
          age: 18
        }
      }
    }

    const vm = new ViewModel(options)
    const vm2 = new ViewModel({
      data: vm._data
    })

    vm2.$el = document.createElement('div')
    vm2.$el.innerHTML = `
      <p> {{ user.name }} </p>
    `
    new Compile(vm2, vm2.$el)

    expect(vm2.$el.innerHTML).toBe(`
      <p> Jack </p>
    `)
  })

  test('010_show', () => {
    const options = {
      data: {
        count: 1,
        show: true
      },
      methods: {
        toggle () {
          this.show = !this.show
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-show="show"> {{ count }} </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p> 1 </p>
    `)

    vm.toggle()
    expect(vm.$el.innerHTML).toBe(`
      <p style="display: none;"> 1 </p>
    `)

    vm.toggle()
    expect(vm.$el.innerHTML).toBe(`
      <p style=""> 1 </p>
    `)
  })

  test('011_show_with_:style', () => {
    const options = {
      data: {
        count: 1,
        show: true,
        style: ''
      },
      methods: {
        toggle () {
          this.show = !this.show
        }
      }
    }
    const vm = new ViewModel(options)
    vm.$el = document.createElement('div')
    vm.$el.innerHTML = `
      <p vm-show="show" :style="style"> {{ count }} </p>
    `

    new Compile(vm, vm.$el)

    expect(vm.$el.innerHTML).toBe(`
      <p style=""> 1 </p>
    `)

    vm.toggle()
    expect(vm.$el.innerHTML).toBe(`
      <p style="display: none;"> 1 </p>
    `)

    vm.style = 'color: red'
    expect(vm.$el.innerHTML).toBe(`
      <p style="color: red; display: none;"> 1 </p>
    `)
  })
})
