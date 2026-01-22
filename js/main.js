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

    // --- 5. LÓGICA DE BARRA DE RESERVA ---
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
});

// --- FUNCIONES GLOBALES ---

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
        // Mostrar
        hiddenItems.forEach(item => {
            item.style.display = 'block';
            // Pequeño timeout para permitir que el navegador registre el 'display:block' antes de animar opacidad
            setTimeout(() => {
                item.classList.add('fade-in');
            }, 10);
        });
        btn.innerHTML = 'Ver menos fotos <i class="fa-solid fa-chevron-up"></i>';
        btn.classList.add('expanded');
    } else {
        // Ocultar
        hiddenItems.forEach(item => {
            item.classList.remove('fade-in');
            setTimeout(() => {
                item.style.display = 'none';
            }, 300); // Esperar a que termine la transición
        });
        btn.innerHTML = 'Ver más fotos <i class="fa-solid fa-chevron-down"></i>';
        btn.classList.remove('expanded');
        gallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// --- LÓGICA DE MODAL ---
let currentImages = [];
let currentIndex = 0;

function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('modalCaption');
    
    if (!modal || !modalImg) return;

    // Buscar imágenes en la galería o carrusel (Marquee)
    const gallery = img.closest('.gallery-grid') || img.closest('.marquee-content'); 
    
    if (gallery) {
        currentImages = Array.from(gallery.querySelectorAll('img'));
    } else {
        currentImages = [img];
    }
    
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