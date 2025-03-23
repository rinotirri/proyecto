const hre = require("hardhat");

async function main() {
    // Obtener las fábricas de los contratos
    const FileNFT = await hre.ethers.getContractFactory("FileNFT");
    const FileNFTProxy = await hre.ethers.getContractFactory("FileNFTProxy");

    // Desplegar el contrato FileNFT
    const fileNFT = await FileNFT.deploy();
    console.log(`FileNFT desplegado en: ${fileNFT.target}`);
    //console.log("FileNFT desplegado en:", fileNFT.address);

    // Desplegar el contrato FileNFTProxy, pasando la dirección de FileNFT
    const fileNFTProxy = await FileNFTProxy.deploy(fileNFT.target);
    console.log(`FileNFTProxy desplegado en: ${fileNFTProxy.target}`);

    // Configurar el proxy en FileNFT
    await fileNFT.setProxy(fileNFTProxy.target);
    console.log("Proxy configurado en FileNFT.");

    console.log("Obtener una cuenta de prueba");
    const [owner, user] = await hre.ethers.getSigners();
    console.log("obtenida");

    console.log("Probar la función registerFileAndMintNFT");
    //ERROR ACA
    console.log("A hashear archivo");
    const archivoHasheado =hre.ethers.utils.toUtf8Bytes("archivo_secreto");
    console.log("el archivo esta en "+archivoHasheado);
    const fileHash = hre.ethers.utils.keccak256(archivoHasheado);

    console.log("hash: "+fileHash);
    const signature = await owner.signMessage(hre.ethers.utils.arrayify(fileHash));
    console.log("signature: "+signature);

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