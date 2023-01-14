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
// import isEqual from 'lodash/isEqual'
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
    }
  },
  mounted () {
    let self = this
    const validator = new Validator(this.schema);
    loader.init().then((monaco) => {
      const editorOptions = {
        language: "yaml",
        value: jsonToYaml(self.value),
        theme: 'vs-dark',
        scrollBeyondLastLine: false,
      };
      self.editor = monaco.editor.create(self.$refs.editor, editorOptions);
      self.editor.getModel().onDidChangeContent(() => {
        let data
        self.errors = []
        self.$emit('error', self.errors)
        try {
          data = yamlToJson(self.editor.getValue())
        } catch (e) {
          self.errors = [e]
          self.$emit('error', self.errors)
          return
        }
        let result = validator.validate(data)
        if (result.valid) {
          self.$emit('input', data)
        } else {
          self.errors = result.errors.map((e) => {
            return `${e.keywordLocation}: ${e.error}`
          })
          self.$emit('error', self.errors)
        }
      });
    });
    // this.editor = new JSONEditor({
    //   target: this.$refs["editor"],
    //   props: {
    //     content: {
    //       json: this.value,
    //     },
    //     statusBar: false,
    //     mode: 'text',
    //     mainMenuBar: false,
    //     indentationNumber: 2,
    //     validator: this.validator,
    //     onChange: (updatedContent, previousContent, { contentErrors }) => {
    //       if (isEqual(contentErrors, {validationErrors: []})) {
    //         // no error occured, we can send the update signal
    //       }
    //     },
    //   }
    // })
  }
}
</script>
<style lang="scss">
.monaco-editor {
  overflow-y: scroll;
  max-height: 60vh;
}
</style>