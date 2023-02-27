/*
 * @Author: muqing
 * @Date: 2023-02-21 14:09:53
 * @LastEditTime: 2023-02-24 18:15:43
 * @Description:
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import home from '../home/index.vue'

const routerList: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "home",
        component: home
    },
   
];

const router = createRouter({
    routes: routerList,
    history: createWebHashHistory()
});

export default router;
