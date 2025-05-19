require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("👤 Deployer:", deployer.address);

  const CanarySignal = await hre.ethers.getContractFactory("CanarySignal");
  const canary = await CanarySignal.deploy(
    hre.ethers.parseEther("0.1"),
    hre.ethers.parseUnits("10", 18),
    process.env.OWNER
  );
  await canary.waitForDeployment();
  console.log("✅ CanarySignal deployed to:", canary.target);

  const EscapeWallet = await hre.ethers.getContractFactory("EscapeWallet");
  const wallet = await EscapeWallet.deploy(
    process.env.OWNER,
    process.env.ESCAPE_TO,
    canary.target
  );
  await wallet.waitForDeployment();
  console.log("✅ EscapeWallet deployed to:", wallet.target);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exitCode = 1;
});