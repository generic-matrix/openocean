// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
contract Bid{
    uint256 public BidId;
    address public bidder_addres;
    uint256 public bid_amount;
    uint256 public royalitiy_amount;
    constructor(uint256 _id,address _bidder_addres,uint256 _bid_amount,uint256 _royalitiy_amount){
        BidId = _id;
        bidder_addres = _bidder_addres;
        bid_amount = _bid_amount;
        royalitiy_amount = _royalitiy_amount;
    }

    function GetId() public view returns(uint256){
        return BidId;
    }

    function GetbidderAddress() public view returns(address){
        return bidder_addres;
    }

    function GetBidAmount() public view returns(uint256){
        return bid_amount;
    }

    function GetRoyalityAmount() public view returns(uint256){
        return royalitiy_amount;
    }
}
