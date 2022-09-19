<template>
  <div class="json-editor">
    {{ error }}
    <div ref="editor" class="jse-theme-dark"></div>
  </div>

</template>
<script>
import isEqual from 'lodash/isEqual'

import { JSONEditor } from "vanilla-jsoneditor"
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
    this.editor = new JSONEditor({
      target: this.$refs["editor"],
      props: {
        content: {
          json: this.value,
        },
        statusBar: false,
        mode: 'text',
        mainMenuBar: false,
        indentationNumber: 2,
        validator: this.validator,
        onChange: (updatedContent, previousContent, { contentErrors }) => {
          if (isEqual(contentErrors, {validationErrors: []})) {
            // no error occured, we can send the update signal
            self.$emit('input', JSON.parse(updatedContent.text))
          }
        },
      }
    })
  }
}
</script>
<style scoped lang="scss">
@import '~vanilla-jsoneditor/themes/jse-theme-dark.css';
.json-editor {
  overflow-y: scroll;
  max-height: 60vh;
}
</style>