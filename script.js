// Base de datos simulada con estructura JSON (vector de ejemplo)
let plantas = [
  {
    id: 1,
    nombre: "Pothos",
    fechaAdquisicion: "2024-01-15",
    tipo: "Interior",
    cuidados: "Riego moderado, luz indirecta",
    imagen: null,
  },
  {
    id: 2,
    nombre: "Rosa",
    fechaAdquisicion: "2024-02-20",
    tipo: "Exterior",
    cuidados: "Riego abundante, pleno sol",
    imagen: null,
  },
];

// Configuración de la API de Perenual
const API_CONFIG = {
  perenual: {
    baseUrl: "https://perenual.com/api",
    apiKey: "sk-nSWN687047006832811382",
  },
};

// Referencias a elementos del DOM
const formulario = document.getElementById("plantForm");
const contenedorPlantas = document.getElementById("plantsContainer");
const mensajeBienvenida = document.getElementById("welcomeMessage");

// Carga inicial cuando se carga el documento
document.addEventListener("DOMContentLoaded", function () {
  cargarPlantasDeStorage();
  cargarMensajeBienvenida();
  mostrarPlantas();
});

// Evento del formulario
formulario.addEventListener("submit", function (event) {
  event.preventDefault();

  let datosFormulario = new FormData(formulario);

  // Validar datos del formulario antes de procesarlos
  if (!validarDatosFormulario(datosFormulario)) {
    return;
  }

  // Agregar planta con información de la API
  agregarPlantaConAPI(datosFormulario);
});

// ============= FUNCIONES DE VALIDACIÓN =============

function validarDatosFormulario(datosFormulario) {
  const nombre = datosFormulario.get("plantName").trim();
  const fechaAdquisicion = datosFormulario.get("plantDate");
  const tipo = datosFormulario.get("plantType");

  if (nombre === "") {
    mostrarMensajeError("El nombre de la planta no puede estar vacío");
    return false;
  }

  if (!fechaAdquisicion) {
    mostrarMensajeError("La fecha de adquisición es requerida");
    return false;
  }

  if (!tipo) {
    mostrarMensajeError("Debe seleccionar si es planta de interior o exterior");
    return false;
  }

  // Validar que la fecha no sea futura
  const fechaSeleccionada = new Date(fechaAdquisicion);
  const fechaActual = new Date();
  if (fechaSeleccionada > fechaActual) {
    mostrarMensajeError("La fecha de adquisición no puede ser futura");
    return false;
  }

  return true;
}

// ============= FUNCIONES DE LA API PERENUAL =============

