<template>
  <v-container>
    <v-btn
        class="px-0"
        to="/settings"
        plain
        small
      >
      <v-icon left v-text="$icons.mdiArrowLeft"></v-icon>
      Go back to settings
    </v-btn>
    <v-divider class="my-4"></v-divider>
    <h1 v-if="id" class="headline mb-4">Edit blueprint "{{ blueprint.label }}"</h1>
    <h1 v-else class="headline mb-4">Create a new blueprint</h1>
    <v-row v-if="blueprint">
      <v-col cols="12" sm="6">
        <v-card tag="section" class="mt-2" :color="$theme.card.color">

          <v-card-title>Definition</v-card-title>
          <v-card-text :class="$theme.card.textSize">
            <blueprint-editor-form
              v-model="blueprint" 
              :deletable="id && !id.startsWith('builtin:')"
            />
        </v-card-text> 
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card
          tag="section"
          class="mt-2"
          :color="$theme.card.color"
        >
          <v-card-title>Rendering</v-card-title>
          <v-card-text>
            <v-expansion-panels
              focusable
              v-model="panels"
              multiple
              flat
              accordion
              tile
              color="transparent"
            >
              <v-expansion-panel
                style="background: transparent" 
              >
                <v-expansion-panel-header>Fields</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                    v-for="field in blueprint.fields"
                    :key="field.id"
                  >
                    <blueprint-field :field="field" />
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel
                style="background: transparent"
              >
                <v-expansion-panel-header>Forms</v-expansion-panel-header>
                <v-expansion-panel-content>
                  <div
                    v-for="form in blueprint.forms"
                    :key="form.id"
                  >
                    <h3 class="headline">{{ form.label }}</h3>
                    <blueprint-form
                      :config="form"
                      :available-fields="availableFields"
                    />
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

import BlueprintField from '@/components/BlueprintField'
import BlueprintEditorForm from '@/components/BlueprintEditorForm'
import BlueprintForm from '@/components/BlueprintForm'
const exampleBlueprint = require('@/blueprints/example:pets.json')

export default {
  props: {
    id: {required: false}
  },
  components: {
    BlueprintEditorForm,
    BlueprintForm,
    BlueprintField,
  },
  data () {
    return {
      panels: [],
      blueprint: null
    }
  },
  async created () {
    let definition = null
    if (this.id) {
      this.$store.state.loadedBlueprints.forEach(b => {
        if (b.id === this.id) {
          definition = b
        }
      })
    }
    this.blueprint = cloneDeep(definition || exampleBlueprint)
  },
  computed: {
    availableFields () {
      let fields = {...this.$store.getters.fieldsById}
      this.blueprint.fields.forEach(f => {
        fields[f.id] = f
      })
      return fields
    }
  }
}
</script>
