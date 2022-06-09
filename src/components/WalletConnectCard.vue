<template>
  <b-row align-v="center" style="min-height: 80vh">
    <b-col class="text-center">
      <h1 class="text-white">Yanda DAO Governance Page</h1>
      <p class="text-white">Connect your wallet to access this page</p>
      <b-overlay :show="loading" rounded="sm" spinner-small class="d-inline-block">
        <b-button v-if="!needMobileApp" class="mt-1" size="lg" variant="outline-primary" @click="connectWeb3()">Connect wallet</b-button>
        <b-button v-else class="mt-1" size="lg" variant="outline-primary" href="https://metamask.app.link/dapp/defi.app.yanda.io" >Connect wallet</b-button>
      </b-overlay>
    </b-col>
  </b-row>
</template>
<script>
import Swal from 'sweetalert2';
import getProvider from "@/web3";
import {isMobile} from '@/util/functions';

export default {
  name: 'WalletMenu',
  data() {
    return {
      loading: false,
      needMobileApp: false,
    };
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
  },
  created() {
    if(isMobile()) {
      // Redirect mobile in the metamask app
      this.needMobileApp = true;
    }
  },
}
</script>
