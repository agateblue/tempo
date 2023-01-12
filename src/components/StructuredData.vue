<template>
  <v-table>
    <template v-slot:default>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td>
            {{ row.label }}
          </td>
          <td>
            {{ row.value }}
          </td>
        </tr>
      </tbody>
    </template>
  </v-table>
</template>
<script>
export default {
  props: ['data', 'fields'],
  computed: {
    rows () {
      let r = []
      for (const key in this.data) {
        if (Object.hasOwnProperty.call(this.data, key)) {
          const value = this.data[key];
          let field = this.fields[key] || {}
          r.push({
            id: key,
            label: field.label || key,
            value: value
          })
        }
      }
      return r
    }
  }
}
</script>