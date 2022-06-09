<template>
  <div>
    <Dropdown menu-on-right 
                    v-if="walletAddress"
                    class="nav-item"
                    tag="li" 
                    title-tag="a"
                    title-classes="nav-link pr-0">
        <div slot="title-container" class="mt-1 nav-link">
          <b-button class="d-none d-lg-block" size="sm" variant="outline-primary">
            <span class="mb-0 text-sm font-weight-bold" variant="outline-primary">{{ shortAddress() }}</span>
          </b-button>
          <a @click.prevent class="d-md-none pr-0" href="#">
            <div class="media align-items-center">
              <p class="h2 mb-0 mt--1 mr-2 text-white">
                <b-icon icon="wallet"/>
              </p>
            </div>
          </a>
        </div>

        <!-- <div class="dropdown-divider"></div> -->
        <a class="dropdown-item text-dark" @click="Disconnect">
            <i class="ni ni-user-run"></i>
            <span>Disconnect</span>
        </a>
    </Dropdown>

    <b-overlay v-else :show="loading" rounded="sm" spinner-small class="d-inline-block">
      <b-button v-if="!needMobileApp" class="mt-1" size="sm" variant="outline-primary" @click="connectWeb3()">Connect wallet</b-button>
      <b-button v-else class="mt-1" size="sm" variant="outline-primary" href="https://metamask.app.link/dapp/defi.app.yanda.io" >Connect wallet</b-button>
    </b-overlay>

  </div>
</template>
<script>
import Swal from 'sweetalert2';
import getProvider from "@/web3";
import {isMobile} from '@/util/functions';
import Dropdown from '@/components/NavBar/Dropdown';

export default {
  name: 'WalletMenu',
  components: {
    Dropdown,
  },
  data() {
    return {
      loading: false,
      needMobileApp: false,
    };
  },
  computed: {
    walletAddress() {
      if(this.$store.state.wallet) {
        return this.$store.state.wallet.address || ''
      }
    },
  },
  methods: {
    switchNetwork(chainId, chainName, rpcUrl, explorerUrl) {
      return new Promise((resolve, reject) => {
        ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainId }],
        }).then(res => {
          resolve(true)
        }).catch(error => {
          if(error.code === 4902) {
            ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainId,
                  chainName: chainName,
                  rpcUrls: [rpcUrl],
                  nativeCurrency: {
                    name: "CELO",
                    symbol: "CELO",
                    decimals: 18,
                  },
                  blockExplorerUrls: [explorerUrl],
                },
              ],
            }).then(res => {
              resolve(true);
            }).catch(error => {
              reject(error);
            })
          } else {
            reject(error)
          }
        });
      });
    },
    async connectWeb3() {
      let _this = this;
      this.loading = true;
      console.log('connectWeb3')
      let provider = null;
      try {
        provider = await getProvider();
      } catch (error) {
        console.log('error', error)
      }

      if(provider) {
        const signer = provider.getSigner();
        const chainInfo = await provider.getNetwork();

        if(chainInfo.chainId != process.env.VUE_APP_CHAIN_ID) {
          _this.switchNetwork(
            '0x' + Number(process.env.VUE_APP_CHAIN_ID).toString(16),
            process.env.VUE_APP_CHAIN_NAME,
            process.env.VUE_APP_CHAIN_RPC,
            process.env.VUE_APP_CHAIN_EXP
          ).then(
            res => {
              signer.getAddress().then(address => {
                _this.$store.dispatch('wallet/connect', address);
              })
            },
            error => {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: "Your wallet extension wasn't able to switch the network.",
              });
            }
          )
        } else {
          signer.getAddress().then(address => {
            _this.$store.dispatch('wallet/connect', address);
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Web3 wallet extension wasn't found in your browser.",
        });
      }
      this.loading = false;
    },
    Disconnect() {
        this.$store.dispatch('wallet/disconnect');
    },
    shortAddress() {
      return this.walletAddress.slice(0, 5) + '...' + this.walletAddress.slice(38, 42)
    },
  },
  created() {
    if(isMobile()) {
      // Redirect mobile in the metamask app
      this.needMobileApp = true;
    }
  },
}
</script>
<style scoped>
.style-chooser { 
  display: inline-block;
  min-width: 200px;
}

#credentials-form {
    width: 90%
}
</style>
