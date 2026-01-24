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

    // --- 2. PRELOADER GLOBAL ---
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

    // --- 5. LÓGICA DE BARRA DE RESERVA (HOTEL) ---
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

    // --- 6. SISTEMA DE HORARIOS DINÁMICOS (PARADOR) ---
    if (document.getElementById('dynamicSchedules')) {
        initScheduleSystem();
    }

}); // --- FIN DOMContentLoaded ---


// ==========================================
//           FUNCIONES GLOBALES
// ==========================================

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return (hours * 60) + minutes;
}

function consultarHabitacion(tipo) {
    const message = `Hola! Estoy interesado en reservar la habitación *${tipo}*.`;
    window.open(`https://wa.me/5493446621925?text=${message}`, '_blank');
}

// --- LÓGICA DE GALERÍA SUAVE (CAMPO) ---
function toggleGallery(galleryId, btn) {
    const gallery = document.getElementById('gallery-' + galleryId);
    if (!gallery) return;
    
    const hiddenItems = gallery.querySelectorAll('.gallery-hidden');
    const isExpanded = btn.classList.contains('expanded');

    if (!isExpanded) {
        hiddenItems.forEach(item => {
            item.style.display = 'block';
            setTimeout(() => { item.classList.add('fade-in'); }, 10);
        });
        btn.innerHTML = 'Ver menos fotos <i class="fa-solid fa-chevron-up"></i>';
        btn.classList.add('expanded');
    } else {
        hiddenItems.forEach(item => {
            item.classList.remove('fade-in');
            setTimeout(() => { item.style.display = 'none'; }, 300);
        });
        btn.innerHTML = 'Ver más fotos <i class="fa-solid fa-chevron-down"></i>';
        btn.classList.remove('expanded');
        gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- LÓGICA DE MODAL DE IMÁGENES ---
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
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function navigateImage(direction) {
    if (currentImages.length === 0) return;
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    if (currentIndex >= currentImages.length) currentIndex = 0;
    
    const img = currentImages[currentIndex];
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    if (modalImg) modalImg.src = img.src;
    if (caption) caption.textContent = img.alt;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- LÓGICA DE MAPA ---
function updateMap(cardElement, mapUrl) {
    const mapFrame = document.getElementById('dynamicMap');
    const mapLoader = document.getElementById('mapLoader');
    if (!mapFrame) return;

    document.querySelectorAll('.amenity-item.interactive-card, .place-card').forEach(card => card.classList.remove('active'));
    
    if(cardElement) cardElement.classList.add('active');

    if (mapLoader) mapLoader.classList.add('map-loader-active');

    setTimeout(() => {
        mapFrame.src = mapUrl;
        mapFrame.onload = () => {
            if (mapLoader) mapLoader.classList.remove('map-loader-active');
        };
    }, 200);
}


// =========================================================
//   SISTEMA DE HORARIOS (MODO DEMO / SIN API KEY)
// =========================================================

async function initScheduleSystem() {
    const container = document.getElementById('dynamicSchedules');
    const btnPrev = document.getElementById('btnPrevDay');
    const btnNext = document.getElementById('btnNextDay');
    const labelDayName = document.getElementById('dayName');
    const labelDayDate = document.getElementById('dayDate');

    if (!container || !btnPrev || !btnNext) return;

    // API DESACTIVADA PARA DEMO
    // const SPREADSHEET_ID = '1fxR9b-Ju1nGUAb2Ku6qhMD94j8lp_OZcJNzAaVmF5mM'; 
    // const API_KEY = 'TU_CLAVE_AQUI';   
    
    let dayOffset = 0; 
    const maxOffset = 6;
    let companiesData = []; 

    // --- DATOS SIMULADOS PARA LAS 4 EMPRESAS ---
    const MOCK_DATA = {
        values: [
            ["header", "logo", "region", "hora", "destino", "info", "dias"], // Header ignorado
            
            // FLECHA BUS
            ["Flecha Bus", "img/parador/flecha bus.svg", "A Buenos Aires", "08:30", "Retiro", "Semi Cama", "lun-mie-vie", "", "", "", "", "", "", "", "", "https://www.flechabus.com.ar"],
            ["Flecha Bus", "img/parador/flecha bus.svg", "A Buenos Aires", "01:15", "Retiro", "Cama Ejecutivo", "todos", "", "", "", "", "", "", "", "", "https://www.flechabus.com.ar"],
            ["Flecha Bus", "img/parador/flecha bus.svg", "Al Norte", "15:45", "Concordia", "Directo", "todos", "", "", "", "", "", "", "", "", "https://www.flechabus.com.ar"],

            // RÁPIDO TATA (Agregado estilo 'header-rapido')
            ["Rápido Tata", "img/parador/rapido tata.svg", "A Buenos Aires", "09:00", "Retiro", "Semicama", "todos", "", "", "", "", "", "", "", "", "https://www.rapidotata.com.ar"],
            ["Rápido Tata", "img/parador/rapido tata.svg", "Al Litoral", "22:30", "Gualeguay", "Coche Cama", "vie-sab-dom", "", "", "", "", "", "", "", "", ""],

            // CRUCERO DEL NORTE
            ["Crucero del Norte", "img/parador/crucero del norte.svg", "Noreste", "02:45", "Foz do Iguazú", "Servicio Premium", "mar-jue-sab", "", "", "", "", "", "", "", "", "https://www.crucerodelnorte.com.ar"],
            ["Crucero del Norte", "img/parador/crucero del norte.svg", "A Posadas", "16:00", "Posadas", "Cama Total", "todos", "", "", "", "", "", "", "", "", ""],

            // VÍA BARILOCHE
            ["Vía Bariloche", "img/parador/via bariloche.svg", "Al Sur", "19:15", "Bariloche", "Cena a bordo", "todos", "", "", "", "", "", "", "", "", "https://www.viabariloche.com.ar"],
            ["Vía Bariloche", "img/parador/via bariloche.svg", "A la Costa", "23:00", "Mar del Plata", "Temporada Alta", "vie-sab", "", "", "", "", "", "", "", "", ""]
        ]
    };

    const changeDayWithAnimation = (newOffset) => {
        container.classList.add('is-loading');
        setTimeout(() => {
            dayOffset = newOffset;
            render(); 
            container.classList.remove('is-loading');
        }, 300); 
    };

    async function loadData() {
        try {
            container.innerHTML = '<div style="width:100%; text-align:center; padding:40px; color:#999;">Cargando horarios...</div>';
            
            setTimeout(() => {
                const result = MOCK_DATA; // Usamos datos simulados

                if (result.values && result.values.length > 0) {
                    companiesData = parseAPIData(result.values);
                    render();
                } else {
                    container.innerHTML = '<div style="text-align:center; padding:40px;">No hay horarios disponibles.</div>';
                }
            }, 500);

        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div style="text-align:center; padding:40px; color:red;">Error de conexión.</div>';
        }
    }

    function parseAPIData(rows) {
        const companiesMap = {};

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row[0] || row.length < 6) continue;

            const empresaName = row[0];
            const logoPath = row[1];
            const region = row[2];
            const time = row[3];
            const dest = row[4];
            const info = row[5];
            const rawDays = row[6] ? row[6] : ""; 
            const webUrl = row[15] ? row[15] : ""; 

            if (!companiesMap[empresaName]) {
                companiesMap[empresaName] = {
                    name: empresaName,
                    logo: logoPath,   
                    headerClass: getHeaderClass(empresaName), 
                    region: region,
                    web: webUrl,
                    departures: []
                };
            }

            const daysParsed = parseDays(rawDays);
            if (daysParsed === 'all' || daysParsed.length > 0) {
                companiesMap[empresaName].departures.push({
                    time: time, dest: dest, info: info, days: daysParsed
                });
            }
        }
        return Object.values(companiesMap);
    }

    function parseDays(dayString) {
        if (!dayString || dayString.trim() === '') return []; 
        if (dayString.toLowerCase().includes('todos')) return 'all';
        const map = { 'dom':0, 'lun':1, 'mar':2, 'mie':3, 'mié':3, 'jue':4, 'vie':5, 'sab':6, 'sáb':6 };
        const result = [];
        const cleanParts = dayString.toLowerCase().split('-'); 
        cleanParts.forEach(d => {
            const code = d.trim().substring(0, 3);
            if (map.hasOwnProperty(code)) result.push(map[code]);
        });
        return result; 
    }

    function getHeaderClass(name) {
        const n = name.toLowerCase();
        // Asignamos colores según el nombre
        if (n.includes('flecha')) return 'header-flecha'; // Amarillo
        if (n.includes('crucero')) return 'header-crucero'; // Naranja
        if (n.includes('via')) return 'header-via'; // Azul
        if (n.includes('rapido') || n.includes('tata')) return 'header-rapido'; // Rojo
        return 'header-flecha'; 
    }

    const render = () => {
        container.innerHTML = '';
        const displayDate = new Date();
        displayDate.setDate(new Date().getDate() + dayOffset);
        
        const dayOfWeek = displayDate.getDay(); 
        const dayStr = displayDate.toLocaleDateString('es-AR', { weekday: 'long' });
        const dateStr = displayDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

        const dayCapitalized = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
        if (dayOffset === 0) labelDayName.textContent = "Hoy";
        else if (dayOffset === 1) labelDayName.textContent = "Mañana";
        else labelDayName.textContent = dayCapitalized;
        
        labelDayDate.textContent = dateStr;

        btnPrev.classList.toggle('disabled', dayOffset === 0);
        btnNext.classList.toggle('disabled', dayOffset >= maxOffset);

        let hasServices = false;

        companiesData.forEach(company => {
            const validDepartures = company.departures.filter(dep => 
                dep.days === 'all' || dep.days.includes(dayOfWeek)
            );
            
            validDepartures.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

            if (validDepartures.length > 0) {
                hasServices = true;
                const listHtml = validDepartures.map(dep => `
                    <li>
                        <div class="dep-time">${dep.time}</div>
                        <div class="dep-info"><strong>${dep.dest}</strong><span>${dep.info}</span></div>
                    </li>
                `).join('');

                let overlayHtml = '';
                if (company.web && company.web.startsWith('http')) {
                    overlayHtml = `
                        <a href="${company.web}" target="_blank" class="website-link-overlay">
                            <span>Ir al sitio</span>
                            <i class="fa-solid fa-arrow-right-long"></i>
                        </a>
                    `;
                }

                const card = document.createElement('div');
                card.className = 'schedule-card fade-in-up';
                
                card.innerHTML = `
                    <div class="company-logo-area">
                        <img src="${company.logo}" alt="${company.name}" onerror="this.src='img/logo.svg'">
                        ${overlayHtml}
                    </div>
                    <div class="company-header ${company.headerClass}">
                        <h3>${company.region}</h3>
                    </div>
                    <ul class="departure-list">
                        ${listHtml}
                    </ul>
                `;
                container.appendChild(card);
            }
        });

        if (!hasServices) {
            container.innerHTML = `
                <div style="width:100%; text-align:center; padding:40px; color:#888;">
                    <i class="fa-solid fa-bus-simple" style="font-size: 2rem; margin-bottom:10px; opacity:0.5;"></i>
                    <p>No hay servicios programados para esta fecha.</p>
                </div>`;
        }
    };

    btnPrev.addEventListener('click', () => { 
        if(dayOffset > 0) changeDayWithAnimation(dayOffset - 1); 
    });

    btnNext.addEventListener('click', () => { 
        if(dayOffset < maxOffset) changeDayWithAnimation(dayOffset + 1); 
    });

    loadData();
}