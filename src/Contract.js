import { ethers } from "ethers";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function addCandidate(string memory _name)",
  "function getCandidatesCount() view returns (uint)",
  "function getCandidate(uint) view returns (string memory, uint)",
  "function vote(uint)",
];

export const getContract = async () => {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  const signer = await provider.getSigner(0);

  return new ethers.Contract(contractAddress, abi, signer);
};