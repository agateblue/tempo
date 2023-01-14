<template>
  <div class="yaml-editor">
    {{ error }}
    <div ref="editor" style="height: 500px; width: 100%;"></div>
  </div>

</template>
<script>
// import isEqual from 'lodash/isEqual'
import loader from "@monaco-editor/loader";
import {jsonToYaml, yamlToJson} from '@/utils'

export default {
  props: {
    value: {default: () => {return {foo: 'bar'}}},
    validator: {}
  },
  data () {
    return {
      editor: null,
      error: null,
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
        self.$emit('input', yamlToJson(self.editor.getValue()))
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