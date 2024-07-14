const { expect } = require("chai");
const { ethers } = require("hardhat");
const ether = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
describe("RealEstate", () => {
  let realEstate, escrow;
  let buyer, seller;
  let nftID = 1;
  let purchasePrice = ether(100);
  let escrowAmount = ether(20);

  beforeEach(async () => {
    const account = await ethers.getSigners();
    seller = account[0];
    buyer = account[1];
    inspector = account[2];
    lender = account[3];

    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    realEstate = await RealEstate.deploy();
    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice,
      escrowAmount,
      buyer.address,
      seller.address,
      inspector.address,
      lender.address
    );

    transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, nftID);

    await transaction.wait();
  });

  describe("Deployment", async () => {
    it("the seller actually owns the real estate", async () => {
      //   console.log(seller.address);
      //   console.log(await realEstate.ownerOf(nftID));
      expect(await realEstate.ownerOf(nftID)).equal(seller.address);
    });
  });

  describe("transfer ownership", async () => {
    let transaction, balance;
    it("execute a successful transaction", async () => {
      //   console.log(seller.address);
      //   console.log(await realEstate.ownerOf(nftID));
      expect(await realEstate.ownerOf(nftID)).equal(seller.address);

      // checking the escrow balance before the buyer deposits earnest money
      balance = await escrow.connect(buyer).getBalance();

      console.log("escrow balance:", ethers.utils.formatEther(balance));

      // buyer deposit earnest money
      transaction = await escrow
        .connect(buyer)
        .depositEarnest({ value: ether(20) });

      console.log("buyer deposit earnest money");

      // checking the updated escrow balance
      balance = await escrow.connect(buyer).getBalance();
      console.log("escrow balance:", ethers.utils.formatEther(balance));

      // inspector approve the status of the realEstate
      transaction = await escrow.connect(inspector).updateInspection(true);
      await transaction.wait();
      console.log("inspector updates inspection status");

      // approval of buyer and seller
      transaction = await escrow.connect(buyer).approveSale();
      await transaction.wait();
      console.log("buyer approve sale");

      transaction = await escrow.connect(seller).approveSale();
      await transaction.wait();
      console.log("seller approve sale");

      // lender transfer 80%
      transaction = await lender.sendTransaction({
        to: escrow.address,
        value: ether(80),
      });

      // checking the purchase price
      balance = await ethers.provider.getBalance(escrow.address);
      console.log("purchase price balance:", ethers.utils.formatEther(balance));
      transaction = await escrow.connect(lender).approveSale();
      await transaction.wait();
      console.log("lender approve sale");

      // finalize the sale and transferring ownership
      transaction = await escrow.connect(buyer).finalizeSale();
      await transaction.wait();
      console.log("buyer finalizes a sale");

      // checking the money is transferred to the seller account
      balance = await ethers.provider.getBalance(seller.address);
      console.log("seller got the money:", ethers.utils.formatEther(balance));

      //checking the transfer of ownership
      expect(await realEstate.ownerOf(nftID)).equal(buyer.address);
    });
  });
});
