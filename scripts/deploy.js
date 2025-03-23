const hre = require("hardhat");

async function main() {
    /*const FileNFT = await hre.ethers.getContractFactory("FileNFT");
    const fileNFT = await FileNFT.deploy();
    await fileNFT.deployed();
    console.log("FileNFT desplegado en:", fileNFT.address);*/
    const namefileNFTRegistry = await hre.ethers.deployContract('FileNFT');
    await namefileNFTRegistry.waitForDeployment();
    //console.log(`FileNFT desplegado en: ${namefileNFTRegistry.target}`);
    console.log(`FileNFT desplegado en: ${namefileNFTRegistry.target}`);

    /*const FileNFTProxy = await hre.ethers.getContractFactory("FileNFTProxy");
    const fileNFTProxy = await FileNFTProxy.deploy(fileNFT.address);
    await fileNFTProxy.deployed();
    console.log("FileNFTProxy desplegado en:", fileNFTProxy.address);*/
    const fileNFTProxy = await hre.ethers.deployContract('FileNFTProxy', [namefileNFTRegistry.target]);
    await fileNFTProxy.waitForDeployment();
    console.log(`FileNFTProxy desplegado en: ${fileNFTProxy.target}`);


    //const tx = await fileNFT.setProxy(fileNFTProxy.address);
    const tx = await namefileNFTRegistry.setProxy(fileNFTProxy.target);
    await tx.wait();
    console.log("Proxy agregado a la lista blanca.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });