# Carpeta de Recursos Visuales (Assets)

Coloca aquí tus renders 3D, ilustraciones y clips de video para tu portafolio.

### Estructura recomendada:
```
/ (raíz del proyecto)
├── index.html
├── style.css
├── script.js
└── assets/
    ├── render-01.jpg
    ├── kinetic-loop.mp4
    ├── anatomia.jpg
    ├── personaje.png
    └── dennis-ariel.jpg (tu foto de perfil)
```

### Cómo enlazar tus archivos en `index.html`:
- **Para una imagen**:
  ```html
  <img src="./assets/render-01.jpg" alt="Descripción de la pieza" class="project-media">
  ```
- **Para un video (bucle animado estilo Apple)**:
  ```html
  <video autoplay muted loop playsinline class="project-media">
    <source src="./assets/kinetic-loop.mp4" type="video/mp4">
  </video>
  ```
- **En el botón "Ver detalle" (para que aparezca en el modal)**:
  ```html
  data-media-type="image"
  data-media-src="./assets/render-01.jpg"
  ```
  o para video:
  ```html
  data-media-type="video"
  data-media-src="./assets/kinetic-loop.mp4"
  ```
