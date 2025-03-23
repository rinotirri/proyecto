const { ethers } = require("hardhat"); // Importar ethers directamente desde hardhat
const hre = require("hardhat");

async function main() {
    // Obtener las fábricas de los contratos
    const FileNFT = await ethers.getContractFactory("FileNFT");
    const FileNFTProxy = await ethers.getContractFactory("FileNFTProxy");

    // Desplegar el contrato FileNFT
    const fileNFT = await FileNFT.deploy();
    console.log(`FileNFT desplegado en: ${fileNFT.target}`);

    // Desplegar el contrato FileNFTProxy, pasando la dirección de FileNFT
    const fileNFTProxy = await FileNFTProxy.deploy(fileNFT.target);
    console.log(`FileNFTProxy desplegado en: ${fileNFTProxy.target}`);

    // Configurar el proxy en FileNFT
    await fileNFT.setProxy(fileNFTProxy.target);
    console.log("Proxy configurado en FileNFT.");

    console.log("Obtener una cuenta de prueba");
    const [owner, user] = await ethers.getSigners();
    console.log("obtenida");

    console.log("Probar la función registerFileAndMintNFT");

    // Hashear el archivo
    console.log("A hashear archivo");
    const archivoHasheado = ethers.toUtf8Bytes("archivo_secreto"); // Usar ethers.toUtf8Bytes
    console.log("el archivo esta en", archivoHasheado);
    const fileHash = ethers.keccak256(archivoHasheado); // Usar ethers.keccak256
    console.log("hash:", fileHash);

    // Firmar el hash
    console.log("a aplicar arrayify va");
    const arrayed = ethers.getBytes(fileHash); 
    console.log("arrayed: "+arrayed);
    const signature = await owner.signMessage(arrayed); // Usar ethers.arrayify
    console.log("signature:", signature);

    console.log("Registrando archivo...");
    const tx = await fileNFTProxy.registerFileAndMintNFT(fileHash, signature);
    await tx.wait();

    console.log("Archivo registrado.");

    // Obtener el tokenId del archivo registrado
    const tokenId = await fileNFT.getCurrentTokenId();
    console.log("Token ID del archivo registrado:", tokenId.toString());

    // Obtener los datos del archivo
    const [storedFileHash, storedSignature, ownerAddress] = await fileNFT.getFile(tokenId);
    console.log("Hash del archivo:", storedFileHash);
    console.log("Firma:", storedSignature);
    console.log("Dueño:", ownerAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });