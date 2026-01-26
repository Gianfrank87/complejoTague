document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENÚ MÓVIL ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('is-active');
            navMenu.classList.toggle('is-open');
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                hamburgerBtn.classList.remove('is-active');
                navMenu.classList.remove('is-open');
            }
        });
    }

    // --- 2. PRELOADER ---
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.classList.add('loader-hidden');
            setTimeout(() => { pageLoader.style.display = 'none'; }, 500);
        }, 500);
    }

    // --- 3. SCROLL SUAVE ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (navMenu && navMenu.classList.contains('is-open')) {
                    hamburgerBtn.classList.remove('is-active');
                    navMenu.classList.remove('is-open');
                }
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // --- 4. ANIMACIÓN REVEAL ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;
        reveals.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // --- 5. LOGICA DEL HOTEL ---
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const guestsSelect = document.getElementById('guests');
    const btnConsultar = document.getElementById('btnConsultar');

    if (checkinInput && checkoutInput && btnConsultar) {
        const today = new Date().toISOString().split('T')[0];
        checkinInput.setAttribute('min', today);
        checkoutInput.setAttribute('min', today);

        checkinInput.addEventListener('change', function() {
            checkoutInput.setAttribute('min', this.value);
            if (checkoutInput.value && checkoutInput.value < this.value) {
                checkoutInput.value = this.value;
            }
        });

        btnConsultar.addEventListener('click', () => {
            const checkin = checkinInput.value;
            const checkout = checkoutInput.value;
            const guests = guestsSelect ? guestsSelect.value : "2"; 
            if (!checkin || !checkout) {
                alert('Por favor, selecciona fecha de llegada y salida.');
                return;
            }
            const message = `Hola! Quisiera consultar disponibilidad.%0A%0A📅 *Llegada:* ${formatDate(checkin)}%0A📅 *Salida:* ${formatDate(checkout)}%0A👥 *Personas:* ${guests}`;
            window.open(`https://wa.me/5493446621925?text=${message}`, '_blank');
        });
    }

    // --- 6. SISTEMA DE HORARIOS ---
    if (document.getElementById('gridContainer') || document.getElementById('listContainer')) {
        initScheduleSystem();
    }

}); 


