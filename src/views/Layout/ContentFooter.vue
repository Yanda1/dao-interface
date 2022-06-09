<template>
 <div class="footer-yanda" style="z-index: 7;">
  <b-card class="bg-transparent border-0">
    <a href="https://github.com/Yanda1/celo" class="mr-4"><h2 class="fab fa-github text-primary"></h2></a>
    <a href="https://discord.gg/KbWSPnFfgs" class="mr-4"><h2 class="fab fa-discord text-primary"></h2></a>
    <a href="https://t.me/yanda_io" class="mr-4"><h2 class="fab fa-telegram text-primary"></h2></a>
    <a href="https://twitter.com/YandaTrading"><h2 class="fab fa-twitter text-primary"></h2></a>
  </b-card>
</div>
</template>
<script>
export default {
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style>
/* .footer-yanda {
  background-color: #271d33;
  position:relative;
  color: #ffffff;
} */

.footer-yanda {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  flex-direction: column;
  height: 60px;
  background-color: #271d33!important;
}

</style>
