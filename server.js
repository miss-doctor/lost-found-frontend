import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '506mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// 数据文件路径
const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');
const itemsFile = path.join(dataDir, 'items.json');
const statsFile = path.join(dataDir, 'stats.json');
const commentsFile = path.join(dataDir, 'comments.json');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据文件
const initData = () => {
  // 初始化用户数据
    if (!fs.existsSync(usersFile)) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: '123456',
          realName: '管理员',
          phone: '13800138000',
          type: 'admin',
          points: 0,
          level: 1,
          creditScore: 100,
          honorBadges: []
        }
      ];
      fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
    }

    // 初始化用户活动数据
    const userActivitiesFile = path.join(dataDir, 'userActivities.json');
    if (!fs.existsSync(userActivitiesFile)) {
      fs.writeFileSync(userActivitiesFile, JSON.stringify([], null, 2));
    }

  // 初始化物品数据
  if (!fs.existsSync(itemsFile)) {
    const defaultItems = [
      {
        id: 1,
        name: '钱包',
        type: 'lost',
        desc: '黑色钱包，内有身份证和银行卡',
        image: '',
        userId: 1,
        publishTime: new Date().toISOString()
      },
      {
        id: 2,
        name: '手机',
        type: 'found',
        desc: '苹果手机，黑色',
        image: '',
        userId: 1,
        publishTime: new Date().toISOString()
      }
    ];
    fs.writeFileSync(itemsFile, JSON.stringify(defaultItems, null, 2));
  }

  // 初始化统计数据
  if (!fs.existsSync(statsFile)) {
    const defaultStats = {
      lost: [
        { username: 'admin', count: 1 }
      ],
      found: [
        { username: 'admin', count: 1 }
      ]
    };
    fs.writeFileSync(statsFile, JSON.stringify(defaultStats, null, 2));
  }

  // 初始化评论数据
  if (!fs.existsSync(commentsFile)) {
    const defaultComments = [
      {
        id: 1,
        itemId: 1,
        userId: 1,
        username: 'admin',
        content: '这是一条测试评论',
        createTime: new Date().toISOString()
      }
    ];
    fs.writeFileSync(commentsFile, JSON.stringify(defaultComments, null, 2));
  }
};

// 读取数据
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // 读取文件失败，返回空数组
    return [];
  }
};

// 写入数据
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    // 写入文件失败，返回false
    return false;
  }
};

// 初始化数据
initData();

const secretKey = 'your-secret-key';

// 注册接口
app.post('/api/register', (req, res) => {
  const { username, password, realName, phone, userType } = req.body;
  
  // 读取用户数据
  const users = readData(usersFile);
  
  // 检查用户名是否已存在
  if (users.find(user => user.username === username)) {
    return res.status(200).json({
      code: 400,
      msg: '用户名已存在'
    });
  }
  
  // 创建新用户
  const newUser = {
    id: users.length + 1,
    username,
    password,
    realName: realName || '',
    phone: phone || '',
    type: userType || 'user',
    studentId: '',
    email: '',
    college: '',
    major: '',
    class: '',
    points: 0,
    level: 1,
    creditScore: 100,
    honorBadges: []
  };
  
  // 添加新用户
  users.push(newUser);
  
  // 写入数据
  writeData(usersFile, users);
  
  // 生成token
  const token = jwt.sign({ id: newUser.id, username: newUser.username }, secretKey, { expiresIn: '1h' });
  
  res.status(200).json({
    code: 200,
    msg: '注册成功',
    data: {
      token,
      userInfo: {
        id: newUser.id,
        username: newUser.username,
        realName: newUser.realName,
        phone: newUser.phone,
        type: newUser.type,
        studentId: newUser.studentId,
        email: newUser.email,
        college: newUser.college,
        major: newUser.major,
        class: newUser.class,
        points: newUser.points,
        level: newUser.level,
        creditScore: newUser.creditScore,
        honorBadges: newUser.honorBadges
      }
    }
  });
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password, userType } = req.body;
  
  // 读取用户数据
  const users = readData(usersFile);
  
  // 查找用户
  const user = users.find(user => user.username === username && user.password === password);
  
  if (!user) {
    return res.status(200).json({
      code: 400,
      msg: '用户名或密码错误'
    });
  }
  
  // 验证用户类型
  if (userType && user.type !== userType) {
    return res.status(200).json({
      code: 400,
      msg: '用户类型错误'
    });
  }
  
  // 生成token
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
  
  res.status(200).json({
    code: 200,
    msg: '登录成功',
    data: {
      token,
      userInfo: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        type: user.type,
        studentId: user.studentId,
        email: user.email,
        college: user.college,
        major: user.major,
        class: user.class,
        points: user.points || 0,
        level: user.level || 1,
        creditScore: user.creditScore || 100,
        honorBadges: user.honorBadges || []
      }
    }
  });
});

