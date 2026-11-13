import React, { useCallback, useEffect, useMemo, useState } from "react";
// AJUSTAR la ruta si este archivo está en otra carpeta (el api.js de ventas).
import {
  listarVentas,
  registrarVenta,
  listarClientes,
  listarProductos,
  simularCredito,
} from "../../panel/api";

/* ---------- Utilidades ---------- */

const formatoGs = (n) =>
  `${new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(Number(n) || 0)} Gs.`;

const mensajeError = (e, porDefecto) => {
  const detalle = e?.response?.data?.detail;
  if (typeof detalle === "string") return detalle;
  if (Array.isArray(detalle) && detalle.length) return detalle.map((d) => d.msg).join(". ");
  return porDefecto;
};

const esHoy = (iso) => {
  if (!iso) return false;
  const f = new Date(iso);
  const h = new Date();
  return (
    f.getFullYear() === h.getFullYear() &&
    f.getMonth() === h.getMonth() &&
    f.getDate() === h.getDate()
  );
};

const claseInput =
  "w-full border border-solid border-borde bg-superficie text-texto rounded-md px-3 py-2";
const claseBotonPrimario =
  "bg-violeta text-negro border-0 px-4 py-2 rounded-md cursor-pointer hover:bg-violeta-claro transition disabled:opacity-50 disabled:cursor-not-allowed";
const claseBotonSecundario =
  "bg-lavanda text-texto border-0 px-4 py-2 rounded-md cursor-pointer hover:bg-violeta-claro transition disabled:opacity-50 disabled:cursor-not-allowed";

/* ---------- Formulario: Nuevo Crédito / Venta ---------- */

