<template>
  <b-card title="Create Proposal" title-tag="h3" class="bg-dark" >
    <b-card-title>
      <a href="https://docs.yanda.io/governance/overview" target="_blank">How to create a governance proposal? Read it in Yanda Docs.</a>
    </b-card-title>
    <b-form @submit.prevent="onSubmit" @reset.prevent="onReset" class="mt-4">
      <b-form-group
        id="input-group-1"
        label="Title:"
        label-for="input-1"
        description="Proposal short description"
      >
        <b-form-input
          id="input-1"
          v-model="proposal.description"
          type="text"
          placeholder="Enter title"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-2"
        label="Method name:"
        label-for="input-2"
        description="Method name you want to call"
      >
        <b-form-input
          id="input-2"
          v-model="proposal.method"
          type="text"
          placeholder="Enter method name"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="input-group-3"
        label="Arguments:"
        label-for="input-3"
        description="Comma-separated method arguments"
      >
        <b-form-textarea
          id="input-3"
          v-model="proposal.argsStr"
          placeholder="arg1, arg2, ..."
          rows="3"
          max-rows="6"
          required
        ></b-form-textarea>
      </b-form-group>

      <b-button type="submit" variant="primary" block>Create proposal</b-button>
    </b-form>

  </b-card>
</template>
<script>
  import Swal from 'sweetalert2';
  import { ethers } from "ethers";
  import { getTokenContract, getGovernorContract } from "@/web3/contract";

  export default {
    name: "CreateProposalCard",
    props: {
      web3Provider: {
        type: Object
      },
    },
    data: () => ({
      proposal: {

      }
    }),
    methods: {
      onReset(eventObj) {
        this.proposal = {}
      },
      delegateVote(to) {
        return this.token.delegate(to);
      },
      async onSubmit(eventObj) {
        const signer = this.web3Provider.getSigner();
        const selectedAddress = await signer.getAddress();

        const balance = await this.token.balanceOf(selectedAddress);
        console.log('YND balance', ethers.utils.formatEther(balance, 'ether'));
        const power = await this.token.getVotes(selectedAddress);
        console.log('Voting power', ethers.utils.formatEther(power, 'ether'))
        if(power < balance) {
          await this.delegateVote(selectedAddress)
        }
        console.log('Ready to propose')

        let transferCalldata = null;
        try {
          let formatedArgsStr = ('[' + this.proposal.argsStr + ']').replace(/(?:[^"']\b(\d{16,})\b)/g, "\"$1\"");
          console.log('args str', formatedArgsStr);
          const args = JSON.parse(formatedArgsStr);
          // Encode function call with args
          transferCalldata = this.token.interface.encodeFunctionData(this.proposal.method, args);
        } catch(error) {
          Swal.fire({
            title: 'Something went wrong',
            text: error,
            width: '60em',
            icon: 'error',
          })
          console.log('Proposal error', error)
          return;
        }
        // Compose description
        const proposals = await this.governor.queryFilter('ProposalCreated', 0)
        const description = `Proposal #${proposals.length + 1}: ${this.proposal.description}`;
        // Make proposal
        try {
          const result = await this.governor.propose(
            [process.env.VUE_APP_TOKEN_ADDR],
            [0],
            [transferCalldata],
            description
          );
          // Success message
          Swal.fire({
            title: 'Proposal created',
            text: "Your proposal was sucessfully created.",
            icon: 'success',
          })
          this.$emit('on-notification');
        } catch (err) {
          console.log('Proposal error', err)
          const start = err.message.indexOf('{');
          const end = err.message.length - err.message.split("").reverse().join("").indexOf('}');
          const parsedMsg = JSON.parse(err.message.substring(start, end));
          // Error message
          Swal.fire({
            title: 'Something went wrong',
            text: parsedMsg.value.data.message,
            icon: 'error',
          })
        }
        // Cleanup the form
        this.onReset();
      }
    },
    created() {
      const tokenAddress = process.env.VUE_APP_TOKEN_ADDR;
      const governorAddress = process.env.VUE_APP_GOVERNOR_ADDR;
      const signer = this.web3Provider.getSigner();
      this.token = getTokenContract(this.web3Provider, tokenAddress).connect(signer);
      this.governor = getGovernorContract(this.web3Provider, governorAddress).connect(signer);
    },
  };
</script>
<style scoped>
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