// 获取用户信息接口
app.get('/api/user/info', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    
    // 读取用户数据
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(200).json({
        code: 401,
        msg: '用户不存在'
      });
    }
    
    res.status(200).json({
    code: 200,
    msg: '获取用户信息成功',
    data: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      points: user.points || 0,
      level: user.level || 1,
      creditScore: user.creditScore || 100,
      honorBadges: user.honorBadges || []
    }
  });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});



// 获取物品列表接口
app.get('/api/items', (req, res) => {
  const { keyword, page = 1, size = 10, status } = req.query;
  
  // 读取物品数据
  let items = readData(itemsFile);
  
  // 为现有物品添加发布者信息和状态
  items = items.map(item => {
    return {
      ...item,
      username: item.username || 'admin',
      status: item.status || 'approved' // 旧数据默认已通过
    };
  });
  
  // 模拟过滤和分页
  let filteredItems = items;
  
  // 状态过滤
  if (status) {
    filteredItems = filteredItems.filter(item => item.status === status);
  } else {
    // 默认只显示已通过的物品
    filteredItems = filteredItems.filter(item => item.status === 'approved');
  }
  
  // 关键词过滤
  if (keyword) {
    filteredItems = filteredItems.filter(item => 
      item.name.includes(keyword) || item.desc.includes(keyword)
    );
  }
  
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + parseInt(size);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);
  
  res.status(200).json({
    code: 200,
    msg: '获取物品列表成功',
    data: {
      list: paginatedItems,
      total: filteredItems.length
    }
  });
});

