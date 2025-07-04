// Base de datos simulada con estructura JSON (vector de ejemplo)
let plantas = [
  { 
    id: 1, 
    nombre: 'Pothos', 
    fechaAdquisicion: '2024-01-15', 
    tipo: 'Interior', 
    cuidados: 'Riego moderado, luz indirecta',
    imagen: null
  },
  { 
    id: 2, 
    nombre: 'Rosa', 
    fechaAdquisicion: '2024-02-20', 
    tipo: 'Exterior', 
    cuidados: 'Riego abundante, pleno sol',
    imagen: null
  },
];

// Referencias a elementos del DOM
const formulario = document.getElementById('plantForm');
const contenedorPlantas = document.getElementById('plantsContainer');
const mensajeBienvenida = document.getElementById('welcomeMessage');

// carga datos desde localStorage si existen
document.addEventListener('DOMContentLoaded', function () {
  cargarPlantasDeStorage();
  cargarMensajeBienvenida();
  mostrarPlantas();
});

// Evento del formulario
formulario.addEventListener('submit', function (event) {
  event.preventDefault(); // evita que el formulario se envíe y recargue la página

  let datosFormulario = new FormData(formulario);

  // Validar datos del formulario antes de procesarlos
  if (!validarDatosFormulario(datosFormulario)) {
    return; // Si la validación falla, no continuar
  }

  let objetoPlanta = convertirFormDataAObjetoPlanta(datosFormulario);
  
  // Mostrar mensaje de carga
  mostrarMensajeInfo('Buscando imagen de la planta...');
  
  // Buscar imagen de la planta usando la API mejorada
  buscarImagenPlantaConVerificacion(objetoPlanta.nombre)
    .then(imagenUrl => {
      console.log('Imagen obtenida:', imagenUrl);
      objetoPlanta.imagen = imagenUrl;
      agregarPlantaAlArray(objetoPlanta);
      guardarPlantasEnStorage(); // Guardar array completo en localStorage
      guardarPreferenciaUsuario(datosFormulario.get('cuidadosEspeciales'));
      mostrarPlantas();
      formulario.reset(); // Limpiar el formulario después de enviarlo
      mostrarMensajeExito('Planta agregada correctamente con imagen');
    })
    .catch(error => {
      console.error('Error al buscar imagen:', error);
      // Si no se puede obtener la imagen, agregar la planta sin imagen
      objetoPlanta.imagen = generarPlaceholderPersonalizado(objetoPlanta.nombre);
      agregarPlantaAlArray(objetoPlanta);
      guardarPlantasEnStorage();
      guardarPreferenciaUsuario(datosFormulario.get('cuidadosEspeciales'));
      mostrarPlantas();
      formulario.reset();
      mostrarMensajeExito('Planta agregada (imagen genérica)');
    });
});

