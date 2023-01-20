<template>
  <div class="yaml-editor">
    <div ref="editor" style="height: 500px; width: 100%;"></div>
    <v-alert
      color="red darken-2"
      outlined
      v-if="errors && errors.length > 0"
    > 
      <ul
        v-for="(e, i) in errors"
        :key="i"
      >
        <li>{{ e }}</li>
      </ul>
    </v-alert>
  </div>
</template> 
<script>
import loader from "@monaco-editor/loader";
import {jsonToYaml, yamlToJson} from '@/utils'
import { Validator } from '@cfworker/json-schema';

export default {
  props: {
    value: {default: () => {return {foo: 'bar'}}},
    schema: {}
  },
  data () {
    return {
      editor: null,
      errors: [],
      validator: new Validator(this.schema)
    }
  },
  mounted () {
    let self = this
    loader.init().then((monaco) => {
      const editorOptions = {
        language: "yaml",
        value: jsonToYaml(self.value),
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
      };
      self.editor = monaco.editor.create(self.$refs.editor, editorOptions);
      self.editor.getModel().onDidChangeContent(() => {
        self.save()
      });
      self.editor.getModel().updateOptions({ tabSize: 2 })
      this.$el.addEventListener("keydown", this.doSave);
    })
  },
  beforeDestroy() {
    this.$el.removeEventListener("keydown", this.doSave);
  },
  methods: {
    doSave (e) {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        let valid = this.save()
        if (valid) {
          this.$emit('save')
        }
      }
    },
    save () {
      let data
      this.errors = []
      this.$emit('error', this.errors)
      try {
        data = yamlToJson(this.editor.getValue())
      } catch (e) {
        this.errors = [e]
        this.$emit('error', this.errors)
        return
      }
      let result = this.validator.validate(data)
      if (result.valid) {
        this.$emit('input', data)
        return true
      } else {
        this.errors = result.errors.map((e) => {
          return `${e.keywordLocation}: ${e.error}`
        })
        this.$emit('error', this.errors)
      }
    }
  }
}
</script>
<style lang="scss">
.monaco-editor {
  overflow-y: scroll;
  max-height: 60vh;
}
</style>