import React, { Component } from 'react'
import MultiSigWallet from './build/contracts/MultiSigWallet.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    // Items in component's state
    this.state = {
      multiSigContract: null,
      web3: null,
      events: [],
      numEvents: 0
    }

    this.sendEther = this.sendEther.bind(this);
    this.addOwner = this.addOwner.bind(this);
    this.removeOwner = this.removeOwner.bind(this);
    this.watchLogs = this.watchLogs.bind(this);
  }

  /** UNSAFE is being used to suppress the deprecation warning:
    *  "Warning: 
    *   componentWillMount has been renamed, and is not recommended for use. 
    *   See https://fb.me/react-unsafe-component-lifecycles for details.
    *   Move code with side effects to componentDidMount, and set initial state in the constructor.
    *   Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode.
    *   In React 17.x, only the UNSAFE_ name will work.
    *   To rename all deprecated lifecycles to their new names, 
    *   you can run `npx react-codemod rename-unsafe-lifecycles` in your project source folder"
   */
  UNSAFE_componentWillMount() {
    // Get network provider and web3 instance. See utils/getWeb3 for more info.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract();
    })
    .catch(() => {
      console.log('Error finding web3.');
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const multiSig = contract(MultiSigWallet);
    multiSig.setProvider(this.state.web3.currentProvider);
    multiSig.deployed().then((instance) => {
      /// Save our contract obj in internal state
      this.setState({multiSigContract: instance})
    }).then(() => this.watchLogs());
  }


  watchLogs() {
    /*
      The original project contained the function .watch which has been deprecated 
      after the web3js version 1 and after. The up-to-date way of subscribing is:
      https://web3js.readthedocs.io/en/v1.7.0/web3-eth-contract.html#contract-events

      The best way however, which I have used, is to subscribe to allEvents:
      https://web3js.readthedocs.io/en/v1.7.0/web3-eth-contract.html#events-allevents

      Finally, the function "getPastEvents" was tested as I wanted to display all the 
      events in the webpage and not only them which have happened after the webpage is 
      loaded. For some reason however, the "getPastEvents" fuction was only returning 1
      event, so it was removed..
    */

    /// save reference to global component obj for later user
    var that = this;
    
    this.state.multiSigContract.contract.events.allEvents(function(error, result) {
        if (error)
            console.log(error);
        else
            that.setState({events: that.state.events.concat([result])});
    });
  }

  /// "Send Ether" button in the browser. Use the web3 object from this react component's
  /// state (i.e. 'this.state.web3.....'). You'll want to use the 'sendTransaction'
  /// function, which is documented here -- https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction
  sendEther() {
    getWeb3.then((getWeb3instance, error) => {
        getWeb3instance.web3.eth.getAccounts().then((accounts, error) => {
            this.state.web3.eth.sendTransaction(
            {
                value: 10000, // sending amount of wei
                to: this.state.multiSigContract.address, 
                from: accounts[1] // sender address
            });
            console.log("Sent 1000 from accounts[1]");
      });
    });
  }

  // I have added this function to display more functionality (not in project requirements)
  addOwner() {
    getWeb3.then((getWeb3instance, error) => {
        getWeb3instance.web3.eth.getAccounts().then((accounts, error) => {
          this.state.multiSigContract.addOwner(accounts[9], {from: accounts[0]});
          console.log("Tried to add accounts[9] as an owner of the multiSigWallet contract.");
      });
    });
  }

  // I have added this function to display more functionality (not in project requirements)
  removeOwner() {
    getWeb3.then((getWeb3instance, error) => {
        getWeb3instance.web3.eth.getAccounts().then((accounts, error) => {
          this.state.multiSigContract.removeOwner(accounts[9], {from: accounts[0]});
          console.log("Tried to remove accounts[9] from the owners list of the multiSigWallet contract.");
      });
    });
  }

  render() {
    /**
     *  Here is some Javascript code that prints more info for each event. (Not in the project's requirements)
     *  Essentially, what happens is that all events are parsed each time the render()
     *  function is called. This is not optimal of course, but it gets the job done.
     */ 
    var eventsHTMLcontent = '';  // holds the HTML code that will be displayed for all the events.
    
    console.log("All events since the page loaded:");
    this.state.events.forEach(function (event) {
      console.log(event);

      // construct the HTML code be displayed. 
      eventsHTMLcontent +=  '<li class="list-item">';
      eventsHTMLcontent += '<p class="event-name">' + event.event + ' event:</p>'
      eventsHTMLcontent += 
        '<p class="event-info"> <b> logIndex: </b>' + event.logIndex + '</p>' +
        '<p class="event-info"> <b> transactionIndex: </b>' + event.transactionIndex + '</p>' +
        '<p class="event-info"> <b> transactionHash: </b>' + event.transactionHash + '</p>' +
        '<p class="event-info"> <b> blockHash: </b>' + event.blockHash + '</p>' +
        '<p class="event-info"> <b> blockNumber: </b>' + event.blockNumber + '</p>' +
        '<p class="event-info"> <b> address: </b>' + event.address + '</p>' +
        '<p class="event-info"> <b> type: </b>' + event.type + '</p>' +
        '<p class="event-info"> <b> id: </b>' + event.id + '</p>' +
        '<p class="event-info"> <b> signature: </b>' + event.signature + '</p>' ;

      let returnValuesField = (JSON.stringify(event.returnValues)).toString();
      eventsHTMLcontent += '<p class="event-info"> <b>returnValues:</b> ';
      returnValuesField.substr(1,returnValuesField.length-2).replaceAll('"','').split(',').forEach(function (field) {
        eventsHTMLcontent += '<p class="event-info-more"><b>' + field.split(':')[0] + ": </b>" + field.split(':')[1] + '</p>';
      });
      eventsHTMLcontent += '</p>';

      eventsHTMLcontent += '<p class="event-info"> <b>raw:</b> ';
      eventsHTMLcontent += '<p class="event-info-more"><b>data: </b>' + event.raw.data + '</p>';
      eventsHTMLcontent += '<p class="event-info-more"><b>topics: </b></p>';
      for (let i=0; i<event.raw.topics.length; i++)
        eventsHTMLcontent += '<p class="event-info-more-more"><b>' + i + ': </b>' + event.raw.topics[i] + '</p>';
      eventsHTMLcontent += '</p>';
      eventsHTMLcontent += '</li>';
    });
    console.log("--------------------------------------------------------------------------");


    // select the HTML 'ul' element that holds the html content of the events
    var eventsList = document.getElementById("events-list");

    // append to the 'ul', the eventsHTMLcontent
    if (eventsList!==undefined && eventsList!==null)
      eventsList.innerHTML = eventsHTMLcontent;

    return (
      <div className="body">
        <h1>Full Stack Dapp: Event Logging</h1>
        <h3>Here you'll see events logged by the multi-sig contract you implemented. First click the button below. Behind the scenes this is sending ether to the multi-sig contract. Accordingly, we'll see the DepositFunds event logged below.</h3>
        <ul id="events-list"></ul>
        <button onClick={this.sendEther} className="ether-btn">Send Ether</button>
        <br/>
        <button onClick={this.addOwner} className="ether-btn">Add Owner</button>
        <br/>
        <button onClick={this.removeOwner} className="ether-btn">Remove Owner</button>
        <p>The last 2 buttons were not in the project's requirements. They were added to display just a bit more functionality. The 'add owner' button adds the accounts[9] as the owner of the contract and the remove button removes accounts[9] from the list of the owners. The relevant events ownerAdded and removedOwner were also added as 'extra' to the MultiSigWallet contract. These events are only transmitted only when a change in the state has happened. Thus, if you click the addOwner button for 2 times in a row you will only see output (the event) the first time.(Similarly for the remove owner button) </p>
      </div>
    );
  }

}

export default App
