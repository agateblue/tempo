<template>
  <v-container fluid>
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
      <v-col
        cols="12"
        sm="6"
        :style="$vuetify.breakpoint.mdAndUp ? 'position: sticky; top: 3em; align-self: flex-start' : ''">
        <v-card tag="section" class="mt-2 fluid" :color="$theme.card.color">

          <v-card-title>Definition</v-card-title>
          <v-card-text :class="$theme.card.textSize">
            <blueprint-editor-form
              v-model="blueprint" 
              :deletable="id && !id.startsWith('builtin:')"
              :key="blueprintEditIdx"
            />
        </v-card-text> 
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card
          tag="section"
          class="mt-2 fluid"
          :color="$theme.card.color"
        >
          <v-card-title>About blueprints</v-card-title>
          <v-card-text>
            <v-tabs>

              <v-tab>
                Introduction
              </v-tab>
              <v-tab>
                Building blocks
              </v-tab>
              <v-tab>
                Complex forms
              </v-tab>
              <v-tab>
                Validation
              </v-tab>
              <v-tab>
                Visualizations
              </v-tab>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    
                    <p>Blueprints let you customize Tempo by adding new forms and visualizations.</p>
                    <p>
                      Blueprints are written in YAML format.
                      You can learn more about this format by reading <a href="https://spacelift.io/blog/yaml">this guide</a>
                      but you should be able to get started using this guide and the included examples.
                    </p>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <p>
                      Blueprints offer three kind of building blocks:
                    </p>
                    <ol>
                      <li>Fields: for tracking raw data such as your weight, height, hormone levels, etc.</li>
                      <li>Forms: to arrange fields and collect data in a human-friendly way</li>
                      <li>Visualizations: to aggregate and browse data collected through forms</li>
                    </ol>
                    <p>
                      Here is a very simple blueprint that you can use to track your weight.
                      Lines starting with a # are comments intended to help you understand what each part of the blueprint is doing.
                    </p>
                    <code-snippet language="yaml" :code="snippets.simple"></code-snippet>
                    <v-btn small class="mb-4" @click.prevent="loadYaml(snippets.simple)">Load in editor</v-btn>
                    <p>
                      If you click the button above or copy/paste this blueprint in the editor, you should see one field and one form
                      in the "Rendering" section below. This rendering section reflects in real-time the changes
                      made to your blueprints, so that you can know how your fields, forms and visualizations behave.
                    </p>
                    <p>
                      Once you're done, save the blueprint, enable it in your settings, and the new form
                      will be available in your diary, under the "additional options" toggle.
                    </p>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <p>
                      Our previous example was a bit simplistic. In a real-life scenario, you'll likely
                      want to collect more and different pieces of data or have multiple forms.
                    </p>
                    <p>
                      For instance, you might want to know the scale you used, and if you are currently
                      following a diet. You might also want to track your cat's weight. Let's do that!
                    </p>
                    <p>
                      This second blueprint is based on the first one. I have removed the previous comments
                      and added new ones when relevant:
                    </p>
                    <code-snippet language="yaml" :code="snippets.advanced"></code-snippet>
                    <v-btn small class="mb-4" @click.prevent="loadYaml(snippets.advanced)">Load in editor</v-btn>
                    <p>
                      As you can see, we can easily build multiple and more complex forms.
                    </p>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <p>
                      Our second blueprint is more useful. However, you might have noticed it lacks several things.
                      First of all, values in the "weight" field can be negative.
                      Also, you might want to make the "scale" field optional.
                    </p>
                    <p>
                      Tempo gives you a few additional configuration on fields you can use for such purpose.
                      Let's update our blueprint!
                    </p>
                    <code-snippet language="yaml" :code="snippets.validation"></code-snippet>
                    <v-btn small class="mb-4" @click.prevent="loadYaml(snippets.validation)">Load in editor</v-btn>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <p>
                      Now that we are able to collect data through our forms, let's build a couple visualizations.
                      Visualizations are written in SQL and can extract, aggregate and compute data to display it in graphs, table, pie charts…
                    </p>
                    <p>
                      We want a graph for our own weight, and a simple table logging our cat weight. Save the blueprint, go to the Diary and submit a couple entries for each form, so we have some data to play with, then come back here.
                    </p>
                    <code-snippet language="yaml" :code="snippets.visualization"></code-snippet>
                    <v-btn small class="mb-4" @click.prevent="loadYaml(snippets.visualization)">Load in editor</v-btn>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
        <v-card
          tag="section"
          class="mt-2 fluid"
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
                <v-expansion-panel-header>Fields ({{ (blueprint.fields || []).length }})</v-expansion-panel-header>
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
                <v-expansion-panel-header>Forms ({{ (blueprint.forms || []).length }})</v-expansion-panel-header>
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
              <v-expansion-panel
                style="background: transparent"
              >
                <v-expansion-panel-header>Visualizations ({{ (blueprint.visualizations || []).length }})</v-expansion-panel-header>
                <v-expansion-panel-content
                  v-if="blueprint.visualizations && blueprint.visualizations.length > 0"
                >
                  <visualization-config
                    v-model="visualizationParams"
                    :all-entries="entries"
                    :show-blueprint-selector="false"
                    :selected-blueprint="blueprint"
                  ></visualization-config>
                  <dataviz 
                    :key="JSON.stringify(blueprint.visualizations)"
                    :blueprint="blueprint"      
                    :entries="queryableEntries"
                    :tags="queryableTags"
                    :params="visualizationParams"
                  ></dataviz>
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
import CodeSnippet from '@/components/CodeSnippet'
import {getQueryableEntries, getQueryableTags, getDates, search, yamlToJson} from '@/utils'
import txt from 'raw-loader!@/blueprints/example:simple.yml'
const exampleBlueprint = yamlToJson(txt)


