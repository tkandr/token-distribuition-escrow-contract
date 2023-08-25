// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bat is ERC20 {
  constructor() ERC20('BAT', 'Basic attention token') {}

  function mint(address to, uint amount) external {
    _mint(to, amount);
  }
}
