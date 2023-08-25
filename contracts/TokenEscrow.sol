// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenEscrow is Ownable {
    IERC20 public token;
    bool public conditionsFulfilled = false;

    struct Recipient {
        address recipientAddress;
        uint16 proportion;
    }
    Recipient[] public recipients;

    address private conditionsFulfiller;

    modifier onlyConditionsFulfiller() {
        require(msg.sender == conditionsFulfiller, "Only conditions fulfiller can call this function");
        _;
    }

    constructor(Recipient[] memory _recipients, address _conditionsFulfiller) {
        uint16 totalProportions;
        for (uint i = 0; i < _recipients.length; i++) {
            recipients.push(_recipients[i]);
            totalProportions += _recipients[i].proportion;
        }

        require(totalProportions == 100, "Total proportions should be 100");
        conditionsFulfiller = _conditionsFulfiller;
    }

    function setTokenAddress(address _tokenAddress) external onlyOwner {
        token = IERC20(_tokenAddress);
    }

    function fulfillConditions() external onlyConditionsFulfiller {
        conditionsFulfilled = true;
    }

    function claim() external {
        require(address(token) != address(0), "Token address is not set");
        require(conditionsFulfilled, "Conditions are not yet fulfilled");

        uint256 totalBalance = token.balanceOf(address(this));

        for (uint i = 0; i < recipients.length; i++) {
            uint256 amount = totalBalance * recipients[i].proportion / 100;
            token.transfer(recipients[i].recipientAddress, amount);
        }
    }
}