const SNIPPETS = {
  simple: `# Each blueprint must have a unique ID
id: my-stuff
# The blueprint label is displayed in various place
# in Tempo's UI
label: My stuff
# Here, we define our blueprint fields
fields:
  # Like blueprints, fields must have unique IDs
  - id: weight
    # The field label will be displayed in the UI
    label: Weight
    unit: Kilograms
    # The field will collect numeric data
    type: number
# Here, we define a simple form that we can use to track
# weight
forms:
  # Again, each form must have a unique ID
  - id: weight-tracking
    label: Weight tracking
    # Here, we declare what fields will be displayed in this form
    fields:
      # we use the id of the field we declared previously
      - id: weight
`,
  advanced: `id: my-stuff
label: My stuff
fields:
  - id: weight
    label: Weight
    unit: Kilograms
    type: number
  # Here, we add two more fields
  # The first one is a text field with suggestions
  # so that you can quickly select values
  - id: scale
    label: Scale
    type: text
    default: Home
    suggestions:
      - Home
      - Lola
      - Doctor
  # The second one is a boolean (yes/no) field
  # that defaults to true
  - id: onDiet
    label: On diet
    type: boolean
    default: true

forms:
  - id: weight-tracking
    label: Weight tracking
    fields:
      - id: weight
      # We update our form by including the new fields
      - id: scale
      - id: onDiet
  # we create a second form for our cat, with different fields
  - id: weight-tracking-cat
    label: Weight tracking (Cat)
    fields:
      - id: weight
      - id: scale
        # Here, we override the default value and suggestions,
        # to make them for relevant for this specific form.
        # All the options available when declaring fields in the blueprints
        # can be replaced here, as needed.
        default: Veterinary
        suggestions:
          - Home
          - Veterinary
`,
  validation: `id: my-stuff
label: My stuff
fields:
  - id: weight
    label: Weight
    unit: Kilograms
    type: number
    # Here, we configure the minimun value for the field
    min: 1
    # The step option might also be useful, to restrict the number
    # of allowed decimal places
    step: '0.1'
  - id: scale
    label: Scale
    type: text
    default: Home
    # here, we mark the field as optional
    required: false
    suggestions:
      - Home
      - Lola
      - Doctor
  - id: onDiet
    label: On diet
    type: boolean
    default: true

forms:
  - id: weight-tracking
    label: Weight tracking
    fields:
      - id: weight
      - id: scale
      - id: onDiet
  - id: weight-tracking-cat
    label: Weight tracking (Cat)
    fields:
      - id: weight
      - id: scale
        default: Veterinary
        suggestions:
          - Home
          - Veterinary
`,
  visualization: `id: my-stuff
label: My stuff
fields:
  - id: weight
    label: Weight
    unit: Kilograms
    type: number
    min: 1
    step: '0.1'
  - id: scale
    label: Scale
    type: text
    default: Home
    required: false
    suggestions:
      - Home
      - Lola
      - Doctor
  - id: onDiet
    label: On diet
    type: boolean
    default: true

forms:
  - id: weight-tracking
    label: Weight tracking
    fields:
      - id: weight
      - id: scale
      - id: onDiet
  - id: weight-tracking-cat
    label: Weight tracking (Cat)
    fields:
      - id: weight
      - id: scale
        default: Veterinary
        suggestions:
          - Home
          - Veterinary

# The visualization magic happens here 
visualizations:
  - label: My weight
    help: Average per day, in kilograms
    # The query is the important part. It's responsible for fetching
    # the data in a way that can be displayed in graphs.
    # Here, we select an average of our weight per date, filtering
    # on our form id.
    query: |-
      SELECT
        date,
        AVG(data->\`weight\`) as Weight
      FROM ? WHERE form = "weight-tracking"
      GROUP BY date
      ORDER BY date DESC
    # We want a simple line chart, but you could try bar as well
    # for a histogram
    displayType: line
    displayOptions:
      colors:
        # you can try with orange or red if you want
        - green
  - label: My cat's weight
    # This query is simpler, because we simply log all the form
    # entries in a table.
    query: |-
      SELECT
        date as Date,
        data->\`weight\` as Weight,
        data->\`scale\` as Scale
      FROM ? WHERE form = "weight-tracking-cat"
      ORDER BY date DESC
    displayType: table
`
}
export default {
  props: {
    id: {required: false}
  },
  components: {
    CodeSnippet,
    BlueprintEditorForm,
    BlueprintForm,
    BlueprintField,
    Dataviz:  () => import(/* webpackChunkName: "visualization" */ "@/components/Dataviz"),
    VisualizationConfig:  () => import(/* webpackChunkName: "visualization" */ "@/components/VisualizationConfig"),
  },
  data () {
    return {
      snippets: SNIPPETS,
      panels: [],
      blueprint: null,
      entries: [],
      visualizationParams: {
        ...getDates(this.defaultStart, this.defaultEnd),
        groupByPeriod: 'date',
      },
      blueprintEditIdx: 0,

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
    await this.search()
  },
  methods: {
    async search () {
      this.entries = await search({
        store: this.$store,
        sortDesc: true,
        query: this.$store.state.searchQuery,
      })
    },
    loadYaml (txt) {
      this.blueprint = yamlToJson(txt)
      this.blueprintEditIdx += 1
    }
  },
  computed: {
    availableFields () {
      let fields = {...this.$store.getters.fieldsById}
      this.blueprint.fields.forEach(f => {
        fields[f.id] = f
      })
      return fields
    },
    
    queryableEntries () {
      return getQueryableEntries(this.entries, this.visualizationParams.start, this.visualizationParams.end)
    },
    queryableTags () {
      return getQueryableTags(this.queryableEntries)
    },
  },
  watch: {
    '$store.state.searchQuery': async function () {
      await this.search()
    },
  }
}
</script>
