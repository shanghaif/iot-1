import { request } from '@/utils/request'

export function warning() {
  const data = {
    get_count: true,
    tid: 'all'
  }
  return request({
    // url: '/alarm/active?get_count=true&tid=all', // 假地址 自行替换
    url: '/alarm/active', // 假地址 自行替换
    method: 'get',
    data
    
  })
}