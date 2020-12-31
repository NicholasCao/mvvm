# mvvm-framework
A mini mvvm framework for graduation project, just a toy.

[![Build Status](https://travis-ci.org/NicholasCao/mvvm.svg?branch=main)](https://travis-ci.org/NicholasCao/mvvm)

todo:
- [x] deep get set
- [x] 数组监听
- [x] vm-for
- [ ] vm-for内进一步compile
- [ ] test with dom

watcher 各种映射关系的实例
dep 每个变量的依赖
dep.notify -> 通知watcher -> watcher触发update函数
