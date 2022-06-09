<template>
    <nav class="navbar navbar-vertical fixed-left navbar-expand-md navbar-dark side-ila" id="sidenav-main">
        <div class="container-fluid">

            <!--Toggler-->
            <ToggleButton @click.native="showSidebar" />
            <router-link class="navbar-brand" to="/portfolio/">
                <img src="/img/brand/icon-yanda.png" class="navbar-brand-img" alt="Yanda Logo">
            </router-link>

            <ul class="nav align-items-center d-md-none">
              <wallet-menu></wallet-menu>
            </ul>
            
            <div v-show="$sidebar.showSidebar" class="navbar-collapse collapse show" id="sidenav-collapse-main">

                <div class="navbar-collapse-header d-md-none">
                    <div class="row">
                        <div class="col-6 collapse-brand">
                            <router-link to="/">
                                <img :src="logo">
                            </router-link>
                        </div>
                        <div class="col-6 collapse-close">
                            <ToggleButton @click.native="closeSidebar" />
                        </div>
                    </div>
                </div>

                <ul class="navbar-nav">
                    <slot name="links">
                    </slot>
                </ul>
            </div>
        </div>
    </nav>
</template>
<script>
  import ToggleButton from '@/components/NavBar/ToggleButton'
  import WalletMenu from '@/components/NavBar/WalletMenu.vue'

  export default {
    name: 'SideBar',
    components: {
      ToggleButton,
      WalletMenu
    },
    props: {
      logo: {
        type: String,
        default: 'img/brand/icon-yanda.png',
        description: 'Sidebar app logo'
      },
      autoClose: {
        type: Boolean,
        default: true,
        description: 'Whether sidebar should autoclose on mobile when clicking an item'
      }
    },
    provide() {
      return {
        autoClose: this.autoClose
      };
    },
    methods: {
      closeSidebar() {
        this.$sidebar.displaySidebar(false)
      },
      showSidebar() {
        this.$sidebar.displaySidebar(true)
      }
    },
    beforeDestroy() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.showSidebar = false;
      }
    }
  };
</script>
<style scoped>
  .side-ila{
    background: #271d33;

  }
</style>
