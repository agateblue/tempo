import Vue from 'vue'
import VueRouter from 'vue-router'
import Timeline from './views/Timeline.vue'
import Vizualisation from './views/Vizualisation.vue'
import Diary from './views/Diary.vue'
import Calendar from './views/Calendar.vue'
import About from './views/About.vue'
import Settings from './views/Settings.vue'
import Tasks from './views/Tasks.vue'

import store from '@/store'
import {trackEvent, getCleanUrlForTracking} from '@/utils'

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
        path: 'vizualisation',
        name: 'Vizualisation',
        component: Vizualisation,
        props: (route) => ({
          query: route.query.q,
          blueprint: route.query.blueprint || 0,
          defaultEnd: route.query.end || null,
          defaultStart: route.query.start || null,
        }),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar,
      },
      {
        path: 'e/:entryId',
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

export function shouldTrackPageView(to, from) {
  if (from && to.name === from.name) {
    // navigating to the same route, no need to track this
    return false
  }
  if (to.fullPath.startsWith('/diary/e/')) {
    return false
  }
  return true
}

export function trackPageView(to, from) {
  trackEvent(
    store,
    "pageview",
    {},
    {
      referrer: from ? getCleanUrlForTracking(window.location, from.fullPath) : null,
      url: getCleanUrlForTracking(window.location, to.fullPath),
    }
  )
}

router.beforeEach((to, from, next) => {
  // we track page view manually here to honor our telemetry setting
  // and avoid tracking querystring and excluded urls
  if (shouldTrackPageView(to, from)) {
    trackPageView(to, from)
  }
  next()
})

export default router
