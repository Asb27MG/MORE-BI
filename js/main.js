/**
 * MORE BI - JavaScript
 * Funcionalidades: Data Streams, Smooth Scroll, Parallax, Mouse Effects
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. GENERAR DATA STREAMS (EFECTO MATRIX)
    // ==========================================
    function initDataStreams() {
        const dataContainer = document.getElementById('dataStreams');
        if (!dataContainer) return;
        
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const streamCount = 20;
        
        for (let i = 0; i < streamCount; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-stream';
            
            // Posición aleatoria horizontal
            stream.style.left = Math.random() * 100 + '%';
            
            // Duración y delay aleatorios para animación orgánica
            const duration = Math.random() * 10 + 10; // 10-20s
            const delay = Math.random() * 5;
            const opacity = Math.random() * 0.5 + 0.1;
            
            stream.style.animationDuration = duration + 's';
            stream.style.animationDelay = delay + 's';
            stream.style.opacity = opacity;
            
            // Generar cadena de caracteres aleatorios
            let text = '';
            const charCount = 50;
            for (let j = 0; j < charCount; j++) {
                text += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            stream.innerHTML = text;
            
            dataContainer.appendChild(stream);
        }
    }

    // ==========================================
    // 2. SMOOTH SCROLL PARA NAVEGACIÓN
    // ==========================================
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Offset para el navbar fijo
                    const navHeight = 80;
                    const targetPosition = targetSection.offsetTop - navHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================
    // 3. EFECTO PARALLAX EN VIDEO DE FONDO
    // ==========================================
    function initParallax() {
        const video = document.querySelector('.video-bg');
        if (!video) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrolled = window.pageYOffset;
                    // Movimiento más lento que el scroll para efecto parallax
                    video.style.transform = `translateY(${scrolled * 0.5}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==========================================
    // 4. EFECTO INTERACTIVO CON MOUSE
    // ==========================================
    function initMouseEffect() {
        const cards = document.querySelectorAll('.service-card');
        if (cards.length === 0) return;
        
        // Solo aplicar en dispositivos no táctiles
        if (window.matchMedia('(pointer: coarse)').matches) return;
        
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let rafId = null;
        let isActive = false;
        
        function animate() {
            if (!isActive) return;
            
            // Suavizado del movimiento
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            cards.forEach((card, index) => {
                const speed = (index + 1) * 10;
                const xOffset = (window.innerWidth / 2 - currentX) / speed;
                const yOffset = (window.innerHeight / 2 - currentY) / speed;
                
                // Aplicar transformación solo si no está en hover
                if (!card.matches(':hover')) {
                    card.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
                }
            });
            
            rafId = requestAnimationFrame(animate);
        }
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!isActive) {
                isActive = true;
                animate();
            }
        });
        
        // Detener animación cuando el mouse sale de la ventana
        document.addEventListener('mouseleave', function() {
            isActive = false;
            if (rafId) cancelAnimationFrame(rafId);
            
            // Resetear posición de las tarjetas
            cards.forEach(card => {
                card.style.transform = '';
            });
        });
    }

    // ==========================================
    // 5. ANIMACIÓN DE ENTRADA AL SCROLL
    // ==========================================
    function initScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observar elementos para animar
        const animateElements = document.querySelectorAll('.service-card, .stat-card, .tech-card');
        
        animateElements.forEach((el, index) => {
            // Estado inicial
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            
            observer.observe(el);
        });
    }

    // ==========================================
    // 6. EFECTO TYPING EN TÍTULO (OPCIONAL)
    // ==========================================
    function initTypingEffect() {
        const title = document.querySelector('.glitch');
        if (!title) return;
        
        const originalText = title.getAttribute('data-text');
        let iteration = 0;
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
        
        const interval = setInterval(() => {
            title.innerText = originalText
                .split('')
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * letters.length)];
                })
                .join('');
            
            if (iteration >= originalText.length) {
                clearInterval(interval);
            }
            
            iteration += 1/3;
        }, 50);
    }

    // ==========================================
    // 7. CONTADOR ANIMADO PARA ESTADÍSTICAS
    // ==========================================
    function initCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observerOptions = {
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = counter.innerText;
                    const numericValue = parseFloat(target);
                    const suffix = target.replace(/[0-9.]/g, '');
                    
                    if (!isNaN(numericValue)) {
                        animateCounter(counter, 0, numericValue, 2000, suffix);
                    }
                    
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(counter => observer.observe(counter));
    }

    function animateCounter(element, start, end, duration, suffix) {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            if (isDecimal) {
                element.innerText = current.toFixed(1) + suffix;
            } else {
                element.innerText = Math.floor(current) + suffix;
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.innerText = end + suffix;
            }
        }
        
        requestAnimationFrame(update);
    }

    // ==========================================
    // 8. FORMULARIO - PREVENIR ENVÍO REAL
    // ==========================================
    function initFormHandler() {
        const form = document.querySelector('.contact-form');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simular envío
            const button = form.querySelector('.submit-button');
            const originalText = button.innerText;
            
            button.innerText = 'ENVIANDO...';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerText = '¡MENSAJE ENVIADO!';
                button.style.background = 'linear-gradient(45deg, #16a34a, #22c55e)';
                
                setTimeout(() => {
                    button.innerText = originalText;
                    button.disabled = false;
                    button.style.background = '';
                    form.reset();
                }, 3000);
            }, 1500);
        });
    }

    // ==========================================
    // INICIALIZAR TODAS LAS FUNCIONES
    // ==========================================
    initDataStreams();
    initSmoothScroll();
    initParallax();
    initMouseEffect();
    initScrollAnimations();
    initTypingEffect();
    initCounters();
    initFormHandler();
    
    console.log('🤖 MORE BI - Sistema inicializado correctamente');
});
