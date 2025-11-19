// 注意：该文件已弃用，项目已从 MongoDB 迁移到 MySQL + Sequelize
// 保留此文件以便参考数据结构。生产数据使用 database 的实际创建脚本。

require('dotenv').config();

// 默认分类数据（参考）
const categories = [
  { name: '前端框架' },
  { name: '后端开发' },
  { name: '算法原理' },
  { name: '数据库' }
];

// 默认八股文数据（参考）
const bibleItems = [
  {
    title: 'Vue Diff算法原理',
    content: 'Vue的Diff算法是虚拟DOM的核心，采用同层比较策略，通过key值快速定位节点，只更新发生变化的部分。',
    category: '前端框架'
  },
  {
    title: 'React Hooks使用规则',
    content: '1. 只能在函数组件的顶层调用Hooks\n2. 只能在React函数组件或自定义Hook中调用Hooks\n3. 不要在循环、条件或嵌套函数中调用Hooks',
    category: '前端框架'
  },
  {
    title: 'Node.js事件循环机制',
    content: 'Node.js事件循环分为6个阶段：\n1. timers：执行setTimeout和setInterval的回调\n2. I/O callbacks：执行除close回调、timers、setImmediate之外的回调\n3. idle, prepare：仅系统内部使用\n4. poll：等待新的I/O事件\n5. check：执行setImmediate的回调\n6. close callbacks：执行关闭事件的回调',
    category: '后端开发'
  },
  {
    title: '二分查找算法',
    content: '二分查找适用于已排序的数组，时间复杂度为O(log n)。',
    category: '算法原理'
  }
];

console.log('seedData.js 已弃用，请查看 initDB.js 进行数据初始化');

module.exports = seedData;
