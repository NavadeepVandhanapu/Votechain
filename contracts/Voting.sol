// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {

    struct Candidate {
        string name;
        uint voteCount;
    } // ❗ NO semicolon here

    Candidate[] public candidates;

    mapping(address => bool) public voters;
    mapping(address => bool) public hasVoted;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name) public {
        require(msg.sender == admin, "Not admin");
        candidates.push(Candidate(_name, 0));
    }

    function addVoter(address _voter) public {
        require(msg.sender == admin, "Not admin");
        voters[_voter] = true;
    }

    function vote(uint candidateIndex) public {
        require(voters[msg.sender], "Not authorized");
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateIndex < candidates.length, "Invalid candidate");

        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function getCandidatesCount() public view returns (uint) {
        return candidates.length;
    }

    function getCandidate(uint index) public view returns (string memory, uint) {
        Candidate memory c = candidates[index];
        return (c.name, c.voteCount);
    }
}

