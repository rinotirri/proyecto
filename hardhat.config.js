require('@nomicfoundation/hardhat-toolbox');
//require("@nomiclabs/hardhat-waffle");

// NEVER record important private keys in your code - this is for demo purposes
const SEPOLIA_TESTNET_PRIVATE_KEY = '547ba41127a3dda96fd9f779cbaa932af66b6689755efb8657c55fc8557a9e51';
const ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY = '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    arbitrumSepolia: {
      url: 'https://arb-sepolia.g.alchemy.com/v2/nu7KFKV6wf6ImmPyAIv4Wv0wfC3XNrJu',
      chainId: 421614,
      accounts: [SEPOLIA_TESTNET_PRIVATE_KEY]
    },
    arbitrumOne: {
      url: 'https://arb1.arbitrum.io/rpc',
      //accounts: [ARBITRUM_MAINNET_TEMPORARY_PRIVATE_KEY]
    },
  },
};