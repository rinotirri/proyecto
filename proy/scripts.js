// Script para el carrusel de imágenes de fondo
const images = [
    "url('https://stellarnova.neocities.org/imagenes/a.jpg')",
    "url('https://stellarnova.neocities.org/imagenes/b.jpg')",
    "url('https://stellarnova.neocities.org/imagenes/c.jpg')"
];

let currentImage = 0;

function changeBackground() {
    document.body.style.backgroundImage = images[currentImage];
    currentImage = (currentImage + 1) % images.length;
}

setInterval(changeBackground, 10000); // Cambia la imagen cada 10 segundos

// Script para el botón "Subir al inicio"
const btnSubir = document.getElementById("btn-subir");

window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        btnSubir.style.display = "block";
    } else {
        btnSubir.style.display = "none";
    }
};

btnSubir.addEventListener("click", () => {
    document.body.scrollTop = 0; // Para Safari
    document.documentElement.scrollTop = 0; // Para otros navegadores
});

// Script para el registro y verificación de archivos
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

let signer;
let proxyContract;
let tokenIdRegistrado; // Variable para almacenar el Token ID

async function conectarMetaMask() {
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        proxyContract = new ethers.Contract(proxyAddress, proxyAbi, signer);

        console.log("Conectado a MetaMask");
        mostrarModal("Billetera conectada correctamente.", "success");
    } else {
        mostrarModal("Por favor, instala MetaMask.", "error");
    }
}

function mostrarLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    loader.style.display = 'block'; // Mostrar la rueda de carga
}

function ocultarLoader(loaderId) {
    const loader = document.getElementById(loaderId);
    loader.style.display = 'none'; // Ocultar la rueda de carga
}

function mostrarModal(mensaje, tipo) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalForm = document.getElementById('modalForm');

    // Limpiar el formulario
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('identificacion').value = '';

    modalContent.className = `modal-content ${tipo}`;
    modalTitle.textContent = tipo === 'success' ? 'Éxito' : 'Error';
    modalMessage.textContent = mensaje;

    if (tipo === 'success') {
        modalForm.style.display = 'block'; // Mostrar formulario solo en caso de éxito
    } else {
        modalForm.style.display = 'none'; // Ocultar formulario en caso de error
    }

    modal.style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function generarCertificado() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const identificacion = document.getElementById('identificacion').value;
    const archivo = document.getElementById('archivoRegistro').files[0];

    const certificado = `
        <h1 style="font-size: 24px;">Certificado de Registro</h1>
        <p style="font-size: 18px;"><strong>Nombre:</strong> ${nombre} ${apellido}</p>
        <p style="font-size: 18px;"><strong>Identificación:</strong> ${identificacion}</p>
        <p style="font-size: 18px;"><strong>Archivo:</strong> ${archivo.name}</p>
        <p style="font-size: 18px;"><strong>Token ID:</strong> ${tokenIdRegistrado}</p>
        <p style="font-size: 18px;">Este certificado garantiza con la inmutabilidad de la red que el registro que ha hecho va a permanecer ahi y servirá como evidencia en el futuro que es el autor.</p>
    `;

    const ventana = window.open('', '_blank');
    ventana.document.write(certificado);
    ventana.document.close();
    ventana.print();
}

async function registrarArchivo(file, secreto) {
    mostrarLoader('loaderRegistro');
    try {
        if (!signer) {
            await conectarMetaMask();
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64File = e.target.result.split(',')[1];
            const fileConSecreto = base64File + secreto;
            const fileHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fileConSecreto));

            // Firmar el hash con la billetera del usuario
            const arrayed = ethers.utils.arrayify(fileHash);
            const signature = await signer.signMessage(arrayed);

            // Llamar al contrato proxy para registrar el archivo
            const tx = await proxyContract.registerFileAndMintNFT(fileHash, signature);
            await tx.wait();

            // Obtener el tokenId directamente desde el contrato
            const fileNFTContract = new ethers.Contract(fileNFTAddress, fileNFTAbi, signer);
            tokenIdRegistrado = await fileNFTContract.getCurrentTokenId();

            console.log("Archivo registrado con NFT ID:", tokenIdRegistrado.toString());
            mostrarModal(`Su archivo fue registrado con el NFT ID: ${tokenIdRegistrado.toString()}. Guárdelo para futuras consultas.`, "success");
        };
        reader.readAsDataURL(file);
    } catch (errorT) {
        console.error("Error:", errorT);
        mostrarModal("Error al registrar el archivo. Por favor, inténtalo de nuevo.", "error");
    } finally {
        ocultarLoader('loaderRegistro'); // Ocultar la rueda de carga al finalizar
    }
}

async function verificarArchivo(file, secreto, tokenId) {
    mostrarLoader('loaderVerificacion');
    try {
        if (!signer) {
            await conectarMetaMask();
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            const base64File = e.target.result.split(',')[1];
            const fileConSecreto = base64File + secreto;
            const fileHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(fileConSecreto));

            // Firmar el hash con la billetera del usuario
            const arrayed = ethers.utils.arrayify(fileHash);
            const signature = await signer.signMessage(arrayed);

            // Llamar al contrato proxy para verificar la autenticidad
            const esAutentico = await proxyContract.verificarAutenticidad(tokenId, fileHash, signature);

            if (esAutentico) {
                mostrarModal("¡El archivo es auténtico! Usted es el creador.", "success");
            } else {
                mostrarModal("El archivo no coincide con el registro original.", "error");
            }
        };
        reader.readAsDataURL(file);
    } catch (errorT) {
        console.error("Error:", errorT);
        mostrarModal("Error al verificar el archivo. Por favor, inténtalo de nuevo.", "error");
    } finally {
        ocultarLoader('loaderVerificacion'); // Ocultar la rueda de carga al finalizar
    }
}

document.getElementById('formRegistro').addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = document.getElementById('archivoRegistro').files[0];
    const secreto = document.getElementById('secretoRegistro').value;

    if (file && secreto) {
        await registrarArchivo(file, secreto);
    } else {
        mostrarModal("Por favor, selecciona un archivo e ingresa un secreto.", "error");
    }
});

document.getElementById('formVerificacion').addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = document.getElementById('archivoVerificacion').files[0];
    const secreto = document.getElementById('secretoVerificacion').value;
    const tokenId = document.getElementById('tokenId').value;

    if (file && secreto && tokenId) {
        await verificarArchivo(file, secreto, tokenId);
    } else {
        mostrarModal("Por favor, selecciona un archivo, ingresa un secreto y proporciona el ID del NFT.", "error");
    }
});