<template>
  <section class="info-header">
    <div class="container">
      <nav class="navbar" role="navigation">
        <div class="navbar-brand">
          <a
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="infoNav"
            @click="isActive = !isActive"
          >
            {{ $auth.user().name }}
          </a>
        </div>

        <div id="infoNav" :class="'navbar-menu' + (isActive ? ' is-active' : '')" v-if="isActive">
          <a class="navbar-item">
            Profile
          </a>
          <a class="navbar-item" @click="logout">
            Log Out
          </a>
        </div>

        <div class="navbar-menu">
          <div class="navbar-start">
            <div class="navbar-item" v-if="title">
              {{ title }}
            </div>
          </div>
          <div class="navbar-end">
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link has-text-weight-semibold">
                {{ $auth.user().name }}
              </a>

              <div class="navbar-dropdown">
                <a
                  class="navbar-item"
                  @click="
                    () => {
                      shouldShowProfile = true;
                      error = null;
                      showSuccessProfileMessage = false;
                    }
                  "
                >
                  Profile
                </a>
                <a class="navbar-item" @click="logout">
                  Log Out
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <SideNav
        v-if="shouldShowProfile"
        :handleClose="() => (shouldShowProfile = false)"
        title="Profile"
        class="profile-title"
      >
        <template #default="props">
          <form id="editProfile" @submit.prevent="handleProfileSubmit">
            <div class="field">
              <label class="label has-text-white">Full Name</label>
              <input
                class="input"
                type="text"
                required
                placeholder="Enter Full Name"
                v-model="$auth.user().name"
                maxlength="255"
              />
            </div>
            <div class="field">
              <label class="label has-text-white">Email</label>
              <input
                class="input"
                type="email"
                required
                placeholder="Enter email"
                v-model="$auth.user().email"
                maxlength="255"
              />
            </div>
            <div class="field">
              <label class="label has-text-white">Organization</label>
              <input
                class="input"
                type="text"
                required
                placeholder="Enter organization"
                v-model="$auth.user().organization"
                maxlength="255"
              />
            </div>
            <hr />
            <div class="field is-grouped">
              <div class="control">
                <Button label="Save" type="info" submit />
              </div>
              <div class="control">
                <Button label="Change Password" type="info" @click.native="changePasswordModal" />
              </div>
            </div>
            <div class="field">
              <div class="control">
                <Button label="Cancel" type="cancel" :preventEvent="true" @click.native="props.close" />
              </div>
            </div>
          </form>
          <br />
          <Alert v-if="showSuccessProfileMessage" :message="successProfileMessage" type="success" />
          <Alert v-if="error" :message="error" type="error" />
        </template>
      </SideNav>
      <ExampleModal
        v-if="shouldShowChangePassword"
        :handleClose="
          () => {
            shouldShowChangePassword = false;
          }
        "
        class="changePassword"
      >
        <span class="title is-size-4">Change Password</span>
        <hr />
        <form id="changePassword" @submit.prevent="handleChangePassword">
          <div class="field">
            <label class="label has-text-white">Current Password</label>
            <input
              class="input"
              type="password"
              required
              placeholder="Enter Current Password"
              v-model="currentPassword"
              maxlength="255"
            />
          </div>
          <div class="field">
            <label class="label has-text-white"
              >New Password
              <HoverText :icon="true" hoverId="passwordInfo">
                Must be at least 8 characters in length and contain at least one lower-case and upper-case character and
                one number.
              </HoverText>
            </label>
            <input
              class="input"
              type="password"
              required
              placeholder="Enter New Password"
              v-model="newPassword"
              maxlength="255"
            />
          </div>
          <div class="field">
            <label class="label has-text-white">Confirm New Password</label>
            <input
              class="input"
              type="password"
              required
              placeholder="Confirm New Password"
              v-model="confirmNewPassword"
              maxlength="255"
            />
          </div>
          <div class="field">
            <Alert v-if="error" :message="error" type="error" />
          </div>
          <hr />
          <div class="field is-grouped">
            <div class="control">
              <Button label="Change" type="success" submit />
            </div>
            <div class="control">
              <Button
                label="Cancel"
                type="cancel"
                :preventEvent="true"
                @click.native="
                  () => {
                    shouldShowChangePassword = false;
                  }
                "
              />
            </div>
            <div class="control">
              <Alert v-if="showSuccessPasswordMessage" :message="successPasswordMessage" type="success" />
            </div>
          </div>
        </form>
      </ExampleModal>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Button from '@/components/shared/Button';
