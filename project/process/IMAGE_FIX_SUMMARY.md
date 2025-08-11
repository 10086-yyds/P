# 项目编辑页面图片数据格式问题修复总结

## 问题描述
根据错误信息 "图片数据第1项必须是对象格式"，后端API期望的图片数据结构是对象数组，但前端发送的是字符串数组。

**错误响应示例：**
```json
{
  "code": "更新项目失败",
  "data": 400,
  "message": "图片数据第1项必须是对象格式",
  "success": false
}
```

## 问题分析
1. **前端数据结构**：`projectImages` 存储的是字符串路径数组
   ```javascript
   ["图片路径1", "图片路径2", "图片路径3"]
   ```

2. **后端期望格式**：图片数据应该是对象数组
   ```javascript
   [
     {
       "id": 1,
       "url": "图片路径1",
       "name": "图片1",
       "type": "image",
       "size": 0,
       "uploadTime": "2025-08-11T01:36:17.788Z"
     }
   ]
   ```

## 修复方案

### 1. 修改 `saveProject` 方法
在保存项目时，将字符串格式的图片数据转换为对象格式：

```javascript
// 验证并转换图片数据格式
if (this.projectImages && this.projectImages.length > 0) {
  // 过滤掉无效的图片URL并转换为对象格式
  const validImages = this.projectImages.filter(img => {
    return img && typeof img === 'string' && img.trim() !== '';
  }).map((imgPath, index) => {
    // 转换为后端期望的对象格式
    return {
      id: index + 1, // 图片ID
      url: imgPath,   // 图片URL
      name: `图片${index + 1}`, // 图片名称
      type: 'image',  // 图片类型
      size: 0,        // 图片大小（暂时设为0）
      uploadTime: new Date().toISOString() // 上传时间
    };
  });
  
  saveData.images = validImages;
}
```

### 2. 修改 `loadProjectInfo` 方法
在加载项目信息时，处理从后端返回的对象格式图片数据，转换为前端使用的字符串格式：

```javascript
if (typeof firstImage === 'object' && firstImage !== null) {
  // 如果是对象数组，提取 url 字段
  this.projectImages = projectData.images.map(img => {
    if (img && typeof img === 'object' && img.url) {
      return img.url;
    } else if (typeof img === 'string') {
      return img;
    } else {
      return null;
    }
  }).filter(url => url !== null);
}
```

### 3. 保持前端数据结构一致性
- **前端内部**：`projectImages` 始终是字符串数组，便于图片显示和操作
- **与后端交互**：在保存时转换为对象格式，在加载时从对象格式转换回字符串格式

## 新增调试功能

### 1. 格式转换测试按钮
新增 "格式转换测试" 按钮，可以测试图片数据格式转换是否正确。

### 2. 增强的日志记录
在保存时记录转换后的图片数据格式，便于调试。

### 3. 数据验证
在加载和保存时都进行数据格式验证，确保数据一致性。

## 测试步骤

1. **重新运行项目**，进入项目编辑页面
2. **添加一些图片**，使用 "简单图片选择测试" 按钮
3. **点击"格式转换测试"**，查看控制台输出的转换结果
4. **尝试保存项目**，观察是否还有格式错误
5. **查看控制台日志**，确认发送给后端的数据格式

## 预期结果

修复后，发送给后端的图片数据应该是：
```json
{
  "images": [
    {
      "id": 1,
      "url": "图片路径1",
      "name": "图片1",
      "type": "image",
      "size": 0,
      "uploadTime": "2025-08-11T01:36:17.788Z"
    }
  ]
}
```

而不是之前的：
```json
{
  "images": ["图片路径1", "图片路径2"]
}
```

这样就能解决 "图片数据第1项必须是对象格式" 的错误。