// 管理员审核物品接口
app.put('/api/admin/items/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user || user.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    // 读取物品数据
    const items = readData(itemsFile);
    const itemIndex = items.findIndex(item => item.id === parseInt(id));
    
    if (itemIndex === -1) {
      return res.status(200).json({
        code: 400,
        msg: '物品不存在'
      });
    }
    
    // 更新物品状态
    items[itemIndex].status = status;
    if (reason) {
      items[itemIndex].rejectReason = reason;
    }
    
    // 写入数据
    writeData(itemsFile, items);
    
    res.status(200).json({
      code: 200,
      msg: '审核成功',
      data: items[itemIndex]
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 发布物品接口
app.post('/api/items', (req, res) => {
  const { name, type, desc, time, location, contactPhone, image } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  let userId = 1; // 默认管理员ID
  let username = 'admin'; // 默认管理员用户名
  
  // 如果有token，获取当前用户信息
  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      const users = readData(usersFile);
      const user = users.find(user => user.id === decoded.id);
      if (user) {
        userId = user.id;
        username = user.username;
      }
    } catch (error) {
      // token无效，使用默认值
    }
  }
  
  // 读取物品数据
  const items = readData(itemsFile);
  
  // 创建新物品
  const newItem = {
    id: items.length + 1,
    name,
    type,
    desc,
    time: time || new Date().toISOString(),
    location: location || '',
    contactPhone: contactPhone || '',
    image: image || '',
    userId,
    username,
    publishTime: new Date().toISOString(),
    status: 'pending' // pending: 待审核, approved: 已通过, rejected: 已拒绝
  };
  
  // 添加新物品
  items.push(newItem);
  
  // 写入物品数据
  writeData(itemsFile, items);
  
  // 更新统计数据
  const stats = readData(statsFile);
  
  if (type === 'lost') {
    // 更新失主统计
    const existingLostUser = stats.lost.find(item => item.username === username);
    if (existingLostUser) {
      existingLostUser.count += 1;
    } else {
      stats.lost.push({ username, count: 1 });
    }
    // 给用户加积分
    addUserPoints(userId, 3, '发布失物信息');
  } else if (type === 'found') {
    // 更新拾主统计
    const existingFoundUser = stats.found.find(item => item.username === username);
    if (existingFoundUser) {
      existingFoundUser.count += 1;
    } else {
      stats.found.push({ username, count: 1 });
    }
    // 给用户加积分
    addUserPoints(userId, 5, '发布招领信息');
  }
  
  // 写入统计数据
  writeData(statsFile, stats);
  
  res.status(200).json({
    code: 200,
    msg: '发布物品成功',
    data: newItem
  });
});

// 编辑物品接口
app.put('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, desc, image } = req.body;
  
  // 读取物品数据
  const items = readData(itemsFile);
  
  // 查找物品
  const itemIndex = items.findIndex(item => item.id === parseInt(id));
  if (itemIndex === -1) {
    return res.status(200).json({
      code: 400,
      msg: '物品不存在'
    });
  }
  
  // 获取原物品类型
  const oldType = items[itemIndex].type;
  const username = items[itemIndex].username || 'admin';
  
  // 更新物品
  items[itemIndex] = {
    ...items[itemIndex],
    name,
    type,
    desc,
    time: req.body.time || items[itemIndex].time,
    location: req.body.location || items[itemIndex].location,
    contactPhone: req.body.contactPhone || items[itemIndex].contactPhone,
    image: image || '',
    username: items[itemIndex].username || 'admin',
    status: items[itemIndex].status || 'pending'
  };
  
  // 写入数据
  writeData(itemsFile, items);
  
  // 更新统计数据（如果类型发生变化）
  if (oldType !== type) {
    const stats = readData(statsFile);
    
    // 减少原类型的统计
    if (oldType === 'lost') {
      const existingLostUser = stats.lost.find(item => item.username === username);
      if (existingLostUser) {
        existingLostUser.count = Math.max(0, existingLostUser.count - 1);
        // 如果 count 为 0，移除该用户
        if (existingLostUser.count === 0) {
          stats.lost = stats.lost.filter(item => item.username !== username);
        }
      }
    } else if (oldType === 'found') {
      const existingFoundUser = stats.found.find(item => item.username === username);
      if (existingFoundUser) {
        existingFoundUser.count = Math.max(0, existingFoundUser.count - 1);
        // 如果 count 为 0，移除该用户
        if (existingFoundUser.count === 0) {
          stats.found = stats.found.filter(item => item.username !== username);
        }
      }
    }
    
    // 增加新类型的统计
    if (type === 'lost') {
      const existingLostUser = stats.lost.find(item => item.username === username);
      if (existingLostUser) {
        existingLostUser.count += 1;
      } else {
        stats.lost.push({ username, count: 1 });
      }
    } else if (type === 'found') {
      const existingFoundUser = stats.found.find(item => item.username === username);
      if (existingFoundUser) {
        existingFoundUser.count += 1;
      } else {
        stats.found.push({ username, count: 1 });
      }
    }
    
    // 写入统计数据
    writeData(statsFile, stats);
  }
  
  res.status(200).json({
    code: 200,
    msg: '编辑物品成功',
    data: items[itemIndex]
  });
});

