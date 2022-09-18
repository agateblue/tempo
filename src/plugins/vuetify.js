// Styles
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi-svg'


// three shaking icons to reduce bundle size
import {
  mdiArrowLeft,
  mdiBook,
  mdiCalendar,
  mdiChartTimelineVariant,
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClock,
  mdiClockOutline,
  mdiClose,
  mdiCog,
  mdiContentCopy,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
  mdiFormatListBulleted,
  mdiHeart,
  mdiHeartOutline,
  mdiHelpCircleOutline,
  mdiMagnify,
  mdiMenuDown,
  mdiPencil,
  mdiPlus,
  mdiReply,
  mdiReplyOutline,
  mdiSend,
  mdiSync,
  mdiTrashCan,
} from '@mdi/js'

export const icons = {
  mdiArrowLeft,
  mdiBook,
  mdiCalendar,
  mdiChartTimelineVariant,
  mdiCheck,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClock,
  mdiClockOutline,
  mdiClose,
  mdiCog,
  mdiContentCopy,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEye,
  mdiEyeOff,
  mdiFormatListBulleted,
  mdiHeart,
  mdiHeartOutline,
  mdiHelpCircleOutline,
  mdiMagnify,
  mdiMenuDown,
  mdiPencil,
  mdiPlus,
  mdiReply,
  mdiReplyOutline,
  mdiSend,
  mdiSync,
  mdiTrashCan,
}

export const theme = {
  appBar: {
    color: "pink-darken-4",
  },
  card: {
    color: "grey-darken-4",
    textSize: "body-1",
  },
  nestedCard: {
    color: "blue-grey-darken-4",
    textSize: "body-2",
  },
  drawer: {
    color: "grey-darken-4",
  },
  bottomNavigation: {
    color: "grey-darken-3",
  },
  menu: {
    color: "grey-darken-4",
  },
  switch: {
    color: "pink",
  },
  input: {
    color: "grey-darken-4",
  },
  mainButton: {
    color: "pink-darken-4",
  },
}

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'tempoTheme',
    options: {
      customProperties: true,
    },
    themes: {
      tempoTheme: {
        dark: true,
        colors: {
          background: '#2c2c2c',
          primary: '#ee44aa',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107'
        }
      },
    },
  },
})
