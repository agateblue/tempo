<template>
  <v-container class="narrow">
    <v-card :color="$theme.card.color" cm>
      <v-card-title class="headline">Aliases</v-card-title>

      <v-card-text :class="$theme.card.textSize">
        <p>
          Aliases let you save and reuse search queries.
          For instance, you could set a <code>$dreams</code> alias in place of a
          <code>dream, dreamed, dreams, nightmare, nightmares</code> query.
        </p>
        <v-form>
          <alias-form
            v-for="alias in $store.state.settings.aliases"
            :key="alias._id"
            :alias="alias"
          />
          <alias-form
            :key="String(lastAliasesUpdate)"
            @created="lastAliasesUpdate = new Date()" />
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import AliasForm from '@/components/AliasForm'

export default {
  props: {
    allEntries: Array
  },
  components: {
    AliasForm
  },
  data () {
    return {
      lastAliasesUpdate: new Date(),
    }
  },    
}
</script>
