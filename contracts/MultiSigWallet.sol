pragma solidity ^0.4.15;

contract MultiSigWallet {
  address private _owner;
  mapping(address => uint8) private _owners;

  mapping (uint => Transaction) private _transactions;
  uint[] private _pendingTransactions;

  // auto incrememnting transaction ID
  uint private _transactionIndex;
  // constant: we need x amount of signatures to sign Transaction
  uint constant MIN_SIGNATURES = 2;

  struct Transaction {
    address source;
    address destination;
    uint value;
    //add how many people signed and who
    uint signatureCount;
    //need to keep record of who signed
    mapping (address => uint8) signatures;
  }

  modifier isOwner() {
    require(msg.sender == _owner);
    _;
  }

  modifier validOwner() {
    require(msg.sender == _owner || _owners[msg.sender] == 1);
    _;
  }

  modifier enoughBalance(uint amount) {
    require(address(this).balance >= amount);
      _;
  }


  /// @dev logged events
  event DepositFunds(address indexed source, uint indexed amount);
  /// @dev full sequence of the transaction event logged
  /// @notice only 3 arguments can have the 'indexed' type.
  event TransactionCreated(address indexed source, address indexed destination, uint indexed value, uint transactionID);
  event TransactionCompleted(address indexed source, address indexed destination, uint indexed value, uint transactionID);
  /// @dev keeps track of who is signing the transactions
  event TransactionSigned(address indexed by, uint indexed transactionID);

  // added these as well
  event OwnerAdded(address indexed addr);
  event OwnerRemoved(address indexed addr);


  /// @dev Contract constructor sets initial owners
  function MultiSigWallet()
  public
  {
    _owner = msg.sender;
  }

  /// @dev add new owner to have access, enables the ability to create more than one owner to manage the wallet
  function addOwner(address newOwner)
  isOwner
  public
  {
    if (_owners[newOwner] == 0) {
      _owners[newOwner] = 1;
      OwnerAdded(newOwner);
    }
  }

  /// @dev remove suspicious owners
  function removeOwner(address existingOwner)
  isOwner
  public
  {
    if (_owners[existingOwner] == 1) {
      _owners[existingOwner] = 0;
      OwnerRemoved(existingOwner);
    }
  }

  /// @dev Fallback function, which accepts ether when sent to contract
  function ()
  public
  payable
  {
    DepositFunds(msg.sender, msg.value);
  }

  function withdraw(uint amount)
  validOwner
  enoughBalance(amount)
  public
  {
    msg.sender.transfer(amount);
  }

  /// @dev Send ether to specific a transaction
  /// @param destination Transaction target address.
  /// @param value Transaction ether value.
  ///
  /// Start by creating your transaction. Since we defined it as a struct,
  /// we need to define it in a memory context. Update the member attributes.
  ///
  /// note, keep transactionID updated
  function transferTo(address destination, uint value)
  validOwner
  public
  {
    require(address(this).balance >= value);
    _transactionIndex++;

    //create the transaction
    //YOUR CODE HERE
    Transaction memory transaction = Transaction({
      source: msg.sender,
      destination: destination,
      value: value,
      signatureCount: 0
    });


    //add transaction to the data structures
    _transactions[_transactionIndex] = transaction;
    _pendingTransactions.push(_transactionIndex);

    //log that the transaction was created to a specific address
    TransactionCreated(transaction.source, transaction.destination, transaction.value, _transactionIndex);
  }

  //returns pending transcations
  function getPendingTransactions()
  validOwner
  constant
  public
  returns (uint[])
  {
    return _pendingTransactions;
  }

  /// @dev Allows an owner to confirm a transaction.
  /// @param transactionID Transaction ID.
  /// Sign and Execute transaction.
  function signTransaction(uint transactionID)
  validOwner 
  public
  {
    //Use Transaction Structure. Above in TransferTo function, because
    //we created the structure, we had to specify the keyword memory.
    //Now, we are pulling in the structure from a storage mechanism
    //Basically, 'storage' will stop the EVM from duplicating the actual
    //object, and instead will reference it directly.

    //Create variable transaction using storage (which creates a reference point)
    //YOUR CODE HERE
    Transaction storage transaction = _transactions[transactionID];

    // Transaction must exist, note: use require(), but can't do require(transaction), .
    //YOUR CODE HERE
    require(transaction.source != address(0));

    // Creator cannot sign the transaction, use require()
    //YOUR CODE HERE
    require(msg.sender != transaction.source);

    // Cannot sign a transaction more than once, use require()
    //YOUR CODE HERE
    require(transaction.signatures[msg.sender] == 0);

    // assign the transaction = 1, so that when the function is called again it will fail
    //YOUR CODE HERE
    transaction.signatures[msg.sender] == 1;

    // increment signatureCount
    //YOUR CODE HERE
    transaction.signatureCount++;

    // log transaction
    //YOUR CODE HERE
    TransactionSigned(msg.sender, transactionID);

    //  check to see if transaction has enough signatures so that it can actually be completed
    // if true, make the transaction. Don't forget to log the transaction was completed.
    if (transaction.signatureCount >= MIN_SIGNATURES)
    {
      require(address(this).balance >= transaction.value); //validate transaction
      //YOUR CODE HERE
      transaction.destination.transfer(transaction.value);

      //log that the transaction was complete
      //YOUR CODE HERE
      TransactionCompleted(transaction.source, transaction.destination, transaction.value, transactionID);

      //end with a call to deleteTransaction
      deleteTransaction(transactionID);
    }
  }

  /// @dev clean up function
  function deleteTransaction(uint transactionId)
  validOwner
  public
  {
    uint8 replace = 0;
    for (uint i = 0; i < _pendingTransactions.length; i++)
    {
      if (1 == replace)
        _pendingTransactions[i-1] = _pendingTransactions[i];
      else if (transactionId == _pendingTransactions[i])
        replace = 1;
    }
    delete _pendingTransactions[_pendingTransactions.length - 1];
    _pendingTransactions.length--;
    delete _transactions[transactionId];
  }

  /// @return Returns balance
  function walletBalance()
  constant
  public 
  returns (uint)
  {
    return address(this).balance;
  }
}
