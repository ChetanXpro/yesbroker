CHAINS="http://localhost:8545" \
CREATE2_SALT="0x0000000000000000000000000000000000000000000000000000000000000009" \
OWNER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
forge script lib/sp1-contracts/contracts/script/deploy/SP1VerifierGatewayGroth16.s.sol:SP1VerifierGatewayScript \
--rpc-url http://localhost:8545 --broadcast \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

forge create --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  src/PropertyVerifier.sol:CertificateVerifier --broadcast \
  --constructor-args 0xEE469e23285a6447851eE1a66e400199aC40f779 0x00a19121185617661899f275d6e1de8c40382a2e2023f5f362712d6dccc16775

# verifier then programvkey
forge create --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
  --private-key 0x0354321fcc872c69dd207ec478fd6781c9c2e52d086ca3d0646901b0e177cdd3 \
  src/PropertyVerifier.sol:CertificateVerifier --broadcast \
  --constructor-args 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B 0x00a19121185617661899f275d6e1de8c40382a2e2023f5f362712d6dccc16775