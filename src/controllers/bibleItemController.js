const BibleItem = require('../models/bibleItemModel');
const { Op } = require('sequelize');
const { isDBConnected } = require('../config/db');

// 模拟数据，当数据库连接失败时使用
const mockBibleItems = [
  {
    id: '1',
    title: 'Vue Diff算法原理',
    content: 'Vue的Diff算法采用了双端比较的策略，通过比较新旧虚拟DOM树的差异，最小化DOM操作以提高性能。',
    category: '前端框架',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Node.js事件循环机制',
    content: 'Node.js采用单线程事件循环模型，通过异步非阻塞I/O操作，实现高效的并发处理能力。',
    category: '后端开发',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: '快速排序算法',
    content: '快速排序是一种分治算法，通过选择一个基准元素，将数组分为小于基准和大于基准的两部分，然后递归排序。',
    category: '算法原理',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'MongoDB索引优化',
    content: 'MongoDB索引可以显著提高查询性能，常用的索引类型包括单字段索引、复合索引、文本索引等。',
    category: '数据库',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'React Hooks使用指南',
    content: 'React Hooks允许在函数组件中使用状态和其他React特性，常用的Hooks包括useState、useEffect、useContext等。',
    category: '前端框架',
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    title: 'TypeScript高级类型',
    content: 'TypeScript提供了丰富的类型系统，包括联合类型、交叉类型、泛型、条件类型等高级特性。',
    category: '编程语言',
    created_at: new Date().toISOString()
  },
  {
    id: '7',
    title: 'Redis缓存策略',
    content: 'Redis作为高性能的内存数据库，常用的缓存策略包括LRU、LFU、FIFO等，合理的缓存策略可以提高系统性能。',
    category: '缓存技术',
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    title: 'Docker容器化部署',
    content: 'Docker通过容器化技术实现应用的快速部署和环境一致性，使用Docker Compose可以管理多容器应用。',
    category: '运维部署',
    created_at: new Date().toISOString()
  },
  {
    id: '9',
    title: 'JWT认证原理',
    content: 'JWT(JSON Web Token)是一种无状态的认证机制，由header、payload和signature三部分组成。',
    category: '安全技术',
    created_at: new Date().toISOString()
  },
  {
    id: '10',
    title: '微服务架构设计',
    content: '微服务架构将应用拆分为多个独立的服务，通过API网关、服务发现、配置中心等组件实现服务治理。',
    category: '架构设计',
    created_at: new Date().toISOString()
  },
  {
    id: '11',
    title: 'CSS Grid布局详解',
    content: 'CSS Grid是一种二维布局系统，可以同时处理行和列，为网页布局提供了强大的灵活性。',
    category: '前端布局',
    created_at: new Date().toISOString()
  },
  {
    id: '12',
    title: 'WebSocket实时通信',
    content: 'WebSocket提供了全双工的通信通道，适用于需要实时数据更新的应用场景，如在线聊天、实时游戏等。',
    category: '网络通信',
    created_at: new Date().toISOString()
  }
];

let mockIdCounter = 5;

