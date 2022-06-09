<template>
  <b-navbar toggleable="lg" type="dark" variant="dark" sticky>
    <b-navbar-brand class="d-none d-lg-block" href="https://yanda.io" target="_blank"><img :src="'/img/brand/icon-yanda.png'" alt="Y" width="30px" style="margin-top: 2px"></b-navbar-brand>
    <WalletMenu class="d-lg-none" />
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <SidebarItem
          :link="{
            name: 'Governance',
            path: '/governance',
            icon: '',
          }"
        />
      </b-navbar-nav>

      <!-- Right aligned nav items -->
  
      <b-navbar-nav class="align-items-center ml-md-auto d-none d-lg-block ">
          <b-form class="navbar-search form-inline mr-sm-3"
              :class="{'navbar-search-dark': type === 'default', 'navbar-search-light': type === 'light'}"
              id="navbar-search-main">
          </b-form>
        <WalletMenu />
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
import { CollapseTransition } from 'vue2-transitions';
import WalletMenu from '@/components/NavBar/WalletMenu.vue';
import SidebarItem from '@/components/SidebarPlugin/SidebarItem'

export default {
  components: {
    CollapseTransition,
    WalletMenu,
    SidebarItem
  },
  props: {
    type: {
      type: String,
      default: 'default', // default|light
      description: 'Look of the dashboard navbar. Default (Green) or light (gray)'
    }
  },
  data() {
    return {};
  },
};
</script>