import SideNav from '@/components/shared/SideNav';
import Alert from '@/components/shared/Alert';
import ExampleModal from '@/components/shared/ExampleModal';
import HoverText from '@/components/shared/HoverText';

export default {
  props: ['userName'],
  components: { Button, SideNav, Alert, ExampleModal, HoverText },
  data() {
    return {
      isActive: false,
      error: null,
      shouldShowProfile: false,
      showSuccessProfileMessage: false,
      shouldShowChangePassword: false,
      showSuccessPasswordMessage: false,
      successProfileMessage: 'Your profile was successfully updated.',
      successPasswordMessage: 'Your password was successfully updated.',
    };
  },
  methods: {
    ...mapActions('user', ['saveProfile', 'changePassword']),
    logout() {
      this.$auth.logout();
    },
    async handleProfileSubmit() {
      try {
        await this.saveProfile({
          data: {
            name: this.name,
            email: this.email,
            organization: this.organization,
          },
        });
        this.showSuccessProfileMessage = true;
        this.name = null;
        this.email = null;
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
    changePasswordModal() {
      this.shouldShowChangePassword = !this.shouldShowChangePassword;
      this.showSuccessPasswordMessage = false;
      this.currentPassword = null;
      this.newPassword = null;
      this.confirmNewPassword = null;
    },
    async handleChangePassword() {
      try {
        await this.changePassword({
          data: {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
            confirmNewPassword: this.confirmNewPassword,
          },
        });
        this.showSuccessPasswordMessage = true;
        this.currentPassword = null;
        this.newPassword = null;
        this.confirmNewPassword = null;
        this.error = null;
      } catch (error) {
        this.error = error.response.data.error;
      }
    },
  },
  computed: {
    ...mapGetters('qapp', ['title']),
    name: {
      get() {
        return this.$store.state.user.newName;
      },
      set(value) {
        this.$store.commit('user/SET_NEW_NAME', value);
      },
    },
    email: {
      get() {
        return this.$store.state.user.newEmail;
      },
      set(value) {
        this.$store.commit('user/SET_NEW_EMAIL', value);
      },
    },
    currentPassword: {
      get() {
        return this.$store.state.user.currentPassword;
      },
      set(value) {
        this.$store.commit('user/SET_CURRENT_PASSWORD', value);
      },
    },
    newPassword: {
      get() {
        return this.$store.state.user.newPassword;
      },
      set(value) {
        this.$store.commit('user/SET_NEW_PASSWORD', value);
      },
    },
    confirmNewPassword: {
      get() {
        return this.$store.state.user.confirmNewPassword;
      },
      set(value) {
        this.$store.commit('user/SET_PASSWORD_CONFIRMATION', value);
      },
    },
    organization: {
      get() {
        return this.$store.state.user.newOrganization;
      },
      set(value) {
        this.$store.commit('user/SET_ORGANIZATION', value);
      },
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.info-header {
  background-color: #e6e6e6;
  font-size: 0.8em;
  z-index: 50;

  .navbar,
  .navbar-brand,
  .navbar-burger {
    background-color: #e6e6e6;
    padding: 0;
    min-height: unset;
    height: 2.5em;
  }

  .navbar-burger {
    padding: 0.5em;
  }
}
</style>

<style lang="scss">
@import '../../../static/variables';
.title {
  color: white;
}
.changePassword .modal-content {
  background: $darkBlue;
}
</style>
