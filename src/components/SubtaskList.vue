<template>

  <div class="pl-4">
    <h5>Subtasks</h5>
    <v-row
      v-for="row, idx in localValue"
      :key="idx"
      class="my-0"
    >
      <v-col
        cols="2"
        sm="2"
        class="py-0 px-0"
      >
        <v-checkbox
          class="my-0 mt-2 py-0"
          :disabled="taskCompleted"
          :value="row.done"
          :input-value="row.done"
          @change="row.done = $event"
          small
        ></v-checkbox>
      </v-col>
      <v-col
        cols="8"
        sm="8"
        class="py-0 px-0"
      >
        <v-textarea
          class="py-0 my-0"
          v-model="row.label"
          :disabled="taskCompleted"
          rows="1"
          dense
          auto-grow
        >
        </v-textarea>
      </v-col>
      <v-col
        cols="2"
        sm="2"
        class="py-0 px-0"
      >
        <v-btn
        class="mt-2"
          @click.prevent="localValue.splice(idx, 1)"
          text
          icon
          small
          :disabled="taskCompleted"
          color="grey"
          title="Delete"
          type="noop"
        >
          <v-icon>{{ $icons.mdiDeleteOutline }}</v-icon>
          
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'

export default {
  props: {
    value: {default: () => {return []}},
    taskCompleted: {default: false}
  },
  data () {
    return {
      localValue: [...this.value].map(t => {
        if (this.taskCompleted) {
          t.done = true
        }
        return t
      })
    }
  },
  computed: {
    preparedRows () {
      return this.localValue.map(r => {
        return {
          label: r.label.trim(),
          done: r.done,
        }
      }).filter(r => {
        return r.label.length > 0
      })
    }
  },
  watch: {
    localValue: {
      immediate: true,
      deep: true,
      handler (v) {
        if (this.taskCompleted) {
          return
        }
        if (v.length === 0 || v[v.length - 1].label.trim()) {
          this.localValue.push({label: '', done: false})
        }
      }
    },
    preparedRows: {
      deep: true,
      handler: debounce(
        function (v, o) {
          if (!isEqual(v, o) && this) {
            this.$emit('input', v)
          }
        }, 500
      )
      
    },
  }
}
</script>