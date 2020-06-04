<template>
  <v-card :color="$theme.card.color" outlined dense small class="date-entry">
    <v-card-text class="text-center body-2">
      <v-icon small>
        {{ $icons.mdiCalendar }}
      </v-icon>
      &nbsp;
      &nbsp;
      &nbsp;
      {{ row.repr }}
    </v-card-text>
  </v-card>
</template>
<script>

export default {
  props: {
    row: Object
  },
}
</script>
