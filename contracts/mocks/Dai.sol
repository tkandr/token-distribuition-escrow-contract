// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dai is ERC20 {
  constructor() ERC20('DAI', 'Dai Stablecoin') {}

  function mint(address to, uint amount) external {
    _mint(to, amount);
  }
}