// Función auxiliar para mostrar mensaje de información
function mostrarMensajeInfo(mensaje) {
  let divInfo = document.getElementById('infoMessage');
  if (!divInfo) {
    divInfo = document.createElement('div');
    divInfo.id = 'infoMessage';
    divInfo.classList.add('info-message');
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
  divInfo.style.display = 'block';

  // Ocultar después de 2 segundos
  setTimeout(() => {
    divInfo.style.display = 'none';
  }, 2000);
}

// Funciones de Storage para toda la base de datos
function guardarPlantasEnStorage() {
  localStorage.setItem('plantas', JSON.stringify(plantas));
}

function cargarPlantasDeStorage() {
  const datosGuardados = localStorage.getItem('plantas');
  if (datosGuardados) {
    plantas = JSON.parse(datosGuardados); // convierte el string JSON de vuelta a array
  }
}

// Validación del formulario
function validarDatosFormulario(datosFormulario) {
  const nombre = datosFormulario.get('plantName').trim(); //.trim() elimina los espacios en blanco al principio y al final de un string.
  const fechaAdquisicion = datosFormulario.get('plantDate');
  const tipo = datosFormulario.get('plantType');

  // Validar que el nombre no esté vacío
  if (nombre === '') {
    mostrarMensajeError('El nombre de la planta no puede estar vacío');
    return false;
  }

  // Validar que se haya seleccionado una fecha
  if (!fechaAdquisicion) {
    mostrarMensajeError('La fecha de adquisición es requerida');
    return false;
  }

  // Validar que se haya seleccionado un tipo
  if (!tipo) {
    mostrarMensajeError('Debe seleccionar si es planta de interior o exterior');
    return false;
  }

  // Validar que la fecha no sea futura
  const fechaSeleccionada = new Date(fechaAdquisicion);
  const fechaActual = new Date();
  if (fechaSeleccionada > fechaActual) {
    mostrarMensajeError('La fecha de adquisición no puede ser futura');
    return false;
  }

  return true; // Si todas las validaciones pasan, se llega al final y se devuelve true
}

// Convertir FormData a objeto planta
function convertirFormDataAObjetoPlanta(datosFormulario) {
  return {
    id: generarNuevoId(),
    nombre: datosFormulario.get('plantName').trim(),
    fechaAdquisicion: datosFormulario.get('plantDate'),
    tipo: datosFormulario.get('plantType'),
    cuidados: datosFormulario.get('cuidadosEspeciales').trim() || 'Sin cuidados especiales',
    imagen: null // Se asignará después con la API
  };
}

// Generar nuevo ID único basado en el ID más alto actual
function generarNuevoId() {
  return plantas.length > 0 ? Math.max(...plantas.map((p) => p.id)) + 1 : 1;
}

// Agregar planta al array
function agregarPlantaAlArray(objetoPlanta) {
  plantas.push(objetoPlanta);
}

//Mostrar plantas desde Storage
function mostrarPlantas() {
  contenedorPlantas.innerHTML = '';

  if (plantas.length === 0) {
    contenedorPlantas.innerHTML =
      '<div class="empty-state">No hay plantas registradas en tu jardín digital</div>';
    return;
  }

  // Itera sobre cada planta y crea su tarjeta visual
  plantas.forEach(function (planta) {
    const plantCard = document.createElement('div');
    plantCard.className = 'plant-card';
    
    // Formatear la fecha para mejor visualización
    const fechaFormateada = new Date(planta.fechaAdquisicion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    plantCard.innerHTML = `
      <div class="plant-id">ID: ${planta.id}</div>
      <div class="plant-image">
        ${planta.imagen ? 
          `<img src="${planta.imagen}" alt="${planta.nombre}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjBmOWZmIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjhkMzkxIj7wn4yxPC90ZXh0Pgo8L3N2Zz4K'" />` : 
          `<div class="plant-placeholder">🌱</div>`
        }
      </div>
      <div class="plant-name">${planta.nombre}</div>
      <div class="plant-details">
        <div class="plant-type">
          <span class="type-badge type-${planta.tipo.toLowerCase()}">${planta.tipo}</span>
        </div>
        <div><strong>Fecha:</strong> ${fechaFormateada}</div>
        <div><strong>Cuidados:</strong> ${planta.cuidados}</div>
      </div>
      <div class="plant-actions">
        <button onclick="eliminarPlanta(${planta.id})" class="btn-delete">Eliminar</button>
      </div>
    `;
    contenedorPlantas.appendChild(plantCard);
  });
}

// Función para eliminar planta
function eliminarPlanta(id) {
  if (confirm('¿Estás seguro de que quieres eliminar esta planta de tu jardín?')) {
    plantas = plantas.filter(planta => planta.id !== id);
    guardarPlantasEnStorage();
    mostrarPlantas();
    mostrarMensajeExito('Planta eliminada del jardín');
  }
}

// Funciones para los cuidados especiales (mantenido de la entrega anterior)
function guardarPreferenciaUsuario(cuidadosEspeciales) {
  if (cuidadosEspeciales && cuidadosEspeciales.trim() !== '') {
    localStorage.setItem('ultimosCuidados', cuidadosEspeciales);
    actualizarMensajeBienvenida();
  }
}

function cargarMensajeBienvenida() {
  const cuidadosGuardados = localStorage.getItem('ultimosCuidados');
  const totalPlantas = plantas.length;
  
  if (cuidadosGuardados) {
    mensajeBienvenida.textContent = `Bienvenido a tu jardín digital (${totalPlantas} plantas) - Últimos cuidados: ${cuidadosGuardados}`;
  } else {
    mensajeBienvenida.textContent = `¡Bienvenido a tu jardín digital! ${totalPlantas > 0 ? `Tienes ${totalPlantas} plantas` : 'Agrega tu primera planta'}`;
  }
}

function actualizarMensajeBienvenida() {
  const cuidadosGuardados = localStorage.getItem('ultimosCuidados');
  const totalPlantas = plantas.length;
  
  if (cuidadosGuardados) {
    mensajeBienvenida.textContent = `Bienvenido a tu jardín digital (${totalPlantas} plantas) - Últimos cuidados: ${cuidadosGuardados}`;
  }
}

// auxiliares para mostrar mensajes (crea mensaje, muestra, lo oculta)
function mostrarMensajeError(mensaje) {
  // Crear elemento de error si no existe
  let divError = document.getElementById('errorMessage');
  if (!divError) {
    // si no existe un mensaje de error en html crea uno
    divError = document.createElement('div'); // crea elemento 'div'
    divError.id = 'errorMessage'; // le asigna un ID
    divError.classList.add('error-message'); // agrego una clase css llamada "error-message"
    formulario.insertBefore(divError, formulario.firstChild); // insertar al inicio del formulario
  }

  // muestra mensaje
  divError.textContent = mensaje;
  divError.style.display = 'block';

  // Ocultar después de 3 segundos automaticamente
  setTimeout(() => {
    divError.style.display = 'none';
  }, 3000);
}

// idem mensaje de exito (crea mensaje / lo muestra / lo oculta)
function mostrarMensajeExito(mensaje) {
  // Crear elemento de éxito si no existe
  let divExito = document.getElementById('successMessage');
  if (!divExito) {
    divExito = document.createElement('div');
    divExito.id = 'successMessage';
    divExito.classList.add('success-message');
    formulario.insertBefore(divExito, formulario.firstChild); // insertar al inicio del formulario
  }

  divExito.textContent = mensaje;
  divExito.style.display = 'block';

  // Ocultar después de 3 segundos automaticamente
  setTimeout(() => {
    divExito.style.display = 'none';
  }, 3000);
}

// ============= FUNCIONES DE LA API DE IMÁGENES MEJORADAS =============

// Función principal para buscar imagen de planta
async function buscarImagenPlanta(nombrePlanta) {
  console.log(`Buscando imagen para: ${nombrePlanta}`);
  
  try {
    // Método 1: Usar Unsplash Source (funciona sin API key)
    const imagenUnsplash = await buscarEnUnsplash(nombrePlanta);
    if (imagenUnsplash) {
      return imagenUnsplash;
    }
  } catch (error) {
    console.log('Error con Unsplash:', error);
  }

  try {
    // Método 2: Usar Picsum con búsqueda por keyword
    const imagenPicsum = await buscarEnPicsum(nombrePlanta);
    if (imagenPicsum) {
      return imagenPicsum;
    }
  } catch (error) {
    console.log('Error con Picsum:', error);
  }

  try {
    // Método 3: Galería predefinida de plantas reales
    const imagenPredefinida = obtenerImagenPredefinida(nombrePlanta);
    if (imagenPredefinida) {
      return imagenPredefinida;
    }
  } catch (error) {
    console.log('Error con imágenes predefinidas:', error);
  }

  // Método 4: Fallback final
  return generarPlaceholderPersonalizado(nombrePlanta);
}

// Método 1: Buscar en Unsplash Source (gratuito, sin API key)
async function buscarEnUnsplash(nombrePlanta) {
  try {
    const query = `${nombrePlanta} plant`;
    const unsplashUrl = `https://source.unsplash.com/200x200/?${encodeURIComponent(query)}`;
    
    // Verificar que la imagen se puede cargar
    const response = await fetch(unsplashUrl, { method: 'HEAD' });
    if (response.ok) {
      return unsplashUrl;
    }
    
    throw new Error('Imagen no disponible en Unsplash');
  } catch (error) {
    console.log('Error Unsplash:', error);
    return null;
  }
}

// Método 2: Usar Picsum con ID específico basado en el nombre
async function buscarEnPicsum(nombrePlanta) {
  try {
    // Generar ID basado en el nombre de la planta
    const id = generarIdParaPlanta(nombrePlanta);
    const picsumUrl = `https://picsum.photos/200/200?random=${id}`;
    
    const response = await fetch(picsumUrl, { method: 'HEAD' });
    if (response.ok) {
      return picsumUrl;
    }
    
    throw new Error('Imagen no disponible en Picsum');
  } catch (error) {
    console.log('Error Picsum:', error);
    return null;
  }
}

// Método 3: Galería predefinida de plantas reales con nombres específicos
function obtenerImagenPredefinida(nombrePlanta) {
  const plantasImagenes = {
    // Plantas comunes con imágenes específicas de Unsplash
    'pothos': 'https://images.unsplash.com/photo-1586910471009-8615f0d8f9f6?w=200&h=200&fit=crop',
    'rosa': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop',
    'suculenta': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=200&h=200&fit=crop',
    'cactus': 'https://images.unsplash.com/photo-1509423350716-97f2360af787?w=200&h=200&fit=crop',
    'monstera': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    'ficus': 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=200&h=200&fit=crop',
    'aloe': 'https://images.unsplash.com/photo-1596547518316-c0a7c8c2e2b6?w=200&h=200&fit=crop',
    'lavanda': 'https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?w=200&h=200&fit=crop',
    'geranio': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
    'helecho': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'bambú': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop',
    'orquídea': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&h=200&fit=crop',
    'tulipán': 'https://images.unsplash.com/photo-1520637736862-4d197d17c23a?w=200&h=200&fit=crop',
    'girasol': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'hibisco': 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop'
  };
  
  const nombreLower = nombrePlanta.toLowerCase();
  
  // Buscar coincidencia exacta
  if (plantasImagenes[nombreLower]) {
    return plantasImagenes[nombreLower];
  }
  
  // Buscar coincidencia parcial
  for (const [planta, imagen] of Object.entries(plantasImagenes)) {
    if (nombreLower.includes(planta) || planta.includes(nombreLower)) {
      return imagen;
    }
  }
  
  // Si no hay coincidencia específica, usar imagen genérica de planta
  const imagenesGenericas = [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=200&h=200&fit=crop'
  ];
  
  const indiceAleatorio = Math.abs(hashString(nombrePlanta)) % imagenesGenericas.length;
  return imagenesGenericas[indiceAleatorio];
}

// Función auxiliar para generar ID único basado en el nombre
function generarIdParaPlanta(nombrePlanta) {
  return Math.abs(hashString(nombrePlanta)) % 1000 + 1;
}

// Función auxiliar para crear hash de string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// Método 4: Placeholder personalizado como último recurso
function generarPlaceholderPersonalizado(nombrePlanta) {
  const coloresPlanta = [
    '22c55e', '16a34a', '65a30d', '84cc16', '10b981', 
    '059669', '0d9488', '0891b2', '0369a1', '7c3aed'
  ];
  
  const indiceColor = Math.abs(hashString(nombrePlanta)) % coloresPlanta.length;
  const color = coloresPlanta[indiceColor];
  
  return `https://via.placeholder.com/200x200/${color}/ffffff?text=${encodeURIComponent(nombrePlanta.substring(0, 8))}&font-size=16`;
}

// Función para pre-cargar y verificar imágenes
async function verificarImagen(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Timeout de 5 segundos
    setTimeout(() => resolve(false), 5000);
  });
}

// Función mejorada con verificación de imagen
async function buscarImagenPlantaConVerificacion(nombrePlanta) {
  try {
    const imagenUrl = await buscarImagenPlanta(nombrePlanta);
    
    // Verificar que la imagen se puede cargar
    const imagenValida = await verificarImagen(imagenUrl);
    
    if (imagenValida) {
      console.log(`✓ Imagen encontrada para ${nombrePlanta}: ${imagenUrl}`);
      return imagenUrl;
    } else {
      console.log(`✗ Imagen no válida para ${nombrePlanta}, usando fallback`);
      return generarPlaceholderPersonalizado(nombrePlanta);
    }
  } catch (error) {
    console.log(`Error buscando imagen para ${nombrePlanta}:`, error);
    return generarPlaceholderPersonalizado(nombrePlanta);
  }
}