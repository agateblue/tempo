import Vue from 'vue'
import VueRouter from 'vue-router'
import Timeline from '../views/Timeline.vue'
import Visualization from '../views/Visualization.vue'
import Diary from '../views/Diary.vue'
import Calendar from '../views/Calendar.vue'
import About from '../views/About.vue'
import Settings from '../views/Settings.vue'
import Tasks from '../views/Tasks.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/diary',
    component: Diary,
    props: (route) => ({ query: route.query.q }),
    children: [
      {
        path: '',
        name: 'Timeline',
        component: Timeline,
      },
      {
        path: 'visualization',
        name: 'Visualization',
        component: Visualization,
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar,
      },
      {
        path: ':entryId',
        name: 'Entry',
        component: Timeline,
        props: true
      },
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/tasks',
    component: Tasks,
    props: (route) => ({ query: route.query.q }),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  }
]

const router = new VueRouter({
  routes
})

export default router
