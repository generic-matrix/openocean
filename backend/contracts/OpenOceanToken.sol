// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;
import "./Bid.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./@rarible/royalties/contracts/impl/RoyaltiesV2Impl.sol";


contract OpenOceanToken is ERC721Pausable,RoyaltiesV2Impl{
    mapping(uint256=>Bid[]) private _DS;

    address owner;
    constructor() ERC721("OpenOcean", "OPCN") {
         owner = msg.sender;
    }

    //mint
    function mintx(uint256 tokenId,address benefeciary) public
    {
        _mint(benefeciary,tokenId);
    }

    function GetTokenAddress() public view returns(address){
        return address(this);
    }

    // Only token owner can do save the royalities
    function saveRoyalties(uint256 id,address payable _royaltiesReceipientAddress, uint96 _percentageBasisPoints) public {
        require(msg.sender==ownerOf(id),"You are not the owner of the token");
        LibPart.Part[] memory _royalties = new LibPart.Part[](1);
        _royalties[0].value = _percentageBasisPoints;
        _royalties[0].account = _royaltiesReceipientAddress;
        _saveRoyalties(id, _royalties);
    }

    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) public view returns (address receiver, uint256 royaltyAmount) {
        LibPart.Part[] memory _royalties = royalties[_tokenId];
        if(_royalties.length > 0) {
            return (_royalties[0].account, (_salePrice * _royalties[0].value)/10000);
        }
        return (address(0), 0);
    }

    function AddBid(uint256 _tokenId,address _bidder_address,uint256 _bid_amount,uint256 _royalitiy_amount) payable public{
        // Add to the mapping DS and return true
        require(msg.value==_bid_amount+_royalitiy_amount,"The complete amount is not sent , contact support");
        require(msg.sender==_bidder_address,"The bidder address and sender looks diffrent , contact support");
        Bid bid = new Bid(_DS[_tokenId].length,_bidder_address,_bid_amount,_royalitiy_amount);
        _DS[_tokenId].push(bid);
    }

    function GetBids(uint256 _tokenId) public view returns(uint256[] memory,address[] memory,uint256[] memory,uint256[] memory){
        uint256 length = _DS[_tokenId].length;
        uint256[] memory BidId = new uint256[](length);
        address[] memory bidder_address = new address[](length);
        uint256[] memory bid_amount = new uint256[](length);
        uint256[] memory royalitiy_amount = new uint256[](length);
        for(uint i=0;i<length;i++){
            Bid _bid = _DS[_tokenId][i];
            BidId[i] =  _bid.GetId();
            bidder_address[i] = _bid.GetbidderAddress();
            bid_amount[i] = _bid.GetBidAmount();
            royalitiy_amount[i] = _bid.GetRoyalityAmount();
        }
        return(BidId,bidder_address,bid_amount,royalitiy_amount);
    }

    // Only the token owner can invoke
    function SelectBid(uint256 _tokenId,uint256 _bid_id)  public {
        require(msg.sender==ownerOf(_tokenId),"You are not the owner of the token");
        require(_DS[_tokenId].length>_bid_id,"The bid id is invalid");
        uint256 length = _DS[_tokenId].length;
        for(uint i=0;i<length;i++){
            Bid bid = _DS[_tokenId][i];
            if(bid.GetId()==_bid_id){
                // This is the selected bid
                // Transfer amount(bid amount) to the token's owner
                payable(msg.sender).transfer(bid.bid_amount());
                //send royality amount to the real owner of the token
                (address receiver,) = royaltyInfo(_tokenId,bid.GetBidAmount());
                if(receiver!=address(0)){
                    payable(receiver).transfer(bid.GetRoyalityAmount());
                }
                // Transfer the ownersip from current owner to bidder's address
                approve(bid.GetbidderAddress(),_tokenId);
                safeTransferFrom(msg.sender,bid.GetbidderAddress(),_tokenId);
            }else{
                // Non selected bid
                // Return the amount (bid+royality) to the bidder's address
                payable(bid.GetbidderAddress()).transfer(bid.GetBidAmount()+bid.GetRoyalityAmount());
            }
        }
        delete _DS[_tokenId];
    }
}


