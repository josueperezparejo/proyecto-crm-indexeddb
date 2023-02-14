(function () {
    // Variables & Selectores
    let DB;
    let idCliente;
    const formulario = document.querySelector('#formulario');
    const btnClientes = document.querySelector('#btnClientes');
    const btnNuevoCliente = document.querySelector('#btnNuevoCliente');

    const nombreInput = document.querySelector('#nombre');
    const emailInput = document.querySelector('#email');
    const empresaInput = document.querySelector('#empresa');
    const telefonoInput = document.querySelector('#telefono');

    // Eventos
    document.addEventListener('DOMContentLoaded', () => {
        conectarDB();

        formulario.addEventListener('submit', actualizarCliente);

        const parametrosURL = new URLSearchParams(window.location.search);
        idCliente = parametrosURL.get('id');

        if (idCliente) {
            setTimeout(() => {
                obtenerCliente(idCliente);
            }, 100);
        }

        btnClientes.addEventListener('click', modoEdicionOut);
        btnNuevoCliente.addEventListener('click', modoEdicionOut);
    });

    // Funciones
    function conectarDB() {
        const abrirConexion = window.indexedDB.open('crm', 1);

        abrirConexion.onerror = function () {
            // Si hay un error
        };

        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;
        };
    };

    function obtenerCliente(id) {
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        const request = objectStore.openCursor();

        request.onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.id == id) {
                    llenarFormulario(cursor.value);
                }
                cursor.continue();
            }
        };
    };

    function llenarFormulario(datosCliente) {
        const { nombre, email, empresa, telefono } = datosCliente;

        nombreInput.value = nombre;
        emailInput.value = email;
        empresaInput.value = empresa;
        telefonoInput.value = telefono;
    };

    function actualizarCliente(event) {
        event.preventDefault();

        if (nombreInput.value === '' || emailInput.value === '' || empresaInput.value === '' || telefonoInput.value === '') {
            imprimirAlerta('Todos los campos son Obligatorios', 'error');
            return;
        }

        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            empresa: empresaInput.value,
            telefono: telefonoInput.value,
            id: Number(idCliente)
        };

        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.put(clienteActualizado);

        transaction.oncomplete = () => {
            // SweetAlert
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Actualizado Correctamente',
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
                title: 'Correo No Valido',
                showConfirmButton: false,
                timer: 1500
              })
        };
    };

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

    function modoEdicionOut(event) {
        event.preventDefault();
        const url = event.target.href;
        // sweetalert
        Swal.fire({
            title: 'Cancelar Edicion?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si',
        }).then((result) => {
            if (result.isConfirmed) {
                // SweetAlert
                let timerInterval
                Swal.fire({
                title: 'Saliendo Modo Edicion',
                timer: 1500,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading()
                },
                willClose: () => {
                    clearInterval(timerInterval)
                }
                }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    window.location.href = url;
                }
                })
            }
        })
    }
})();