<template>
  <b-container fluid class="pb-6 pt-2 pt-md-4 bg-transparent" style="min-height: 100%" >
    <b-row v-if="isConnected">
      <b-col xl="8">
        <b-row>
          <b-col xl="4" v-for="proposal in proposals" :key="proposal.id"  class="mb-4" >
            <ProposalCard :values="proposal.args" :web3Provider="provider"/>
          </b-col>
        </b-row>
      </b-col>
      <b-col xl="4" v-if="canCreate">
        <CreateProposalCard :web3Provider="provider" />
      </b-col>
    </b-row>
    <WalletConnectCard v-else />
  </b-container>
</template>
<script>
  import { getTokenContract, getGovernorContract } from "@/web3/contract";
  import getProvider from "@/web3";

  import ProposalCard from "@/components/Governance/ProposalCard";
  import CreateProposalCard from "@/components/Governance/CreateProposalCard";
  import WalletConnectCard from "@/components/WalletConnectCard";

  export default {
    components: {
      ProposalCard,
      CreateProposalCard,
      WalletConnectCard,
    },
    data() {
      return {
        proposals: [],
        canCreate: false,
        provider: null,
      };
    },
    computed: {
      isConnected() {
        return this.$store.state.wallet.address || false;
      }
    },
    methods: {
      init() {
        if(!this.isConnected) {
          return
        }
        getProvider().then(provider => {
          if(provider) {
            this.provider = provider;
            const tokenAddress = process.env.VUE_APP_TOKEN_ADDR;
            const governorAddress = process.env.VUE_APP_GOVERNOR_ADDR;
            const token = getTokenContract(provider, tokenAddress);
            const governor = getGovernorContract(provider, governorAddress);

            governor.queryFilter('ProposalCreated', 0).then(proposals => {
              this.proposals = proposals;
            })

            const signer = provider.getSigner();
            signer.getAddress().then(selectedAddress => {
              if (selectedAddress) {
                token.balanceOf(selectedAddress).then(balance => {
                  if (balance >= 5000000000000000000000000) {
                    this.canCreate = true
                  }
                });
                token.getVotes(selectedAddress).then(power => {
                  if (power >= 5000000000000000000000000) {
                    this.canCreate = true
                  }
                });
              }
            });
          }
        });
      }
    },
    created() {
      this.init();
    },
    watch: {
      'isConnected': function() {
        this.init();
      },
    }
  };
</script>
<style scoped>
.button-size {
  width: 200px;
}
.content-class {
  background-color: #000;
}

.show-mobile {
  display: none;
}

.mobile {
  display: none;
}


@media only screen and (min-width: 768px) {
  .show-mobile {
    display: block;
  }
}

@media only screen and (max-width: 768px) {
  .mobile {
    display: block;
  }
}
.btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active, .btn-group-vertical > .btn:focus, .btn-group-vertical > .btn:active, .btn-group-vertical > .btn.active {
  z-index: 0 !important;
}

.borderless-top {
  border-top: none;
  border-top-left-radius: 0%;
  border-top-right-radius: 0%;
}
</style>
