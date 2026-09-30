# BranDers - Juego Tokens

## Descripcion

BranDers - Juego Tokens es una aplicacion interactiva tipo kiosco desarrollada con React, TypeScript y Vite. El juego muestra una experiencia de captura de tokens, calcula el puntaje final y presenta premios con imagen y codigo QR. El proyecto tambien incluye un panel administrativo local en Express para configurar activaciones, restaurantes, premios, logos, horarios y sesiones.

El repositorio incluye configuracion de Electron para ejecutar la experiencia en pantalla completa / modo kiosco y para generar un ejecutable portable de Windows.

## Tecnologias utilizadas

Versiones declaradas en `package.json`:

- React: `^19.2.8`
- React DOM: `^19.2.8`
- Vite: `^8.2.0`
- TypeScript: `~6.0.2`
- Electron: `^41.7.1`
- Electron Builder: `^26.15.3`
- Express: `^5.2.1`
- Sass Embedded: `^1.100.0`
- ESLint: `^10.8.0`
- Concurrently: `^10.0.4`

## Requisitos

- Node.js instalado.
- npm como gestor de paquetes. El proyecto incluye `package-lock.json`, por lo que la instalacion reproducible se realiza con npm.
- Windows si se desea generar el ejecutable portable configurado por `electron-builder`.

El proyecto no declara una version exacta de Node.js en `package.json` mediante `engines`. Se recomienda usar una version LTS reciente compatible con las versiones de Vite, TypeScript y Electron declaradas.

## Instalacion

Desde la carpeta donde se descomprime el codigo fuente:

```bash
npm install
```

Para una instalacion estrictamente basada en el lockfile, tambien puede usarse:

```bash
npm ci
```

## Ejecutar en desarrollo

La aplicacion del juego se ejecuta con Vite:

```bash
npm run dev
```

El panel administrativo y la API local se ejecutan con:

```bash
npm run server
```

Normalmente se usan dos terminales: una para el juego y otra para el servidor administrativo. La API queda disponible en:

```text
http://localhost:3001/api
```

El panel administrativo se sirve desde:

```text
http://localhost:3001
```

Tambien existe el script:

```bash
npm run dev:all
```

Este script esta definido en `package.json` para iniciar procesos con `concurrently`.

## Generar build

Para generar la version web de produccion:

```bash
npm run build
```

Este comando ejecuta primero la compilacion/verificacion de TypeScript con `tsc -b` y luego genera los archivos de produccion con Vite en la carpeta `dist/`.

Para previsualizar el build web generado:

```bash
npm run preview
```

## Electron

El proyecto incluye Electron en `electron/main.cjs`.

Antes de ejecutar Electron, debe existir el build web en `dist/`:

```bash
npm run build
npm run electron
```

Para generar el ejecutable/paquete de escritorio configurado:

```bash
npm run electron:build
```

La configuracion de `electron-builder` esta dentro de `package.json`:

- `appId`: `com.branders.juegotokens`
- `productName`: `BranDers Juego`
- salida: `electron-release/`
- target de Windows: `portable`

El ejecutable generado queda dentro de `electron-release/`.

Consideraciones de kiosco:

- La ventana de Electron se abre con `fullscreen: true`.
- La ventana usa `kiosk: true`.
- La barra de menu se oculta con `autoHideMenuBar: true`.
- El menu contextual se bloquea desde `electron/main.cjs`.
- Electron carga `dist/index.html`, por lo que siempre debe generarse el build antes de ejecutar o empaquetar la app de escritorio.

## Estructura del proyecto

```text
.
├── db/
├── electron/
├── public/
├── server/
├── src/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── README.md
```

Carpetas principales:

- `src/`: codigo fuente del juego React, pantallas, componentes, estilos, motor del juego, reglas de premios y control de audio.
- `src/assets/`: recursos usados por el juego, incluyendo imagenes, logos, premios, codigos QR, tokens y audio.
- `public/`: archivos publicos servidos por Vite, como favicon e iconos.
- `server/`: servidor Express local, API y panel administrativo estatico.
- `server/public/`: archivos HTML, CSS y JS del panel administrativo.
- `db/`: archivos JSON locales usados por el servidor para configuracion, sesiones, restaurantes y programacion.
- `electron/`: archivo principal de Electron para modo pantalla completa / kiosco.

## Assets

Los recursos principales estan organizados dentro de `src/assets/`:

- `src/assets/images/`: logos del juego.
- `src/assets/prizes/`: imagenes de premios.
- `src/assets/qr/`: codigos QR de premios.
- `src/assets/audio/`: musica y efectos de sonido.
- `src/assets/tokens/`: sprites e imagenes SVG/PNG/WebP de tokens.
- `src/assets/svg/`: ondas y recursos SVG visuales.

Los iconos y favicon globales estan en `public/`.

## Notas de entrega

La entrega de codigo fuente no debe incluir dependencias instaladas ni archivos generados. Carpetas como `node_modules/`, `dist/`, `electron-release/`, `release/` y caches locales se reconstruyen instalando dependencias y ejecutando los scripts del proyecto.

Para reconstruir desde cero:

```bash
npm install
npm run build
```

Para generar el ejecutable portable de Electron:

```bash
npm run electron:build
```
