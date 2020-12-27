<template>
  <p class="font-weight-thin text--lighten">
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