// ==========================================
//          FUNCIONES GLOBALES
// ==========================================

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function toggleGallery(galleryId, btn) {
    const gallery = document.getElementById('gallery-' + galleryId);
    if (!gallery) return;
    const hiddenItems = gallery.querySelectorAll('.gallery-hidden');
    const isExpanded = btn.classList.contains('expanded');
    if (!isExpanded) {
        hiddenItems.forEach(item => { item.style.display = 'block'; setTimeout(() => { item.classList.add('fade-in'); }, 10); });
        btn.innerHTML = 'Ver menos fotos <i class="fa-solid fa-chevron-up"></i>';
        btn.classList.add('expanded');
    } else {
        hiddenItems.forEach(item => { item.classList.remove('fade-in'); setTimeout(() => { item.style.display = 'none'; }, 300); });
        btn.innerHTML = 'Ver más fotos <i class="fa-solid fa-chevron-down"></i>';
        btn.classList.remove('expanded');
        gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

let currentImages = [];
let currentIndex = 0;
function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (!modal || !modalImg) return;
    const gallery = img.closest('.gallery-grid') || img.closest('.marquee-content'); 
    currentImages = gallery ? Array.from(gallery.querySelectorAll('img')) : [img];
    currentIndex = currentImages.indexOf(img);
    modal.style.display = 'flex';
    modalImg.src = img.src;
    if(caption) caption.textContent = img.alt;
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
}
function navigateImage(direction) {
    if (currentImages.length === 0) return;
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    if (currentIndex >= currentImages.length) currentIndex = 0;
    const img = currentImages[currentIndex];
    const modalImg = document.getElementById('modalImage');
    if (modalImg) modalImg.src = img.src;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function updateMap(cardElement, mapUrl) {
    const mapFrame = document.getElementById('dynamicMap');
    if (!mapFrame) return;
    document.querySelectorAll('.place-card').forEach(card => card.classList.remove('active'));
    if(cardElement) cardElement.classList.add('active');
    setTimeout(() => { mapFrame.src = mapUrl; }, 200);
}


// =========================================================
//   SISTEMA DE HORARIOS HÍBRIDO (GRID / LIST)
// =========================================================

async function initScheduleSystem() {
    const gridContainer = document.getElementById('gridContainer');
    const listContainer = document.getElementById('listContainer');
    const listScrollArea = document.getElementById('listScrollArea');
    const btnPrev = document.getElementById('btnPrevView');
    const btnNext = document.getElementById('btnNextView');
    const viewNameLabel = document.getElementById('viewName');
    const searchInput = document.getElementById('destinationInput');
    const suggestionsList = document.getElementById('suggestionsList');

    if (!gridContainer || !listContainer) return;

    // --- 1. CONFIGURACIÓN ---
    const logoMapList = {
        "via bariloche": "img/logos/via bariloche.jpg",
        "flecha bus": "img/logos/flecha bus.png",
        "crucero del norte": "img/logos/crucero del norte.png",
        "rapido tata": "img/logos/rapido tata.png",
        "rápido tata": "img/logos/rapido tata.png"
    };

    const mainCompaniesConfig = [
        { name: "Via Bariloche", headerClass: "header-via", region: "Vía Bariloche", logoSvg: "img/parador/via bariloche.svg", borderClass: "border-via" },
        { name: "Flecha Bus", headerClass: "header-flecha", region: "Flecha Bus", logoSvg: "img/parador/flecha bus.svg", borderClass: "border-flecha" },
        { name: "Rapido Tata", headerClass: "header-rapido", region: "Rápido Tata", logoSvg: "img/parador/rapido tata.svg", borderClass: "border-rapido" },
        { name: "Crucero del Norte", headerClass: "header-crucero", region: "Crucero del Norte", logoSvg: "img/parador/crucero del norte.svg", borderClass: "border-crucero" }
    ];

    // --- 2. DATOS DE LOS VIAJES ---
    const allTrips = [
        // VIA BARILOCHE
        { empresa: "Via Bariloche", time: "04:35", dest: "Retiro", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "05:30", dest: "Retiro", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "07:35", dest: "Retiro", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "09:50", dest: "Retiro", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "10:25", dest: "Retiro", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        
        { empresa: "Via Bariloche", time: "04:35", dest: "Mar del Plata", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        
        { empresa: "Via Bariloche", time: "00:00", dest: "Posadas", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "00:40", dest: "Posadas", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "17:35", dest: "Posadas", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "21:00", dest: "Posadas", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "23:05", dest: "Posadas", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        
        { empresa: "Via Bariloche", time: "00:00", dest: "Puerto Iguazú", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "00:40", dest: "Puerto Iguazú", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "17:35", dest: "Puerto Iguazú", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },
        { empresa: "Via Bariloche", time: "21:00", dest: "Puerto Iguazú", info: "Cama / Semi", web: "https://www.viabariloche.com.ar" },

        // RAPIDO TATA
        { empresa: "Rapido Tata", time: "19:40", dest: "Roque Sáenz Peña", info: "Cama / Semi", web: "https://www.rapidotata.com.ar" },
        { empresa: "Rapido Tata", time: "19:40", dest: "Mercedes", info: "Cama / Semi", web: "https://www.rapidotata.com.ar" },
        { empresa: "Rapido Tata", time: "19:40", dest: "Resistencia", info: "Cama / Semi", web: "https://www.rapidotata.com.ar" },
        { empresa: "Rapido Tata", time: "19:40", dest: "Miraflores", info: "Cama / Semi", web: "https://www.rapidotata.com.ar" },

        // FLECHA BUS
        { empresa: "Flecha Bus", time: "14:00", dest: "Porto Alegre (Brasil)", info: "Cama / Semi", web: "https://www.flechabus.com.ar" },
        { empresa: "Flecha Bus", time: "14:00", dest: "Florianópolis (Brasil)", info: "Cama / Semi", web: "https://www.flechabus.com.ar" },
        { empresa: "Flecha Bus", time: "14:00", dest: "Camboriú (Brasil)", info: "Cama / Semi", web: "https://www.flechabus.com.ar" },

        // CRUCERO DEL NORTE
        { empresa: "Crucero del Norte", time: "20:30", dest: "Eldorado", info: "Cama / Semi", web: "https://www.crucerodelnorte.com.ar" },
        { empresa: "Crucero del Norte", time: "20:30", dest: "Posadas", info: "Cama / Semi", web: "https://www.crucerodelnorte.com.ar" },
        { empresa: "Crucero del Norte", time: "20:30", dest: "Puerto Iguazú", info: "Cama / Semi", web: "https://www.crucerodelnorte.com.ar" }
    ];

    // --- 3. AUTOCOMPLETADO PERSONALIZADO ---
    function setupAutocomplete() {
        if(!searchInput || !suggestionsList) return;
        const destinations = [...new Set(allTrips.map(t => t.dest))].sort();

        searchInput.addEventListener('input', function() {
            const val = this.value.toLowerCase();
            suggestionsList.innerHTML = ''; 
            
            if (val.length === 0) {
                suggestionsList.classList.add('hidden');
                applyFilter(''); 
                return;
            }

            const matches = destinations.filter(dest => dest.toLowerCase().includes(val));

            if (matches.length > 0) {
                suggestionsList.classList.remove('hidden');
                matches.forEach(dest => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${dest}`;
                    li.addEventListener('click', () => {
                        searchInput.value = dest;
                        suggestionsList.classList.add('hidden');
                        applyFilter(dest);
                    });
                    suggestionsList.appendChild(li);
                });
            } else {
                suggestionsList.classList.add('hidden');
            }
            applyFilter(val);
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.classList.add('hidden');
            }
        });
    }

    // --- 4. CONTROLADOR DE VISTAS ---
    let currentViewMode = 'grid'; 

    function switchView() {
        if(searchInput) searchInput.value = '';
        if(suggestionsList) suggestionsList.classList.add('hidden');
        applyFilter('');

        if (currentViewMode === 'grid') {
            currentViewMode = 'list';
            viewNameLabel.textContent = "Todos los Horarios";
            gridContainer.classList.add('hidden');
            listContainer.classList.remove('hidden');
            if(listScrollArea.children.length === 0) renderList();
        } else {
            currentViewMode = 'grid';
            viewNameLabel.textContent = "Por Empresas";
            listContainer.classList.add('hidden');
            gridContainer.classList.remove('hidden');
        }
    }

    // --- 5. FILTRO DE BÚSQUEDA ---
    function applyFilter(searchTerm) {
        const term = searchTerm.toLowerCase();

        if (currentViewMode === 'grid') {
            const cards = gridContainer.querySelectorAll('.schedule-card');
            cards.forEach(card => {
                const list = card.querySelector('.departure-list');
                const items = list.querySelectorAll('li:not(.no-results-in-card)');
                const noResultsMsg = card.querySelector('.no-results-in-card');
                let visibleCount = 0;

                items.forEach(item => {
                    const destText = item.querySelector('.dep-info strong').textContent.toLowerCase();
                    if (destText.includes(term)) {
                        item.classList.remove('hidden-item');
                        visibleCount++;
                    } else {
                        item.classList.add('hidden-item');
                    }
                });

                if (visibleCount === 0 && items.length > 0) {
                    if(noResultsMsg) noResultsMsg.classList.remove('hidden');
                } else {
                    if(noResultsMsg) noResultsMsg.classList.add('hidden');
                }
            });
        } else {
            const rows = listScrollArea.querySelectorAll('.schedule-row');
            const noResList = document.getElementById('noResultsList');
            let visibleCount = 0;

            rows.forEach(row => {
                const destText = row.querySelector('.row-dest').textContent.toLowerCase();
                if (destText.includes(term)) {
                    row.classList.remove('hidden-item');
                    visibleCount++;
                } else {
                    row.classList.add('hidden-item');
                }
            });

            // LOGICA MENSAJE NO RESULTADOS EN LISTA
            if (visibleCount === 0) {
                if(noResList) noResList.classList.remove('hidden');
            } else {
                if(noResList) noResList.classList.add('hidden');
            }
        }
    }

    // --- 6. RENDERIZADO: MODO GRILLA ---
    function renderGrid() {
        gridContainer.innerHTML = '';
        
        mainCompaniesConfig.forEach(config => {
            const trips = allTrips.filter(t => t.empresa === config.name);
            trips.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

            const listItems = trips.map(t => `
                <li>
                    <div class="dep-time">${t.time}</div>
                    <div class="dep-info"><strong>${t.dest}</strong><span>${t.info}</span></div>
                </li>
            `).join('');

            const logoPath = config.logoSvg;
            
            const card = document.createElement('div');
            card.className = 'schedule-card fade-in-up';
            card.innerHTML = `
                <div class="company-logo-area">
                    <img src="${logoPath}" alt="${config.name}">
                </div>
                <div class="company-header ${config.headerClass}">
                    <h3>${config.region}</h3>
                </div>
                <ul class="departure-list">
                    ${listItems || '<li style="padding:20px; color:#999;">Sin servicios</li>'}
                    <li class="no-results-in-card hidden">
                        No encontrado en esta empresa.
                        <small>Consulte en boletería</small>
                    </li>
                </ul>
            `;
            gridContainer.appendChild(card);
        });
    }

    // --- 7. RENDERIZADO: MODO LISTA ---
    function renderList() {
        listScrollArea.innerHTML = '';
        
        const sortedTrips = [...allTrips].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

        sortedTrips.forEach((trip, index) => {
            const logoPath = getLogoPathList(trip.empresa);
            
            // Determinar color de borde
            const companyConfig = mainCompaniesConfig.find(c => c.name === trip.empresa);
            const borderClass = companyConfig ? companyConfig.borderClass : '';

            const btnLink = trip.web ? 
                `<a href="${trip.web}" target="_blank" class="btn-ticket"><i class="fa-solid fa-ticket"></i> Comprar</a>` : 
                `<span class="btn-ticket" style="background:#ccc; cursor:not-allowed;">Boletería</span>`;

            const row = document.createElement('div');
            row.className = `schedule-row ${borderClass}`;
            if(index < 20) row.style.animationDelay = `${index * 0.03}s`;
            row.classList.add('fade-in-up');
            
            row.innerHTML = `
                <div class="row-logo">
                    <img src="${logoPath}" alt="${trip.empresa}">
                </div>
                <div class="row-time">
                    <span class="time-big">${trip.time}</span>
                    <span class="time-label">Salida</span>
                </div>
                <div class="row-info">
                    <strong class="row-dest">${trip.dest}</strong>
                    <div class="row-meta">
                        <span><i class="fa-solid fa-bus"></i> ${trip.empresa}</span>
                        <span><i class="fa-solid fa-couch"></i> ${trip.info}</span>
                    </div>
                </div>
                <div class="row-action">
                    ${btnLink}
                </div>
            `;
            listScrollArea.appendChild(row);
        });

        // AGREGAMOS EL DIV DE "NO RESULTADOS" OCULTO AL FINAL
        const noRes = document.createElement('div');
        noRes.id = 'noResultsList';
        noRes.className = 'no-results-list hidden';
        noRes.innerHTML = `
            <i class="fa-solid fa-road"></i>
            <p>No se encontraron viajes para ese destino.</p>
            <small>Intente con otro o consulte en boletería.</small>
        `;
        listScrollArea.appendChild(noRes);
    }

    // --- UTILS ---
    function timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        // Manejar formato "00hs" o "21 hs"
        let cleanTime = timeStr.toLowerCase().replace('hs', '').replace(' ', '').trim();
        // Si no tiene minutos (ej: "21"), agregar ":00"
        if (!cleanTime.includes(':')) cleanTime += ':00';
        
        const [hours, minutes] = cleanTime.split(':').map(Number);
        return (hours * 60) + (minutes || 0);
    }

    function getLogoPathList(companyName) {
        const key = companyName.toLowerCase().trim();
        return logoMapList[key] || "img/logo.svg";
    }

    // --- EVENTOS ---
    if(btnPrev) btnPrev.addEventListener('click', switchView);
    if(btnNext) btnNext.addEventListener('click', switchView);

    // Inicializar
    setupAutocomplete();
    renderGrid();
    renderList(); 
}