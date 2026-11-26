db.tipos_inversiones.insertOne({
  codigo_tipo_inversion: "TIP-INV-TEST",
  nombre_inversion: "Fondo Prueba VES",
  moneda: "VES",
  rendimiento_esperado_porcentaje: 12.0,
  plazo_minimo_dias: 30,
  monto_minimo: 5000.00,
  nivel_riesgo: "Moderado",
  descripcion: "Registro ficticio para probar inserción.",
  estatus: "activo"
})