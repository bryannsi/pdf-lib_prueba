const { pool } = require("./database");

const getSender = (idEmisor) => {
  return pool.one("SELECT e.e_nombre emisor_nombre, e.emisor_numero emisor_identif, e.emisor_telefono_numtelefono emisor_telefono, UPPER(CONCAT(e.e_otras_senas, ', ', d.nombre_distrito, ', ', c.nombre_canton, ', ', p.nombre_provincia)) emisor_direccion, e.e_correoelectronico emisor_correo  FROM emisor e LEFT JOIN provincia p ON e.e_provincia = p.id LEFT JOIN canton c ON e.e_canton = c.id AND c.codigo_provincia = p.codigo_provincia LEFT JOIN distrito d ON e.e_distrito = d.codigo_distrito AND c.id = d.codigo_canton WHERE e.idemisor = $1",
  idEmisor
  );
};

const getReceiver = (idReceptor) => {
  return pool.one(
    "SELECT r.nombre receptor_nombre, r.identificacion receptor_identif, r.receptor_telefono_numtelefono receptor_telefono, UPPER(CONCAT(r.otras_senas, ', ', d.nombre_distrito, ', ', c.nombre_canton, ', ', p.nombre_provincia)) receptor_direccion, r.correoelectronico correo FROM receptor r INNER JOIN provincia p ON r.provincia = p.id INNER JOIN canton c ON r.canton = c.id AND c.codigo_provincia = p.codigo_provincia INNER JOIN distrito d ON r.distrito = d.codigo_distrito AND c.id = d.codigo_canton WHERE r.idreceptor = $1",
    idReceptor
  );
};

const getHeader = (idFactura) => {
  return pool.one(
    "SELECT f.consecutivo, f.clavenumerica clave_numerica, f.tipo_comprobante, to_char(f.fechaemision, 'DD-MM-YYYY HH24:MI:SS') fecha_factura, f.totaldescuentos monto_descuento, f.subtotal monto_subtotal, f.totalmercanciasgravadas monto_mercancia_gravada, f.totalmercanciaexonerada monto_mercancia_exonerada, f.totalmercanciasexentas monto_mercancia_exenta, f.totalimpuesto monto_iva, f.totalcomprobante monto_total, f.idreceptor, f.idemisor FROM factura f WHERE f.idfactura = $1",
    idFactura
  );
};

const getDetail = (idFactura) => {
  return pool.any(
    "SELECT p.codigoproducto codigo, o.cantidadproducto cantidad, o.unidadmedida unidad, o.detalle, o.preciounitarioproducto precio_unitario, o.subtotal sub_total, o.total_orden total_linea FROM orden o LEFT JOIN producto p ON o.idproducto = p.idproducto WHERE idfactura = $1",
    idFactura
  );
};

exports.getSender = getSender;
exports.getReceiver = getReceiver;
exports.getHeader = getHeader;
exports.getDetail = getDetail;
