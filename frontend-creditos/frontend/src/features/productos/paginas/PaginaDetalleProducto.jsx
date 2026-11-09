import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerProducto } from "../api";
import { formatearPrecio } from "../formato";

// PENDIENTE (lógica de créditos): estas opciones son de muestra para la parte visual.
// Reemplazar por los planes que devuelva el backend (cantidad de cuotas y tasa de cada uno).
const CUOTAS_DE_MUESTRA = [3, 6, 12, 18, 24];

// Detalle de un producto del catálogo: foto, datos y el bloque para simular el crédito
// o solicitar la compra. Por ahora la simulación es solo visual.
export default function PaginaDetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");
    obtenerProducto(id)
      .then(setProducto)
      .catch((err) =>
        setError(
          err.response?.status === 404
            ? "Este producto no existe o ya no está disponible."
            : "No se pudo cargar el producto.",
        ),
      )
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div className="flex flex-col gap-6 py-5">
      <Link to="/productos" className="w-fit text-sm font-medium text-violeta-oscuro no-underline hover:underline">
        ← Volver al catálogo
      </Link>

      {cargando && <p className="text-sm text-texto-suave">Cargando producto...</p>}
      {error && (
        <p className="rounded-lg bg-peligro-fondo px-4 py-3 text-sm text-peligro">{error}</p>
      )}

      {producto && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <FichaProducto producto={producto} />
          <SimuladorCredito producto={producto} />
        </div>
      )}
    </div>
  );
}

function FichaProducto({ producto }) {
  const disponible = producto.stock > 0;

  return (
    <section className="overflow-hidden rounded-xl border border-solid border-borde bg-superficie">
      <div className="aspect-[4/3] bg-lavanda">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="block h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-texto-suave">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl">{producto.nombre}</h1>
          {!disponible && (
            <span className="rounded-full bg-lavanda px-3 py-1 text-xs text-texto-suave">
              No disponible
            </span>
          )}
        </div>
        <p className="text-xs uppercase tracking-wider text-texto-suave">Código {producto.codigo}</p>
        {producto.descripcion && (
          <p className="text-base leading-relaxed text-texto-suave">{producto.descripcion}</p>
        )}
        <div className="mt-2 flex flex-col gap-1">
          <span className="text-sm text-texto-suave">Precio de contado</span>
          <span className="font-titulo text-4xl font-semibold text-texto">
            {formatearPrecio(producto.precio)}
          </span>
        </div>
      </div>
    </section>
  );
}

function SimuladorCredito({ producto }) {
  const [cuotas, setCuotas] = useState(12);
  const disponible = producto.stock > 0;

  return (
    <section className="flex h-fit flex-col gap-6 rounded-xl border border-solid border-borde bg-superficie p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl">Simulación de crédito</h2>
        <p className="text-sm text-texto-suave">
          Elige en cuántas cuotas quieres pagarlo y mira cuánto pagarías por mes.
        </p>
      </div>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 p-0 text-sm font-medium text-texto">Cantidad de cuotas</legend>
        <div className="flex flex-wrap gap-2">
          {CUOTAS_DE_MUESTRA.map((opcion) => {
            const elegida = opcion === cuotas;
            return (
              <button
                key={opcion}
                type="button"
                onClick={() => setCuotas(opcion)}
                aria-pressed={elegida}
                className={`min-h-11 min-w-16 cursor-pointer rounded-lg border border-solid px-4 text-sm font-medium transition ${
                  elegida
                    ? "border-negro bg-negro text-white"
                    : "border-borde bg-superficie text-texto hover:border-violeta"
                }`}
              >
                {opcion} cuotas
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* PENDIENTE (lógica de créditos): completar con el resultado de la simulación del backend. */}
      <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-solid border-borde bg-borde">
        <Dato titulo="Precio del producto" valor={formatearPrecio(producto.precio)} />
        <Dato titulo="Cantidad de cuotas" valor={cuotas} />
        <Dato titulo="Tasa de interés" valor="—" />
        <Dato titulo="Total a pagar" valor="—" />
        <div className="col-span-2 flex items-center justify-between gap-4 bg-lavanda px-5 py-4">
          <dt className="text-sm font-medium text-texto">Cuota mensual</dt>
          <dd className="m-0 font-titulo text-3xl font-semibold text-texto">—</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled
          title="No anda todavía xd"
          className="min-h-11 flex-1 cursor-not-allowed rounded-lg border border-solid border-negro bg-superficie px-4 text-sm font-medium text-texto opacity-60"
        >
          Simular crédito
        </button>
        <button
          type="button"
          disabled
          title="No anda todavía xd"
          className="min-h-11 flex-1 cursor-not-allowed rounded-lg border-0 bg-violeta px-4 text-sm font-medium text-negro opacity-60"
        >
          {disponible ? "Solicitar compra" : "No disponible"}
        </button>
      </div>
      <p className="-mt-2 text-center text-xs text-texto-suave">
        No anda todavía xd
      </p>
    </section>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div className="flex flex-col gap-1 bg-superficie px-5 py-4">
      <dt className="text-xs text-texto-suave">{titulo}</dt>
      <dd className="m-0 text-lg font-semibold text-texto">{valor}</dd>
    </div>
  );
}