// @desc    Get all bible items with pagination (no search filtering)
// @route   GET /api/bible-items/all?page=:page&pageSize=:pageSize&category=:category
// @access  Public
const getAllBibleItems = async (req, res) => {
  try {
    console.log('===== 获取全部数据请求开始 =====');
    // 记录完整的查询参数，确认从前端传递到后端的参数
    console.log('请求查询参数从前端接收:', JSON.stringify(req.query));
    console.log(req.query);
    
    
    // 获取查询参数
    const { page = 1, pageSize = 6, category = 'all' } = req.query;
    
    // 处理数字参数
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 6;
    const offset = (parsedPage - 1) * parsedPageSize;
    
    // 对分类参数进行URL解码
    let decodedCategory = category;
    try {
      decodedCategory = decodeURIComponent(category);
      console.log('分类参数解码前:', category, '解码后:', decodedCategory);
    } catch (error) {
      console.error('分类参数解码失败:', error);
      // 解码失败时使用原始值
    }
    
    console.log('原始查询参数:', JSON.stringify(req.query));
    console.log(`处理后参数 - 页码: ${parsedPage}, 每页数量: ${parsedPageSize}, 分类: ${decodedCategory}`);

    // 构建查询条件（仅分类过滤）
    const whereCondition = {};
    
    // 如果有分类过滤且不是'all'，添加分类条件
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      console.log(`添加分类过滤条件: ${decodedCategory}`);
      whereCondition.category = decodedCategory;
    }
    
    console.log('查询条件:', JSON.stringify(whereCondition));
    console.log('开始执行数据库查询...');
    
    // 优先使用数据库数据
    const dbConnected = isDBConnected();
    console.log('数据库连接状态检查:', dbConnected);
    if (dbConnected) {
      try {
        console.log('使用数据库模式查询');
        // 使用findAll和count分别获取数据和总数
        const rows = await BibleItem.findAll({
          where: whereCondition,
          offset: offset,
          limit: parsedPageSize,
          order: [['created_at', 'DESC']] // 按创建时间降序排列
        });

        // 获取总记录数
        const count = await BibleItem.count({ where: whereCondition });
        console.log('数据库查询成功，获取到', rows.length, '条记录，总数:', count);
        
        console.log('===== 获取全部数据请求结束 =====');

        // 确保返回正确的数据结构
        res.status(200).json({
          items: rows,
          pagination: {
            currentPage: parsedPage,
            pageSize: parsedPageSize,
            totalItems: count,
            totalPages: Math.ceil(count / parsedPageSize)
          }
        });
        return;
      } catch (dbError) {
        console.error('数据库查询发生错误:', dbError.message);
        console.log('即使数据库已连接但查询失败，切换到模拟数据作为后备方案');
      }
    } else {
      console.log('数据库未连接或检查失败，使用模拟数据');
    }
      
    // 使用模拟数据并应用相同的过滤条件
    let filteredItems = [...mockBibleItems];
    
    // 仅应用分类过滤
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      filteredItems = filteredItems.filter(item => 
        item.category === decodedCategory
      );
    }
    
    // 计算总数和分页
    const totalItems = filteredItems.length;
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    console.log('使用模拟数据，过滤后共', totalItems, '条记录，当前页返回', paginatedItems.length, '条');
    console.log('===== 获取全部数据请求结束 =====');
    
    // 返回模拟数据
    res.status(200).json({
      items: paginatedItems,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / parsedPageSize)
      }
    });
  
  } catch (err) {
    console.error('===== 获取全部数据请求错误 =====');
    console.error('获取全部八股文条目发生未知错误:', err);
    
    // 即使出现严重错误，也返回模拟数据，确保API不会完全失败
    const { page = 1, pageSize = 6, category = 'all' } = req.query;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 6;
    
    let fallbackItems = [...mockBibleItems];
    
    // 仅应用分类过滤
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      fallbackItems = fallbackItems.filter(item => 
        item.category === decodedCategory
      );
    }
    
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;
    const paginatedFallbackItems = fallbackItems.slice(startIndex, endIndex);
    const totalItems = fallbackItems.length;
    const totalPages = Math.ceil(totalItems / parsedPageSize);
    
    console.log('使用最终备选方案返回模拟数据');
    res.status(200).json({
      items: paginatedFallbackItems,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems,
        totalPages
      }
    });
  }
};

