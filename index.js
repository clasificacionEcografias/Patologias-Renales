function verificarValor() {
    // Obtener el valor ingresado por el usuario
    var valorIngresado = document.getElementById('codigo').value;

    // Valor preestablecido
    var valorPreestablecido = 'NiuVet1';

    // Verificar si el valor ingresado es igual al valor preestablecido
    if (valorIngresado === valorPreestablecido) {
        // Obtener la URL base del repositorio en GitHub
        var githubURL = 'https://clasificacionecografias.github.io/Patologias-Renales/'; // Reemplaza con tu nombre de usuario y nombre de repositorio
        // Redirigir a otra página web en GitHub
        window.location.href = githubURL + 'evalue.html';
    } else {
        // Mostrar un mensaje si el valor no coincide
        alert('El valor ingresado no es válido. Inténtelo de nuevo.');
    }
}

document.getElementById('ingresar').addEventListener('click', verificarValor);
