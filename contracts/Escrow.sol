// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}


contract Escrow {

    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public buyer;
    address payable public seller;
    address public lender;
    address public inspector;
    bool public inspectionStatus = false;
    constructor(
        address _nftAddress,
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _buyer,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftID = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        buyer = _buyer;
        seller =_seller;
        inspector = _inspector;
        lender = _lender;

    }

    modifier BuyerOnly {
        require(msg.sender == buyer, "only buyer must deposit an earnset money");
        _;
    }
     modifier inspectorOnly {
        require(msg.sender == inspector, "only inspector can call this function");
        _;
    }
    function depositEarnest () public payable BuyerOnly{
        require(msg.value >= escrowAmount, "escrowAmount must be greater than 20");
    }
    function updateInspection (bool _inspectionStatus) public inspectorOnly {
        inspectionStatus = _inspectionStatus;
    }
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    function finalizeSale() public {
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}