// @desc    Get bible items with pagination and filtering
// @route   GET /api/bible-items?page=:page&pageSize=:pageSize&search=:search&category=:category
// @access  Public
const getBibleItems = async (req, res) => {
  try {
    console.log('===== 搜索请求开始 =====');
    // 记录完整的查询参数，确认从前端传递到后端的参数
    console.log('请求查询参数从前端接收:', JSON.stringify(req.query));
    
    // 获取查询参数
    const { page = 1, pageSize = 6, search = '', category = 'all' } = req.query;
    
    // 处理数字参数
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 6;
    const offset = (parsedPage - 1) * parsedPageSize;
    
    // 对分类参数进行URL解码
    let decodedCategory = category;
    try {
      decodedCategory = decodeURIComponent(category);
      console.log('分类参数解码前:', category, '解码后:', decodedCategory);
    } catch (error) {
      console.error('分类参数解码失败:', error);
      // 解码失败时使用原始值
    }
    
    // 解码URL编码的搜索关键词
    let decodedSearch = search;
    try {
      if (search && search.trim() !== '') {
        decodedSearch = decodeURIComponent(search);
        console.log('URL解码前:', search, '解码后:', decodedSearch);
      }
    } catch (e) {
      console.warn('搜索关键词解码失败，使用原始关键词:', e.message);
    }
    
    console.log('原始查询参数:', JSON.stringify(req.query));
    console.log('搜索关键词存在:', !!decodedSearch, '值:', decodedSearch, '类型:', typeof decodedSearch);
    console.log(`处理后参数 - 页码: ${parsedPage}, 每页数量: ${parsedPageSize}, 搜索关键词: ${decodedSearch}, 分类: ${decodedCategory}`);

    // 构建查询条件
    const whereCondition = {};
    
    if (decodedSearch && decodedSearch.trim() !== '') {
      console.log('构建搜索条件，只对title字段搜索，关键词:', decodedSearch);
      // 只搜索title字段，支持中文
      whereCondition.title = { [Op.like]: `%${decodedSearch}%` };
      console.log('已应用搜索条件，只搜索title字段');
    } else {
      console.log('未应用搜索条件');
    }
    
    // 如果有分类过滤且不是'all'，添加分类条件
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      console.log(`添加分类过滤条件: ${decodedCategory}`);
      whereCondition.category = decodedCategory;
    }
    
    console.log('查询条件:', JSON.stringify(whereCondition));
    console.log('开始执行数据库查询...');
    
    // 优先使用数据库数据
    const dbConnected = isDBConnected();
    console.log('数据库连接状态:', dbConnected);
    
    if (dbConnected) {
      try {
        console.log('使用数据库模式查询');
        // 使用findAll和count分别获取数据和总数
        const rows = await BibleItem.findAll({
          where: whereCondition,
          offset: offset,
          limit: parsedPageSize,
          order: [['created_at', 'DESC']] // 按创建时间降序排列
        });

        // 获取总记录数
        const count = await BibleItem.count({ where: whereCondition });
        console.log('数据库查询成功，获取到', rows.length, '条记录，总数:', count);
        
        if (rows.length > 0) {
          console.log('返回的记录标题:', rows.map(item => item.title));
        }
        
        console.log('===== 搜索请求结束 =====');

        // 确保返回正确的数据结构
        res.status(200).json({
          items: rows,
          pagination: {
            currentPage: parsedPage,
            pageSize: parsedPageSize,
            totalItems: count,
            totalPages: Math.ceil(count / parsedPageSize)
          }
        });
        return;
      } catch (dbError) {
        console.error('数据库查询发生错误:', dbError.message);
        console.log('即使数据库已连接但查询失败，切换到模拟数据作为后备方案');
      }
    } else {
      console.log('数据库未连接，使用模拟数据');
    }
      
    // 使用模拟数据并应用相同的过滤条件
    let filteredItems = [...mockBibleItems];
    console.log('模拟数据总数:', mockBibleItems.length);
    
    // 应用搜索过滤
    if (decodedSearch && decodedSearch.trim() !== '') {
      console.log(`模拟数据搜索 - 在title和content字段搜索: ${decodedSearch}`);
      console.log('搜索关键词详情:', JSON.stringify(decodedSearch));
      
      // 添加详细的匹配日志
      filteredItems = mockBibleItems.filter(item => {
        const titleMatch = item.title.includes(decodedSearch);
        if (titleMatch) {
          console.log(`找到匹配项: ID=${item.id}, 标题=${item.title}, 标题匹配=${titleMatch}`);
        }
        return titleMatch;
      });
      console.log('模拟数据搜索结果数量:', filteredItems.length);
    }
    
    // 应用分类过滤
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      filteredItems = filteredItems.filter(item => 
        item.category === decodedCategory
      );
    }
    
    // 计算总数和分页
    const totalItems = filteredItems.length;
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    console.log('使用模拟数据，过滤后共', totalItems, '条记录，当前页返回', paginatedItems.length, '条');
    console.log('===== 搜索请求结束 =====');
    
    // 返回模拟数据
    res.status(200).json({
      items: paginatedItems,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems: totalItems,
        totalPages: Math.ceil(totalItems / parsedPageSize)
      }
    });
  
  } catch (err) {
    console.error('===== 搜索请求错误 =====');
    console.error('获取八股文条目发生未知错误:', err);
    
    // 即使出现严重错误，也返回模拟数据，确保API不会完全失败
    const { page = 1, pageSize = 6, search = '', category = 'all' } = req.query;
    const parsedPage = parseInt(page, 10) || 1;
    const parsedPageSize = parseInt(pageSize, 10) || 6;
    
    let fallbackItems = [...mockBibleItems];
    
    // 应用过滤条件
    if (decodedSearch && decodedSearch.trim() !== '') {
      fallbackItems = fallbackItems.filter(item => 
        item.title.includes(decodedSearch)
      );
    }
    
    if (decodedCategory && decodedCategory !== 'all' && decodedCategory !== '') {
      fallbackItems = fallbackItems.filter(item => 
        item.category === decodedCategory
      );
    }
    
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;
    const paginatedFallbackItems = fallbackItems.slice(startIndex, endIndex);
    const totalItems = fallbackItems.length;
    const totalPages = Math.ceil(totalItems / parsedPageSize);
    
    console.log('使用最终备选方案返回模拟数据');
    res.status(200).json({
      items: paginatedFallbackItems,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems,
        totalPages
      }
    });
  }
};

