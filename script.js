/**
 * ==============================================================================
 * PORTAFOLIO DIGITAL DE DENNIS ARIEL — CONTROLADOR PRINCIPAL (script.js)
 * ==============================================================================
 * 
 * GUÍA PEDAGÓGICA Y ARQUITECTURA DEL SCRIPT:
 * 1. GESTIÓN DE TEMA (DARK / LIGHT MODE):
 *    Detecta preferencias del sistema operativo (macOS / Windows) y guarda la elección
 *    del usuario en localStorage para que persista entre recargas.
 * 
 * 2. FILTRADO DINÁMICO DE CATEGORÍAS:
 *    Calcula automáticamente los contadores de cada categoría, filtra las tarjetas
 *    con transiciones de opacidad y escala sin librerías externas.
 *    -> CÓMO AÑADIR UNA NUEVA CATEGORÍA:
 *       Solo añade el botón en index.html con `data-filter="mi-categoria"` y las tarjetas
 *       con `data-category="mi-categoria"`. ¡El script lo detecta automáticamente!
 * 
 * 3. MODAL DE VISTA RÁPIDA (QUICK VIEW):
 *    Extrae la información directamente de los atributos `data-*` del botón "Ver detalle"
 *    o de los elementos internos de la tarjeta, permitiendo reproducir videos o ver
 *    imágenes en alta resolución. Bloquea el scroll del body al estar activo.
 * 
 * 4. COPIADO AL PORTAPAPELES:
 *    Utiliza la API moderna `navigator.clipboard` con microinteracción visual durante 2 seg.
 * 
 * 5. SCROLL FLUIDO & NAVBAR GLASSMORPHISM:
 *    Añade o retira la clase `.scrolled` según la posición de desplazamiento de la ventana.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de módulos
  initThemeManager();
  initNavbarScroll();
  initMobileMenu();
  initCategoryFilters();
  initQuickViewModal();
  initCopyEmail();
  initFooterYear();
});

/* ==============================================================================
   1. GESTOR DE MODO OSCURO / MODO CLARO (THEME MANAGER)
   ============================================================================== */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const rootElement = document.documentElement;
  const STORAGE_KEY = 'dennis_ariel_theme';

  // 1. Determinar tema inicial: Almacenado en localStorage o preferencia del sistema
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  // 2. Event listener al botón
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = rootElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem(STORAGE_KEY, newTheme);
    });
  }

  // 3. Escuchar cambios en la preferencia del sistema operativo si el usuario no ha forzado una
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    rootElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label', 
        theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
      );
    }
  }
}

/* ==============================================================================
   2. NAVBAR BLUR & SCROLL LISTENER
   ============================================================================== */
function initNavbarScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 20;

  function handleScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Ejecutar al cargar por si la página inicia ya con scroll
}

/* ==============================================================================
   3. MENÚ MÓVIL RESPONSIVO
   ============================================================================== */
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (!mobileBtn || !navLinks) return;

  mobileBtn.addEventListener('click', () => {
    const isExpanded = mobileBtn.getAttribute('aria-expanded') === 'true';
    mobileBtn.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('mobile-open');
  });

  // Cerrar menú al hacer clic en un enlace de navegación
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Cerrar menú si se hace clic fuera del mismo
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
      navLinks.classList.remove('mobile-open');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==============================================================================
   4. SISTEMA DE FILTRADO DINÁMICO POR CATEGORÍAS
   ============================================================================== */
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-chip');
  const projectCards = document.querySelectorAll('.project-card');
  const noProjectsMsg = document.getElementById('no-projects-msg');

  if (!filterButtons.length || !projectCards.length) return;

  // Paso A: Calcular y actualizar los contadores en las etiquetas de los filtros
  updateFilterCounters(filterButtons, projectCards);

  // Paso B: Manejar eventos de clic en los botones de filtro
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 1. Actualizar estado visual activo en los botones
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // 2. Obtener filtro seleccionado (ej. 'all', '3d', 'motion', 'anatomico', 'cartoon')
      const targetFilter = button.getAttribute('data-filter');

      // 3. Ejecutar animación de filtrado fluido
      let visibleCount = 0;

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const matches = (targetFilter === 'all' || cardCategory === targetFilter);

        if (matches) {
          // Si coincide, lo mostramos suavemente
          card.style.display = 'flex';
          // Pequeño timeout para permitir que la transición CSS opere
          setTimeout(() => {
            card.classList.remove('fade-out');
            card.classList.add('fade-in');
          }, 20);
          visibleCount++;
        } else {
          // Si no coincide, fade out y luego ocultar
          card.classList.remove('fade-in');
          card.classList.add('fade-out');
          setTimeout(() => {
            if (card.classList.contains('fade-out')) {
              card.style.display = 'none';
            }
          }, 300); // 300ms coincide con la transición CSS
        }
      });

      // 4. Mostrar u ocultar mensaje de "No se encontraron obras"
      if (noProjectsMsg) {
        noProjectsMsg.style.display = (visibleCount === 0) ? 'block' : 'none';
      }
    });
  });
}

/**
 * Función auxiliar para contar automáticamente cuántos proyectos existen por categoría.
 * No requiere que modifiques código JavaScript al agregar nuevas tarjetas.
 */
