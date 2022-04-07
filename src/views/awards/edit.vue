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
            />
            <b-form-invalid-feedback :state="validate('name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="fieldset-award-shortname"
            label="Award Short Name"
            label-for="input-award-name"
          >
            <b-form-input
              id="input-award-shortname"
              v-model="award.short_name"
              placeholder="Code or shortened name of award"
            />
            <b-form-invalid-feedback :state="validate('short_name')">
              This field is required.
            </b-form-invalid-feedback>
          </b-form-group>

          <b-form-group
            id="input-award-milestone"
            label="Select Award Milestone"
            label-for="input-award-milestone"
            label-class="font-weight-bold"
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
            label="Select Award Image Link"
            label-for="input-award-milestone"
            label-class="font-weight-bold"
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
            label="Award Description"
            label-for="input-award-description"
            label-class="font-weight-bold"
          >
            <b-form-textarea
              id="input-award-description"
              v-model="award.description"
            />
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
            @click="reroute('/ceremonies')">
            Return to Awards
          </b-button>

        </b-form-group>
      </b-card>
    </b-form>
  </b-container>
</template>

<script>
import PageHeader from '@/components/PageHeader'
import { get, put, post } from "@/services/api.services";
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
    async reroute(uri) {
      await this.$router.push(uri)
    },
    async submit() {
      this.processing = true

      // combine date and time
      const datetime = `${this.date} ${this.time}`
      console.log(this.date, datetime)

      const [error,] = this.isCreate
        ? await post(`awards/create`, {
          scheduled_datetime: datetime
        })
        : await put(`awards/update/${this.$route.params.id}`, {
          id: this.id,
          scheduled_datetime: datetime
        })

      if (error) {
        this.$store.commit('setMessage', {
            text: 'Award could not be saved. An error occurred.',
            type: 'danger'
          }
        )
      }
      else {
        // successful update
        this.$store.commit('setMessage', {
          text: this.isCreate
            ? 'Award successfully created'
            : 'Award successfully updated',
          type: 'success'
        })
        // redirect to manage users
        this.isCreate ? await this.$router.push(`/awards/`) : ()=>{}
      }

      this.processing = false
    }
  },
  async created() {
    this.$store.commit('setLoading', true)

    // initialize data
    const [error, data] = this.isCreate
      ? [null, {}]
      : await get(`awards/show/${this.$route.params.id}` || '')

    if (error) this.$store.commit('setMessage', error)

    this.award = {
      id: data.id || '',
      name: data.name || '',
      shortName: data.short_name || '',
      milestone: data.milestone || '',
      description: data.description || '',
      imageUrl: data.image_url || '',
      options: JSON.parse(data.options || '{}') || null,
    }

    console.log('!!!', this.award)

    this.$store.commit('setLoading', false)
  }
}
</script>
