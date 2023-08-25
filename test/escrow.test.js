const TokenEscrow = artifacts.require("TokenEscrow");
const DaiMock = artifacts.require("Dai");
const BatMock = artifacts.require("Bat");

contract("SpendTokenEscrow", (accounts) => {
  // Solidity maps ENUMs to the numeric indexes
  const [owner, conditionsFulfiller, recipient1, recipient2, outsider] =
    accounts;

  let token;
  let escrow;
  const recipients = [
    { recipientAddress: recipient1, proportion: 70 },
    { recipientAddress: recipient2, proportion: 30 },
  ];

  beforeEach(async () => {
    token = await DaiMock.new();
    escrow = await TokenEscrow.new(recipients, conditionsFulfiller);
  });

  it("should distribute tokens correctly after conditions are fulfilled", async () => {
    await token.mint(owner, 1000);
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.setTokenAddress(token.address, { from: owner });
    await escrow.fulfillConditions({ from: conditionsFulfiller });
    await escrow.claim();

    const balanceRecipient1 = await token.balanceOf(recipient1);
    const balanceRecipient2 = await token.balanceOf(recipient2);

    assert.equal(balanceRecipient1.toString(), "700");
    assert.equal(balanceRecipient2.toString(), "300");
  });

  it("should work if distribution happens before address is set", async () => {
    await token.mint(owner, 2000);
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.fulfillConditions({ from: conditionsFulfiller });
    await escrow.setTokenAddress(token.address, { from: owner });
    await escrow.claim();

    const balanceRecipient1 = await token.balanceOf(recipient1);
    const balanceRecipient2 = await token.balanceOf(recipient2);

    assert.equal(balanceRecipient1.toString(), "700");
    assert.equal(balanceRecipient2.toString(), "300");
  });

  it("should work for multiple claims", async () => {
    const sum = 3000;
    await token.mint(owner, sum);
    await token.transfer(escrow.address, 1000, { from: owner });
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.fulfillConditions({ from: conditionsFulfiller });
    await escrow.setTokenAddress(token.address, { from: owner });
    await escrow.claim();
    await escrow.claim();
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.claim();

    const balanceRecipient1 = await token.balanceOf(recipient1);
    const balanceRecipient2 = await token.balanceOf(recipient2);

    assert.equal(
      balanceRecipient1.toString(),
      recipients[0].proportion * sum * 0.01
    );
    assert.equal(
      balanceRecipient2.toString(),
      recipients[1].proportion * sum * 0.01
    );
  });

  it("works if token is changed several times", async () => {
    const sum = 3000;
    await token.mint(owner, sum);
    const token2 = await BatMock.new();
    await token2.mint(owner, 1000);

    // If we have set wrong token address and then changed it to the correct one
    // it must work

    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.fulfillConditions({ from: conditionsFulfiller });
    await escrow.setTokenAddress(token.address, { from: owner });
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.setTokenAddress(token2.address, { from: owner });
    await escrow.claim();
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.setTokenAddress(token.address, { from: owner });
    await escrow.claim();

    const balanceRecipient1 = await token.balanceOf(recipient1);
    const balanceRecipient2 = await token.balanceOf(recipient2);

    assert.equal(
      balanceRecipient1.toString(),
      recipients[0].proportion * sum * 0.01
    );
    assert.equal(
      balanceRecipient2.toString(),
      recipients[1].proportion * sum * 0.01
    );
  });

  it("should not distribute tokens if conditions are not fulfilled", async () => {
    await token.mint(owner, 1000);
    await token.transfer(escrow.address, 1000, { from: owner });
    await escrow.setTokenAddress(token.address, { from: owner });

    try {
      await escrow.claim();
      assert.fail("Expected claim to fail");
    } catch (error) {
      assert(
        error.toString().includes("Conditions are not yet fulfilled"),
        error.toString()
      );
    }
  });

  it("should not allow outsiders to fulfill conditions", async () => {
    try {
      debugger;
      await escrow.fulfillConditions({ from: outsider });
      assert.fail("Expected fulfillConditions to fail");
    } catch (error) {
      assert(
        error
          .toString()
          .includes("Only conditions fulfiller can call this function"),
        error.toString()
      );
    }
  });

  it("should not allow outsiders to set token address", async () => {
    try {
      await escrow.setTokenAddress(token.address, { from: outsider });
      assert.fail("Expected setTokenAddress to fail");
    } catch (error) {
      assert(
        error.toString().includes("caller is not the owner"),
        error.toString()
      );
    }
  });

  it("should not allow claim before token is set", async () => {
    try {
      await escrow.claim();
      assert.fail("Expected claim to fail");
    } catch (error) {
      assert(
        error.toString().includes("Token address is not set"),
        error.toString()
      );
    }
  });
});
