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

// --- LÓGICA DE MAPA (HOTEL) ---
function updateMap(cardElement, mapUrl) {
    const mapFrame = document.getElementById('dynamicMap');
    const mapLoader = document.getElementById('mapLoader');
    if (!mapFrame) return;

    document.querySelectorAll('.place-card').forEach(card => card.classList.remove('active'));
    if(cardElement) cardElement.classList.add('active');

    if (mapLoader) mapLoader.classList.add('map-loader-active');

    setTimeout(() => {
        mapFrame.src = mapUrl;
        mapFrame.onload = () => {
            if (mapLoader) mapLoader.classList.remove('map-loader-active');
        };
    }, 200);
}

function resetMap() {
    const initialUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3344.501222738296!2d-58.62336862357091!3d-33.04326877677655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95baa82f7036ff21%3A0x92cca64ac3fdedab!2sParador%20%26%20Hotel%20El%20Tag%C3%BCe!5e0!3m2!1ses-419!2sar!4v1769046901040!5m2!1ses-419!2sar"; 
    document.querySelectorAll('.place-card').forEach(card => card.classList.remove('active'));
    const mapFrame = document.getElementById('dynamicMap');
    const mapLoader = document.getElementById('mapLoader');
    
    if (mapLoader) mapLoader.classList.add('map-loader-active');
    
    setTimeout(() => {
        if(mapFrame) mapFrame.src = initialUrl;
        if(mapFrame) mapFrame.onload = () => {
            if (mapLoader) mapLoader.classList.remove('map-loader-active');
        };
    }, 200);
}


// =========================================================
//   SISTEMA DE HORARIOS (CONECTADO A GOOGLE SHEETS API)
// =========================================================

async function initScheduleSystem() {
    const container = document.getElementById('dynamicSchedules');
    const btnPrev = document.getElementById('btnPrevDay');
    const btnNext = document.getElementById('btnNextDay');
    const labelDayName = document.getElementById('dayName');
    const labelDayDate = document.getElementById('dayDate');

    if (!container || !btnPrev || !btnNext) return;

    // ⬇️⬇️⬇️ TUS CREDENCIALES (PÉGALAS AQUÍ) ⬇️⬇️⬇️
    
    const SPREADSHEET_ID = '1fxR9b-Ju1nGUAb2Ku6qhMD94j8lp_OZcJNzAaVmF5mM'; 
    const API_KEY = 'API KEY ACA';   

    // ⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️

    const RANGE = 'Hoja 1!A:P'; 
    const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    
    let dayOffset = 0; 
    const maxOffset = 6;
    let companiesData = []; 

    // --- ANIMACIÓN "FANTASMA" (SUTIL) ---
    const changeDayWithAnimation = (newOffset) => {
        // 1. Efecto Fade Out (baja opacidad)
        container.classList.add('is-loading');
        
        // 2. Pausa breve (300ms) para cambio suave
        setTimeout(() => {
            dayOffset = newOffset;
            render(); // Dibuja los nuevos datos
            
            // 3. Efecto Fade In (vuelve a opacidad normal)
            container.classList.remove('is-loading');
        }, 300); 
    };

    // --- CARGAR DATOS (INICIAL) ---
    async function loadData() {
        try {
            // Loader simple de texto para la primera carga
            container.innerHTML = '<div style="width:100%; text-align:center; padding:40px; color:#999;">Cargando horarios...</div>';
            
            const response = await fetch(API_URL);
            const result = await response.json(); 
            
            if (result.error) {
                console.error('Error API:', result.error);
                container.innerHTML = `<div style="text-align:center; padding:40px; color:red;">Verificar configuración de API.</div>`;
                return;
            }

            if (result.values && result.values.length > 0) {
                companiesData = parseAPIData(result.values);
                render();
            } else {
                container.innerHTML = '<div style="text-align:center; padding:40px;">No hay horarios disponibles.</div>';
            }

        } catch (error) {
            console.error('Error de red:', error);
            container.innerHTML = '<div style="text-align:center; padding:40px; color:red;">Error de conexión.</div>';
        }
    }

    // --- PARSEADOR DE DATOS ---
    function parseAPIData(rows) {
        const companiesMap = {};

        // Empezamos de 1 para saltar encabezados
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            
            // Verificamos datos mínimos
            if (!row[0] || row.length < 6) continue;

            const empresaName = row[0];
            const logoPath = row[1];
            const region = row[2];
            const time = row[3];
            const dest = row[4];
            const info = row[5];
            const rawDays = row[6] ? row[6] : ""; 
            const webUrl = row[15] ? row[15] : ""; // Columna P (índice 15)

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

    // --- UTILIDADES ---
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
        if (n.includes('flecha')) return 'header-flecha';
        if (n.includes('crucero')) return 'header-crucero';
        if (n.includes('via')) return 'header-via';
        if (n.includes('rio') || n.includes('río')) return 'header-rio';
        return 'header-flecha';
    }

    // --- RENDERIZADO ---
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
            validDepartures.sort((a, b) => a.time.localeCompare(b.time));

            if (validDepartures.length > 0) {
                hasServices = true;
                const listHtml = validDepartures.map(dep => `
                    <li>
                        <div class="dep-time">${dep.time}</div>
                        <div class="dep-info"><strong>${dep.dest}</strong><span>${dep.info}</span></div>
                    </li>
                `).join('');

                // Crear botón "Ir al sitio" si hay URL
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

    // --- EVENTOS DE BOTONES (Con Animación) ---
    btnPrev.addEventListener('click', () => { 
        if(dayOffset > 0) changeDayWithAnimation(dayOffset - 1); 
    });

    btnNext.addEventListener('click', () => { 
        if(dayOffset < maxOffset) changeDayWithAnimation(dayOffset + 1); 
    });

    // Iniciar el sistema
    loadData();
}