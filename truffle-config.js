module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*", // Match any network id
      websockets: true, //allow websockets, maybe not needed.
                    // See the App.js watchLogs() function on why I use this.
    }
  },
  compilers: {
    solc: {
      version: "0.4.15",
    }
  },
};
