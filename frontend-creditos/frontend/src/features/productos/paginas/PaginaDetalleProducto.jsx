import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerProducto } from "../api";
import { formatearPrecio } from "../formato";
import { simularCredito, solicitarCompra } from "../../panel/api";

const OPCIONES_DE_CUOTAS = [3, 6, 12, 18, 24];

// Tasa de interés anual de las compras a crédito hechas por el cliente desde la web.
// Debe coincidir con TASA_ANUAL_ONLINE de backend/src/app/ventas/router.py (ahí es donde
// realmente se aplica: el servidor no toma la tasa que mande el navegador).
const TASA_ANUAL = 24;

const mensajeError = (err, porDefecto) => {
  const detalle = err?.response?.data?.detail;
  if (typeof detalle === "string") return detalle;
  if (Array.isArray(detalle) && detalle.length) return detalle.map((d) => d.msg).join(". ");
  return porDefecto;
};

// Detalle de un producto del catálogo: foto, datos y el bloque para simular el crédito
// y solicitar la compra.
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

  // Vuelve a pedir el producto (por ejemplo, para actualizar el stock tras una compra).
  const recargarProducto = () => {
    obtenerProducto(id)
      .then(setProducto)
      .catch(() => {});
  };

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
          <SimuladorCredito producto={producto} onCompraRealizada={recargarProducto} />
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

