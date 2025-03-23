// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FileNFT.sol";

contract FileNFTProxy {
    FileNFT public fileNFT;
    address public owner;
    mapping(address => uint256) public operationsCount;
    mapping(address => uint256) public lastOperationTime;

    constructor(address _fileNFTAddress) {
        fileNFT = FileNFT(_fileNFTAddress);
        owner = msg.sender;
    }
    

    function registerFileAndMintNFT(bytes32 fileHash, bytes memory signature) public  payable {
        //require(msg.value == 0, "No se permiten comisiones adicionales");
        //require(operationsCount[msg.sender] < 20, unicode"Has alcanzado el límite de operaciones");
        //esto comentado por motivos de prueba
        //require(block.timestamp - lastOperationTime[msg.sender] >= 1 days, "Debes esperar 24 horas");

        //operationsCount[msg.sender]++;
        //lastOperationTime[msg.sender] = block.timestamp;

        //console.log("Registrando archivo y creando NFT...");
        

        uint256 tokenId = fileNFT.registerFileAndMintNFT(fileHash, signature);
        //console.log("Token ID del NFT creado:", tokenId);

        //console.log("Transfiriendo NFT al usuario:", msg.sender);
        fileNFT.transferFrom(address(this), msg.sender, tokenId);
    }

    function getFile(uint256 tokenId) public view returns (bytes32, bytes memory, address) {
        return fileNFT.getFile(tokenId);
    }

    function verificarAutenticidad(uint256 tokenId, bytes32 fileHash, bytes memory signature) public view returns (bool) {
        // Llamar al contrato FileNFT para verificar la autenticidad
        return (fileNFT.verificarAutenticidad(tokenId, fileHash, signature));
    }
}
