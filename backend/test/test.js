const OpenOceanToken = artifacts.require("../contracts/OpenOceanToken.sol");


function ToJson(data){
  let json = [];
  for(var i=0;i<data['0'].length;i++){
    json.push({
      "bidId":Number(data['0'][i].toString()),
      "bidder_address":data['1'][i],
      "bid_amount":Number(data['2'][i].toString()),
      "royalitiy_amount":Number(data['3'][i].toString())
    });
  }
  return json;
}
contract("OpenOceanToken", accounts => {
    let token_id;
    let token;

    before(async()=>{
      try{
        token = await OpenOceanToken.deployed();
        token_id = Number(Date.now());
        await token.mintx(token_id,accounts[0]);
      }catch(e){
        console.log(e);
      }
    });

    it("Setting 10% royality and get royality info for address[0] if sold for 100 bucks to address[1]", async () => {
        await token.saveRoyalties(token_id,accounts[0],1000);
        let data = await token.royaltyInfo(token_id,100);
        assert.equal(10/100*100,data.royaltyAmount.toNumber(),"The royality info is wrong");
    });

    it("Does OpenOcean token transfer's or not from account 0 to 1", async () => {
      let balance =await token.balanceOf(accounts[0]);
      assert.equal(balance,"1", "The balance of token of address : "+accounts[0]+" is not 1 ");
      // Transfer from one account to another accounts[1]
      await token.approve(accounts[1],token_id);
      await token.safeTransferFrom(accounts[0],accounts[1],token_id);
      // Show trx from the blockchain
      let balance_of_account1 =await token.balanceOf(accounts[1]);
      let balance_of_account0 =await token.balanceOf(accounts[0]);
      assert.equal(balance_of_account1,"1", "The balance of account 1 is not 1");
      assert.equal(balance_of_account0,"0", "The balance of account 0 is not 0");
    });

    it("Setting 10% royality and get royality info from account[0] must fail as account[1] is the new owner", async () => {
      try{
        await token.saveRoyalties(token_id,accounts[0],1000,{from: accounts[0]});
      }catch(e){
        assert.equal("The exception was raised as expected","The exception was raised as expected","Error");
      }
    });

    it("Setting 10% royality and get royality info from account[1] must succeed as account[1] is the new owner", async () => {
      try{
        await token.saveRoyalties(token_id,accounts[0],1000,{from: accounts[1]});
        assert.equal("Exception was not raised","Exception was not raised","Error");
      }catch(e){
        console.log("BUMMER : The exception was raised");
      }
    });

    it("Add bid for the token", async () => {
      await token.AddBid(token_id,accounts[2],1000,100,{from: accounts[2],value:1100})
    });

    it("Get bids data from the token", async () => {
      let data = await token.GetBids(token_id);
      let json = ToJson(data);
      assert.equal(json.length,1,"Error : all the bids were not returned");
      let expected_json=[
        {
          bidId: 0,
          bidder_address: accounts[2],
          bid_amount: 1000,
          royalitiy_amount: 100
        }];
      assert.equal(JSON.stringify(json),JSON.stringify(expected_json),"Error : all the bids were not returned");
    });

    //Non owner
    it("Non Owner should not have ability to select bid", async () => {
      try{
        await token.SelectBid(token_id,0,{from: accounts[0]});
      }catch(e){
        assert.equal("Non owner not allowrd","Non owner not allowrd","Error :Non owner was allowed");
      }
    });
    //invalid bid id
    it("Non Owner should not have ability to select bid", async () => {
      try{
        await token.SelectBid(token_id,1,{from: accounts[1]});
      }catch(e){
        assert.equal("Invalid bid id","Invalid bid id","Error :Invalid bid id was allowed");
      }
    });
    //must transfer
    it("Selecting  Bid with id 0 for the token id  from the owner", async () => {
      await token.SelectBid(token_id,0,{from: accounts[1]});
      let data = await token.GetBids(token_id);
      let json = ToJson(data);
      assert.equal(JSON.stringify(json),JSON.stringify([]),"Error : Few bids were returned");
      // Check if accounts[2] has the token
      assert.equal(await token.balanceOf(accounts[2]),"1", "accounts[2] does not have the token");
      // Check if current owner has no tokens
      assert.equal(await token.balanceOf(accounts[1]),"0", "accounts[1] does have the token");
    });

});

contract("OpenOceanToken : Creating a token with multiple bidders and test with no royalities set", accounts => {
  // Create token 1 with owner as accounts[4]
  // Set no royalities
  // Add bid for token 1 from accounts[5] for 1 ether
  // Add bid for token 1 from accounts[6] for 2 ether
  /*
    1) Expect accounts[4] to have 1 token
  */
  // Select bid of 2 ether accounts[6]
  /*
    1) Expect accounts[6] to have 1 token
    2) Expect accounts[4] to have 0 token
    3) Expect the owner of the token_id to be accounts[6]
    4) Expect accounts[4] to have atlest 1.9 ether more than prior amount
    5) Expect accounts[5] to have atlest 0.9 ether more than prior amount
  */
  let tokenId;
  let token;
  let ownerBalanceInWEI;
  let accountFiveBalanceInWEI;
  before(async()=>{
    tokenId = Number(Date.now());
    token = await OpenOceanToken.deployed();
    await token.mintx(tokenId,accounts[4]);
    let OneEth = web3.utils.toWei('1', 'ether');
    await token.AddBid(tokenId,accounts[5],OneEth,0,{from: accounts[5],value:OneEth}) // Bid id 0
    let TwoEth = web3.utils.toWei('2', 'ether');
    await token.AddBid(tokenId,accounts[6],TwoEth,0,{from: accounts[6],value:TwoEth}) // Bid id 1
    ownerBalanceInWEI = await web3.eth.getBalance(accounts[4]);
    accountFiveBalanceInWEI = await web3.eth.getBalance(accounts[5]);
  });
  it("Expect accounts[4] to have 1 token", async () => {
    assert.equal(await token.balanceOf(accounts[4]),"1","The account[4] does not have one token");
  });

  it("Selecting the bid (bid id 1 of 2ETH) and expecting accounts[6] to have 1 token", async () => {
    await token.SelectBid(tokenId,1,{from: accounts[4]});
    assert.equal(await token.balanceOf(accounts[6]),"1","The account[6] does not have one token");
  });

  it("Expecting accounts[4] to have 1 token", async () => {
    assert.equal(await token.balanceOf(accounts[4]),"0","The account[4] still has token");
  });

  it("Expecting the owner of the token to be accounts[6]", async () => {
    assert.equal(await token.ownerOf(tokenId),accounts[6],"The account[6] is not the owner");
  });

  it("Expect accounts[4] to have atlest 1.9 ether more ether than prior amount", async () => {
    assert.equal((await web3.eth.getBalance(accounts[4])-ownerBalanceInWEI)>web3.utils.toWei('1.9', 'ether'),true,"The account[4] does not have the rquired ether expected");
  });

  it("Expect accounts[5] to have atlest 0.9 ether more ether than prior amount", async () => {
    assert.equal((await web3.eth.getBalance(accounts[5])-accountFiveBalanceInWEI)>web3.utils.toWei('0.9', 'ether'),true,"The account[5] does not have the rquired ether expected");
  });

});
