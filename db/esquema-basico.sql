-- CREAR BASE DE DATOS
CREATE DATABASE empresa_prestamos;
USE empresa_prestamos;

-- CREAR TABLAS

CREATE TABLE empleado (
	rut varchar(20) not null,
    nombre varchar(50),
    direccion varchar(50),
    id_comuna int,
    primary key (rut)
);

CREATE TABLE comuna (
	id_comuna int not null,
    nombre_comuna varchar(50),
    primary key (id_comuna)
);

CREATE TABLE prestamo (
	id_prestamo int not null,
    monto_prestamo int,
    cantidad_cuotas int,
    monto_pagar int,
	rut varchar(20),
    id_tipo_prestamo int,
    primary key (id_prestamo)
);

CREATE TABLE tipo_prestamo(
	id_tipo_prestamo int not null,
    nombre_tipo_prestamo varchar(50),
    tasa_interes int,
    primary key (id_tipo_prestamo)
);

CREATE TABLE cuota (
	id_prestamo int not null,
    numero_cuota int not null,
    monto_cuota int,
    cuota_fecha_emision datetime,
    cuota_fecha_vencimiento datetime,
    cuota_fecha_pago datetime,
    primary key (id_prestamo, numero_cuota)
);

-- DEFINICION DE FK's
ALTER TABLE empleado 
ADD CONSTRAINT FOREIGN KEY (id_comuna) REFERENCES comuna(id_comuna);

ALTER TABLE prestamo 
ADD CONSTRAINT FOREIGN KEY (rut) REFERENCES empleado(rut),
ADD CONSTRAINT FOREIGN KEY (id_tipo_prestamo) REFERENCES tipo_prestamo(id_tipo_prestamo);

ALTER TABLE cuota 
ADD CONSTRAINT FOREIGN KEY (id_prestamo) REFERENCES prestamo(id_prestamo)