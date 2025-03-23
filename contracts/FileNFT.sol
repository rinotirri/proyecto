// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./ManualCounter.sol"; // Importa la biblioteca ManualCounter

contract FileNFT is ERC721 {
    using ManualCounter for ManualCounter.Counter; // Usa el contador manual
    ManualCounter.Counter private _tokenIdCounter; // Reemplaza el contador manual

    struct File {
        bytes32 fileHash;
        bytes signature;
        address owner;
    }
    

    mapping(uint256 => File) public files; // Almacena los archivos registrados
    address public owner; // Dirección del dueño del contrato
    address public proxy; // Dirección del contrato proxy
    mapping(address => bool) public whitelist; // Lista blanca de direcciones permitidas

    // Variable para evitar reentrancy
    bool private _locked;
    modifier noReentrancy() {
        require(!_locked, "Reentrancy detected");
        _locked = true;
        _;
        _locked = false;
    }
    //agregado manualmente
    //event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);


    constructor() ERC721("FileNFT", "FNFT") {
        owner = msg.sender; // El despliegue del contrato establece al dueño
        _tokenIdCounter.value = 0; // Inicializa el contador en 0
    }

    
    // Modificador para permitir solo al dueño
    modifier onlyOwner() {
        require(msg.sender == owner, unicode"Solo el dueño puede llamar a esta funcion");
        _;
    }

    // Modificador para permitir solo al proxy, al dueño o a direcciones en la lista blanca
    modifier onlyProxyOrOwnerOrWhitelist() {
        require(
            msg.sender == proxy || msg.sender == owner || whitelist[msg.sender],
            unicode"Solo el proxy, el dueño o direcciones en la lista blanca pueden llamar a esta funcion"
        );
        _;
    }

    // Función para establecer la dirección del proxy
    function setProxy(address _proxy) public onlyOwner {
        proxy = _proxy;
        whitelist[_proxy] = true; // Agrega el proxy a la lista blanca
    }

    // Función para agregar una dirección a la lista blanca
    function addToWhitelist(address _address) public onlyOwner {
        whitelist[_address] = true;
    }

    // Función para quitar una dirección de la lista blanca
    function removeFromWhitelist(address _address) public onlyOwner {
        whitelist[_address] = false;
    }

    // Función para obtener el ID actual del contador
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    //creado por Rino Tirri

    function registerFileAndMintNFT(bytes32 fileHash, bytes memory signature) public onlyProxyOrOwnerOrWhitelist noReentrancy returns (uint256) {
        _tokenIdCounter.increment(); // Incrementa el contador
        uint256 newTokenId = _tokenIdCounter.current(); // Obtén el valor actual del contador

        // Mintear el NFT al contrato proxy (msg.sender)
        _mint(msg.sender, newTokenId); // Crea el NFT
        files[newTokenId] = File(fileHash, signature, msg.sender); // Almacena los datos del archivo

        // Emitir el evento Transfer manualmente
        //emit Transfer(address(0), msg.sender, newTokenId);

        return newTokenId;
    }

    // Función para obtener los datos de un archivo
    function getFile(uint256 tokenId) public view returns (bytes32, bytes memory, address) {
        require(_ownerOf(tokenId) != address(0), "El NFT no existe");
        File memory file = files[tokenId];
        return (file.fileHash, file.signature, file.owner);
    }

    function verificarAutenticidad(uint256 tokenId, bytes32 fileHash, bytes memory signature) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "El NFT no existe");

        // Obtener los datos del archivo registrado
        File memory file = files[tokenId];

        // Comparar el hash y la firma directamente
        bool hashCoincide = (file.fileHash == fileHash);
        bool firmaCoincide = (keccak256(file.signature) == keccak256(signature));

        // Verificar si el archivo y la firma coinciden
        return (hashCoincide && firmaCoincide);
    }
}