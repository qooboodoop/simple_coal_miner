#!/bin/sh

read -p "ID of the NFT: " MID
read -p "Mainnet or Testnet? (default Mainnet) " MNET

if [ -z "$MNET" ]
then
      MNET=""
else
      MNET="testnet"
fi

node index.mjs $MID $MNET