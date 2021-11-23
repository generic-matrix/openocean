const OpenOceanToken = artifacts.require("./OpenOceanToken.sol");

module.exports = function (deployer) {
  deployer.deploy(OpenOceanToken);
};