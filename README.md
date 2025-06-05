# Tácticas del Río Revuelto

Este es un juego de estrategia por turnos implementado en JavaScript.

## Tutorial del Juego

Este proyecto incluye un tutorial completo que explica qué es el juego y cómo se juega.

Puedes acceder al tutorial de dos maneras:

1.  **Dentro del Juego:** En el menú principal, haz clic en el botón "Cómo Jugar (Tutorial)".
2.  **Archivo Markdown:** Puedes leer el tutorial directamente en el archivo [`TUTORIAL.md`](TUTORIAL.md) ubicado en la raíz del repositorio.

## Cómo Jugar (Breve Resumen)

El objetivo principal en Tácticas del Río Revuelto es destruir la Base enemiga o, alternativamente, eliminar todas sus unidades móviles. Es un juego de estrategia por turnos donde los jugadores comandan un ejército de diversas unidades con habilidades únicas. En cada turno, las unidades pueden moverse o atacar, pero no ambas acciones. El campo de batalla, dividido por un río con puentes, añade un componente táctico crucial al movimiento y posicionamiento.

## Desarrollo

### Cómo Ejecutar el Proyecto Localmente

Para el juego local básico (modos "VS IA" y "Multijugador Local"), simplemente abre el archivo `index.html` en un navegador web moderno que soporte módulos ES6 (JavaScript Modules). No se requiere un servidor web dedicado para estas funcionalidades.

### Dependencias Externas (Cargadas vía CDN)

El proyecto utiliza las siguientes bibliotecas externas, las cuales son cargadas automáticamente a través de sus respectivas CDNs (Content Delivery Networks):

*   **Tailwind CSS:** Para la estilización y el diseño de la interfaz de usuario.
*   **Tone.js:** Para la generación y control de efectos de sonido y música en el juego.

### Estándar de JavaScript

El código JavaScript del proyecto está escrito utilizando **módulos ES6**.

### Dependencia de Firebase (Para Multijugador Online)

Para las funcionalidades de **multijugador online**, Tácticas del Río Revuelto depende de **Firebase**. Específicamente, se utiliza para:

*   Autenticación de usuarios.
*   Gestión de partidas en tiempo real (crear, unirse, sincronizar estado).

**Configuración de Firebase:**

Para que el modo multijugador online funcione, necesitarás configurar tu propio proyecto de Firebase:

1.  Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2.  Habilita los servicios que el juego pueda necesitar (por ejemplo, Firebase Authentication para usuarios anónimos y Firebase Realtime Database o Firestore para la gestión de partidas).
3.  Obtén las credenciales de configuración de tu proyecto Firebase (API Key, Auth Domain, Project ID, etc.).
4.  Esta configuración debe ser introducida en el archivo `js/firebase.js`. Revisa dicho archivo para conocer la estructura esperada de las credenciales que permitirán la conexión a tus servicios de Firebase.

Sin una configuración válida de Firebase en `js/firebase.js`, las características de multijugador online no estarán operativas.
