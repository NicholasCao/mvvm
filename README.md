# mvvm-framework
A mini mvvm framework for graduation project, just a toy.

[![Build Status](https://travis-ci.org/NicholasCao/mvvm.svg?branch=main)](https://travis-ci.org/NicholasCao/mvvm)
[![Codecov](https://codecov.io/gh/NicholasCao/mvvm/branch/main/graph/badge.svg)](https://codecov.io/github/NicholasCao/mvvm?branch=master)

watcher 各种映射关系的实例
dep 每个变量的依赖
dep.notify -> 通知watcher -> watcher触发update函数

实现指令:
- vm-on | @
- vm-bind | :
- {{ text }}
- vm-model
- vm-for
- vm-show

todo:
- [x] deep get set
- [x] 数组监听
- [x] vm-for
- [x] vm-for内进一步compile
- [x] test with dom
- [x] 监听表达式
