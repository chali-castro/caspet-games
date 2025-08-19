import { createRouter, createWebHistory } from 'vue-router';
import Rooms from '../components/Rooms.vue';
import RoomGM from '../components/RoomGM.vue';
import RoomPlayer from '../components/RoomPlayer.vue';

const routes = [
    {
        path: '/',
        name: 'Rooms',
        component: Rooms
    },
    {
        path: '/room-gm/:id',
        name: 'RoomGM',
        component: RoomGM,
        props: true

    },
    {
        path: '/room-player/:id',
        name: 'RoomPlayer',
        component: RoomPlayer,
        props: true
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
