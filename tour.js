// ============================================================
//  CONVIVE360 — Visita guiada (modo demostración)
//  Resalta cada parte de la pantalla con una explicación breve.
//  Se puede salir en cualquier momento y volver a iniciarla.
// ============================================================
(function () {
  "use strict";
  const CLAVE = "cv360_tour";
  const LS = window.localStorage;
  const leer = () => { try { return JSON.parse(LS.getItem(CLAVE)) || { activo: false, hecho: {} }; } catch (e) { return { activo: false, hecho: {} }; } };
  const guardar = e => { try { LS.setItem(CLAVE, JSON.stringify(e)); } catch (x) { } };
  const go = n => typeof window[n] === "function" ? window[n] : () => { };

  // ---------- Pasos de cada pantalla ----------
  const PASOS = {
    "inicio-direccion": [
      { titulo: "Bienvenida a CONVIVE360", texto: "Está viendo la cuenta de Dirección de una escuela de demostración. Todos los nombres y reportes son ficticios. Use «Siguiente» para recorrer las funciones." },
      { sel: "#vInicio .bloque", titulo: "Alertas de alumnos", texto: "Al entrar, Dirección ve qué alumnos acumulan 3 o más reportes en los últimos 30 días, de todas las áreas. Un toque abre su expediente completo." },
      { antes: () => go("irA")("usuarios"), sel: "#vUsuarios .bloque", titulo: "Personal y permisos", texto: "Dirección da de alta a cada persona, con su área e iniciales. A cada prefecto le puede asignar grados a su cargo para que vea los reportes de esos alumnos." },
      { antes: () => go("irA")("historial"), sel: "#vHistorial .bloque", titulo: "Reportes anteriores", texto: "Aquí se asignan a su autor los reportes que vienen de una versión anterior del sistema." },
      { antes: () => go("irA")("bitacora"), sel: "#vBitacora .bloque", titulo: "Bitácora", texto: "Registra quién entra, quién consulta la información completa y cada cambio de usuarios. Sirve para rendir cuentas del uso de los datos." },
      { antes: () => go("irA")("inicio"), sel: "[data-vista=reportes]", titulo: "Reportes y expedientes", texto: "Aquí Dirección consulta todos los reportes, notas y fotos, e imprime expedientes.", boton: "Ir a reportes y expedientes", ir: "direccion.html" }
    ],
    "direccion": [
      { sel: "#sejAlertas", titulo: "Aviso de alumnos", texto: "El mismo aviso aparece aquí. Las tarjetas de esos alumnos llevan la marca roja «en 30 días»." },
      { antes: () => go("switchTab")("history"), sel: "button[onclick=\"sincronizarDesdeNube()\"]", titulo: "Sincronizar", texto: "Trae los reportes, notas y fotos nuevas de Prefectura y Gabinete. Conviene hacerlo al iniciar la jornada." },
      { antes: () => go("switchTab")("history"), sel: "#historyListContainer", titulo: "Historial de la escuela", texto: "Los reportes se agrupan por área con su color. El ícono de cámara abre las fotos de evidencia y «Seguimiento» muestra las notas del caso." },
      { sel: "#historyListContainer button[onclick*=\"abrirExpediente\"]", titulo: "Expediente del alumno", texto: "Reúne todos los reportes de un alumno, de cualquier área y fecha, con notas y fotos, listo para imprimir con espacios de firma." },
      { antes: () => go("switchTab")("form"), sel: "#formatSelector", titulo: "Dirección también captura", texto: "Dirección levanta sus propios reportes y citatorios con los mismos formatos." },
      { titulo: "Fin del recorrido de Dirección", texto: "Use «Cambiar de rol» en la banda de demostración para ver cómo trabaja Prefectura o Gabinete." }
    ],
    "captura-prefectura": [
      { titulo: "Terminal de Prefectura", texto: "Cada prefecto entra con su propio usuario. Ve sus reportes y, si Dirección le asigna grados, también los de esos alumnos. Funciona con o sin internet." },
      { sel: "#schoolDependency", titulo: "Datos de la escuela", texto: "Se capturan una sola vez en cada aparato y forman el encabezado de los documentos." },
      { sel: "#studentName", titulo: "Buscar al alumno", texto: "Se escribe parte del nombre y se elige de la lista: grado, grupo y tutor se llenan solos. Pruebe escribiendo «die»." },
      { sel: "#formatSelector", titulo: "Formatos", texto: "Incidencia leve, moderada o grave, citatorio, omisión de actividades y formato libre." },
      { sel: "#presetHechos", titulo: "Hechos frecuentes", texto: "Textos de ejemplo para empezar más rápido; después se ajustan al caso." },
      { sel: "#sejFotosCaptura", titulo: "Fotos de evidencia", texto: "Hasta 3 por reporte, desde la cámara o la galería. Se reducen solas, sin datos de ubicación, y solo las ven quien las tomó y Dirección." },
      { sel: "button[onclick=\"saveReport()\"]", titulo: "Guardar", texto: "El folio se asigna solo, aun sin internet. El reporte guardado ya no se modifica: lo que pase después se agrega como nota de seguimiento." },
      { sel: "button[onclick=\"window.print()\"]", titulo: "Imprimir", texto: "El documento sale listo para firmar con los datos de la escuela." },
      { antes: () => go("switchTab")("history"), sel: "#historyListContainer", titulo: "Historial", texto: "Sus reportes y los de su grado, marcados como «De tu grado». A cualquiera puede agregarle notas de seguimiento, que también le llegan a quien lo capturó." },
      { sel: "button[onclick=\"sincronizarPendientes()\"]", titulo: "Enviar y recibir", texto: "Envía a Dirección lo pendiente y trae las notas nuevas. Al recuperar internet lo hace solo." },
      { titulo: "Fin del recorrido de Prefectura", texto: "Use «Cambiar de rol» en la banda de demostración para ver Gabinete o Dirección." }
    ],
    "captura-gabinete": [
      { titulo: "Terminal de Gabinete psicopedagógico", texto: "Lo que registra Gabinete es confidencial: Prefectura no lo ve, salvo los reportes que Gabinete decida compartir." },
      { antes: () => { const s = document.getElementById("formatSelector"); if (s) { s.value = "cita_psicopedagogica"; go("updateFormType")(); } }, sel: "#additionalFieldsArea", titulo: "Cita psicopedagógica", texto: "Formato propio de Gabinete: tipo de cita, fecha y hora, y compromisos con la familia." },
      { sel: "#presetHechos", titulo: "Motivos frecuentes", texto: "Primera cita, seguimiento, entrevista con la familia, canalización o cierre de caso." },
      { antes: () => go("switchTab")("history"), sel: "#historyListContainer", titulo: "Compartir con prefectura", texto: "En cada reporte enviado, Gabinete puede tocar «Compartir con prefectura» para que la prefecta del grado lo vea. Se puede dejar de compartir en cualquier momento." },
      { titulo: "Fin del recorrido de Gabinete", texto: "Use «Cambiar de rol» en la banda de demostración para ver Prefectura o Dirección." }
    ]
  };

  // ---------- Interfaz ----------
  let pasos = [], i = 0, clave = "", capa, marco, caja;
  function crearUI() {
    if (capa) return;
    capa = document.createElement("div");
    capa.style.cssText = "position:fixed;inset:0;z-index:9997";
    marco = document.createElement("div");
    marco.style.cssText = "position:fixed;z-index:9998;border:3px solid #1BA3A6;border-radius:10px;box-shadow:0 0 0 9999px rgba(12,42,75,.55);transition:all .25s ease;pointer-events:none";
    caja = document.createElement("div");
    caja.setAttribute("role", "dialog");
    caja.style.cssText = "position:fixed;z-index:9999;width:min(340px,92vw);background:#fff;color:#14233A;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:14px 16px;font-family:'Segoe UI',Roboto,system-ui,sans-serif;font-size:14px;line-height:1.45";
    document.body.append(capa, marco, caja);
    window.addEventListener("resize", () => colocar(pasos[i]));
  }
  function quitarUI() { [capa, marco, caja].forEach(e => e && e.remove()); capa = marco = caja = null; }

  function mostrar() {
    const p = pasos[i];
    if (!p) return;
    crearUI();
    try { if (p.antes) p.antes(); } catch (e) { }
    setTimeout(() => colocar(p), 250);
  }

  function colocar(p) {
    if (!p || !caja) return;
    const el = p.sel ? document.querySelector(p.sel) : null;
    const visible = el && el.getClientRects().length;
    if (visible) el.scrollIntoView({ block: "center" });
    const ultimo = i === pasos.length - 1;
    caja.innerHTML = `
      <div style="font-size:11px;font-weight:700;letter-spacing:.06em;color:#0E7476;text-transform:uppercase">Visita guiada · ${i + 1} de ${pasos.length}</div>
      <div style="font-weight:800;font-size:16px;margin:4px 0 6px;color:#0C2A4B">${p.titulo}</div>
      <div>${p.texto}</div>
      <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap">
        <button data-t="salir" style="background:none;border:0;color:#5B6B7C;text-decoration:underline;cursor:pointer;font-size:13px;padding:0">Salir de la visita guiada</button>
        <span style="display:flex;gap:6px">
          ${i > 0 ? `<button data-t="ant" style="border:1px solid #0C2A4B;background:#fff;color:#0C2A4B;border-radius:8px;padding:6px 10px;cursor:pointer;font-weight:600">Anterior</button>` : ""}
          <button data-t="sig" style="border:0;background:#0C2A4B;color:#fff;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:700">${p.boton || (ultimo ? "Terminar" : "Siguiente")}</button>
        </span>
      </div>`;
    caja.querySelector("[data-t=salir]").onclick = salir;
    const ant = caja.querySelector("[data-t=ant]"); if (ant) ant.onclick = () => { i--; mostrar(); };
    caja.querySelector("[data-t=sig]").onclick = siguiente;

    setTimeout(() => {
      if (!caja) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      if (visible) {
        const r = el.getBoundingClientRect(), m = 6;
        Object.assign(marco.style, { display: "block", left: (r.left - m) + "px", top: (r.top - m) + "px", width: (r.width + 2 * m) + "px", height: Math.min(r.height + 2 * m, vh * .6) + "px" });
        const cw = caja.offsetWidth, ch = caja.offsetHeight;
        let top = r.bottom + 14; if (top + ch > vh - 8) top = Math.max(8, r.top - ch - 14);
        let left = Math.min(Math.max(8, r.left), vw - cw - 8);
        Object.assign(caja.style, { left: left + "px", top: top + "px" });
      } else {
        Object.assign(marco.style, { display: "block", left: (vw / 2) + "px", top: (vh / 2) + "px", width: "0px", height: "0px" });
        Object.assign(caja.style, { left: Math.max(8, (vw - caja.offsetWidth) / 2) + "px", top: Math.max(8, (vh - caja.offsetHeight) / 2) + "px" });
      }
    }, 300);
  }

  function siguiente() {
    const p = pasos[i];
    if (i < pasos.length - 1) { i++; mostrar(); return; }
    const e = leer(); e.hecho = e.hecho || {}; e.hecho[clave] = true; guardar(e);
    quitarUI();
    if (p.ir) location.href = p.ir;
  }

  function salir() {
    guardar({ activo: false, hecho: {} });
    quitarUI();
  }

  window.CV360Tour = {
    // Inicia los pasos de esta pantalla si la visita está activa y no se ha hecho aquí
    iniciar(k) {
      clave = k; pasos = PASOS[k] || [];
      const e = leer();
      if (!e.activo || (e.hecho && e.hecho[k]) || !pasos.length) return;
      i = 0; setTimeout(mostrar, 600);
    },
    // Botón «Visita guiada»: empieza de nuevo en esta pantalla
    reiniciar(k) { guardar({ activo: true, hecho: {} }); clave = k; pasos = PASOS[k] || []; i = 0; mostrar(); },
    activar(si) { guardar({ activo: !!si, hecho: {} }); },
    salir
  };
})();
