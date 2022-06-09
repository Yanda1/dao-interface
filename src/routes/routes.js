import DashboardLayout from '@/views/Layout/DashboardLayout.vue';
import NotFound from '@/views/NotFoundPage.vue';

const routes = [
    {
        path: '/',
        redirect: 'governance',
        component: DashboardLayout,
        children: [
            {
                path: '/governance',
                name: 'YND Governance',
                meta: { guest: false, min_auth_level: 2 },
                component: () =>
                    import ('../views/Governance.vue')
            },

        ]
    },
    // Page not found view
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    },
];

export default routes;
