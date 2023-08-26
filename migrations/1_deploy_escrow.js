const TokenEscrow = artifacts.require("TokenEscrow");

const recipients = [
  {
    recipientAddress: "0x809335243E5895c37aBe5FC8D0Bbea9c0fb4e474",
    proportion: 70,
  },
  {
    recipientAddress: "0x52aebD0571519f7a265478095b92787Cd52f793F",
    proportion: 30,
  },
];

const conditionsFulfiller = "0x8F46a61ce98aF985d94aabd2503aCBC6D917286b";

module.exports = function (deployer) {
  deployer.deploy(TokenEscrow, recipients, conditionsFulfiller);
};
