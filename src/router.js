import { createRouter, createWebHashHistory } from 'vue-router'

import store from '@/store'
import {trackEvent, getCleanUrlForTracking} from '@/utils'


const routes = [
  {
    path: '/diary',
    alias: '/',
    component: () => import(/* webpackChunkName: "DiaryChunk" */ './views/Diary.vue'),
    props: (route) => ({ query: route.query.q }),
    children: [
      {
        path: '',
        name: 'Timeline',
        component: () => import(/* webpackChunkName: "DiaryTimelineChunk" */ './views/Timeline.vue'),
      },
      {
        path: 'visualization',
        name: 'Visualization',
        component: () => import(/* webpackChunkName: "DiaryVisualizationChunk" */ './views/Visualization.vue'),
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
        component: () => import(/* webpackChunkName: "DiaryCalendarChunk" */ './views/Calendar.vue'),
      },
      {
        path: 'e/:entryId',
        name: 'Entry',
        component: () => import(/* webpackChunkName: "DiaryTimelineChunk" */ './views/Timeline.vue'),
        props: true
      },
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "AboutChunk" */ './views/About.vue'),
  },
  {
    path: '/tasks',
    component: () => import(/* webpackChunkName: "TasksChunk" */ './views/Tasks.vue'),
    props: (route) => ({ query: route.query.q }),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import(/* webpackChunkName: "SettingsChunk" */ './views/Settings.vue'),
  },
  {
    path: '/blueprint-editor/:id?',
    name: 'BlueprintEditor',
    props: true,
    component: () => import(/* webpackChunkName: "BlueprintsChunk" */ './views/BlueprintEditor.vue'),
  }
]

const router = createRouter({
  history: createWebHashHistory(),
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
