export interface UserInfo {
  id: number;
  password: string;
  realName: string;
  roles: string[];
  username: string;
  homePath?: string;
}

/** 仅供真实服务接入前本地开发使用。 */
export const MOCK_USERS: UserInfo[] = [
  {
    homePath: '/dashboard',
    id: 1,
    password: '123456',
    realName: 'StoneLab 管理员',
    roles: ['admin'],
    username: 'admin',
  },
];

export const MOCK_CODES = [
  {
    codes: ['catalog:read', 'catalog:write', 'content:write', 'order:read'],
    username: 'admin',
  },
];

export const MOCK_MENUS = [
  {
    menus: [
      {
        children: [
          {
            component: '/dashboard/index',
            meta: {
              affixTab: true,
              title: 'page.dashboard.overview',
            },
            name: 'DashboardOverview',
            path: '',
          },
        ],
        meta: {
          icon: 'lucide:layout-dashboard',
          order: -1,
          title: 'page.dashboard.title',
        },
        name: 'Dashboard',
        path: '/dashboard',
      },
    ],
    username: 'admin',
  },
];
