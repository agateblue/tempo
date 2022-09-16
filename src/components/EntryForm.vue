<template>
  <v-card
    tag="form"
    outlined
    color="transparent"
    @submit.prevent="submit"
    @keydown.ctrl.enter.exact="submit"
  >
    <v-card-text class="narrow px-0" color="transparent">
      <v-textarea
        clearable
        outlined
        :name="name"
        class="mt-0"
        ref="textarea"
        id="composer"
        auto-grow
        autofocus
        :label="textareaLabel"
        placeholder="How do you feel?"
        v-model="text"
        hide-details
      ></v-textarea>
      <v-expansion-panels focusable flat accordion tile color="transparent">
        <v-expansion-panel color="transparent" style="background: transparent">
          <v-expansion-panel-header color="transparent">More options...</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row class="d-flex justify-space-between align-center my-2">
              <v-col
                v-if="formChoices.length > 1"
                cols="12"
                sm="4"
              >
                <v-select
                  label="Type"
                  v-model="currentFormId"
                  :items="formChoices"
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                sm="4"

              >
                <v-text-field
                  label="Date"
                  v-model="textDate"
                  type="datetime-local"
                  :max="new Date().toLocaleDateString('en-ca')"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="4"
                class="py-0"
              >
                <v-btn
                  small
                  @click.prevent="date = new Date()"
                >
                  Set to now
                </v-btn>
              </v-col>
            </v-row>
            <v-divider v-if="currentFormId" class="my-4" />
            <v-row
              class="mt-0 d-flex justify-space-between align-center">
              <v-col
                v-if="currentFormId"
                cols="12"
                sm="4"
              >
                <v-btn
                  small
                  @click="$refs.blueprintForm.fillFromLast()"
                >
                  Reuse last values
                </v-btn>
              </v-col>
              <v-col
                v-if="!isEmpty(formData) || currentFormId"
                cols="12"
                sm="12"
              >
                <blueprint-form
                  ref="blueprintForm"
                  :key="blueprintFormKey"
                  :config="$store.getters.formsById[currentFormId]"
                  :available-fields="$store.getters.fieldsById"
                  v-model="formData"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="entry || thread" 
          text
          small
          @click="$emit('cancel')"
        >
          Cancel
        </v-btn>
        <v-btn :color="$theme.mainButton.color" type="submit">Save</v-btn>
      </v-card-actions>
    </v-card-text>   
  </v-card>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import format from 'date-fns/format'
import throttle from 'lodash/throttle'

import BlueprintForm from '@/components/BlueprintForm'
import {getNewEntryData} from '@/utils'

function getFormData (entry, formData) {
  let d = entry.data || {}
  d = {
    ...d,
    ...(formData || {}),
  }
  return isEmpty(d) ? null : d
}

export default {
  props: {
    entry: {type: Object, default: null},
    thread: {type: String, default: null},
    name: {type: String, default: 'how'},
    initialText: {type: String, default: ''},
    textareaLabel: {type: String, default: 'Entry content'},
    color: {type: String, default: ''},
  },
  components: {
    BlueprintForm
  },
  data () {
    return {
      text: this.initialText,
      currentFormId: (this.entry || {}).form || null,
      dateDialog: false,
      blueprintFormKey: 1,
      date: null,
      formData: {},
      textDate: null,
      maxDate: null,
      isEmpty,
    }
  },
  async created () {
    if (this.entry) {
      this.text = this.entry.text
      this.date = new Date(this.entry.fullDate)
    } else if (!this.text) {
      this.text = localStorage.getItem('entry-draft')
    }
  },
  computed: {
    formChoices () {
      return [
        {text:'Default', value: null},
        ...this.$store.getters.forms.map((f) => {
          return {
            text: f.label,
            value: f.id
          }
        })
      ]
    }
  },
  methods: {
    async submit () {
      if (!this.text && isEmpty(this.formData)) {
        return
      }
      let e
      if (this.entry) {
        e = await this.update()
      } else {
        e = await this.addNew()
      }
      this.$emit('submitted', e)
      await this.$store.dispatch('triggerWebhook')
    },
    async addNew () {
      let date = this.date ? new Date(this.date) : new Date()
      let data = {
        ...getNewEntryData(this.text, {thread: this.thread}),
        date: date.toISOString(),
        form: this.currentFormId,
      }
      data.data = getFormData(data, this.formData)
      data._id = data.date
      let e = await this.$store.dispatch('addEntry', data)
      this.$emit('created', e)
      this.text = ''
      this.date = null
      this.formData = {}
      this.blueprintFormKey += 1
      return e
    },
    async update () {
      let date = new Date(this.date || this.entry.date)
      let data = {
        ...getNewEntryData(this.text, {thread: this.entry.thread, replies: this.entry.replies}),
        _rev: this.entry._rev,
        _id: this.entry._id,
        date: date.toISOString(),
        form: this.currentFormId,
      }
      data.data = getFormData(data, this.formData)
      let e = await this.$store.dispatch('updateEntry', data)
      this.$store.dispatch('forceSync', {updateLastSync: false})
      this.$emit('updated', e)
      return e
    },
  },
  watch: {
    date: {
      handler (v) {
        if (!v) {
          this.textDate = null
        } else {
          this.textDate = format(v, "yyyy-MM-dd'T'HH:mm")
        }
      },
      immediate: true,
    },
    textDate: {
      handler (v) {
        if (v) {
          this.date = new Date(v)
        }
      },
      immediate: true,
    },
    text: {
      handler: throttle(function (v) {
        if (!this.entry) {
          localStorage.setItem('entry-draft', v || '')
        }
      }, 1000, {leading: true, trailing: true})
    },
    currentFormId: {
      immediate: true,
      handler () {
        this.formData = {...(this.entry || {}).data || {}}
      }
    }
  }
}
</script>
