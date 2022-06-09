<template>
  <b-card :title="values.description" title-tag="h3" class="bg-dark h-100 mb-4" >
    <p>Proposer: {{shortAddress(values.proposer)}}</p>
    <p v-if="values.startBlock >= currentBlock">
      Status: Waiting Before Votation Opens<br>
      Starts {{proposalTime}}<br>
      <!-- <a :href="`https://yanda.io/proposals/${values.proposalId}`" target="_blank">Read in the blog</a> -->
      <b-button v-if="canDelegate" type="button" variant="primary" class="ml-4" @click="makeDelegate">Delegate</b-button>
    </p>
    <div v-else>
      <p v-if="proposalState==1">
        Status: {{proposalStateName}}<br>
        Ends {{proposalTime}}<br>
      </p>
      <p v-else>
        Status: {{proposalStateName}}<br>
        Ended {{proposalTime}}<br>
      </p>
      <p>
        Progress:<br>
        <vue-slider
          ref="slider"
          class="mt-5 mb-5"
          v-model="votes"
          :process="votingProcess"
          :marks="quorum"
          :tooltip-formatter="formatter"
          :tooltip="'always'"
          :dot-options="dotOptions"
          >
          <template v-slot:dot="{ value, focus }">
            <div :class="['custom-dot', { focus }]"></div>
          </template>
        </vue-slider>
      </p>
      <div v-if="proposalState==1 && !alreadyVoted">
        <b-form @submit.prevent="onSubmit">
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio v-model="decision" :aria-describedby="ariaDescribedby" name="vote-radios" value="1" class='btn btn-outline-success mb-2 mr-0' required>For</b-form-radio>
            <b-form-radio v-model="decision" :aria-describedby="ariaDescribedby" name="vote-radios" value="0" class='btn btn-outline-warning mb-2 mr-0' required>Against</b-form-radio>
            <b-form-radio v-model="decision" :aria-describedby="ariaDescribedby" name="vote-radios" value="2" class='btn btn-outline' required>Abstained</b-form-radio>
          </b-form-group>
          <b-button type="submit" variant="primary" block>Submit your vote</b-button>
        </b-form>
      </div>
      <p v-if="proposalState==1 && alreadyVoted">
        Already Voted
      </p>
      <p v-if="proposalState==4 && values.proposer==selectedAddress">
        <b-button type="button" variant="primary" @click="execProposal" block>Execute</b-button>
      </p>
    </div>
    <!-- <a :href="`https://yanda.io/proposals/${values.proposalId}`" target="_blank">Read in the blog</a> -->
    <p v-if="alreadyVoted">
      Already Voted
    </p>
    <p v-else>
      You Didn't Vote
    </p>
  </b-card>
