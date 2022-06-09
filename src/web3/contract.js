import TokenData from "./YandaToken.json";
import GovernorData from "./YandaGovernor.json";
import { ethers } from "ethers";

const tokenSymbol = 'YND';
const tokenDecimals = 18;
const tokenImage = 'https://defi.app.yanda.io/img/brand/icon-yanda.png';

const addToken = (provider, contractAddress) => {
    return provider.provider.request({
        method: 'wallet_watchAsset',
        params: {
            type: 'ERC20', // Initially only supports ERC20, but eventually more!
            options: {
                address: contractAddress, // The address that the token is at.
                symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                decimals: tokenDecimals, // The number of decimals in the token
                image: tokenImage, // A string url of the token logo
            },
        },
    });
}

const getTokenContract = (provider, tokenAddress) => {
    return new ethers.Contract(tokenAddress, TokenData.abi, provider);
}

const getGovernorContract = (provider, governorAddress) => {
    return new ethers.Contract(governorAddress, GovernorData.abi, provider);
}

export {getTokenContract, addToken, getGovernorContract};
