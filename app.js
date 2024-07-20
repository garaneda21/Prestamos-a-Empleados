import express from 'express';
import cors from 'cors';
import { pool } from './db/db.js';

const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    console.log("Usuario llegó al servidor");
    res.send({ error: false, msg: "todo ok" })
});

app.get('/tipo_prestamo', async (req, res) => {
    try {
        const [tipo_prestamo] = await pool.query("SELECT * FROM tipo_prestamo");

        res.send({ error: false, tipo_prestamo })
    } catch (error) {
        res.status(400).send({ error: true, msg: "Error Interno" })
    }
})

app.post('/prestamo', async (req, res) => {
    try {
        console.log("Usuario solicitando un préstamo");

        let {
            rut,
            monto_prestamo,
            numero_de_cuotas,
            id_tipo_prestamo
        } = req.body;

        let [[{ tasa_interes: tasa_interes }]] = await pool.query(`
            SELECT tasa_interes FROM tipo_prestamo
            WHERE id_tipo_prestamo = ${id_tipo_prestamo};
        `);

        // calculos de las cuotas
        monto_prestamo = Number(monto_prestamo);
        numero_de_cuotas = Number(numero_de_cuotas);

        let intereses = monto_prestamo * (tasa_interes / 100)
        let monto_pagar = monto_prestamo + intereses;
        let monto_cuota = Math.floor(monto_pagar / numero_de_cuotas)
        let monto_ultima_cuota = monto_cuota + (monto_pagar - monto_cuota * numero_de_cuotas);

        let [[getFec]] = await pool.query(`SELECT MONTH(NOW()) as month, YEAR(NOW()) as year`)

        // fecha que se ira iterando en el bucle for
        let fecha_actual = `${getFec.year}-${getFec.month}-01`

        // aqui se guardaran las cuotas para ingresarlas posteriormente
        let cuotas = [];

        for (let i = 1; i <= numero_de_cuotas; i++) {
            // obtener siguiente fecha inicio cuota
            let [[{
                fecha_emision: fecha_emision,
                fecha_vencimiento: fecha_vencimiento
            }]] = await pool.query(`
                SELECT '${fecha_actual}' + INTERVAL 1 MONTH AS fecha_emision,
                LAST_DAY('${fecha_actual}') AS fecha_vencimiento;
            `)

            fecha_actual = fecha_emision;

            const cuota = [
                i,
                i !== numero_de_cuotas ? monto_cuota : monto_ultima_cuota,
                fecha_actual,
                fecha_vencimiento
            ];

            cuotas.push(cuota);
        }

        // obtener id de la ultima cuota
        const [[{ ultimo_prestamo_id: ultimo_prestamo_id }]] = await pool.query(`
            SELECT id_prestamo AS ultimo_prestamo_id FROM prestamo ORDER BY id_prestamo DESC LIMIT 1;
        `);

        // comprobar si existe el rut
        const [[{ existe: existe }]] = await pool.query(`
            SELECT EXISTS(SELECT 1 FROM empleado WHERE rut = '${rut}') AS existe;
        `);



        // REALIZAR INSERTS
        if (existe === 1) {
            /* 
            MÉTODO UNO A UNO
            */
            //insertar a tabla prestamo
            await pool.query(`
               INSERT INTO prestamo
               VALUES (${ultimo_prestamo_id + 1}, ?, ?, ?, ?, ?);
            `, [monto_prestamo, numero_de_cuotas, monto_pagar, rut, id_tipo_prestamo]);

            // insertar a tabla cuotas
            for (const cuota of cuotas) {
                await pool.query(`
                    INSERT INTO cuota (id_prestamo,numero_cuota,monto_cuota,cuota_fecha_emision,cuota_fecha_vencimiento) 
                    VALUES (${ultimo_prestamo_id + 1},?,?,?,?)
                `, cuota);
            }

            res.send({ error: false, monto_prestamo, tasa_interes, intereses, monto_pagar, cuotas });
        }
        else {
            res.status(400).send({ error: true, msg: "El rut ingresado no se encuentra registrado" })
        }
    } catch (error) {
        res.status(400).send({ error: true, msg: "Ocurrió un problema" })
    }
})

// PARA REGISTRAR USUARIO
app.get('/comunas', async (req, res) => {
    const [comunas] = await pool.query("SELECT * FROM comuna");
    res.send(comunas);
})

app.post('/registrar', async (req, res) => {
    try {
        console.log('usuario realizando registro con rut:', req.body.rut);

        // obtener datos del front
        const {
            rut,
            nombre,
            calle_nombre,
            calle_numero,
            comuna
        } = req.body;

        const direccion = `${calle_nombre} #${calle_numero}`

        // comprobar si existe en la db
        const [[{ existe: existe }]] = await pool.query(`
            SELECT EXISTS(SELECT 1 FROM empleado
            WHERE rut = '${rut}') AS existe`
        )

        if (existe === 0) {
            // realizar insert

            const resul = await pool.query(`INSERT INTO empleado
                VALUES (?, ?, ?, ?)`,
                [rut, nombre, direccion, comuna]
            )

            res.status(200).send({ error: false, resul })
        }
        else {
            res.status(400).send({ error: true, msg: "El usuario ya existe" })
        }
    } catch (error) {
        res.status(400).send({ error: true, msg: "Ocurrio un problema, Compruebe los datos" })
    }
})

app.listen(5000, () => {
    console.log("Servidor Escuchando en el puerto 5000...");
})