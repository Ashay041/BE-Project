import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'



/*
const express = require('express')
const app = express()
const fs =require('fs');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
*/
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


//functions








class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData) {
      const contract = web3.eth.Contract(Meme.abi, networkData.address)
      this.setState({ contract })
      const memeHash = await contract.methods.get().call()
      this.setState({ memeHash })
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      memeHash: ``,
      memeHashagain: 'Qmen1Jdjgt1aqb3wxMNMBoH6ifu8GdUJZAW2kpt78KeMxU',
      contract: null,
      web3: null,
      buffer: null,
      account: null,
      hashval: '',
      value:'',
      textBoxValue: ''

    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert('A CID was submitted: ' + this.state.value);
    event.preventDefault();

  }

  myChangeHandler = (event) => {
    this.setState({textBoxValue: event.target.value});
  }
  
  
  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    //var data = new Buffer(fs.readFileSync(req.file.path));

    
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      const memeHash = result[0].hash
      this.setState({memeHash : memeHash})
      if(error) {
        console.error(error)
        return
      }      
        this.setState({hashval : memeHash})
        
       this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }).then((r) => {
         return this.setState({ memeHash: result[0].hash })
       })
       
    })

    
  }


//https://ipfs.infura.io/ipfs/QmahcS9oCxv1xy25Ayer7M6heYwKs9nGo7LJCvy2sUZCob
//<img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} />

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            IPFS Image Upload Dapp With Ethereum Smart Contract
          </a>
        </nav>
        
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
            
              <div className="content mr-auto ml-auto">
                <div className = "imagecontainer">
                  <a
                    href="http://www.dappuniversity.com/bootcamp"
                    target="_blank"
                    rel="noopener noreferrer" >
                      
                   

                  
                  </a>
                  <p>&nbsp;</p>
                  <h1>Images</h1>
                  <h4> Upload images to IPFS and store the IPFS hash on the Ethereum Blockchain </h4>
                  <form onSubmit={this.onSubmit} >
                    <input type='file' onChange={this.captureFile} />
                    <input type='submit' />
                  </form>

                  <p>&nbsp;</p>
                  <div className="filesec">
                    <p>IPFS-Hash: {this.state.hashval}</p>
                      
                  </div>
                  <div className="Download">
                      <form onSubmit={this.handleSubmit}>
                        <label>
                          CID:
                          
                          <input type='text' onChange={this.myChangeHandler} />
                        </label>
                        
                       
                    </form>
                    <form target="_blank" action={`https://ipfs.infura.io/ipfs/${this.state.textBoxValue}`}>
                              <input type="submit"  value="Go to Google" />
                          </form>


                    
                    

                    
                    <a
                      href={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`}
                      download >

                      <i className="fa fa-download" />
                    </a>

                     {/* <a style={{display: "flex",justifyContent: "center",alignItems: "center",}}href={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} target="_blank"> text <button>Download</button></a> */}
                      {/*<input type="text" value={this.state.value} onChange={this.handleChange} /> */}
                    
                      <p>&nbsp;</p>
 
                      <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`}  />

                  </div>



                </div>
                

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
