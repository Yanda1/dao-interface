import { ethers } from "ethers";

async function getProvider() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  if (provider) {
    let accounts = await provider.provider.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      accounts = await provider.provider.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        return null;
      }
    }
    return provider;
}
  return null;
}

export default getProvider;
