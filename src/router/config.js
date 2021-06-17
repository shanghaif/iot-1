import TabsView from '@/layouts/tabs/TabsView'
//import BlankView from '@/layouts/BlankView'
//import PageView from '@/layouts/PageView'

// 路由配置
const options = {
  routes: [
    {
      path: '/login',
      name: '登录页',
      component: () => import('@/pages/login')
    },
    {
      path: '*',
      name: '404',
      component: () => import('@/pages/exception/404'),
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/pages/exception/403'),
    },
    {
      path: '/',
      name: '首页',
      component: TabsView,
      redirect: '/login',
      children: [
        {
          path: 'mcfg',
          name: '物模型配置',
          meta: {
            icon: 'deployment-unit'
          },
          component: () => import('@/pages/mcfg')
        },
        {
          path: 'scfg',
          name: '被监控对象配置',
          meta: {
            icon: 'container'
          },
          component: () => import('@/pages/dcfg')
        },
        {
          path: 'tester',
          name: '数据调试',
          meta: {
            icon: 'file-ppt'
          },
          component: () => import('@/pages/tester')
        }
      ]
    }
  ]
}

export default options