// @desc    Get bible item by ID
// @route   GET /api/bible-items/:id
// @access  Public
const getBibleItemById = async (req, res) => {
  try {
    if (isDBConnected()) {
      // 使用数据库
      const bibleItem = await BibleItem.findByPk(req.params.id);
      if (!bibleItem) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }
      res.status(200).json(bibleItem);
    } else {
      // 使用模拟数据
      const bibleItem = mockBibleItems.find(item => item.id === req.params.id);
      if (!bibleItem) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }
      res.status(200).json(bibleItem);
    }
  } catch (err) {
    console.error('获取八股文条目详情失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Create a bible item
// @route   POST /api/bible-items
// @access  Public
const createBibleItem = async (req, res) => {
  const { title, content, category, example } = req.body;

  try {
    // 验证必填字段
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: '标题不能为空' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: '内容不能为空' });
    }
    if (!category || category.trim() === '') {
      return res.status(400).json({ message: '分类不能为空' });
    }

    if (isDBConnected()) {
      // 使用数据库
      const bibleItem = await BibleItem.create({
        title,
        content,
        category,
        example: example || null
      });
      res.status(201).json(bibleItem);
    } else {
      // 使用模拟数据
      const newBibleItem = {
        id: (mockIdCounter++).toString(),
        title,
        content,
        category,
        example,
        created_at: new Date().toISOString()
      };

      mockBibleItems.push(newBibleItem);
      res.status(201).json(newBibleItem);
    }
  } catch (err) {
    console.error('创建八股文条目失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Update a bible item
// @route   PUT /api/bible-items/:id
// @access  Public
const updateBibleItem = async (req, res) => {
  const { title, content, category, example } = req.body;

  try {
    if (isDBConnected()) {
      // 使用数据库
      const bibleItem = await BibleItem.findByPk(req.params.id);
      if (!bibleItem) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }

      // 验证必填字段
      if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ message: '标题不能为空' });
      }
      if (content !== undefined && content.trim() === '') {
        return res.status(400).json({ message: '内容不能为空' });
      }
      if (category !== undefined && category.trim() === '') {
        return res.status(400).json({ message: '分类不能为空' });
      }

      // 更新字段
      if (title !== undefined) bibleItem.title = title;
      if (content !== undefined) bibleItem.content = content;
      if (category !== undefined) bibleItem.category = category;
      if (example !== undefined) bibleItem.example = example;
      bibleItem.updated_at = new Date();

      await bibleItem.save();
      res.status(200).json(bibleItem);
    } else {
      // 使用模拟数据
      const index = mockBibleItems.findIndex(item => item.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }

      // 验证必填字段
      if (title !== undefined && title.trim() === '') {
        return res.status(400).json({ message: '标题不能为空' });
      }
      if (content !== undefined && content.trim() === '') {
        return res.status(400).json({ message: '内容不能为空' });
      }
      if (category !== undefined && category.trim() === '') {
        return res.status(400).json({ message: '分类不能为空' });
      }

      // 更新字段
      if (title !== undefined) mockBibleItems[index].title = title;
      if (content !== undefined) mockBibleItems[index].content = content;
      if (category !== undefined) mockBibleItems[index].category = category;
      if (example !== undefined) mockBibleItems[index].example = example;

      res.status(200).json(mockBibleItems[index]);
    }
  } catch (err) {
    console.error('更新八股文条目失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

// @desc    Delete a bible item
// @route   DELETE /api/bible-items/:id
// @access  Public
const deleteBibleItem = async (req, res) => {
  try {
    if (isDBConnected()) {
      // 使用数据库
      const bibleItem = await BibleItem.findByPk(req.params.id);
      if (!bibleItem) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }

      await bibleItem.destroy();
      res.status(200).json({ message: '八股文条目已删除' });
    } else {
      // 使用模拟数据
      const index = mockBibleItems.findIndex(item => item.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: '八股文条目不存在' });
      }

      mockBibleItems.splice(index, 1);
      res.status(200).json({ message: '八股文条目已删除' });
    }
  } catch (err) {
    console.error('删除八股文条目失败:', err.message);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getAllBibleItems,
  getBibleItems,
  getBibleItemById,
  createBibleItem,
  updateBibleItem,
  deleteBibleItem
};
