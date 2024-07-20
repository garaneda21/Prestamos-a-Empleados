async function registrar(body) {
    const res = await fetch("http://localhost:5000/registrar", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const data = await res.json();

    return data;
}

async function comunas() {
    const res = await fetch("http://localhost:5000/comunas");
    const data = await res.json();

    return data;
}

async function renderForm() {
    try {        
        // si el fetch resulta exitoso, mostrar formulario, sino, mostrar error
        const comuna = await comunas();
    
        const dropdown = document.getElementById("tipos-prestamos");
                
        for (const el of comuna) {
            const {
                id_comuna,
                nombre_comuna
            } = el;
        
            let option = document.createElement('option');
            option.setAttribute('value', id_comuna);
            option.innerHTML = nombre_comuna;
    
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

renderForm();

const form = document.getElementById("formulario");

form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    
    // obtener elementos html
    let elementos = Array.from(evento.target.elements);
    
    // obtener datos ingresadon en el html
    let datos = elementos.reduce((acc, el) => {
        if (!el.name) return acc;
        
        acc[el.name] = el.value;
        return acc;
    }, {})  

    // obtener dato del dropdown
    const dropdown = document.getElementById("tipos-prestamos");
    datos.comuna = dropdown.value;
        
    // cambiar contenidos de la pagina dependiendo del error
    
    if (datos.comuna !== "Escoja un tipo ...") {
        
        const res = await registrar(datos);
        console.log(res);
        
        if(res.error === false) {
            const contenedor = document.getElementById("contenedor");
            contenedor.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Registro Exitoso</h4>
                    <p>Se ha registrado con exito, ahora puede pedir un prestamo en la pagina anterior</p>
                    <hr>
                    <a class="alert-link" href="index.html">Volver al Inicio</a>
                </div>
            `;
        }
        else {
            const alerta = document.getElementById("alerta");
            alerta.innerHTML = `
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error!</strong> ${res.msg}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `
        }
    }
    else {
        modalContent.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>ERROR</strong> You should check in on some of those fields below.
        </div>
        `;
    }

})
