# 🌿 Mi Jardín Digital

**Mi Jardín Digital** es una aplicación web interactiva que permite registrar, visualizar y gestionar una colección de plantas personales. Las personas usuarias pueden ingresar información sobre sus plantas, almacenarla de forma persistente en el navegador y obtener datos detallados mediante una API externa.

La estética del sitio está inspirada en un entorno natural, con una interfaz amigable y una paleta de colores suave basada en tonos de bosque.

## ✨ Funcionalidades

- Formulario para registrar plantas, con campos como nombre, fecha de adquisición, tipo y cuidados especiales.
- Validación de datos para mantener la integridad del registro.
- Almacenamiento local mediante `localStorage`, sin necesidad de base de datos externa.
- Visualización de las plantas en tarjetas dinámicas.
- Búsqueda por nombre, tipo o cuidados especiales.
- Eliminación individual de registros.
- Integración con la API de **Perenual**, que permite consultar información adicional sobre cada planta.
- Acceso a una vista detallada mediante un botón en cada tarjeta, con información extendida obtenida desde la API.

## 🌱 Integración con API

Actualmente, la aplicación se conecta exclusivamente con la API de [Perenual](https://perenual.com/), que permite:

- Obtener datos botánicos más detallados.
- Acceder a imágenes representativas de cada especie.

### Problemas actuales con la API

- Algunos campos retornados por la API están vacíos o incompletos, lo cual limita la experiencia informativa.
- En ciertos casos no se obtiene una imagen representativa de la planta buscada.

### Posibles mejoras futuras

- Implementar un sistema de imágenes de respaldo locales para mostrar en caso de que la API no devuelva una foto adecuada.
- Validar la respuesta de la API y mostrar solo la información disponible para evitar datos vacíos.
- Ampliar el buscador con sugerencias automáticas basadas en las especies más comunes o previamente cargadas.

## 🛠️ Tecnologías utilizadas

- HTML5  
- CSS3  
- JavaScript  
- API externa: **Perenual**  
- `localStorage` para almacenamiento local

## 📸 Captura de pantalla

![Vista previa de Mi Jardín Digital](./JardinDigital.png)
