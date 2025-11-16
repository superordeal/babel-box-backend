const mongoose = require('mongoose');
const BibleItem = require('../models/BibleItem');
const Category = require('../models/Category');
require('dotenv').config();

// 默认分类数据
const categories = [
  { name: '前端框架' },
  { name: '后端开发' },
  { name: '算法原理' },
  { name: '数据库' }
];

// 默认八股文数据
const bibleItems = [
  {
    title: 'Vue Diff算法原理',
    content: 'Vue的Diff算法是虚拟DOM的核心，采用同层比较策略，通过key值快速定位节点，只更新发生变化的部分。',
    category: '前端框架',
    example: '// 使用key优化渲染性能\n<ul>\n  <li v-for="item in items" :key="item.id">{{ item.name }}</li>\n</ul>'
  },
  {
    title: 'React Hooks使用规则',
    content: '1. 只能在函数组件的顶层调用Hooks\n2. 只能在React函数组件或自定义Hook中调用Hooks\n3. 不要在循环、条件或嵌套函数中调用Hooks',
    category: '前端框架',
    example: '// 正确用法\nfunction Example() {\n  const [count, setCount] = useState(0);\n  \n  useEffect(() => {\n    document.title = `You clicked ${count} times`;\n  }, [count]);\n  \n  return <button onClick={() => setCount(count + 1)}>Click me</button>;\n}'
  },
  {
    title: 'Node.js事件循环机制',
    content: 'Node.js事件循环分为6个阶段：\n1. timers：执行setTimeout和setInterval的回调\n2. I/O callbacks：执行除close回调、timers、setImmediate之外的回调\n3. idle, prepare：仅系统内部使用\n4. poll：等待新的I/O事件\n5. check：执行setImmediate的回调\n6. close callbacks：执行关闭事件的回调',
    category: '后端开发',
    example: '// 示例：setTimeout vs setImmediate\nsetTimeout(() => {\n  console.log("timeout");\n}, 0);\n\nsetImmediate(() => {\n  console.log("immediate");\n});'
  },
  {
    title: '二分查找算法',
    content: '二分查找适用于已排序的数组，时间复杂度为O(log n)。\n步骤：\n1. 取数组中间元素与目标值比较\n2. 如果相等，返回索引\n3. 如果目标值小于中间元素，在左半部分继续查找\n4. 如果目标值大于中间元素，在右半部分继续查找\n5. 重复上述过程直到找到目标值或确定不存在',
    category: '算法原理',
    example: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) {\n      return mid;\n    } else if (arr[mid] < target) {\n      left = mid + 1;\n    } else {\n      right = mid - 1;\n    }\n  }\n  \n  return -1; // 目标值不存在\n}'
  }
];

// 检查数据库连接状态的函数
function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

// 连接数据库并初始化数据
async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected for seeding...');
    
    // 检查数据库是否连接成功
    if (!isDBConnected()) {
      console.log('警告: 数据库连接失败，应用将使用模拟数据模式运行');
      console.log('模拟数据已包含以下分类:', categories.map(c => c.name).join(', '));
      console.log('模拟数据已包含以下八股文:', bibleItems.map(i => i.title).join(', '));
      process.exit(0);
      return;
    }

    // 清空现有数据
    await BibleItem.deleteMany({});
    await Category.deleteMany({});
    console.log('Existing data cleared');

    // 插入分类
    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);
    
    // 为每个八股文找到对应的分类ID
    const bibleItemsWithCategory = bibleItems.map(item => {
      const category = createdCategories.find(cat => cat.name === item.category);
      return {
        ...item,
        category: category ? category._id : null
      };
    });

    // 插入八股文数据
    const createdItems = await BibleItem.insertMany(bibleItemsWithCategory);
    console.log(`${createdItems.length} bible items created`);

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err.message);
    console.log('应用将在启动时自动使用模拟数据模式运行');
    process.exit(1);
  }
}

// 如果直接运行此文件，则执行数据初始化
if (require.main === module) {
  seedData();
}

module.exports = seedData;