function FormularioVenta({ clientes, productos, clienteInicial, onVentaRegistrada, onCerrar }) {
  const [clienteId, setClienteId] = useState(clienteInicial ? String(clienteInicial) : "");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [aCredito, setACredito] = useState(true);
  const [cuotas, setCuotas] = useState(12);
  const [tasa, setTasa] = useState(24);
  const [simulacion, setSimulacion] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'ok' | 'error', texto }

  const productosDisponibles = productos.filter((p) => p.activo !== false && p.stock > 0);
  const producto = productos.find((p) => String(p.id) === productoId);
  const total = producto ? Number(producto.precio) * Number(cantidad || 0) : 0;

  // Si cambia cualquier dato, la simulación anterior deja de ser válida.
  useEffect(() => {
    setSimulacion(null);
  }, [productoId, cantidad, cuotas, tasa, aCredito]);

  const validar = () => {
    if (!clienteId) return "Elegí un cliente.";
    if (!producto) return "Elegí un producto.";
    if (!(Number(cantidad) >= 1)) return "La cantidad debe ser al menos 1.";
    if (Number(cantidad) > producto.stock) return `Solo hay ${producto.stock} en stock.`;
    if (aCredito) {
      if (!(Number(cuotas) >= 1 && Number(cuotas) <= 120)) return "Las cuotas deben estar entre 1 y 120.";
      if (!(Number(tasa) >= 0)) return "La tasa anual no puede ser negativa.";
    }
    return null;
  };

  const simular = async () => {
    const problema = validar();
    if (problema) return setMensaje({ tipo: "error", texto: problema });
    setMensaje(null);
    try {
      const resultado = await simularCredito({
        monto: total,
        tasa_anual: Number(tasa),
        cuotas: Number(cuotas),
      });
      setSimulacion(resultado);
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeError(e, "No se pudo simular el crédito.") });
    }
  };

  const confirmar = async () => {
    const problema = validar();
    if (problema) return setMensaje({ tipo: "error", texto: problema });
    setEnviando(true);
    setMensaje(null);
    try {
      const datos = {
        cliente_id: Number(clienteId),
        producto_id: Number(productoId),
        cantidad: Number(cantidad),
      };
      if (aCredito) {
        datos.cuotas = Number(cuotas);
        datos.tasa_anual = Number(tasa);
      }
      await registrarVenta(datos);
      setMensaje({ tipo: "ok", texto: "Venta registrada correctamente." });
      setProductoId("");
      setCantidad(1);
      setSimulacion(null);
      onVentaRegistrada();
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeError(e, "No se pudo registrar la venta.") });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-superficie border border-solid border-borde rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-texto">Nuevo Crédito / Venta</h2>
        <button className={claseBotonSecundario} onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      {mensaje && (
        <div
          className={`px-4 py-3 rounded-md text-sm ${
            mensaje.tipo === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block text-sm text-texto-suave">
          Cliente
          <select className={claseInput} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.username} ({c.email})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-texto-suave">
          Producto
          <select className={claseInput} value={productoId} onChange={(e) => setProductoId(e.target.value)}>
            <option value="">Seleccionar producto...</option>
            {productosDisponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {formatoGs(p.precio)} (stock {p.stock})
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-texto-suave">
          Cantidad
          <input
            type="number"
            min="1"
            className={claseInput}
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </label>

        <div className="text-sm text-texto-suave">
          Total de la venta
          <p className="text-2xl font-bold text-texto mt-1">{formatoGs(total)}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-texto">
        <input type="checkbox" checked={aCredito} onChange={(e) => setACredito(e.target.checked)} />
        Venta a crédito (en cuotas)
      </label>

      {aCredito && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm text-texto-suave">
            Cantidad de cuotas (mensuales)
            <input
              type="number"
              min="1"
              max="120"
              className={claseInput}
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
            />
          </label>
          <label className="block text-sm text-texto-suave">
            Tasa de interés anual (%)
            <input
              type="number"
              min="0"
              step="0.01"
              className={claseInput}
              value={tasa}
              onChange={(e) => setTasa(e.target.value)}
            />
          </label>
        </div>
      )}

      {aCredito && simulacion && (
        <div className="border border-solid border-borde rounded-md p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-texto-suave">Cuota mensual</p>
              <p className="text-xl font-bold text-texto">{formatoGs(simulacion.cuota_mensual)}</p>
            </div>
            <div>
              <p className="text-sm text-texto-suave">Total a pagar</p>
              <p className="text-xl font-bold text-texto">{formatoGs(simulacion.total_a_pagar)}</p>
            </div>
            <div>
              <p className="text-sm text-texto-suave">Intereses</p>
              <p className="text-xl font-bold text-texto">{formatoGs(simulacion.total_intereses)}</p>
            </div>
          </div>

          <details>
            <summary className="cursor-pointer text-sm text-texto-suave">Ver plan de pagos</summary>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm text-left">
                <thead className="text-texto-suave">
                  <tr>
                    <th className="py-1 pr-4">N°</th>
                    <th className="py-1 pr-4">Cuota</th>
                    <th className="py-1 pr-4">Interés</th>
                    <th className="py-1 pr-4">Capital</th>
                    <th className="py-1">Saldo</th>
                  </tr>
                </thead>
                <tbody className="text-texto">
                  {simulacion.plan.map((f) => (
                    <tr key={f.numero}>
                      <td className="py-1 pr-4">{f.numero}</td>
                      <td className="py-1 pr-4">{formatoGs(f.cuota)}</td>
                      <td className="py-1 pr-4">{formatoGs(f.interes)}</td>
                      <td className="py-1 pr-4">{formatoGs(f.capital)}</td>
                      <td className="py-1">{formatoGs(f.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        {aCredito && (
          <button className={claseBotonSecundario} onClick={simular} disabled={enviando}>
            Simular
          </button>
        )}
        <button className={claseBotonPrimario} onClick={confirmar} disabled={enviando}>
          {enviando ? "Registrando..." : "Confirmar venta"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Buscador de clientes ---------- */

function BuscadorClientes({ clientes, ventas, productos, onVender, onCerrar }) {
  const [busqueda, setBusqueda] = useState("");
  const [abiertoId, setAbiertoId] = useState(null);

  const filtrados = clientes.filter((c) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return c.username.toLowerCase().includes(texto) || c.email.toLowerCase().includes(texto);
  });

  const nombreProducto = (id) => productos.find((p) => p.id === id)?.nombre ?? `Producto #${id}`;

  return (
    <div className="bg-superficie border border-solid border-borde rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-texto">Buscar Cliente</h2>
        <button className={claseBotonSecundario} onClick={onCerrar}>
          Cerrar
        </button>
      </div>

      <input
        className={claseInput}
        placeholder="Buscar por nombre de usuario o correo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <p className="text-sm text-texto-suave">No se encontraron clientes.</p>
      ) : (
        <ul className="divide-y divide-borde list-none p-0 m-0">
          {filtrados.map((c) => {
            const compras = ventas.filter((v) => v.cliente_id === c.id);
            const abierto = abiertoId === c.id;
            return (
              <li key={c.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-texto">{c.username}</p>
                    <p className="text-sm text-texto-suave">
                      {c.email} · {compras.length} {compras.length === 1 ? "compra" : "compras"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className={claseBotonSecundario} onClick={() => setAbiertoId(abierto ? null : c.id)}>
                      {abierto ? "Ocultar compras" : "Ver compras"}
                    </button>
                    <button className={claseBotonPrimario} onClick={() => onVender(c.id)}>
                      Vender
                    </button>
                  </div>
                </div>

                {abierto && (
                  <div className="mt-3 overflow-x-auto">
                    {compras.length === 0 ? (
                      <p className="text-sm text-texto-suave">Este cliente todavía no tiene compras.</p>
                    ) : (
                      <table className="w-full text-sm text-left">
                        <thead className="text-texto-suave">
                          <tr>
                            <th className="py-1 pr-4">Fecha</th>
                            <th className="py-1 pr-4">Producto</th>
                            <th className="py-1 pr-4">Cant.</th>
                            <th className="py-1 pr-4">Total</th>
                            <th className="py-1 pr-4">Modalidad</th>
                            <th className="py-1">Cuota mensual</th>
                          </tr>
                        </thead>
                        <tbody className="text-texto">
                          {compras.map((v) => (
                            <tr key={v.id}>
                              <td className="py-1 pr-4">{new Date(v.fecha).toLocaleDateString("es-PY")}</td>
                              <td className="py-1 pr-4">{nombreProducto(v.producto_id)}</td>
                              <td className="py-1 pr-4">{v.cantidad}</td>
                              <td className="py-1 pr-4">{formatoGs(v.total)}</td>
                              <td className="py-1 pr-4">{v.cuotas ? `${v.cuotas} cuotas` : "Contado"}</td>
                              <td className="py-1">{v.cuota_mensual ? formatoGs(v.cuota_mensual) : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Panel principal ---------- */

// El saludo al usuario se muestra en el encabezado (layout/Encabezado.jsx).
export default function VendedorPanel() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [errorCarga, setErrorCarga] = useState(null);
  const [vista, setVista] = useState(null); // null | 'venta' | 'clientes'
  const [clientePreseleccionado, setClientePreseleccionado] = useState(null);

  const cargar = useCallback(async () => {
    const [rVentas, rClientes, rProductos] = await Promise.allSettled([
      listarVentas(),
      listarClientes(),
      listarProductos(),
    ]);
    const fallos = [];
    if (rVentas.status === "fulfilled") setVentas(rVentas.value);
    else fallos.push("ventas");
    if (rClientes.status === "fulfilled") setClientes(rClientes.value);
    else fallos.push("clientes");
    if (rProductos.status === "fulfilled") setProductos(rProductos.value);
    else fallos.push("productos");
    setErrorCarga(fallos.length ? `No se pudieron cargar: ${fallos.join(", ")}.` : null);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const metricas = useMemo(() => {
    const aCredito = ventas.filter((v) => v.cuotas);
    return {
      hoy: ventas.filter((v) => esHoy(v.fecha)).length,
      creditosActivos: aCredito.length,
      cuotaMensualTotal: aCredito.reduce((suma, v) => suma + Number(v.cuota_mensual || 0), 0),
    };
  }, [ventas]);

  const abrirVenta = (clienteId = null) => {
    setClientePreseleccionado(clienteId);
    setVista("venta");
  };

  return (
    <div className="p-6 space-y-6">
      {errorCarga && <div className="px-4 py-3 rounded-md text-sm bg-red-50 text-red-600">{errorCarga}</div>}

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Ventas Registradas Hoy</h3>
          <p className="text-3xl font-bold text-texto mt-2">{metricas.hoy}</p>
        </div>
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Créditos Activos en Cartera</h3>
          <p className="text-3xl font-bold text-texto mt-2">{metricas.creditosActivos}</p>
        </div>
        <div className="bg-superficie border border-solid border-borde p-6 rounded-xl">
          <h3 className="text-texto-suave font-semibold text-sm">Cuota Mensual Total a Cobrar</h3>
          <p className="text-3xl font-bold text-texto mt-2">{formatoGs(metricas.cuotaMensualTotal)}</p>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-superficie border border-solid border-borde rounded-xl p-6">
        <h2 className="text-lg font-semibold text-texto mb-4">Acciones Principales</h2>
        <div className="flex flex-wrap gap-4">
          <button className={claseBotonPrimario} onClick={() => abrirVenta()}>
            + Nuevo Crédito / Venta
          </button>
          <button className={claseBotonSecundario} onClick={() => setVista("clientes")}>
            Buscar Cliente
          </button>
        </div>
      </div>

      {vista === "venta" && (
        <FormularioVenta
          key={clientePreseleccionado ?? "sin-cliente"}
          clientes={clientes}
          productos={productos}
          clienteInicial={clientePreseleccionado}
          onVentaRegistrada={cargar}
          onCerrar={() => setVista(null)}
        />
      )}

      {vista === "clientes" && (
        <BuscadorClientes
          clientes={clientes}
          ventas={ventas}
          productos={productos}
          onVender={abrirVenta}
          onCerrar={() => setVista(null)}
        />
      )}
    </div>
  );
}