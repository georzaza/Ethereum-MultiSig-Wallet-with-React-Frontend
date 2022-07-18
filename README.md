## What this project is about
My personal implementation of the following project of the University of Berkeley:
https://github.com/Blockchain-for-Developers/sp18-midterm-pt2


## Installation

- Go to the `client` folder
- Run `npm install`
- Go to the root folder of the project and run either `truffle develop` or `ganache`
	If you're going to use ganache, it might be usefull to first read the next section.
- Deploy the contracts
- Go again into the `client` folder, and run `npm run start`
	Optionally, you may first run `npm run test` and then `npm run start`.
- If not done automatically, open your browser to localhost:3000
- Open the `Console` of the `Developer Tools` of your browser to see more info about the next steps.
- Click the button `Send ether` of the webpage.
- You should now see 1. The event info in the webpage, 2. more info in the browser's Console.
- Read the section `Testing` below for an extra step you may do.


If for some reason something is not working correctly there are 2 explanations.
Either it's Truffle that has the problem, or the Nodejs version.
I had Truffle installed globally and my versions were as follows.
```
Truffle v5.4.23 (core: 5.4.23)
Solidity - 0.4.15 (solc-js)
Node v12.18.2
Web3.js v1.5.3
```

To try to fix the problem WITHOUT breaking anything, here's a solution:
```
# go into the client folder if you're not there
# and remove package-lock.json and node_modules folder
cd client
rm -rf node_modules
rm -rf package-lock.json

# Install Node version-manager package n
sudo npm install -g n

# Install a compatible Node version (does not replace the current Node version)
sudo n v12.18.2

# You can now choose the Node version v12.18.2 with:
sudo n

# run install again
npm install

# do the steps mentioned in the 'Installation' section of this document.
```


## Ganache instead of truffle develop

This project is mostly about 'listening' for events that happen on the chain and display them in a React-based website. In order to do so, we need to 'subscribe' to events. And in order to subscribe to 
these events we need websockets enabled. (see the comments in the `watchLogs()` function in the file `client/App.js`). 

There is official documentation that explicitly states that ganache-cli version 7+ supports websocket.
However, there is no documentation at all about support of websockets on ganache-ui.

Nevertheless, ganache-ui was tested and was found to be working for this project. 



## Testing
I needed to somehow test if all events were captured, so I added an
event called OwnerAdded in the MultiSigWallter.sol contract.

To test the application we can head over to the truffle console
and run those:
```
contract = await MultiSigWallet.deployed();
accounts = await web3.eth.getAccounts();
contract.addOwner(accounts[1]);
```

The last action will emit the event OwnerAdded which should now 
be shown in our browser.


## What is the .env file
The client/.env file resolves a might-happen dependency regarding the webpack package.


## Notes
It might be useful to check the original files of the project against this project's files.