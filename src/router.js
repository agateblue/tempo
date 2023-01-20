import Vue from 'vue'
import VueRouter from 'vue-router'

import store from '@/store'
import {trackEvent, getCleanUrlForTracking} from '@/utils'

Vue.use(VueRouter)

const routes = [
  {
    path: '/diary',
    alias: '/',
    component: () => import(/* webpackChunkName: "Diary" */ './views/Diary.vue'),
    props: (route) => ({ query: route.query.q }),
    children: [
      {
        path: '',
        name: 'Timeline',
        component: () => import(/* webpackChunkName: "DiaryTimeline" */ './views/Timeline.vue'),
      },
      {
        path: 'visualization',
        name: 'Visualization',
        component: () => import(/* webpackChunkName: "DiaryVisualization" */ './views/Visualization.vue'),
        props: (route) => ({
          query: route.query.q,
          blueprint: route.query.blueprint,
          defaultEnd: route.query.end || null,
          defaultStart: route.query.start || null,
          defaultGroupByPeriod: route.query.period || 'date',
        }),
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: () => import(/* webpackChunkName: "DiaryCalendar" */ './views/Calendar.vue'),
      },
      {
        path: 'e/:entryId',
        name: 'Entry',
        component: () => import(/* webpackChunkName: "DiaryTimeline" */ './views/Timeline.vue'),
        props: true
      },
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "About" */ './views/About.vue'),
  },
  {
    path: '/tasks',
    component: () => import(/* webpackChunkName: "Tasks" */ './views/Tasks.vue'),
    props: (route) => ({ query: route.query.q }),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "Settings" */ './views/Settings.vue'),
  },
  {
    path: '/blueprint-editor/:id?',
    name: 'BlueprintEditor',
    props: true,
    component: () => import(/* webpackChunkName: "Blueprints" */ './views/BlueprintEditor.vue'),
  },
  {
    path: '/pages/:id?',
    name: 'Page',
    props: true,
    component: () => import(/* webpackChunkName: "Page" */ './views/Page.vue'),
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
