# Canary Wallet Contracts 

[![Deployment](https://github.com/realCanaryWallet/contract/actions/workflows/deploy-sepolia.yml/badge.svg)](https://github.com/realCanaryWallet/contract/actions/workflows/deploy-sepolia.yml)
[![Unit Test](https://github.com/realCanaryWallet/contract/actions/workflows/unit-test.yaml/badge.svg)](https://github.com/realCanaryWallet/contract/actions/workflows/unit-test.yaml)

This repository contains the smart contracts powering the **Canary Wallet**, a security-first Ethereum wallet designed to protect users and organizations from unnoticed private key compromise or long-term inactivity.

---

## ✨ Features

* **Canary Signaling**: Monitor wallet liveness via `ping()` calls.
* **Escape Wallet**: Self-custodial wallet that can escape assets if the canary goes silent.
* **ERC20 Support**: Withdraw both ETH and ERC20 tokens.
* **Permissioned Control**: Strict access control to escape functions.
* **Modular**: Designed to work independently or as a module in a larger architecture.

---

## 📁 Project Structure

```
canary-wallet-contracts/
├── contracts/
│   ├── CanarySignal.sol       # Canary signal tracking contract
│   └── EscapeWallet.sol       # Main escape wallet logic
├── scripts/
│   └── deploy.ts              # Hardhat deployment script
├── test/
│   └── escape.test.ts         # Full test suite
├── .github/workflows/
│   └── ci.yml                 # GitHub Actions CI
├── hardhat.config.ts          # Hardhat setup
├── package.json
├── README.md
└── tsconfig.json
```

---

## 📦 Dependencies

This repo uses:

* [Hardhat](https://hardhat.org/)
* [Ethers.js](https://docs.ethers.org/)
* [TypeChain](https://github.com/dethcrypto/TypeChain)
* [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
* [dotenv](https://www.npmjs.com/package/dotenv)

To install dependencies:

```bash
npm install
```

To compile contracts

```bash
npx hardhat compile
```

## 🧪 Run Tests

Run the full test suite using:

```bash
npx hardhat test
```

Includes:

* Canary ping and expiration
* Manual escape trigger
* ERC20 withdrawals
* Ownership and authorization logic
* Time simulation via Hardhat helpers

---

### Deploy to Sepolia (or other networks)

Before deploying your EscapeWallet contract, you need to configure the .env file with your own:

```bash
OWNER=0xYourOwnerAddress        # Address that can trigger the escape
ESCAPE_TO=0xYourEscapeToAddress # Destination address for escaping funds
CANARY=0xYourCanaryAddress      # Deployed CanarySignal contract address
```

* `OWNER`

The wallet address that has permission to call the `escape()` function on the `EscapeWallet` contract.

> 💡It is strongly recommended to use a cold wallet, hardware wallet, or a multi-signature wallet to enhance security.

* `ESCAPE_TO`

The destination wallet address where all funds (ETH and ERC20 tokens) will be transferred if the canary is deemed inactive (i.e., considered “dead”).

> Use secure and reliable addresses — for example, a cold wallet for OWNER, and a trusted recovery wallet for ESCAPE_TO.

* `CANARY`

The address of the `CanarySignal` contract. This contract must be actively pinged within a certain time window. If it is not pinged in time, the escape mechanism becomes valid.

---

Start deploying your wallet to sepolia by running:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 💠 Contribution Guide

1. Fork this repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Run tests and `npx hardhat compile`
5. Open a pull request


---

## 📬 Contact

For questions or integrations, reach out via GitHub Issues or contact the core team.