function updateFilterCounters(filterButtons, projectCards) {
  // Cuenta total
  const totalCount = projectCards.length;
  const countAllElement = document.getElementById('count-all');
  if (countAllElement) countAllElement.textContent = totalCount;

  // Objeto para acumular conteos por categoría
  const categoryCounts = {};

  projectCards.forEach(card => {
    const category = card.getAttribute('data-category');
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });

  // Asignar el conteo a cada botón según su id o su data-filter
  filterButtons.forEach(btn => {
    const filterKey = btn.getAttribute('data-filter');
    if (filterKey && filterKey !== 'all') {
      const countSpan = btn.querySelector('.chip-count');
      if (countSpan) {
        countSpan.textContent = categoryCounts[filterKey] || 0;
      }
    }
  });
}

/* ==============================================================================
   5. MODAL INTERACTIVO DE VISTA RÁPIDA (QUICK VIEW)
   ============================================================================== */
function initQuickViewModal() {
  const modal = document.getElementById('quickview-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const detailTriggers = document.querySelectorAll('.btn-detail-trigger');

  // Elementos internos del modal para inyección de datos
  const modalMediaContainer = document.getElementById('modal-media-container');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalToolsList = document.getElementById('modal-tools-list');

  if (!modal) return;

  // Abrir modal con la información de la tarjeta seleccionada
  detailTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();

      // Extracción de datos del dataset del botón
      const title = trigger.getAttribute('data-title') || 'Proyecto';
      const category = trigger.getAttribute('data-category') || 'Arte Visual';
      const description = trigger.getAttribute('data-desc') || 'Sin descripción disponible.';
      const tools = trigger.getAttribute('data-tools') || '';
      const mediaType = trigger.getAttribute('data-media-type') || 'image';
      const mediaSrc = trigger.getAttribute('data-media-src') || '';

      // Inyección en el modal
      if (modalTitle) modalTitle.textContent = title;
      if (modalCategory) modalCategory.textContent = category;
      if (modalDescription) modalDescription.textContent = description;

      // Inyección dinámica de herramientas (Pills)
      if (modalToolsList) {
        modalToolsList.innerHTML = '';
        if (tools) {
          const toolsArray = tools.split(',').map(t => t.trim());
          toolsArray.forEach(tool => {
            const pill = document.createElement('span');
            pill.className = 'modal-tool-pill';
            pill.textContent = tool;
            modalToolsList.appendChild(pill);
          });
        }
      }

      // Inyección dinámica del medio (Imagen o Video)
      if (modalMediaContainer) {
        modalMediaContainer.innerHTML = '';
        if (mediaType === 'video') {
          const videoElement = document.createElement('video');
          videoElement.src = mediaSrc;
          videoElement.autoplay = true;
          videoElement.loop = true;
          videoElement.muted = true;
          videoElement.playsInline = true;
          videoElement.controls = true; // Permite pausar y reproducir en el modal
          videoElement.className = 'modal-media';
          modalMediaContainer.appendChild(videoElement);
        } else {
          const imgElement = document.createElement('img');
          imgElement.src = mediaSrc;
          imgElement.alt = title;
          imgElement.className = 'modal-media';
          modalMediaContainer.appendChild(imgElement);
        }
      }

      // Mostrar modal y bloquear scroll del body
      openModal();
    });
  });

  // Métodos de apertura y cierre
  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // Pausar cualquier video activo al cerrar para no consumir recursos
    if (modalMediaContainer) {
      const activeVideo = modalMediaContainer.querySelector('video');
      if (activeVideo) {
        activeVideo.pause();
      }
    }
  }

  // 1. Cierre mediante botón "X"
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // 2. Cierre al hacer clic fuera del contenedor (en el fondo oscuro)
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // 3. Cierre accesible mediante tecla Escape (ESC)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==============================================================================
   6. MICROINTERACCIÓN DE COPIAR CORREO AL PORTAPAPELES
   ============================================================================== */
function initCopyEmail() {
  const copyBtn = document.getElementById('copy-email-btn');
  const userEmailSpan = document.getElementById('user-email');

  if (!copyBtn || !userEmailSpan) return;

  const copyText = copyBtn.querySelector('.copy-text');
  const copyIcon = copyBtn.querySelector('.copy-icon');
  const checkIcon = copyBtn.querySelector('.check-icon');

  copyBtn.addEventListener('click', async () => {
    const emailToCopy = userEmailSpan.textContent.trim();

    try {
      // Método principal: API moderna de portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        // Fallback clásico para navegadores antiguos o entornos no seguros
        const textArea = document.createElement('textarea');
        textArea.value = emailToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Feedback visual inmediato (Estilo Apple macOS)
      copyBtn.classList.add('copied');
      if (copyText) copyText.textContent = '¡Copiado con éxito!';
      if (copyIcon) copyIcon.style.display = 'none';
      if (checkIcon) checkIcon.style.display = 'block';

      // Restaurar estado original tras 2.2 segundos
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (copyText) copyText.textContent = 'Copiar correo';
        if (copyIcon) copyIcon.style.display = 'block';
        if (checkIcon) checkIcon.style.display = 'none';
      }, 2200);

    } catch (err) {
      console.error('Error al copiar correo al portapapeles:', err);
      if (copyText) copyText.textContent = 'Error al copiar';
      setTimeout(() => {
        if (copyText) copyText.textContent = 'Copiar correo';
      }, 2000);
    }
  });
}

/* ==============================================================================
   7. ACTUALIZACIÓN AUTOMÁTICA DEL AÑO EN FOOTER
   ============================================================================== */
function initFooterYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
