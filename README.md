# 🚀 auroLab - Herramientas de Producción Musical

![Astro](https://img.shields.io/badge/ASTRO-000000?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/REACT-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000000)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css&logoColor=white)

> **Herramientas precisas para convertir tempo, espacio y armonía en decisiones musicales sin salir del navegador.**

---

## ▶️ Live Preview

**🔗 [Visitar Sitio Web](https://aurolab.dhreian.com)**

---

## 📋 Tabla de Contenidos

- [🔍 ¿Qué es este proyecto?](#-qué-es-este-proyecto)
- [✨ Características Principales](#-características-principales)
- [🎛️ Herramientas Incluidas](#️-herramientas-incluidas)
- [🔒 Privacidad y Procesamiento de Audio](#-privacidad-y-procesamiento-de-audio)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [🎨 Estilo y Diseño](#-estilo-y-diseño)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🚀 Requisitos e Instalación](#-requisitos-e-instalación)
- [📦 Scripts y Comandos](#-scripts-y-comandos)
- [📧 Contacto](#-contacto)

---

## 🔍 ¿Qué es este proyecto?

**auroLab** es una aplicación web gratuita para productores musicales, beatmakers, músicos y DJs. Reúne en una sola interfaz las utilidades que suelen interrumpir el flujo de una sesión: cálculo de delay y reverb sincronizados al BPM, metrónomo, tap tempo y detección de tempo y tonalidad.

La aplicación está construida como un sitio estático con Astro y una interfaz interactiva en React. No necesita cuentas, backend ni base de datos; los cálculos se ejecutan directamente en el navegador y los archivos de audio seleccionados para análisis nunca se suben a un servidor.

---

## ✨ Características Principales

- **Delay y reverb sincronizados:** convierte BPM a milisegundos y hercios para subdivisiones normales, con puntillo y tresillo; además propone valores de pre-delay y decay.
- **Metrónomo preciso:** utiliza el reloj de Web Audio, programación anticipada de eventos, acento en el primer pulso, compases configurables, tap tempo y control de volumen.
- **Tap tempo robusto:** calcula el BPM mediante mediana y rechazo de valores atípicos, muestra la estabilidad de las pulsaciones y permite trabajar en half-time o double-time.
- **Análisis local de audio:** estima BPM, tonalidad mayor o menor, código Camelot, nivel de confianza, resultados alternativos y energía por nota.
- **Privacidad por diseño:** decodifica y analiza el audio en memoria dentro del dispositivo del usuario.
- **Experiencia adaptable:** diseño responsive, navegación por teclado, estados de foco visibles y soporte para preferencias de movimiento reducido.
- **Rutas optimizadas para buscadores:** páginas estáticas independientes, metadatos Open Graph, Twitter Cards, JSON-LD, `robots.txt` y sitemap XML.
- **Sin configuración obligatoria:** basta con instalar dependencias y ejecutar el servidor de desarrollo.

---

## 🎛️ Herramientas Incluidas

| Herramienta            | Entrada                                                                         | Resultado                                                                               |
| :--------------------- | :------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| **Delay & Reverb**     | BPM entre 30 y 300                                                              | Tiempos en ms y Hz para subdivisiones; sugerencias de pre-delay, decay y duración total |
| **Metrónomo**          | BPM, pulsos por compás y volumen                                                | Click estable con acento de compás, indicador visual y controles por teclado            |
| **Tap Tempo**          | Pulsaciones con mouse, pantalla táctil, `Espacio` o `T`                         | BPM promedio, estabilidad, ajuste `/2` y `×2`, y reinicio automático configurable       |
| **BPM & Key Detector** | Archivo WAV, MP3, FLAC, AAC u otro formato de audio compatible con el navegador | BPM y tonalidad estimados, confianza, alternativas, código Camelot y gráfico de chroma  |

El detector de tempo busca transientes mediante cambios de energía y compara sus intervalos dentro de un rango de 60 a 200 BPM. La tonalidad se obtiene agrupando energía en las 12 clases cromáticas y comparándola con perfiles tonales mayores y menores. Los resultados son estimaciones: material con tempo variable, poca percusión, afinaciones no estándar o cambios de tonalidad puede requerir verificación manual.

---

## 🔒 Privacidad y Procesamiento de Audio

El analizador usa `File.arrayBuffer()`, `AudioContext.decodeAudioData()` y procesamiento JavaScript en memoria. **No envía el archivo a una API ni lo almacena fuera del navegador.**

La compatibilidad de WAV, MP3, FLAC, AAC y otros formatos depende de los códecs disponibles en el navegador y el sistema operativo. Para obtener resultados más confiables, conviene usar audio con transientes claros para el BPM y pasajes armónicamente estables para la tonalidad.

---

## 🛠️ Tecnologías Utilizadas

### Frontend e Interfaz de Usuario

- **Core:** Astro 7, React 19, JavaScript con ES Modules, HTML5 y CSS3.
- **Interactividad:** islas de React hidratadas en el cliente mediante `@astrojs/react`.
- **Audio:** Web Audio API para síntesis del metrónomo, decodificación y análisis de archivos.
- **Iconos:** Font Awesome Free Solid, renderizado como SVG dentro de los componentes.
- **Tipografías:** paquetes locales de Fontsource, sin solicitudes a servicios externos de fuentes.

### Arquitectura y Entrega

- **Generación:** páginas estáticas con rutas dinámicas preconstruidas por Astro.
- **SEO:** metadatos por herramienta, canonical URLs, Open Graph, Twitter Cards y datos estructurados Schema.org.
- **Despliegue:** salida estática compatible con Vercel y otros proveedores de hosting estático.
- **Persistencia:** no utiliza backend, base de datos ni almacenamiento remoto.

---

## 🎨 Estilo y Diseño

auroLab utiliza una estética oscura inspirada en interfaces de estudio: fondos azul noche, paneles de alto contraste y acentos violetas para destacar valores, controles y estados activos. La cuadrícula sutil, los brillos contenidos y la jerarquía tipográfica mantienen el carácter técnico sin sacrificar legibilidad.

### Paleta de Colores

| Color                | Hexadecimal | Uso principal                                 |
| :------------------- | :---------- | :-------------------------------------------- |
| **Fondo**            | `#030711`   | Base de la aplicación y tema del navegador    |
| **Superficie**       | `#071321`   | Paneles, tarjetas y navegación                |
| **Primario**         | `#0E2A47`   | Controles y superficies de marca              |
| **Acento**           | `#8A6CFF`   | Acciones, indicadores y estados activos       |
| **Acento claro**     | `#C9C0FF`   | Énfasis, títulos y detalles de alto contraste |
| **Texto base**       | `#F7F8FF`   | Contenido principal                           |
| **Texto secundario** | `#AAB3C8`   | Descripciones, ayudas y metadatos             |

### Tipografía

- **Interfaz y títulos:** Montserrat Variable.
- **Marca y firma visual:** Quintessential.
- **Carga:** ambas familias se empaquetan localmente mediante Fontsource.

---

## 📁 Estructura del Proyecto

```text
📂 aurolab
 ┣ 📂 public
 ┃ ┣ 📜 logo.svg                 # Identidad visual y favicon
 ┃ ┗ 📜 site.webmanifest         # Metadatos de instalación web
 ┣ 📂 src
 ┃ ┣ 📂 components
 ┃ ┃ ┗ 📜 ProducerTools.jsx      # Interfaz y lógica de las cuatro herramientas
 ┃ ┣ 📂 layouts
 ┃ ┃ ┗ 📜 BaseLayout.astro       # Documento base, SEO y datos estructurados
 ┃ ┣ 📂 lib
 ┃ ┃ ┣ 📜 audioAnalysis.js       # Estimación de BPM, chroma y tonalidad
 ┃ ┃ ┣ 📜 documentation.js       # Documentación integrada en la aplicación
 ┃ ┃ ┣ 📜 musicMath.js           # Cálculos de tempo, notas, reverb y tap tempo
 ┃ ┃ ┣ 📜 seo.js                 # Metadatos y definición de rutas
 ┃ ┃ ┣ 📜 textFormat.js          # Utilidades de formato
 ┃ ┃ ┗ 📜 translations.js        # Textos de la interfaz
 ┃ ┣ 📂 pages
 ┃ ┃ ┣ 📜 index.astro            # Página principal
 ┃ ┃ ┣ 📜 [tool].astro           # Páginas estáticas por herramienta
 ┃ ┃ ┣ 📜 robots.txt.js          # Directivas para crawlers
 ┃ ┃ ┗ 📜 sitemap.xml.js         # Sitemap generado desde las rutas SEO
 ┃ ┗ 📂 styles
 ┃   ┗ 📜 global.css             # Sistema visual y diseño responsive
 ┣ 📜 astro.config.mjs           # Configuración de Astro y URL del sitio
 ┣ 📜 package.json               # Dependencias y scripts
 ┗ 📜 tsconfig.json              # Configuración del editor y TypeScript
```

---

## 🚀 Requisitos e Instalación

### Requisitos

- [Node.js](https://nodejs.org/) `22.12.0` o superior.
- npm, incluido con Node.js.
- Un navegador moderno con soporte para Web Audio API si quieres usar las funciones de audio.

### Instalación Local

```bash
git clone https://github.com/melitacruces/aurolab.git
cd aurolab
npm ci
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) en el navegador. El proyecto no requiere variables de entorno para desarrollo local.

---

## 📦 Scripts y Comandos

| Comando           | Descripción                                                      |
| :---------------- | :--------------------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo de Astro con recarga automática |
| `npm run build`   | Genera el sitio estático optimizado en `dist/`                   |
| `npm run preview` | Sirve localmente la compilación de producción para revisarla     |

Para validar el resultado de producción:

```bash
npm run build
npm run preview
```

---

## 📧 Contacto

Si tienes alguna pregunta o deseas colaborar en algún proyecto, no dudes en ponerte en contacto:

- **Nombre:** Luis Andrés Melita Cruces
- **Email:** [melitacruces@gmail.com](mailto:melitacruces@gmail.com)
- **LinkedIn:** [linkedin.com/in/melitacruces](https://www.linkedin.com/in/melitacruces)
- **GitHub:** [github.com/melitacruces](https://github.com/melitacruces)
- **Ubicación:** Concepción, Chile
