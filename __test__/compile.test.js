import ViewModel from '../src/index.js'
import Compile from '../src/compile.js'

describe('ViewModel', () => {
  test('01_on', () => {
    const options = {
      data: { count: 1 },
      methods: {
        add() {
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
        hide() {
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
  })

  test('04_model', () => {
    const options = {
      data: { count: 1 },
      methods: {
        add() {
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

  test('06_compile_in_vm-for', () => {
    const options = {
      data: {
        cities: ['ShangHai', 'ShenZhen'],
        count: 1
      },
      methods: {
        add() {
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
})
