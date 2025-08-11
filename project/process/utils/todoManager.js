// 代办事项管理工具
import { API_CONFIG } from '../config/api.js';

class TodoManager {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.todoApi = API_CONFIG.TODO;
  }

  // 获取用户token
  getToken() {
    return uni.getStorageSync('userToken') || '';
  }

  // 获取代办事项列表
  async getTodoList(params = {}) {
    try {
      const { status, priority, limit = 10, page = 1 } = params;
      
      let url = `${this.baseUrl}${this.todoApi.GET_TODOS}`;
      const queryParams = [];
      
      if (status) queryParams.push(`status=${status}`);
      if (priority) queryParams.push(`priority=${priority}`);
      if (limit) queryParams.push(`limit=${limit}`);
      if (page) queryParams.push(`page=${page}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const result = await uni.request({
        url,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        timeout: 10000
      });

      if (result.statusCode === 200 && result.data) {
        if (result.data.success && result.data.data) {
          return {
            success: true,
            data: result.data.data,
            total: result.data.total || result.data.data.length
          };
        } else if (Array.isArray(result.data)) {
          return {
            success: true,
            data: result.data,
            total: result.data.length
          };
        } else {
          return {
            success: false,
            message: '数据格式错误'
          };
        }
      } else {
        throw new Error(`API响应错误: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('获取代办事项列表失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 创建代办事项
  async createTodo(todoData) {
    try {
      const result = await uni.request({
        url: `${this.baseUrl}${this.todoApi.CREATE_TODO}`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        data: {
          title: todoData.title,
          description: todoData.description,
          priority: todoData.priority || 'normal',
          dueDate: todoData.dueDate,
          category: todoData.category || 'general',
          assignee: todoData.assignee,
          status: 'pending'
        },
        timeout: 10000
      });

      if (result.statusCode === 200 || result.statusCode === 201) {
        if (result.data && result.data.success) {
          return {
            success: true,
            data: result.data.data,
            message: '代办事项创建成功'
          };
        } else {
          return {
            success: false,
            message: result.data?.message || '创建失败'
          };
        }
      } else {
        throw new Error(`创建失败: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('创建代办事项失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 更新代办事项
  async updateTodo(todoId, updateData) {
    try {
      const result = await uni.request({
        url: `${this.baseUrl}${this.todoApi.UPDATE_TODO}/${todoId}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        data: updateData,
        timeout: 10000
      });

      if (result.statusCode === 200) {
        if (result.data && result.data.success) {
          return {
            success: true,
            data: result.data.data,
            message: '代办事项更新成功'
          };
        } else {
          return {
            success: false,
            message: result.data?.message || '更新失败'
          };
        }
      } else {
        throw new Error(`更新失败: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('更新代办事项失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 删除代办事项
  async deleteTodo(todoId) {
    try {
      const result = await uni.request({
        url: `${this.baseUrl}${this.todoApi.DELETE_TODO}/${todoId}`,
        method: 'DELETE',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        timeout: 10000
      });

      if (result.statusCode === 200 || result.statusCode === 204) {
        return {
          success: true,
          message: '代办事项删除成功'
        };
      } else {
        throw new Error(`删除失败: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('删除代办事项失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 标记代办事项完成
  async completeTodo(todoId) {
    try {
      const result = await uni.request({
        url: `${this.baseUrl}${this.todoApi.COMPLETE_TODO}/${todoId}`,
        method: 'PUT',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        data: {
          status: 'completed',
          completedAt: new Date().toISOString()
        },
        timeout: 10000
      });

      if (result.statusCode === 200) {
        if (result.data && result.data.success) {
          return {
            success: true,
            data: result.data.data,
            message: '代办事项已完成'
          };
        } else {
          return {
            success: false,
            message: result.data?.message || '操作失败'
          };
        }
      } else {
        throw new Error(`操作失败: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('标记代办事项完成失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 获取代办事项统计
  async getTodoStats() {
    try {
      const result = await uni.request({
        url: `${this.baseUrl}${this.todoApi.GET_TODO_STATS}`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        timeout: 10000
      });

      if (result.statusCode === 200 && result.data) {
        if (result.data.success && result.data.data) {
          return {
            success: true,
            data: result.data.data
          };
        } else {
          return {
            success: false,
            message: '数据格式错误'
          };
        }
      } else {
        throw new Error(`获取统计失败: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('获取代办事项统计失败:', error);
      return {
        success: false,
        message: error.message || '网络请求失败'
      };
    }
  }

  // 从项目数据生成代办事项（备用方案）
  generateTodosFromProjects(projectsData) {
    try {
      if (!Array.isArray(projectsData) || projectsData.length === 0) {
        return [];
      }

      const activeProjects = projectsData.filter(p => 
        ['active', 'planning', 'ongoing', 'pending'].includes(p.status)
      );

      return activeProjects.slice(0, 5).map((project, index) => ({
        id: `project_${project._id || project.id || index}`,
        title: `${project.name || project.projectName || '未命名项目'}项目审批`,
        description: `需要审核${project.name || project.projectName || '该'}项目的相关文档和进度`,
        time: this.formatTime(new Date(Date.now() + index * 3600000)),
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'normal',
        category: 'project',
        status: 'pending',
        dueDate: new Date(Date.now() + (index + 1) * 24 * 3600000).toISOString(),
        assignee: project.manager || project.owner || '当前用户',
        projectId: project._id || project.id
      }));
    } catch (error) {
      console.error('从项目数据生成代办事项失败:', error);
      return [];
    }
  }

  // 格式化时间
  formatTime(timeString) {
    if (!timeString) return '';
    
    try {
      const date = new Date(timeString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  }

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  }

  // 获取优先级显示文本
  getPriorityText(priority) {
    const priorityMap = {
      'high': '高',
      'medium': '中',
      'normal': '低',
      'urgent': '紧急'
    };
    return priorityMap[priority] || '普通';
  }

  // 获取状态显示文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待处理',
      'in_progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消',
      'overdue': '已逾期'
    };
    return statusMap[status] || '未知';
  }

  // 获取优先级颜色类名
  getPriorityClass(priority) {
    const classMap = {
      'high': 'high',
      'medium': 'medium',
      'normal': 'normal',
      'urgent': 'urgent'
    };
    return classMap[priority] || 'normal';
  }

  // 获取状态颜色类名
  getStatusClass(status) {
    const classMap = {
      'pending': 'pending',
      'in_progress': 'in-progress',
      'completed': 'completed',
      'cancelled': 'cancelled',
      'overdue': 'overdue'
    };
    return classMap[status] || 'pending';
  }
}

// 创建单例实例
const todoManager = new TodoManager();

export default todoManager;
