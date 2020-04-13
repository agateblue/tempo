<template>
  <form @submit.prevent="submit">
    <div v-for="v in $store.state.cssVars" :key="v.id" class="theme-var">
      <label :for="v.id">{{ v.label }}</label>
      <div class="field">
        <input :id="v.id" type="text" :name="v.id" v-model="values[v.id]">
        <span class="color-preview" :style="`background: ${values[v.id]}`"></span>
      </div>
    </div>
    <div>
      <label for="json">Import/Export theme</label>
      <input type="text" id="json" v-model="themeJson">
    </div>
    <button type="reset" @click.prevent="$store.dispatch('setTheme', null)" class="link">Reset to defaults</button>
    <input class="right floated" type="submit" value="Apply">
  </form>
</template>

<script>

export default {
  data () {
    let values = {}
    this.$store.state.cssVars.forEach(v => {
      values[v.id] = this.$store.state.theme[v.id] || v.default
    })
    return {
      values
    }
  },
  computed: {
    themeJson: {
      get () {
        return JSON.stringify(this.values)
      },
      set (v) {
        let payload
        try {
          payload = JSON.parse(v)
        } catch {
          console.log('Invalid JSON')
          return
        }
        Object.keys(this.values).forEach((k) => {
          if (payload[k] != undefined) {
            this.values[k] = payload[k]
          }
        })
      }
    }
  },
  methods: {
    submit () {
      this.$store.dispatch('setTheme', this.values)
    }
  },
  watch: {
    "$store.state.theme": {
      deep: true,
      handler (theme) {
        this.$store.state.cssVars.forEach(v => {
          this.values[v.id] = theme[v.id] || v.default
        })
      }
    }
  }
}
</script>
