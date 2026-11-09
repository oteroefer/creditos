// Formato de precios del catálogo (separador de miles, hasta 2 decimales, sin símbolo de moneda).
const formatoPrecio = new Intl.NumberFormat("es", { maximumFractionDigits: 2 });

export function formatearPrecio(valor) {
  return formatoPrecio.format(valor);
}