// 删除物品接口
app.delete('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(200).json({
        code: 401,
        msg: '用户不存在'
      });
    }
  
    // 读取物品数据
    const items = readData(itemsFile);
    
    // 查找要删除的物品
    const itemToDelete = items.find(item => item.id === parseInt(id));
    if (!itemToDelete) {
      return res.status(200).json({
        code: 400,
        msg: '物品不存在'
      });
    }
    
    // 检查权限：管理员可以删除任何物品，普通用户只能删除自己的物品
    if (user.type !== 'admin' && itemToDelete.userId !== user.id) {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    const { type, username } = itemToDelete;
    
    // 过滤掉要删除的物品
    const filteredItems = items.filter(item => item.id !== parseInt(id));
    
    // 写入数据
    writeData(itemsFile, filteredItems);
    
    // 更新统计数据
    const stats = readData(statsFile);
    
    if (type === 'lost') {
      const existingLostUser = stats.lost.find(item => item.username === username);
      if (existingLostUser) {
        existingLostUser.count = Math.max(0, existingLostUser.count - 1);
        // 如果 count 为 0，移除该用户
        if (existingLostUser.count === 0) {
          stats.lost = stats.lost.filter(item => item.username !== username);
        }
      }
    } else if (type === 'found') {
      const existingFoundUser = stats.found.find(item => item.username === username);
      if (existingFoundUser) {
        existingFoundUser.count = Math.max(0, existingFoundUser.count - 1);
        // 如果 count 为 0，移除该用户
        if (existingFoundUser.count === 0) {
          stats.found = stats.found.filter(item => item.username !== username);
        }
      }
    }
    
    // 写入统计数据
    writeData(statsFile, stats);
    
    res.status(200).json({
      code: 200,
      msg: '删除物品成功',
      data: null
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 获取物品详情接口
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  
  // 读取物品数据
  const items = readData(itemsFile);
  
  // 查找物品
  let item = items.find(item => item.id === parseInt(id));
  if (!item) {
    return res.status(200).json({
      code: 400,
      msg: '物品不存在'
    });
  }
  
  // 确保物品有发布者信息
  if (!item.username) {
    item = {
      ...item,
      username: 'admin'
    };
  }
  
  // 读取留言数据
  const comments = readData(commentsFile).filter(comment => comment.itemId === parseInt(id));
  
  res.status(200).json({
    code: 200,
    msg: '获取物品详情成功',
    data: {
      ...item,
      comments
    }
  });
});

// 获取失主统计数据接口
app.get('/api/stats/lost', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user || user.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    const stats = readData(statsFile);
    res.status(200).json({
      code: 200,
      msg: '获取失主统计数据成功',
      data: stats.lost
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 获取拾主统计数据接口
app.get('/api/stats/found', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user || user.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    const stats = readData(statsFile);
    res.status(200).json({
      code: 200,
      msg: '获取拾主统计数据成功',
      data: stats.found
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 发布留言接口
app.post('/api/items/:itemId/comments', (req, res) => {
  const { itemId } = req.params;
  const { content } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    
    // 读取用户数据
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(200).json({
        code: 401,
        msg: '用户不存在'
      });
    }
    
    // 读取评论数据
    const comments = readData(commentsFile);
    
    // 创建新评论
    const newComment = {
      id: comments.length + 1,
      itemId: parseInt(itemId),
      userId: user.id,
      username: user.username,
      content,
      createTime: new Date().toISOString()
    };
    
    // 添加新评论
    comments.push(newComment);
    
    // 写入数据
    writeData(commentsFile, comments);
    
    // 给用户加积分
    addUserPoints(user.id, 2, '发布留言');
    
    res.status(200).json({
      code: 200,
      msg: '发布留言成功',
      data: newComment
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 删除留言接口
app.delete('/api/comments/:id', (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    // 读取评论数据
    const comments = readData(commentsFile);
    
    // 过滤掉要删除的评论
    const filteredComments = comments.filter(comment => comment.id !== parseInt(id));
    
    if (filteredComments.length === comments.length) {
      return res.status(200).json({
        code: 400,
        msg: '留言不存在'
      });
    }
    
    // 写入数据
    writeData(commentsFile, filteredComments);
    
    res.status(200).json({
      code: 200,
      msg: '删除留言成功'
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 获取物品的留言列表
app.get('/api/items/:itemId/comments', (req, res) => {
  const { itemId } = req.params;
  
  // 读取评论数据
  const comments = readData(commentsFile);
  
  // 过滤出指定物品的评论
  const itemComments = comments.filter(comment => comment.itemId === parseInt(itemId));
  
  res.status(200).json({
    code: 200,
    msg: '获取留言列表成功',
    data: itemComments
  });
});

// 添加用户接口（管理员）
app.post('/api/admin/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { username, password, realName, phone, studentId, email, college, major, class: className, type } = req.body;
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    
    // 读取用户数据
    const users = readData(usersFile);
    const currentUser = users.find(user => user.id === decoded.id);
    
    if (!currentUser || currentUser.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    // 检查用户名是否已存在
    if (users.find(user => user.username === username)) {
      return res.status(200).json({
        code: 400,
        msg: '用户名已存在'
      });
    }
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      password,
      realName,
      phone,
      studentId,
      email,
      college,
      major,
      class: className,
      type
    };
    
    // 添加新用户
    users.push(newUser);
    
    // 写入数据
    writeData(usersFile, users);
    
    res.status(200).json({
      code: 200,
      msg: '添加用户成功',
      data: newUser
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 获取用户列表接口（管理员）
app.get('/api/admin/users', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    
    // 读取用户数据
    const users = readData(usersFile);
    const currentUser = users.find(user => user.id === decoded.id);
    
    if (!currentUser || currentUser.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    res.status(200).json({
      code: 200,
      msg: '获取用户列表成功',
      data: users
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 给用户添加积分
const addUserPoints = (userId, points, reason) => {
  const users = readData(usersFile);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    // 确保用户有积分字段
    if (!users[userIndex].points) {
      users[userIndex].points = 0;
    }
    if (!users[userIndex].level) {
      users[userIndex].level = 1;
    }
    if (!users[userIndex].creditScore) {
      users[userIndex].creditScore = 100;
    }
    if (!users[userIndex].honorBadges) {
      users[userIndex].honorBadges = [];
    }
    
    // 添加积分
    users[userIndex].points += points;
    
    // 更新等级
    const newLevel = Math.floor(users[userIndex].points / 100) + 1;
    if (newLevel > users[userIndex].level) {
      users[userIndex].level = newLevel;
    }
    
    // 写入用户数据
    writeData(usersFile, users);
    
    // 记录用户活动
    const userActivitiesFile = path.join(dataDir, 'userActivities.json');
    const activities = readData(userActivitiesFile);
    activities.push({
      id: activities.length + 1,
      userId,
      type: 'points',
      points,
      reason,
      timestamp: new Date().toISOString()
    });
    writeData(userActivitiesFile, activities);
  }
};

// 给用户扣除积分
const deductUserPoints = (userId, points, reason) => {
  const users = readData(usersFile);
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex !== -1) {
    // 确保用户有积分字段
    if (!users[userIndex].points) {
      users[userIndex].points = 0;
    }
    
    // 扣除积分
    users[userIndex].points = Math.max(0, users[userIndex].points - points);
    
    // 更新等级
    const newLevel = Math.floor(users[userIndex].points / 100) + 1;
    if (newLevel < users[userIndex].level) {
      users[userIndex].level = newLevel;
    }
    
    // 写入用户数据
    writeData(usersFile, users);
    
    // 记录用户活动
    const userActivitiesFile = path.join(dataDir, 'userActivities.json');
    const activities = readData(userActivitiesFile);
    activities.push({
      id: activities.length + 1,
      userId,
      type: 'penalty',
      points: -points,
      reason,
      timestamp: new Date().toISOString()
    });
    writeData(userActivitiesFile, activities);
  }
};

// 获取用户积分记录
app.get('/api/users/:userId/activities', (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const user = users.find(user => user.id === decoded.id);
    
    if (!user) {
      return res.status(200).json({
        code: 401,
        msg: '用户不存在'
      });
    }
    
    // 只有管理员或用户本人可以查看
    if (user.type !== 'admin' && user.id !== parseInt(userId)) {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    const userActivitiesFile = path.join(dataDir, 'userActivities.json');
    const activities = readData(userActivitiesFile).filter(activity => activity.userId === parseInt(userId));
    
    res.status(200).json({
      code: 200,
      msg: '获取积分记录成功',
      data: activities
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 获取用户排行榜
app.get('/api/rankings', (req, res) => {
  const users = readData(usersFile);
  
  // 按积分排序
  const rankings = users
    .map(user => ({
      id: user.id,
      username: user.username,
      points: user.points || 0,
      level: user.level || 1,
      creditScore: user.creditScore || 100
    }))
    .sort((a, b) => b.points - a.points);
  
  res.status(200).json({
    code: 200,
    msg: '获取排行榜成功',
    data: rankings
  });
});

// 管理员扣除用户积分
app.post('/api/admin/users/:userId/penalty', (req, res) => {
  const { userId } = req.params;
  const { points, reason } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const currentUser = users.find(user => user.id === decoded.id);
    
    if (!currentUser || currentUser.type !== 'admin') {
      return res.status(200).json({
        code: 403,
        msg: '权限不足'
      });
    }
    
    // 扣除积分
    deductUserPoints(parseInt(userId), points, reason);
    
    res.status(200).json({
      code: 200,
      msg: '扣除积分成功'
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 更新用户信息接口
app.put('/api/user/info', (req, res) => {
  const { realName, phone, email, college, major } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(200).json({
      code: 401,
      msg: '未授权'
    });
  }
  
  try {
    const decoded = jwt.verify(token, secretKey);
    const users = readData(usersFile);
    const userIndex = users.findIndex(user => user.id === decoded.id);
    
    if (userIndex === -1) {
      return res.status(200).json({
        code: 404,
        msg: '用户不存在'
      });
    }
    
    // 更新用户信息
    users[userIndex].realName = realName;
    users[userIndex].phone = phone;
    users[userIndex].email = email;
    users[userIndex].college = college;
    users[userIndex].major = major;
    
    // 写入用户数据
    writeData(usersFile, users);
    
    res.status(200).json({
      code: 200,
      msg: '更新信息成功',
      data: users[userIndex]
    });
  } catch (error) {
    res.status(200).json({
      code: 401,
      msg: 'token无效'
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  // 服务器启动成功
});