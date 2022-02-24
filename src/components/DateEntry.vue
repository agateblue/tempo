<template>
  <p class="font-weight-light text--lighten">
    {{ row.repr }}
  </p>
</template>
<script>

export default {
  props: {
    row: Object
  },
}
</script>
