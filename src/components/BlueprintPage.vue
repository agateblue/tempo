<template>
  <section class="section">
    <h1 class="title">{{ page.title }}</h1>
    <template v-for="(section, idx) in page.sections">
      <div
        :key="idx"
        v-if="(section.type || 'markdown') === 'markdown'"
        v-html="RENDERER.render(section.content)"
        class="my-4"
      ></div>
      <v-checkbox
        class="question"
        :key="idx"
        v-else-if="section.type === 'question' && showQuestion(section)"
        v-model="answers[section.content]"
        :label="section.content"
        hide-details
        style="margin-top: 10px"
        :class="section.conditions ? 'ml-4' : ''"
      ></v-checkbox>
      <div
        v-else-if="section.type === 'counters' && (page.counters || []).length > 0"
        :key="idx"
        class="my-4"
      >
        <div
          class="my-4"
          v-html="RENDERER.render(section.content)"
        ></div>
        <v-row
          class="mt-4"
          :key="idx"
        >
          <v-col v-for="counter in page.counters || []" :key="counter.id" class="text-center">
            <v-progress-circular
              :value="Math.ceil(countersValues[counter.id] * 100 / maxCountersValues[counter.id])"
              :color="counter.color || 'orange'"
              class="mb-2"
              :size="100"
            >
              {{ Math.ceil(countersValues[counter.id] * 100 / maxCountersValues[counter.id]) }}%
            </v-progress-circular>
            <h3>{{ counter.label }}</h3>
          </v-col>
        </v-row>

      </div>
    </template>
    
  </section>
</template>
<script>
import isEmpty from 'lodash/isEmpty'
import RENDERER from '@/markdown'

function getCounterValues (counters, questions, answers) {
  let values = {}
  counters = (counters || [])
  counters.forEach(c => {
    values[c.id] = 0
  })
  questions.forEach(q => {
    if (answers[q.content]) {
      let increment = q.increment || {}
      for (const key in values) {
        if (increment[key]) {
          values[key] += increment[key]
        }
      }
    }
  })
  return values
}
function matchConditions(conditions, counters) {
  for (const key in conditions) {
    if (Object.hasOwnProperty.call(conditions, key)) {
      const minimum = conditions[key]
      const value = counters[key] || 0;
      if (value >= minimum) {
        return true
      }
    }
  }
  return false
}
function getMaxCounterValues(counters, questions) {
  let values = {}
  counters = (counters || [])
  counters.forEach(c => {
    values[c.id] = 0
  })
  questions.forEach(q => {
    let increment = q.increment || {}
    for (const key in increment) {
      if (Object.hasOwnProperty.call(increment, key)) {
        values[key] += increment[key]
      }
    }
  })
  return values
}
export default {
  props: ['page'],
  data () {
    return {
      RENDERER,
      answers: {},
      countersValues: {},
      maxCountersValues: {}
    }
  },
  created () {
    this.questions.forEach(s => {
      this.$set(this.answers, s.content, false)
    })
    this.countersValues = getCounterValues(this.page.counters, this.questions, this.answers)
    this.maxCountersValues = getMaxCounterValues(this.page.counters, this.questions)
  },
  computed: {
    questions () {
      return this.page.sections.filter(s => {
        return s.type === 'question'
      })
    },
  },
  methods: {
    showQuestion(section) {
      if (isEmpty(section.conditions)) {
        return true
      }
      return matchConditions(section.conditions, this.countersValues)
    } 
  },
  watch: {
    answers: {
      deep: true,
      handler () {
        this.countersValues = getCounterValues(this.page.counters, this.questions, this.answers)
        this.maxCountersValues = getMaxCounterValues(this.page.counters, this.questions)
      }
    }
  }
}
</script>