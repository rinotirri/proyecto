const { ethers } = require("hardhat"); // Importar ethers directamente desde hardhat

async function main() {
    // Direcciones de los contratos ya desplegados
    const direccionContratoFileNFT = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Reemplaza con la dirección de FileNFT
    const direccionContratoFileNFTProxy = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Reemplaza con la dirección de FileNFTProxy

    // Obtener instancias de los contratos
    const FileNFT = await ethers.getContractAt("FileNFT", direccionContratoFileNFT);
    const FileNFTProxy = await ethers.getContractAt("FileNFTProxy", direccionContratoFileNFTProxy);

    console.log("FileNFT conectado en:", direccionContratoFileNFT);
    console.log("FileNFTProxy conectado en:", direccionContratoFileNFTProxy);

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
    const arrayed = ethers.getBytes(fileHash); // Usar ethers.getBytes
    console.log("arrayed:", arrayed);
    const signature = await owner.signMessage(arrayed); // Firmar el mensaje
    console.log("signature:", signature);

    console.log("Registrando archivo...");
    const tx = await FileNFTProxy.registerFileAndMintNFT(fileHash, signature);
    const receipt = await tx.wait(); // Esperar a que la transacción se confirme

    // Extraer el tokenId del evento Transfer emitido por FileNFT
    console.log("Buscando evento Transfer en la transacción...");
    const event = receipt.events?.find((e) => e.event === "Transfer");
    if (!event) {
        console.log("No se encontró el evento Transfer. Eventos disponibles:", receipt.events);
        throw new Error("No se encontró el evento Transfer en la transacción");
    }

    const tokenId = event.args.tokenId.toString(); // Obtener el tokenId del evento
    console.log("Token ID del archivo registrado:", tokenId);

    // Obtener los datos del archivo
    const [storedFileHash, storedSignature, ownerAddress] = await FileNFT.getFile(tokenId);
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