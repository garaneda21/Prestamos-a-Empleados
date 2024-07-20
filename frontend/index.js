async function obtenerTiposPrestamos() {
    const res = await fetch("http://localhost:5000/tipo_prestamo");
    const data = await res.json();

    return data;
}

async function solicitarPrestamo(body) {
    const res = await fetch("http://localhost:5000/prestamo", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await res.json();

    return data;
}

async function renderForm() {
    try {        
        // si el fetch resulta exitoso, mostrar formulario, sino, mostrar error
        const { tipo_prestamo } = await obtenerTiposPrestamos();
    
        const dropdown = document.getElementById("tipos-prestamos");
                
        for (const prestamo of tipo_prestamo) {
            const {
                id_tipo_prestamo,
                nombre_tipo_prestamo,
                tasa_interes,
            } = prestamo;
    
            const opcion_prestamo = `${nombre_tipo_prestamo} [Tasa de Interés: ${tasa_interes}%]`
    
            let option = document.createElement('option');
            option.setAttribute('value', id_tipo_prestamo);
            option.innerHTML = opcion_prestamo;
    
            dropdown.append(option);
        }
        
    } catch (error) {
        const contenedor = document.getElementById("contenedor");
        contenedor.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${error}
        </div>
        `;
    }
}

async function renderResumen(datos) {
    const contenedor = document.getElementById("contenedor");

    const {
        monto_prestamo,
        tasa_interes,
        intereses,
        monto_pagar,
        cuotas,
        error
    } = await solicitarPrestamo(datos);

    if(error === false) {
        contenedor.innerHTML = `
            <div class="shadow p-3 mb-3 bg-body-tertiary rounded border border-secondary-subtle">
                <div class="row">
                    <div class="col">
                        <h3>Resumen</h3>
                    </div>
                    <div class="col text-end">
                        <button onclick="window.print()" class="btn btn-secondary">Imprimir</button>
                    </div>
                </div>
                <hr>
    
                <div class="row">
                    <div class="col">
                        <p class="fw-bold fs-5">Monto del Préstamo</p>
                        <p>$ ${monto_prestamo}</p>
                    </div>
                    <div class="col">
                        <p class="fw-bold fs-5">Intereses (${tasa_interes}%)</p>
                        <p>$ ${intereses}</p>
                    </div>
                    <div class="col">
                        <p class="fw-bold fs-5"> Monto a Pagar</p>
                        <p class="fw-bold">$ ${monto_pagar}</p>
                    </div>
                </div>
    
                <table class="shadow table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th scope="col">N° Cuota</th>
                            <th scope="col">Monto Cuota</th>
                            <th scope="col">Fecha de Emisión</th>
                            <th scope="col">Fecha de Vencimiento</th>
                        </tr>
                    </thead>
                    <tbody id="tbody" class="table-group-divider">
                        
                    </tbody>
                </table>
            </div>
        `;

        const tbody = document.getElementById("tbody")
        for (const cuota of cuotas) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th scope="row"># ${cuota[0]}</th>
                <td>${cuota[1]}</td>
                <td>${cuota[2]}</td>
                <td>${cuota[3]}</td>
            `
            tbody.append(tr);
        }
    }
    else {
        const alerta = document.getElementById("alerta");
        alerta.innerHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <strong>Error!</strong> ${res.msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
}

const validarDatos = (datos) => {
    for (const key in datos) {
        if (datos[key] === "")
            return false
    }
    
    return true
}

renderForm();

const form = document.getElementById("formulario");

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    // obtener elementos html
    let elementos = Array.from(evento.target.elements);

    // obtener datos ingresados en el html
    let datos = elementos.reduce((acc, el) => {
        if (!el.name) return acc;

        acc[el.name] = el.value;
        return acc;
    }, {})

    const {
        rut,
        monto_prestamo,
        numero_de_cuotas,
    } = datos;

    // obtener modal
    const modalContent = document.getElementById("confirmar");
    // obtener dato del dropdown
    const dropdown = document.getElementById("tipos-prestamos");


    if (validarDatos(datos) && dropdown.value !== "Escoja un tipo ...") {
        id_tipo_prestamo = dropdown.value;
        nombre_tipo_prestamo = dropdown.options[dropdown.selectedIndex].text;

        datos.id_tipo_prestamo = id_tipo_prestamo;

        modalContent.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <p class="fw-bold">Rut</p>
                </div>
                <div class="col-md-8">${rut}</div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p class="fw-bold">Mónto Prestamo</p>
                </div>
                <div class="col-md-8">${monto_prestamo}</div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p class="fw-bold">Numero de Cuotas</p>
                </div>
                <div class="col-md-8">${numero_de_cuotas}</div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <p class="fw-bold">Tipo de Préstamo</p>
                </div>
                <div class="col-md-8">${nombre_tipo_prestamo}</div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Volver</button>
                <button id="modalButton" class="btn btn-primary" data-bs-dismiss="modal">
                    Confirmar Datos
                </button>
            </div>
        `;

        modalButton = document.getElementById("modalButton");
        modalButton.addEventListener('click', () => {
            renderResumen(datos);
        });
    }
    else {
        modalContent.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>ERROR</strong> You should check in on some of those fields below.
        </div>
        `;
    }
})

