<template>
  <div class="pb-8">
    <template v-if="!entryId">
      <entry-form
        
        textarea-label="Write a new entry"
        color="transparent"
        :key="`timeline-form-${$store.state.lastSync}`"
        ref="entryForm"
        @submitted="handleCreated"
      />
      <v-divider></v-divider>
    </template>
    <v-container v-if="!entryId" class="py-0 px-0 narrow d-flex justify-end">
      <v-switch
        class="mr-2"
        v-model="filters.threads"
        label="Show threads"
      ></v-switch>
      <v-switch
        v-model="filters.favorites"
        label="Show favorites"
      ></v-switch>
    </v-container>
    <v-container v-if="entryId" class="py-0 px-0 narrow d-flex justify-start">
      <v-btn
        class="mt-5 px-0"
        to="/diary"
        plain
        small
      >
        <v-icon left v-text="$icons.mdiArrowLeft"></v-icon>
        Go back to diary
      </v-btn>
    </v-container>
    <timeline
      ref="timeline"
      class="mt-0 container narrow px-0"
      :entries="shownEntries"
      :entry-id="entryId"
      :key="`timeline-${$store.state.lastSync}`"
      @updated="$emit('updated', $event)"
      @replied="$emit('replied', $event)"
      @deleted="$emit('deleted', $event)"></timeline>
    <v-container
      v-if="!entryId && shownEntries.length < entries.length"
      class="narrow"
      :key="`container-${$store.state.lastSync}`"
    >
      <v-btn
        v-if="showShowMoreButton"
        color="secondary"
        @click.prevent="showMore([{isIntersecting: true}])"
        v-intersect="{
          handler: showMore,
          options: {
            threshold: 0.5
          }
        }">Show more</v-btn>
    </v-container>
  </div>
</template>

<script>
import Timeline from '@/components/Timeline.vue'
import debounce from 'lodash/debounce'
import EntryForm from '@/components/EntryForm.vue'

export default {
  props: {
    allEntries: Array,
    entryId: {required: false}
  },
  components: {
    Timeline,
    EntryForm,
  },
  data () {
    return {
      filters: {
        favorites: false,
        threads: false,
      },
      showEntryModal: false,
      showShowMoreButton: false,
      count: this.$store.state.pageSize,
      sortDesc: true,
    }
  },
  computed: {
    entries () {
      let e = [...this.allEntries]
      if (this.sortDesc) {
        e.reverse()
      }
      return e
    },
    shownEntries () {
      return this.entries.slice(0, this.count)
    },
  },
  methods: {
    async handleCreated (e) {
      this.$emit('created', e)
    },
    showMore: debounce(function (data) {
      if (data && !data[0].isIntersecting) {
        return
      }
      this.count += this.$store.state.pageSize
    }, 1000, {leading: true, trailing: false, maxWait: 500})
  },
  watch: {
    
    shownEntries () {
      setTimeout(() => {
        this.showShowMoreButton = true
      }, 1000)
    },
    filters: {
      handler (v) {
        let query = []
        if (v.favorites) {
          query.push('is:fav')
        }
        if (v.threads) {
          query.push('is:threads')
        }
        this.$store.commit('searchQuery', query.join(' '))
      },
      deep: true
    }
  },
}
</script>
