set /p MID=ID of the NFT: #

set /p MNET=mainnet or testnet? (default mainnet)

IF "%MNET" == "testnet" (set MNET="testnet")


node index.mjs %MID% %MNET%

set /p MID=Finished !!!