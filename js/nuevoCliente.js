(function () {
    let DB;

    const formulario = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {
        formulario.addEventListener('submit', validarCliente);
        conectarDB();
    });

    function conectarDB() {
        let abrirConexion = window.indexedDB.open('crm', 1);

        abrirConexion.onerror = function () {
            // SweetAlert
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Hubo un Error',
                showConfirmButton: false,
                timer: 1500
              })
        };

        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;
        };
    };

    function validarCliente(event) {
        event.preventDefault();

        const nombre = document.querySelector('#nombre').value;
        const email = document.querySelector('#email').value;
        const telefono = document.querySelector('#telefono').value;
        const empresa = document.querySelector('#empresa').value;

        if (nombre === '' || email === '' || telefono === '' || empresa === '') {
            imprimirAlerta('Todos Los Campos son Obligatorios', 'error');
            return;
        }

        const cliente = {
            nombre,
            email,
            telefono,
            empresa
        };

        cliente.id = Date.now();

        crearNuevoCliente(cliente);
    }

    function crearNuevoCliente(cliente) {
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.add(cliente);

        transaction.oncomplete = () => {
             // SweetAlert
             Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Guardado Correctamente',
                showConfirmButton: false,
                timer: 1500
            });

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        };

        transaction.onerror = () => {
            // SweetAlert
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Correo no valido!',
                showConfirmButton: false,
                timer: 1500
              })
        };
    }

    function imprimirAlerta(mensaje, tipo) {
        const alerta = document.querySelector('.alert-active');

        if(!alerta) {
            const divMensaje = document.createElement('div');
            divMensaje.classList.add("px-4", "py-3", "rounded", "max-w-lg", "mx-auto", "mt-6", "text-center", "alert-active");
    
            if (tipo === 'error') {
                divMensaje.classList.add('bg-red-100', "border-red-400", "text-red-700");
            } else {
                divMensaje.classList.add('bg-green-100', "border-green-400", "text-green-700");
            }
    
            divMensaje.textContent = mensaje;
            formulario.appendChild(divMensaje);
    
            setTimeout(() => {
                divMensaje.remove();
            }, 3000);
        }
    }
})();