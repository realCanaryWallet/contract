import { ethers } from "hardhat";
import { expect } from "chai";
import { CanarySignal, EscapeWallet } from "typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Canary Wallet", function () {
  let owner: any, escapeTo: any, canaryEOA: any;
  let canarySignal: CanarySignal;
  let escapeWallet: EscapeWallet;

  beforeEach(async function () {
    [owner, escapeTo, canaryEOA] = await ethers.getSigners();

    // Deploy CanarySignal contract
    const CanarySignalFactory = await ethers.getContractFactory("CanarySignal");
    canarySignal = await CanarySignalFactory.connect(canaryEOA).deploy(
      ethers.parseEther("0.1"),
      ethers.parseUnits("10", 18),
      canaryEOA.address
    );
    await canarySignal.waitForDeployment();

    // Deploy EscapeWallet contract
    const EscapeWalletFactory = await ethers.getContractFactory("EscapeWallet");
    escapeWallet = await EscapeWalletFactory.deploy(
      owner.address,
      escapeTo.address,
      await canarySignal.getAddress()
    );
    await escapeWallet.waitForDeployment();
  });

  it("✅ should store correct canary address", async function () {
    expect(await escapeWallet.canary()).to.equal(await canarySignal.getAddress());
  });

  it("✅ should return correct thresholds", async function () {
    const ethThreshold = await canarySignal.ethThreshold();
    const erc20Threshold = await canarySignal.erc20Threshold();
    expect(ethThreshold).to.equal(ethers.parseEther("0.1"));
    expect(erc20Threshold).to.equal(ethers.parseUnits("10", 18));
  });

  it("✅ should allow ping from canary", async () => {
    await canarySignal.connect(canaryEOA).ping();
    const lastPing = await canarySignal.lastPing();
    expect(lastPing).to.be.gt(0);
  });

  it("✅ should detect expired canary and allow escape", async () => {
    await canarySignal.connect(canaryEOA).ping();

    // Send ETH to EscapeWallet
    await owner.sendTransaction({
      to: await escapeWallet.getAddress(),
      value: ethers.parseEther("1"),
    });

    // Simulate 7 days without ping
    await time.increase(7 * 24 * 60 * 60);

    const before = await ethers.provider.getBalance(escapeTo.address);
    await escapeWallet.connect(owner).escape();
    const after = await ethers.provider.getBalance(escapeTo.address);

    expect(after - before).to.be.gt(0);
  });

  it("❌ should revert if canary is not expired", async () => {
    await canarySignal.connect(canaryEOA).ping();

    await expect(
      escapeWallet.connect(owner).escape()
    ).to.be.revertedWith("Canary not expired");
  });

  it("❌ should only allow owner to escape", async () => {
    await time.increase(8 * 24 * 60 * 60);

    await expect(
      escapeWallet.connect(escapeTo).escape()
    ).to.be.revertedWith("Not authorized");
  });
  
  it("❌ should not allow non-owner to update canary", async () => {
    await expect(
      escapeWallet.connect(escapeTo).updateCanary(escapeTo.address)
    ).to.be.revertedWith("Not authorized");
  });

  it("✅ should allow owner to update canary", async () => {
    const oldCanary = await escapeWallet.canary();
    await escapeWallet.connect(owner).updateCanary(escapeTo.address);
    const newCanary = await escapeWallet.canary();
    expect(newCanary).to.equal(escapeTo.address);
    expect(newCanary).to.not.equal(oldCanary);
  });

  it("❌ should not allow escape twice", async () => {
    await canarySignal.connect(canaryEOA).ping();
    await time.increase(8 * 24 * 60 * 60);
    await escapeWallet.connect(owner).escape();

    await expect(
      escapeWallet.connect(owner).escape()
    ).to.be.revertedWith("Already escaped");
  });
});
