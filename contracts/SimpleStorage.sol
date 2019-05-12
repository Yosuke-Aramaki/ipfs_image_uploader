pragma solidity >=0.4.21 <0.6.0;

contract SimpleStorage {
  string ipfsHash;

  struct Ipfs {
    string _ipfsHash;
  }

  event createIpfsHash (
    string ipfsHash
  );

  Ipfs[] public IpfsHash;

  function set(string memory _ipfsHash) public {
    ipfsHash = _ipfsHash;
    IpfsHash.push(Ipfs(ipfsHash));
    emit createIpfsHash(ipfsHash);
  }

  function arraylength() public view returns (uint) {
    uint counter = 0;
    for (uint i = 0; i < IpfsHash.length; i++) {
      counter++;
    }
    return counter;
  }

  function get() public view returns (string memory) {
    return ipfsHash;
  }
}
