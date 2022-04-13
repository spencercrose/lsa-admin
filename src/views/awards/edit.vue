<template>
  <b-container fluid>
    <PageHeader :header="this.header" :lead="this.lead" />

    <b-form v-if="!isLoading">
      <b-card
        :header="isCreate ? 'Create Award' : 'Update Award'"
        header-tag="header"
        bg-variant="light"
        header-class="font-weight-bold"
        class="mb-3"
      >
        <b-form-group>

          <b-form-group
            id="fieldset-award-name"
            label="Award Name"
            label-for="input-award-name"
          >
            <b-form-input
              id="input-award-name"
              v-model="award.name"
              placeholder="Full name of award"
              :state="validate('name')"
            />
            <b-form-invalid-feedback :state="validate('name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="fieldset-award-shortname"
            label="Short Name"
            label-for="input-award-name"
          >
            <b-form-input
              id="input-award-shortname"
              v-model="award.short_name"
              placeholder="Code or shortened name of award"
              :state="validate('short_name')"
            />
            <b-form-invalid-feedback :state="validate('short_name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-award-milestone"
            label="Select Milestone"
            label-for="input-award-milestone"
            class="mb-4"
          >
            <b-form-select
              id="input-award-milestone"
              :value="award.milestone"
              :options="milestones"
              :state="validate('milestone')"
            >
            </b-form-select>
            <b-form-invalid-feedback :state="validate('milestone')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-award-image-url"
            label="Enter Image URL"
            label-for="input-award-milestone"
            class="mb-4"
          >
            <b-form-input
              id="input-award-image-url"
              type="url"
              v-model="award.image_url"
              placeholder="URL for award image"
            />
          </b-form-group>

          <b-form-group
            id="fieldset-award-description"
            label="Description"
            label-for="input-award-description"
            description="Use '\n' for line breaks."
          >
            <b-form-textarea
              id="input-award-description"
              v-model="award.description"
            />
          </b-form-group>

          <b-form-group
            id="fieldset-award-options"
            label="Options"
            label-for="input-award-options"
            label-class="font-weight-bold"
          >
              <b-form-checkbox-group
                id="input-award-options"
                v-model="selectedOptions"
                name="award-options"
                stacked
              >
                <b-form-checkbox
                  v-for="(optType, index) in optionTypes"
                  v-bind:key="optType.value"
                  :value="optType.value"
                  :id='`input-group-award-options-${index}`'
                >
                  <b-badge class="mr-2">{{optType.type}}</b-badge>
                  <span class="font-weight-bold">{{optType.text}}</span>
                  <b-form-group
                    v-if="selectedOptions.includes(optType.value) && optType.type==='select'"
                    :id='`input-group-award-options-values-${index}`'
                    label="Options:"
                    :label-for='`input-award-options-value-${index}`'
                    label-cols="3"
                  >
                    <b-input-group
                      prepend="Enter Value/Label"
                      v-for="(optSelection, selectionIndex) in options[optType.value]"
                      v-bind:key="optSelection.value"
                      class="mb-2"
                    >
                      <b-form-input
                        :id='`input-award-options-value-${selectionIndex}`'
                        v-model="optSelection.value"
                      />
                      <b-form-input
                        :id='`input-award-options-text-${selectionIndex}`'
                        v-model="optSelection.text"
                      />
                    </b-input-group>
                  </b-form-group>
                </b-form-checkbox>

              </b-form-checkbox-group>
            </b-form-group>

          <b-button
            class="mt-2"
            variant="info"
            :disabled="!validate('all') || processing"
            @click="submit()">
            {{ isCreate ? 'Create' : 'Update'}}
            <b-spinner class="ml-3" small v-if="processing" />
          </b-button>

          <b-button
            class="mt-2 ml-2"
            variant="secondary"
            :disabled="processing"
            @click="reroute('/awards')">
            Return to Awards
          </b-button>

        </b-form-group>
      </b-card>
    </b-form>
  </b-container>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import { get } from "@/services/api.services";
import optionServices from '@/services/options.services'

export default {
  head: {
    title: 'Register User',
  },
  props: ['header', 'lead', 'mode'],
  components: {
    PageHeader
  },
  data() {
    return {
      processing: false,
      award: '',
      options: [],
      selectedOptions: [],
      optionTypes: optionServices.get('award-option-types'),
      milestones: optionServices.get('milestones')
    }
  },
  computed: {
    isLoading() {
      return this.$store.getters.isLoading || this.$store.getters.getOrganizations.length === 0
    },
    isOrgContact() {
      return this.user.role === 'orgContact'
    },
    isCreate () {
      return this.mode === 'create'
    },
    validate(){
      return (field) => {
        const fields = {
          milestone: ()=>{
            return !!parseInt(this.award.milestone)
          },
          name: ()=>{
            return !!this.award.name
          },
          short_name: ()=>{
            return !!this.award.short_name
          }
        }
        // check if all fields validate
        if (field === 'all') return Object.keys(fields).filter(key => {
          return !fields[key]()
        }).length === 0

        if (!fields[field]) return false;
        return !!fields[field]();
      }
    }
  },
  methods: {
    async submit() {
      this.processing = true

      // encode award options
      this.award.options = JSON.stringify(this.options)

      console.log(this.award)

      // const [error,] = this.isCreate
      //   ? await post(`awards/create`, this.award)
      //   : await put(`awards/update/${this.$route.params.id}`, this.award)
      //
      // if (error) {
      //   this.$store.commit('setMessage', {
      //       text: 'Award could not be saved. An error occurred.',
      //       type: 'danger'
      //     }
      //   )
      // }
      // else {
      //   // successful update
      //   this.$store.commit('setMessage', {
      //     text: this.isCreate
      //       ? 'Award successfully created'
      //       : 'Award successfully updated',
      //     type: 'success'
      //   })
      //   // redirect to manage users
      //   this.isCreate ? await this.$router.push(`/awards/`) : ()=>{}
      // }

      this.processing = false
    },
    async reroute(uri) {
      await this.$router.push(uri)
    },
    lookup(key, value) {
      return optionServices.lookup(key, value)
    },
  },
  async created() {
    this.$store.commit('setLoading', true)

    // initialize data
    const [error, data] = this.isCreate
      ? [null, {}]
      : await get(`awards/show/${this.$route.params.id}`)

    if (error) this.$store.commit('setMessage', error)

    this.award = {
      id: data.id || '',
      name: data.name || '',
      short_name: data.short_name || '',
      milestone: data.milestone || '',
      description: data.description || '',
      image_url: data.image_url || '',
    }

    // get selected award options
    this.selectedOptions = Object.keys(JSON.parse(data.options || '{}'))
    this.options = JSON.parse(data.options || '{}')

    this.$store.commit('setLoading', false)
  }
}
</script>