</template>
<script>
  import Swal from 'sweetalert2';
  import moment from 'moment';
  import VueSlider from 'vue-slider-component'
  import 'vue-slider-component/theme/default.css'
  import {getTokenContract, getGovernorContract} from "@/web3/contract";
  import StateMap from "./constants";
  import { ethers, BigNumber } from "ethers";

  const BlockTime = Number(process.env.VUE_APP_BLOCK_TIME);

  export default {
    name: "ProposalCard",
    components: {
      VueSlider
    },
    props: {
      values: {
        type: Array
      },
      web3Provider: {
        type: Object
      },
    },
    data: () => ({
      currentBlock: 0,
      proposalState: 0,
      proposalStateName: '',
      decision: null,
      alreadyVoted: false,
      proposalTime: '',
      quorum: {},
      votes: [2, 96],
      votingProcess: dotsPos => [
        [0, dotsPos[0], { backgroundColor: 'green' }],
        [100, dotsPos[1], { backgroundColor: 'red' }]
      ],
      formatter: [ v => `${Number(v.toFixed(4))}%`, v => `${Number((100 - v).toFixed(4))}%`],
      dotOptions: [{disabled: true}, {disabled: true,}],
      selectedAddress: null,
      balance: null,
      power: null,
    }),
    methods: {
      async getBalancePower() {
        const signer = this.web3Provider.getSigner();
        const selectedAddress = await signer.getAddress();

        this.balance = await this.token.balanceOf(selectedAddress);
        console.debug('YND balance', ethers.utils.formatEther(this.balance, 'ether'));
        this.power = await this.token.getVotes(selectedAddress);
        console.debug('Voting power', ethers.utils.formatEther(this.power, 'ether'));
      },
      async makeDelegate() {
        const signer = this.web3Provider.getSigner();
        const selectedAddress = await signer.getAddress();
        this.token.delegate(selectedAddress);
      },
      execProposal() {
        this.governor.execute(this.values.targets, [0], this.values.calldatas, ethers.utils.id(this.values.description)).then(
          result => {
            Swal.fire({
              title: 'Successfully executed',
              text: "Your proposal was executed.",
              icon: 'success',
            })
          },
          error => {
            console.log('Proposal execution error', error)
            Swal.fire({
              title: 'Something went wrong',
              text: error,
              width: '60em',
              icon: 'error',
            })
          }
        );
      },
      shortAddress(address) {
        return address.slice(0, 5) + '...' + address.slice(38, 42)
      },
      async onSubmit(eventObj) {
        const signer = this.web3Provider.getSigner();
        const selectedAddress = await signer.getAddress();

        const power = await this.token.getVotes(selectedAddress);
        if(power === 0) {
          Swal.fire({
            title: 'Voting power needed',
            text: "You don't have any voting power, in order to vote you need to get YND tokens",
            icon: 'warning',
          })
          return
        }
        console.log('Ready to vote')

        await this.governor.castVote(this.values.proposalId, this.decision);

        Swal.fire({
          title: 'Successfully voted',
          text: "Your vote was sucessfully casted.",
          icon: 'success',
        })
        this.alreadyVoted = true;
      },
      async getRequiredQuorum(proposalId) {
        const rank = await this.governor.proposalRank(proposalId);
        const quorums = await this.governor.quorumNumerator();
        return quorums[rank].toNumber();
      },
      async getVotes(proposalId) {
        const totalSupply = await this.token.getPastTotalSupply(this.values.startBlock);
        const votes = await this.governor.proposalVotes(proposalId);
        this.votes = [ethers.utils.formatEther(votes[1]) * 100 / ethers.utils.formatEther(totalSupply), 100 - (ethers.utils.formatEther(votes[0]) * 100 / ethers.utils.formatEther(totalSupply))];
      },
      updateProposalTime() {
        let t = new Date();
        if (this.values.startBlock > this.currentBlock) {
          t.setSeconds(t.getSeconds() + (this.values.startBlock - this.currentBlock) * BlockTime);
        } else if (this.values.startBlock < this.currentBlock) {
          t.setSeconds(t.getSeconds() + (this.values.endBlock - this.currentBlock) * BlockTime);
        } else {
          // In case when startBlock == currentBlock, voting will start from the next block
          t.setSeconds(t.getSeconds() + BlockTime);
        }
        this.proposalTime = moment(t).fromNow();
      },
    },
    computed: {
      canDelegate() {
        if(this.power === null || this.balance === null) {
          return false;
        } else {
          return this.power < this.balance;
        }
      },
    },
    created() {
      const tokenAddress = process.env.VUE_APP_TOKEN_ADDR;
      const governorAddress = process.env.VUE_APP_GOVERNOR_ADDR;
      const signer = this.web3Provider.getSigner();
      this.token = getTokenContract(this.web3Provider, tokenAddress).connect(signer);
      this.governor = getGovernorContract(this.web3Provider, governorAddress).connect(signer);

      signer.getAddress().then(selectedAddress => {
        if (selectedAddress) {
          this.selectedAddress = selectedAddress;
          this.governor.hasVoted(this.values.proposalId, selectedAddress).then(hasVoted => {
            this.alreadyVoted = hasVoted;
          });
        }
        this.governor.state(this.values.proposalId).then(state => {
            this.proposalState = state;
            this.proposalStateName = StateMap[state];
        })
      });

      this.web3Provider.getBlockNumber().then(block => {
        if (block) {
          this.currentBlock = block;
          this.updateProposalTime();
          this.getRequiredQuorum(this.values.proposalId).then(quorum => {
            this.quorum = JSON.parse(`{"${quorum}": "${quorum}%"}`);
          })
        }
      });

      this.getVotes(this.values.proposalId);
      this.getBalancePower();
    },
  };
</script>
<style scoped>
.custom-dot {
    width: 0px;
    height: 0px;
  }
.card-title {
  color: #e4e6eb;
}
.btn-outline-success {
  color: #40d397;
  background-color: transparent;
  background-image: none;
  border-color: #40d397;
  border-width: 1px;
}
.btn-outline-success:hover {
    color: #e4e6eb;
    background-color: #40d397;
    border-color: #40d397;
}
.btn-outline-warning {
    color: #fa9078;
    background-color: transparent;
    background-image: none;
    border-color: #fa9078;
    border-width: 1px;
}
.btn-outline-warning:hover {
    color: #e4e6eb;
    background-color: #fa9078;
    border-color: #fa9078;
}
.btn-outline {
  border-color: #e4e6eb;
  border-width: 1px;
}
</style>