function SimuladorCredito({ producto, onCompraRealizada }) {
  const [cuotas, setCuotas] = useState(12);
  const [simulacion, setSimulacion] = useState(null);
  const [simulando, setSimulando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [confirmando, setConfirmando] = useState(false); // modal de confirmación abierto
  const [aviso, setAviso] = useState(null); // { tipo: "ok" | "error", texto }
  const disponible = producto.stock > 0;

  // Si el cliente elige otra cantidad de cuotas, la simulación anterior ya no vale.
  useEffect(() => {
    setSimulacion(null);
    setAviso(null);
  }, [cuotas]);

  const simular = async () => {
    setSimulando(true);
    setAviso(null);
    try {
      const resultado = await simularCredito({
        monto: Number(producto.precio),
        tasa_anual: TASA_ANUAL,
        cuotas,
      });
      setSimulacion(resultado);
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err, "No se pudo simular el crédito.") });
    } finally {
      setSimulando(false);
    }
  };

  const confirmarCompra = async () => {
    if (!simulacion) return;

    setSolicitando(true);
    setAviso(null);
    try {
      await solicitarCompra({ producto_id: producto.id, cuotas });
      setAviso({
        tipo: "ok",
        texto: `¡Compra registrada! Vas a pagar ${cuotas} cuotas mensuales de ${formatearPrecio(simulacion.cuota_mensual)}.`,
      });
      setSimulacion(null);
      onCompraRealizada();
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err, "No se pudo registrar la compra.") });
    } finally {
      setSolicitando(false);
      setConfirmando(false);
    }
  };

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
          {OPCIONES_DE_CUOTAS.map((opcion) => {
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

      <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-solid border-borde bg-borde">
        <Dato titulo="Precio del producto" valor={formatearPrecio(producto.precio)} />
        <Dato titulo="Cantidad de cuotas" valor={cuotas} />
        <Dato
          titulo="Tasa de interés"
          valor={simulacion ? `${Number(simulacion.tasa_anual)}% anual` : "—"}
        />
        <Dato
          titulo="Total a pagar"
          valor={simulacion ? formatearPrecio(simulacion.total_a_pagar) : "—"}
        />
        <div className="col-span-2 flex items-center justify-between gap-4 bg-lavanda px-5 py-4">
          <dt className="text-sm font-medium text-texto">Cuota mensual</dt>
          <dd className="m-0 font-titulo text-3xl font-semibold text-texto">
            {simulacion ? formatearPrecio(simulacion.cuota_mensual) : "—"}
          </dd>
        </div>
      </dl>

      {simulacion && (
        <details className="text-sm text-texto">
          <summary className="cursor-pointer text-texto-suave">Ver plan de pagos</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-texto-suave">
                <tr>
                  <th className="py-1 pr-4 font-medium">N°</th>
                  <th className="py-1 pr-4 font-medium">Cuota</th>
                  <th className="py-1 pr-4 font-medium">Interés</th>
                  <th className="py-1 pr-4 font-medium">Capital</th>
                  <th className="py-1 font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {simulacion.plan.map((fila) => (
                  <tr key={fila.numero}>
                    <td className="py-1 pr-4">{fila.numero}</td>
                    <td className="py-1 pr-4">{formatearPrecio(fila.cuota)}</td>
                    <td className="py-1 pr-4">{formatearPrecio(fila.interes)}</td>
                    <td className="py-1 pr-4">{formatearPrecio(fila.capital)}</td>
                    <td className="py-1">{formatearPrecio(fila.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {aviso && (
        <p
          className={`m-0 rounded-lg px-4 py-3 text-sm ${
            aviso.tipo === "ok" ? "bg-green-50 text-green-700" : "bg-peligro-fondo text-peligro"
          }`}
        >
          {aviso.texto}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={simular}
          disabled={simulando || solicitando}
          className="min-h-11 flex-1 cursor-pointer rounded-lg border border-solid border-negro bg-superficie px-4 text-sm font-medium text-texto transition hover:bg-lavanda disabled:cursor-not-allowed disabled:opacity-60"
        >
          {simulando ? "Calculando..." : "Simular crédito"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          disabled={!disponible || !simulacion || solicitando}
          title={disponible && !simulacion ? "Primero simulá el crédito" : undefined}
          className="min-h-11 flex-1 cursor-pointer rounded-lg border-0 bg-violeta px-4 text-sm font-medium text-negro transition hover:bg-violeta-claro disabled:cursor-not-allowed disabled:opacity-60"
        >
          {solicitando ? "Procesando..." : disponible ? "Solicitar compra" : "No disponible"}
        </button>
      </div>
      {disponible && !simulacion && (
        <p className="-mt-2 text-center text-xs text-texto-suave">
          Simulá el crédito para poder solicitar la compra.
        </p>
      )}

      {confirmando && simulacion && (
        <ModalConfirmacion
          producto={producto}
          cuotas={cuotas}
          simulacion={simulacion}
          procesando={solicitando}
          onCancelar={() => setConfirmando(false)}
          onConfirmar={confirmarCompra}
        />
      )}
    </section>
  );
}

// Ventana de confirmación antes de registrar la compra. Se cierra con Cancelar, con la
// tecla Escape o haciendo clic fuera de la ventana (salvo mientras se está procesando).
function ModalConfirmacion({ producto, cuotas, simulacion, procesando, onCancelar, onConfirmar }) {
  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === "Escape" && !procesando) onCancelar();
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [procesando, onCancelar]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!procesando) onCancelar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-confirmacion"
        onClick={(evento) => evento.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-solid border-borde bg-superficie p-6 shadow-xl"
      >
        <div className="flex flex-col gap-1">
          <h2 id="titulo-confirmacion" className="text-2xl">
            Confirmar compra
          </h2>
          <p className="m-0 text-sm text-texto-suave">Revisá los datos antes de confirmar.</p>
        </div>

        <dl className="m-0 flex flex-col gap-3">
          <FilaResumen titulo="Producto" valor={producto.nombre} />
          <FilaResumen titulo="Precio de contado" valor={formatearPrecio(producto.precio)} />
          <FilaResumen titulo="Cantidad de cuotas" valor={cuotas} />
          <FilaResumen titulo="Tasa de interés" valor={`${Number(simulacion.tasa_anual)}% anual`} />
          <FilaResumen titulo="Total a pagar" valor={formatearPrecio(simulacion.total_a_pagar)} />
        </dl>

        <div className="flex items-center justify-between gap-4 rounded-lg bg-lavanda px-5 py-4">
          <span className="text-sm font-medium text-texto">Cuota mensual</span>
          <span className="font-titulo text-3xl font-semibold text-texto">
            {formatearPrecio(simulacion.cuota_mensual)}
          </span>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancelar}
            disabled={procesando}
            className="min-h-11 flex-1 cursor-pointer rounded-lg border border-solid border-negro bg-superficie px-4 text-sm font-medium text-texto transition hover:bg-lavanda disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={procesando}
            autoFocus
            className="min-h-11 flex-1 cursor-pointer rounded-lg border-0 bg-violeta px-4 text-sm font-medium text-negro transition hover:bg-violeta-claro disabled:cursor-not-allowed disabled:opacity-60"
          >
            {procesando ? "Procesando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilaResumen({ titulo, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-texto-suave">{titulo}</dt>
      <dd className="m-0 text-right text-base font-semibold text-texto">{valor}</dd>
    </div>
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