// Función corregida para buscar información de planta
async function buscarInformacionPlanta(nombrePlanta) {
  try {
    console.log(`🔍 Buscando información para: ${nombrePlanta}`);

    const response = await fetch(
      `${API_CONFIG.perenual.baseUrl}/species-list?key=${
        API_CONFIG.perenual.apiKey
      }&q=${encodeURIComponent(nombrePlanta)}`
    );

    if (!response.ok) {
      console.error(`Error HTTP: ${response.status}`);
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Respuesta de la API:", data);

    if (data.data && data.data.length > 0) {
      const planta = data.data[0];
      console.log("Información de planta encontrada:", planta);

      const infoPlanta = {
        id: planta.id,
        nombre: planta.common_name || nombrePlanta,
        // Corregir el manejo del nombre científico (viene como array)
        nombreCientifico: Array.isArray(planta.scientific_name)
          ? planta.scientific_name.join(", ")
          : planta.scientific_name || "No disponible",
        imagen:
          planta.default_image?.medium_url ||
          planta.default_image?.original_url ||
          null,
        ciclo: planta.cycle || "No disponible",
        riego: planta.watering || "No disponible",
        luz: Array.isArray(planta.sunlight)
          ? planta.sunlight.join(", ")
          : planta.sunlight || "No disponible",
        toxicidad: planta.poisonous_to_humans
          ? "Tóxica para humanos"
          : "No tóxica",
        cuidadosEspeciales: planta.care_level || "No disponible",
      };

      console.log("Información procesada:", infoPlanta);
      return infoPlanta;
    }

    console.log("No se encontraron resultados para:", nombrePlanta);
    return null;
  } catch (error) {
    console.error("Error al buscar información de planta:", error);
    return null;
  }
}

// Obtener cuidados detallados de una planta específica
async function obtenerCuidadosDetallados(plantaId) {
  try {
    console.log(`🔍 Obteniendo cuidados detallados para ID: ${plantaId}`);

    const response = await fetch(
      `${API_CONFIG.perenual.baseUrl}/species/details/${plantaId}?key=${API_CONFIG.perenual.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log("Cuidados detallados:", data);

    return {
      descripcion:
        data.description || "Información no disponible en la base de datos",
      cuidados: {
        riego:
          data.watering_general_benchmark?.value ||
          data.watering ||
          "Información no disponible",
        luz: Array.isArray(data.sunlight)
          ? data.sunlight.join(", ")
          : data.sunlight || "Información no disponible",
        humedad: data.humidity || "Información no disponible",
        temperatura:
          data.hardiness?.min && data.hardiness?.max
            ? `${data.hardiness.min}°C - ${data.hardiness.max}°C`
            : "Información no disponible",
        fertilizacion: data.fertilizer || "Información no disponible",
        poda: Array.isArray(data.pruning_month)
          ? data.pruning_month.join(", ")
          : data.pruning_month || "Información no disponible",
      },
      problemas: {
        plagas: data.pest_susceptibility || [],
        enfermedades: data.disease_susceptibility || [],
      },
    };
  } catch (error) {
    console.error("❌ Error al obtener cuidados detallados:", error);
    return null;
  }
}

// Función corregida para generar placeholder personalizado
function generarPlaceholderPersonalizado(nombrePlanta) {
  // Escapar caracteres especiales para XML/SVG
  const nombreEscapado = nombrePlanta.replace(/[<>&'"]/g, function (match) {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return match;
    }
  });

  // Crear SVG sin usar btoa() para evitar problemas con caracteres especiales
  const svgContent = `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f9ff"/>
      <text x="100" y="105" font-family="Arial" font-size="60" text-anchor="middle" fill="#68d391">🌱</text>
      <text x="100" y="170" font-family="Arial" font-size="14" text-anchor="middle" fill="#68d391">${nombreEscapado}</text>
    </svg>
  `;

  // Usar encodeURIComponent en lugar de btoa
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);
}

// Función alternativa más simple sin emoji
function generarPlaceholderSimple(nombrePlanta) {
  const nombreEscapado = nombrePlanta.replace(/[<>&'"]/g, function (match) {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return match;
    }
  });

  const svgContent = `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f9ff" stroke="#68d391" stroke-width="2"/>
      <circle cx="100" cy="80" r="30" fill="#68d391"/>
      <rect x="95" y="110" width="10" height="40" fill="#68d391"/>
      <text x="100" y="170" font-family="Arial" font-size="12" text-anchor="middle" fill="#68d391">${nombreEscapado}</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);
}

// ============= FUNCIONES PRINCIPALES =============

// Función principal para agregar planta con información de API
async function agregarPlantaConAPI(datosFormulario) {
  const nombrePlanta = datosFormulario.get("plantName").trim();

  // Mostrar mensaje de carga
  mostrarMensajeInfo("Buscando información de la planta...");

  try {
    // Buscar información en Perenual API
    const infoPlanta = await buscarInformacionPlanta(nombrePlanta);

    // Crear objeto planta base
    let objetoPlanta = {
      id: generarNuevoId(),
      nombre: nombrePlanta,
      fechaAdquisicion: datosFormulario.get("plantDate"),
      tipo: datosFormulario.get("plantType"),
      cuidados:
        datosFormulario.get("cuidadosEspeciales")?.trim() ||
        "Sin cuidados especiales",
      imagen: null,
    };

    // Si encontramos información de la API, enriquecemos los datos
    if (infoPlanta) {
      console.log("Enriqueciendo datos con información de API");

      // Agregar información de la API para detalles (NO mostrar en card principal)
      objetoPlanta.nombreCientifico = infoPlanta.nombreCientifico;
      objetoPlanta.imagen = infoPlanta.imagen;
      objetoPlanta.ciclo = infoPlanta.ciclo;
      objetoPlanta.riego = infoPlanta.riego;
      objetoPlanta.luz = infoPlanta.luz;
      objetoPlanta.toxicidad = infoPlanta.toxicidad;
      objetoPlanta.cuidadosEspeciales = infoPlanta.cuidadosEspeciales;
      objetoPlanta.apiId = infoPlanta.id;

      // MANTENER los cuidados originales del usuario - NO duplicar info de API
      if (objetoPlanta.cuidados === "Sin cuidados especiales") {
        objetoPlanta.cuidados =
          "Cuidados personalizados disponibles en detalles";
      }

      console.log("Objeto planta enriquecido:", objetoPlanta);
    } else {
      console.log("⚠️ No se encontró información de API, usando datos básicos");
    }

    // Si no hay imagen de la API, usar placeholder personalizado
    if (!objetoPlanta.imagen) {
      objetoPlanta.imagen = generarPlaceholderPersonalizado(nombrePlanta);
    }

    // Agregar la planta al array y guardar
    plantas.push(objetoPlanta);
    console.log("Guardando planta en array:", objetoPlanta);
    console.log("Array completo de plantas:", plantas);

    guardarPlantasEnStorage();
    guardarPreferenciaUsuario(datosFormulario.get("cuidadosEspeciales"));
    mostrarPlantas();
    formulario.reset();

    // Mostrar mensaje de éxito
    const mensajeExito = infoPlanta
      ? `✅ Planta "${nombrePlanta}" agregada con información completa de la API`
      : `✅ Planta "${nombrePlanta}" agregada con información básica`;

    mostrarMensajeExito(mensajeExito);

    // Mostrar en consola qué datos se guardaron
    console.log("Planta agregada exitosamente:", objetoPlanta);
  } catch (error) {
    console.error("❌ Error al agregar planta:", error);

    // Si hay error, agregar planta con datos básicos
    let objetoPlanta = {
      id: generarNuevoId(),
      nombre: nombrePlanta,
      fechaAdquisicion: datosFormulario.get("plantDate"),
      tipo: datosFormulario.get("plantType"),
      cuidados:
        datosFormulario.get("cuidadosEspeciales")?.trim() ||
        "Sin cuidados especiales",
      imagen: generarPlaceholderPersonalizado(nombrePlanta),
    };

    plantas.push(objetoPlanta);
    guardarPlantasEnStorage();
    guardarPreferenciaUsuario(datosFormulario.get("cuidadosEspeciales"));
    mostrarPlantas();
    formulario.reset();

    mostrarMensajeError(
      "Error al obtener información de la planta, se agregó con datos básicos"
    );
  }
}

// Función para mostrar información detallada de una planta
async function mostrarDetallesPlanta(plantaId) {
  const planta = plantas.find((p) => p.id === plantaId);

  if (!planta) {
    mostrarMensajeError("Planta no encontrada");
    return;
  }

  // Si tenemos el ID de la API, obtener información detallada
  if (planta.apiId) {
    mostrarMensajeInfo("Obteniendo información detallada...");
    const cuidadosDetallados = await obtenerCuidadosDetallados(planta.apiId);

    if (cuidadosDetallados) {
      console.log("Cuidados detallados obtenidos:", cuidadosDetallados);

      // Crear modal con información detallada y colores mejorados
      const modalInfo = `
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); max-width: 650px; margin: 20px auto; font-family: 'Arial', sans-serif;">
          <h3 style="color: #1f401b; margin-bottom: 20px; font-size: 24px; font-weight: bold; text-align: center;">${
            planta.nombre
          }</h3>
          
          ${
            planta.nombreCientifico &&
            planta.nombreCientifico !== "No disponible"
              ? `<p style="color: #4a5568; font-style: italic; text-align: center; margin-bottom: 15px; font-size: 16px;"><strong>Nombre científico:</strong> ${planta.nombreCientifico}</p>`
              : ""
          }
          
          <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #2d3748; line-height: 1.6; margin: 0;"><strong style="color: #1f401b;">Descripción:</strong> ${
              cuidadosDetallados.descripcion
            }</p>
          </div>
          
          <h4 style="color: #1f401b; margin-top: 25px; margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #68d391; padding-bottom: 8px;">Cuidados Específicos</h4>
          <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #68d391;">
            <ul style="margin: 0; padding-left: 20px; color: #2d3748; line-height: 1.8;">
              <li><strong style="color: #1f401b;">💧 Riego:</strong> ${
                cuidadosDetallados.cuidados.riego
              }</li>
              <li><strong style="color: #1f401b;">☀️ Luz:</strong> ${
                cuidadosDetallados.cuidados.luz
              }</li>
              <li><strong style="color: #1f401b;">💨 Humedad:</strong> ${
                cuidadosDetallados.cuidados.humedad
              }</li>
              <li><strong style="color: #1f401b;">🌡️ Temperatura:</strong> ${
                cuidadosDetallados.cuidados.temperatura
              }</li>
              <li><strong style="color: #1f401b;">🌿 Fertilización:</strong> ${
                cuidadosDetallados.cuidados.fertilizacion
              }</li>
              <li><strong style="color: #1f401b;">✂️ Poda:</strong> ${
                cuidadosDetallados.cuidados.poda
              }</li>
            </ul>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fff5f5; border-radius: 8px; border-left: 4px solid #f56565;">
            <p style="color: #2d3748; margin: 0;"><strong style="color: #e53e3e;">⚠️ Toxicidad:</strong> ${
              planta.toxicidad || "Información no disponible"
            }</p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <button onclick="cerrarModal()" style="background: #1f401b; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 8px rgba(31, 64, 27, 0.3); transition: all 0.3s ease;">Cerrar</button>
          </div>
        </div>
      `;

      // Mostrar modal
      mostrarModal(modalInfo);
    }
  } else {
    // Mostrar información básica con mejor diseño
    const infoBasica = `
      <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); max-width: 600px; margin: 20px auto; font-family: 'Arial', sans-serif;">
        <h3 style="color: #1f401b; margin-bottom: 20px; font-size: 24px; font-weight: bold; text-align: center;">${
          planta.nombre
        }</h3>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #2d3748; margin: 0;"><strong style="color: #1f401b;">Tipo:</strong> ${
            planta.tipo
          }</p>
        </div>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="color: #2d3748; margin: 0;"><strong style="color: #1f401b;">Fecha de adquisición:</strong> ${new Date(
            planta.fechaAdquisicion
          ).toLocaleDateString("es-ES")}</p>
        </div>
        
        <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #68d391;">
          <p style="color: #2d3748; margin: 0;"><strong style="color: #1f401b;">Cuidados:</strong> ${
            planta.cuidados
          }</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
          <button onclick="cerrarModal()" style="background: #1f401b; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 8px rgba(31, 64, 27, 0.3);">Cerrar</button>
        </div>
      </div>
    `;

    mostrarModal(infoBasica);
  }
}

function mostrarModal(contenido) {
  const modal = document.createElement("div");
  modal.id = "plantModal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
  `;
  modal.innerHTML = contenido;
  document.body.appendChild(modal);

  // Cerrar modal al hacer clic fuera
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      cerrarModal();
    }
  });
}

function cerrarModal() {
  const modal = document.getElementById("plantModal");
  if (modal) {
    modal.remove();
  }
}

// ============= FUNCIONES DE STORAGE =============

function guardarPlantasEnStorage() {
  try {
    const plantasJson = JSON.stringify(plantas);
    localStorage.setItem("plantas", plantasJson);
    console.log(" Plantas guardadas en localStorage:", plantasJson);
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
  }
}

function cargarPlantasDeStorage() {
  try {
    const datosGuardados = localStorage.getItem("plantas");
    if (datosGuardados) {
      plantas = JSON.parse(datosGuardados);
      console.log(" Plantas cargadas desde localStorage:", plantas);
    } else {
      console.log(" No hay plantas guardadas en localStorage");
    }
  } catch (error) {
    console.error(" Error al cargar desde localStorage:", error);
  }
}

// ============= FUNCIONES DE UTILIDAD =============

function generarNuevoId() {
  return plantas.length > 0 ? Math.max(...plantas.map((p) => p.id)) + 1 : 1;
}

function guardarPreferenciaUsuario(cuidadosEspeciales) {
  if (cuidadosEspeciales && cuidadosEspeciales.trim() !== "") {
    localStorage.setItem("ultimosCuidados", cuidadosEspeciales);
    actualizarMensajeBienvenida();
  }
}

function cargarMensajeBienvenida() {
  const cuidadosGuardados = localStorage.getItem("ultimosCuidados");
  const totalPlantas = plantas.length;

  if (cuidadosGuardados) {
    mensajeBienvenida.textContent = `Bienvenido a tu jardín digital (${totalPlantas} plantas) - Últimos cuidados: ${cuidadosGuardados}`;
  } else {
    mensajeBienvenida.textContent = `¡Bienvenido a tu jardín digital! ${
      totalPlantas > 0
        ? `Tienes ${totalPlantas} plantas`
        : "Agrega tu primera planta"
    }`;
  }
}

function actualizarMensajeBienvenida() {
  const cuidadosGuardados = localStorage.getItem("ultimosCuidados");
  const totalPlantas = plantas.length;

  if (cuidadosGuardados) {
    mensajeBienvenida.textContent = `Bienvenido a tu jardín digital (${totalPlantas} plantas) - Últimos cuidados: ${cuidadosGuardados}`;
  }
}

// ============= FUNCIONES DE VISUALIZACIÓN =============

function mostrarPlantas() {
  console.log(" Mostrando plantas:", plantas);
  contenedorPlantas.innerHTML = "";

  if (plantas.length === 0) {
    contenedorPlantas.innerHTML =
      '<div class="empty-state">No hay plantas registradas en tu jardín digital</div>';
    return;
  }

  plantas.forEach(function (planta) {
    const plantCard = document.createElement("div");
    plantCard.className = "plant-card";

    const fechaFormateada = new Date(
      planta.fechaAdquisicion
    ).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // CARD SIMPLIFICADA - Solo mostrar información básica
    plantCard.innerHTML = `
      <div class="plant-id">ID: ${planta.id}</div>
      <div class="plant-image">
        ${
          planta.imagen
            ? `<img src="${planta.imagen}" alt="${
                planta.nombre
              }" onerror="this.src='${generarPlaceholderPersonalizado(
                planta.nombre
              )}'" />`
            : `<div class="plant-placeholder">🌱</div>`
        }
      </div>
      <div class="plant-name">${planta.nombre}</div>
      <div class="plant-details">
        <div class="plant-type">
          <span class="type-badge type-${planta.tipo.toLowerCase()}">${
      planta.tipo
    }</span>
        </div>
        <div><strong>Fecha:</strong> ${fechaFormateada}</div>
        <div><strong>Cuidados:</strong> ${planta.cuidados}</div>
      </div>
      <div class="plant-actions">
        <button onclick="eliminarPlanta(${
          planta.id
        })" class="btn-delete">Eliminar</button>
        <button onclick="mostrarDetallesPlanta(${
          planta.id
        })" class="btn-details">Más detalles</button>
      </div>
    `;
    contenedorPlantas.appendChild(plantCard);
  });
}

function eliminarPlanta(id) {
  if (
    confirm("¿Estás seguro de que quieres eliminar esta planta de tu jardín?")
  ) {
    // Filtrar la planta
    plantas = plantas.filter((planta) => planta.id !== id);

    // Reasignar IDs secuenciales (sino quedan huecos)
    plantas.forEach((planta, index) => {
      planta.id = index + 1; 
    });

    guardarPlantasEnStorage();
    mostrarPlantas();
    mostrarMensajeExito("Planta eliminada del jardín");
  }
}

// ============= FUNCIONES DE BÚSQUEDA =============

function buscarPlantas() {
  const termino = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  if (termino === "") {
    mostrarPlantas();
    return;
  }

  const plantasFiltradas = plantas.filter(
    (planta) =>
      planta.nombre.toLowerCase().includes(termino) ||
      planta.tipo.toLowerCase().includes(termino) ||
      planta.cuidados.toLowerCase().includes(termino) ||
      (planta.nombreCientifico &&
        planta.nombreCientifico.toLowerCase().includes(termino))
  );

  mostrarPlantasFiltradas(plantasFiltradas);
}

function mostrarPlantasFiltradas(plantasFiltradas) {
  contenedorPlantas.innerHTML = "";

  if (plantasFiltradas.length === 0) {
    contenedorPlantas.innerHTML =
      '<div class="empty-state">No se encontraron plantas que coincidan con tu búsqueda</div>';
    return;
  }

  plantasFiltradas.forEach(function (planta) {
    const plantCard = document.createElement("div");
    plantCard.className = "plant-card";

    const fechaFormateada = new Date(
      planta.fechaAdquisicion
    ).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // CARD SIMPLIFICADA PARA BÚSQUEDA TAMBIÉN
    plantCard.innerHTML = `
      <div class="plant-id">ID: ${planta.id}</div>
      <div class="plant-image">
        ${
          planta.imagen
            ? `<img src="${planta.imagen}" alt="${
                planta.nombre
              }" onerror="this.src='${generarPlaceholderPersonalizado(
                planta.nombre
              )}'" />`
            : `<div class="plant-placeholder">🌱</div>`
        }
      </div>
      <div class="plant-name">${planta.nombre}</div>
      <div class="plant-details">
        <div class="plant-type">
          <span class="type-badge type-${planta.tipo.toLowerCase()}">${
      planta.tipo
    }</span>
        </div>
        <div><strong>Fecha:</strong> ${fechaFormateada}</div>
        <div><strong>Cuidados:</strong> ${planta.cuidados}</div>
      </div>
      <div class="plant-actions">
        <button onclick="eliminarPlanta(${
          planta.id
        })" class="btn-delete">Eliminar</button>
        <button onclick="mostrarDetallesPlanta(${
          planta.id
        })" class="btn-details">Más detalles</button>
      </div>
    `;
    contenedorPlantas.appendChild(plantCard);
  });
}

// ============= FUNCIONES DE MENSAJES =============

function mostrarMensajeInfo(mensaje) {
  let divInfo = document.getElementById("infoMessage");
  if (!divInfo) {
    divInfo = document.createElement("div");
    divInfo.id = "infoMessage";
    divInfo.classList.add("info-message");
    divInfo.style.cssText = `
      background-color: #3b82f6;
      color: white;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      text-align: center;
      display: none;
    `;
    formulario.insertBefore(divInfo, formulario.firstChild);
  }

  divInfo.textContent = mensaje;
  divInfo.style.display = "block";

  setTimeout(() => {
    divInfo.style.display = "none";
  }, 2000);
}

function mostrarMensajeError(mensaje) {
  let divError = document.getElementById("errorMessage");
  if (!divError) {
    divError = document.createElement("div");
    divError.id = "errorMessage";
    divError.classList.add("error-message");
    divError.style.cssText = `
      background-color: #ef4444;
      color: white;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      text-align: center;
      display: none;
    `;
    formulario.insertBefore(divError, formulario.firstChild);
  }

  divError.textContent = mensaje;
  divError.style.display = "block";

  setTimeout(() => {
    divError.style.display = "none";
  }, 3000);
}

function mostrarMensajeExito(mensaje) {
  let divExito = document.getElementById("successMessage");
  if (!divExito) {
    divExito = document.createElement("div");
    divExito.id = "successMessage";
    divExito.classList.add("success-message");
    divExito.style.cssText = `
      background-color: #10b981;
      color: white;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      text-align: center;
      display: none;
    `;
    formulario.insertBefore(divExito, formulario.firstChild);
  }

  divExito.textContent = mensaje;
  divExito.style.display = "block";

  setTimeout(() => {
    divExito.style.display = "none";
  }, 3000);
}
