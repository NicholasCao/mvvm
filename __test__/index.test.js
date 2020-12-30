/*
 * Copyright (c) 2020 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* 基于鸿蒙os
 * ace_lite_jsfwk/packages/runtime-core/src/__test__/index.test.js修改
 */

import ViewModel from '../src/index.js'

describe('ViewModel', () => {
  test('01_proxy_data', () => {
    const options = { data: { count: 1 } }
    const vm = new ViewModel(options)
    expect(vm.count).toBe(options.data.count)
    vm.count = 2
    expect(options.data.count).toBe(2)
  })

  test('02_data_type', () => {
    const as1 = new ViewModel({ data: { count: 1 } })
    const as2 = new ViewModel({
      data() {
        return { count: 2 }
      }
    })
    expect(as1.count).toBe(1)
    expect(as2.count).toBe(2)
  })

  test('03_handler', () => {
    const vm = new ViewModel({
      data() {
        return { count: 1 }
      },
      methods: {
        increase() {
          ++this.count
        },
        decrease() {
          --this.count
        }
      }
    })
    expect(typeof vm.increase).toBe('function')
    expect(typeof vm.decrease).toBe('function')
    vm.increase()
    expect(vm.count).toBe(2)
    vm.decrease()
    expect(vm.count).toBe(1)
  })

  test('04_watch_basic_usage', done => {
    const vm = new ViewModel({
      data: function() {
        return { count: 1 }
      },
      methods: {
        increase() {
          ++this.count
        },
        decrease() {
          --this.count
        }
      },
      watch: {
        count(value) {
          expect(value).toBe(2)
          done()
        }
      }
    })

    expect(vm.count).toBe(1)
    vm.increase()
  })

  test('05_watch_nested_object', done => {
    const vm = new ViewModel({
      data: function() {
        return { user: { name: 'Chen' } }
      },

      methods: {
        setName(name) {
          this.user.name = name
        }
      }
    })

    vm.$watch('user', name => {
      expect(name).toBe('Chen2')
      done()
    })
    vm.setName('Chen2')
  })

  test('05_2_watch_nested_object2', done => {
    const vm = new ViewModel({
      data: function() {
        return { user: { name: 'Chen' } }
      },

      methods: {
        setName(name) {
          this.user.name = name
        }
      }
    })

    vm.$watch('user.name', name => {
      expect(name).toBe('Chen2')
      done()
    })
    vm.setName('Chen2')
  })

  test('05_2_watch_nested_object2', done => {
    const vm = new ViewModel({
      data: function() {
        return { user: { name: 'Chen' } }
      },

      methods: {
        setName(name) {
          this.user.name = name
        }
      }
    })

    vm.$watch('user.name', name => {
      expect(name).toBe('Chen2')
      done()
    })
    vm.setName('Chen2')
  })

  test('06_watch_array', done => {
    const vm = new ViewModel({
      data: function() {
        return { cities: ['HangZhou'] }
      },
      methods: {
        add(city) {
          this.cities.push(city)
        }
      }
    })

    vm.$watch(
      'cities',
      value => {
        expect(value.length).toBe(2)
        expect(value[1]).toBe('ShenZhen')
        done()
      }
    )
    vm.add('ShenZhen')
  })

  test('07_observed_array_push', done => {
    const vm = new ViewModel({
      data: {
        address: []
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[0]).toBe('BeiJing')
        done()
      }
    )

    vm.address.push('BeiJing')
  })

  test('08_observed_array_pop', done => {
    const vm = new ViewModel({
      data: {
        address: ['HangZhou', 'BeiJing']
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[1]).toBeUndefined()
        done()
      }
    )

    vm.address.pop()
  })

  test('09_observed_array_unshift', done => {
    const vm = new ViewModel({
      data: {
        address: []
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[0]).toBe('HangZhou')
        done()
      }
    )

    vm.address.unshift('HangZhou')
  })

  test('10_observed_array_shift', done => {
    const vm = new ViewModel({
      data: {
        address: ['BeiJing', 'HangZhou']
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[0]).toBe('HangZhou')
        done()
      }
    )

    vm.address.shift()
  })

  test('11_observed_array_splice', done => {
    const vm = new ViewModel({
      data: {
        address: ['BeiJing', 'HangZhou']
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[0]).toBe('ShenZhen')
        done()
      }
    )

    vm.address.splice(0, 1, 'ShenZhen')
  })

  test('12_observed_array_reverse', done => {
    const vm = new ViewModel({
      data: {
        address: ['BeiJing', 'HangZhou']
      }
    })

    vm.$watch(
      'address',
      value => {
        expect(value[0]).toBe('HangZhou')
        done()
      }
    )

    vm.address.reverse()
  })

  // test('13_watch_multidimensional_array', done => {
  //   const vm = new ViewModel({
  //     data: function() {
  //       return {
  //         numbers: [
  //           [0, 0, 0, 2],
  //           [0, 0, 0, 0],
  //           [0, 0, 0, 0],
  //           [0, 0, 0, 0]
  //         ]
  //       }
  //     }
  //   })

  //   vm.$watch(
  //     'numbers',
  //     value => {
  //       expect(value[0][0]).toBe(4)
  //       done()
  //     }
  //   )

  //   vm.numbers[0].splice(0, 1, 4)
  // })

  // test('14_watch_multidimensional_array', done => {
  //   const vm = new ViewModel({
  //     data: function() {
  //       return {
  //         numbers: [
  //           [0, 0, 0, 2],
  //           [0, 0, 0, 0],
  //           [0, 0, 0, 0],
  //           [0, 0, 0, 0]
  //         ]
  //       }
  //     }
  //   })

  //   vm.$watch(
  //     'numbers',
  //     value => {
  //       expect(value[0][0]).toBe(4)
  //       done()
  //     }
  //   )

  //   vm.numbers.splice(0, 1, [4, 4, 4, 4])
  // })

  test('15_change_array_by_index', done => {
    const vm = new ViewModel({
      data: {
        users: ['Jack', 'Mike']
      }
    })

    vm.$watch(
      'users',
      value => {
        expect(value[0]).toBe('Enzo')
        done()
      }
    )

    vm.$set('users', 0, 'Enzo')
  })

  test('16_watch_object_array', done => {
    const vm = new ViewModel({
      data: {
        users: []
      }
    })

    vm.$watch(
      'users',
      users => {
        expect(users[0].name).toEqual('Jack')
        done()
      }
    )
    vm.users.push({ name: 'Jack' })
  })

  test('16_2_watch_object_array', done => {
    const vm = new ViewModel({
      data: {
        users: [{ name: 'Jack' }]
      }
    })

    vm.$watch(
      'users',
      users => {
        expect(users[0].name).toEqual('Enzo')
        done()
      }
    )

    vm.$set('users', 0, { name: 'Enzo' })
  })

  test('17_watch_object&array_delete', done => {
    const vm = new ViewModel({
      data: {
        numbers: [1, 2, 3],
        person: {
          name: 'Jack',
          age: 18
        }
      }
    })

    vm.$watch(
      'numbers',
      numbers => {
        expect(numbers).toEqual([1, 2])
      }
    )
    vm.$watch(
      'person',
      () => {
        expect(vm.person).toEqual({ name: 'Jack' })
        done()
      }
    )

    vm.$delete('numbers', 2)
    vm.$delete('person', 'age')
  })

  test('18_observed_array_sort', done => {
    const vm = new ViewModel({
      data: {
        numbers: [4, 1, 9, 2]
      }
    })
    vm.$watch(
      'numbers',
      numbers => {
        expect(numbers).toEqual([1, 2, 4, 9])
        done()
      }
    )
    vm.numbers.sort()
  })

  // test('99_lifecycle', () => {
  // const onInit = jest.fn().mockReturnValue('onInit')
  //   const onReady = jest.fn().mockReturnValue('onReady')
  //   const onShow = jest.fn().mockReturnValue('onShow')
  //   const onDestroy = jest.fn().mockReturnValue('onDestroy')
  //   const onDataChange = jest.fn().mockReturnValue('onDataChange')

  //   const vm = new ViewModel({
  //     onInit,
  //     onReady,
  //     onShow,
  //     onDestroy,
  //     onDataChange
  //   })

  //   expect(vm.onInit()).toBe('onInit')
  //   expect(vm.onDataChange()).toBe('onDataChange')
  //   expect(vm.onReady()).toBe('onReady')
  //   expect(vm.onShow()).toBe('onShow')
  //   expect(vm.onDestroy()).toBe('onDestroy')

  //   expect(onInit.mock.instances[0]).toBe(vm)
  //   expect(onDataChange.mock.instances[0]).toBe(vm)
  //   expect(onReady.mock.instances[0]).toBe(vm)
  //   expect(onShow.mock.instances[0]).toBe(vm)
  //   expect(onDestroy.mock.instances[0]).toBe(vm)
  // })
})
