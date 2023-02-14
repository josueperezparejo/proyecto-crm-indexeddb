(function () {
    // Variables & Selectores
    let DB;
    const listadoClientes = document.querySelector('#listado-clientes');

    // Eventos
    document.addEventListener('DOMContentLoaded', () => {
        crearDB();

        if (window.indexedDB.open('crm', 1)) {
            imprimirClientes();
        }
    });

    // Funciones
    function crearDB() {
        const crearDB = window.indexedDB.open('crm', 1);

        crearDB.onerror = function () {
            // SweetAlert
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Hubo un Error',
                showConfirmButton: false,
                timer: 1500
              })
        };

        crearDB.onsuccess = function () {
            DB = crearDB.result;
        };

        crearDB.onupgradeneeded = function (event) {
            const db = event.target.result;

            const objectStore = db.createObjectStore('crm', { keyPath: 'id', autoIncrement: true });

            objectStore.createIndex('nombre', 'nombre', { unique: false });
            objectStore.createIndex('email', 'email', { unique: true });
            objectStore.createIndex('telefono', 'telefono', { unique: false });
            objectStore.createIndex('empresa', 'empresa', { unique: false });
            objectStore.createIndex('id', 'id', { unique: true });
        };
    };

    function imprimirClientes() {
        limpiarHTML();

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

            const objectStore = DB.transaction('crm').objectStore('crm');

            objectStore.openCursor().onsuccess = function (event) {
                const cursor = event.target.result;

                // Revisa si hay Citas para Imprimir 
                const total = objectStore.count();
                total.onsuccess = function () {
                    if (total.result <= 0) {
                        const tablaClientes = document.querySelector('#tabla-clientes');
                        const noClientes = document.createElement('p');
                        noClientes.classList.add('text-center', 'text-danger', 'fw-bold', 'my-4');
                        noClientes.textContent = 'Aun no hay Clientes, Agrega algunos...';

                        tablaClientes.appendChild(noClientes);
                        return
                    }
                };

                // Si hay citas Itera sobre ellas y las Imprime en el HTML
                if (cursor) {
                    const { nombre, empresa, email, telefono, id } = cursor.value;

                    const trCitas = document.createElement('tr');
                    trCitas.classList.add('align-items-center');
                    trCitas.dataset.id = id;

                    const tdNombre = document.createElement('td');
                    tdNombre.classList.add('text-center')

                    const nombreParrafo = document.createElement('p');
                    nombreParrafo.classList.add('fw-bold', 'text-capitalize');
                    nombreParrafo.textContent = `${nombre}`;

                    tdNombre.appendChild(nombreParrafo);

                    const tdCorreo = document.createElement('td');
                    tdCorreo.classList.add('text-center')

                    const correoParrafo = document.createElement('p');
                    correoParrafo.classList.add('text-success');
                    correoParrafo.textContent = `${email}`;

                    tdCorreo.appendChild(correoParrafo);

                    const tdTelefono = document.createElement('td');
                    tdTelefono.classList.add('text-center');

                    const telefonoParrafo = document.createElement('p');
                    telefonoParrafo.classList.add('text-gray-700');
                    telefonoParrafo.textContent = `${telefono}`;

                    tdTelefono.appendChild(telefonoParrafo);

                    const tdEmpresa = document.createElement('td');
                    tdEmpresa.classList.add('text-center');

                    const empresaParrafo = document.createElement('p');
                    empresaParrafo.classList.add('text-gray-600');
                    empresaParrafo.textContent = `${empresa}`;

                    tdEmpresa.appendChild(empresaParrafo);

                    const tdEditar = document.createElement('td');
                    tdEditar.classList.add('text-center');

                    const btnEditar = document.createElement('a');
                    btnEditar.classList.add('btn', 'btn-success', 'btn-sm');
                    btnEditar.textContent = 'Editar';
                    btnEditar.onclick = (event) => {
                        event.preventDefault();

                        // SweetAlert
                        let timerInterval
                        Swal.fire({
                            title: 'Cargando Modo Edicion',
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
                                window.location.href = `editar-cliente.html?id=${id}`;
                            }
                        })
                    }

                    tdEditar.appendChild(btnEditar);

                    const tdEliminar = document.createElement('td');
                    tdEliminar.classList.add('text-center');

                    const btnEliminar = document.createElement('a');
                    btnEliminar.classList.add('btn', 'btn-danger', 'btn-sm');
                    btnEliminar.textContent = 'Eliminar';
                    btnEditar.href = '#';
                    btnEliminar.onclick = (event) => {
                        event.preventDefault();
                        // sweetalert
                        Swal.fire({
                            title: 'Estas Seguro?',
                            text: "No podras recuperarlo!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            cancelButtonText: 'Cancelar',
                            confirmButtonText: 'Si, Eliminarlo!'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire(
                                    'Eliminado!',
                                    'Eliminado Correctamente.',
                                    'success'
                                )
                                eliminarCita(id)
                            }
                        })
                    }

                    tdEliminar.appendChild(btnEliminar);

                    trCitas.appendChild(tdNombre);
                    trCitas.appendChild(tdCorreo);
                    trCitas.appendChild(tdTelefono);
                    trCitas.appendChild(tdEmpresa);
                    trCitas.appendChild(tdEditar);
                    trCitas.appendChild(tdEliminar);

                    listadoClientes.appendChild(trCitas);

                    cursor.continue();
                };
            };
        };
    };

    function limpiarHTML() {
        while (listadoClientes.firstChild) {
            listadoClientes.removeChild(listadoClientes.firstChild)
        }
    };

    function eliminarCita(idCliente) {
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        const resultado = objectStore.delete(idCliente);

        transaction.oncomplete = () => {
            imprimirClientes()
        }

        transaction.onerror = () => {
            // SweetAlert
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Hubo un Error',
                showConfirmButton: false,
                timer: 1500
              })
        }
    };
})();