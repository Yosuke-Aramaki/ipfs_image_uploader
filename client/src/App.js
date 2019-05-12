import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";
import ipfs from "./ipfs.js";
import "./App.css";

class App extends Component {

  constructor(props) {
    super(props) 
    this.state= {
      web3: null, 
      accounts: null, 
      contract: null,
      buffer: null,
      ipfsHash: [],
      hoge: '',
    }
    //関数を使えるようにする
    this.captureFile = this.captureFile.bind(this);
    this.onSubmit = this.onSubmit.bind(this); 
  } 

  componentWillMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Web3でユーザーのアドレスを取得
      const accounts = await web3.eth.getAccounts();
      // コントラクト情報をブロックチェーン上から取得
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      //Stateにweb3, accounts, contractをセットする
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
      console.error(error);
    }
    await this.loadIpfsHash();
  };

  loadIpfsHash = async () => {
    const length = await this.state.contract.methods.arraylength().call()
    console.log(length)
    const hoge = await this.state.contract.methods.IpfsHash(1).call()
    console.log(hoge)
    this.setState({ hoge })
    for (var i = 0; i <= length; i++) {
      const ipfsHashs = await this.state.contract.methods.IpfsHash(i).call()
      this.setState({
        ipfsHash: [...this.state.ipfsHash, ipfsHashs]
      })
    }
  }

  captureFile(event) {
    console.log('File loader ...')
    event.preventDefault()
    //fileにアクセスする
    const file = event.target.files[0]
    //fileを読み込む
    const reader = new window.FileReader()
    //fileをipfsいアクセスできるArrayに追加する
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      //結果をBufferに入れ,ipfsにアクセスできるようにする
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit = async (event) => {
    console.log('on Submit ...')
    //Submit時にリロードしなくなる
    event.preventDefault()
    //ipfsにファイルを追加
    ipfs.files.add(this.state.buffer, async (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      //ブロックチェーンにipfsHashを書きこむ
      this.state.contract.methods.set(result[0].hash).send({ from: this.state.accounts[0] })
      //iphsHashの値をアップデートする
      return this.loadIpfsHash();
    }) 
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Your Image</h1>
        <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
        {this.state.ipfsHash.map((hash, key) => {
          return(
            <div key={key}>
              <img src= {`https://ipfs.io/ipfs/${hash}`} alt=""></img>
            </div>
          )
        })}
        <img src= {`https://ipfs.io/ipfs/${this.state.hoge}`} alt=""></img>
        <h2>Upload image</h2>
        <form onSubmit={this.onSubmit} >
          <input type="file" onChange={this.captureFile} />
          <input type="submit" />
        </form>
      </div>
    );
  }
}

export default App;
