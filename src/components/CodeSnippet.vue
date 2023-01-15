<template>
  <pre><code class="code-snippet" ref="code" :class="`language-${language}`">{{ code }}</code></pre>
</template>
<script>
import 'highlight.js/styles/night-owl.css'
import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';
hljs.registerLanguage('yaml', yaml);

export default {
  props: ['language', 'code'],
  mounted () {
    hljs.highlightElement(this.$refs.code);
  }
}
</script>