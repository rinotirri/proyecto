// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ManualCounter {
    
    struct Counter {
        uint256 value;
    }

    function current(Counter storage counter) internal view returns (uint256) {
        return counter.value;
    }

    function increment(Counter storage counter) internal returns (uint256) {
        counter.value += 1;
        return counter.value;
    }
}