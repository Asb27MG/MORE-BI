
        // Elementos del DOM
        const messageInput = document.getElementById('messageInput');
        const messagesArea = document.getElementById('messagesArea');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const suggestionsContainer = document.getElementById('suggestionsContainer');
        const sendBtn = document.getElementById('sendBtn');
        // Permite override manual: /ia-demo.html?apiBase=http://localhost:4000
        // y si no existe, detecta origen actual con fallback a localhost:4000.
        function resolveApiChatUrl() {
            const params = new URLSearchParams(window.location.search);
            const apiBaseFromQuery = params.get('apiBase');
            const apiBaseFromWindow = typeof window.__MORE_BI_API_BASE__ === 'string'
                ? window.__MORE_BI_API_BASE__
                : null;

            if (apiBaseFromQuery) {
                return `${apiBaseFromQuery.replace(/\/$/, '')}/api/chat`;
            }

            if (apiBaseFromWindow) {
                return `${apiBaseFromWindow.replace(/\/$/, '')}/api/chat`;
            }

            const { protocol, hostname, origin } = window.location;

            // En desarrollo local normalmente backend corre en :4000.
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
                return `${protocol}//${hostname}:4000/api/chat`;
            }

            // En dominio custom de produccion, usar subdominio API dedicado.
            if (hostname === 'morebi.ai' || hostname === 'www.morebi.ai') {
                return `${protocol}//api.morebi.ai/api/chat`;
            }

            // Si el frontend esta en Render con nombre "*-frontend", intenta "*-backend".
            if (hostname.endsWith('.onrender.com') && hostname.includes('-frontend')) {
                const backendHost = hostname.replace('-frontend', '-backend');
                return `${protocol}//${backendHost}/api/chat`;
            }

            // Si existe proxy/reverse-proxy, usar mismo origen.
            return `${origin}/api/chat`;
        }

        const API_CHAT_URL = resolveApiChatUrl();

        let conversationStarted = false;

        // Función para enviar mensaje
        async function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            // Ocultar pantalla de bienvenida y sugerencias para liberar espacio visual
            if (!conversationStarted) {
                welcomeScreen.classList.add('hidden');
                conversationStarted = true;
            }

            if (suggestionsContainer) {
                suggestionsContainer.classList.add('hidden');
                document.body.classList.add('suggestions-hidden');
            }

            // Agregar mensaje del usuario
            addMessage(text, 'user');
            messageInput.value = '';
            messageInput.focus(); // Mantener foco

            // Scroll al final
            scrollToBottom();

            // Mostrar indicador de escritura
            showTypingIndicator();

            try {
                const res = await fetch(API_CHAT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ mensaje: text })
                });

                if (!res.ok) {
                    throw new Error('No se pudo conectar con la IA');
                }

                const data = await res.json();
                removeTypingIndicator();
                addMessage(data.reply || 'No obtuve respuesta del modelo.', 'ai');
                scrollToBottom();
            } catch (error) {
                console.error(error);
                removeTypingIndicator();
                addMessage('Error de conexion con la IA. Verifica que el backend este encendido o define ?apiBase=http://localhost:4000 en la URL.', 'ai');
                scrollToBottom();
            }
        }

        // Función para enviar sugerencia
        function sendSuggestion(text) {
            messageInput.value = text;
            sendMessage();
        }

        // Scroll suave al final
        function scrollToBottom() {
            setTimeout(() => {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }, 100);
        }

        // Agregar mensaje al chat
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}`;
            
            const avatar = sender === 'user' ? '👤' : '🤖';
            const time = new Date().toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            messageDiv.innerHTML = `
                <div class="avatar">${avatar}</div>
                <div class="message-content">
                    <div class="message-text">${formatText(text)}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;

            messagesArea.appendChild(messageDiv);
        }

        // Formatear texto
        function formatText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #00d4ff;">$1</strong>')
                .replace(/\n/g, '<br>');
        }

        // Mostrar indicador de escritura
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'message ai typing';
            typingDiv.id = 'typingIndicator';
            typingDiv.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            messagesArea.appendChild(typingDiv);
            scrollToBottom();
        }

        // Remover indicador de escritura
        function removeTypingIndicator() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }

        // Event listeners
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        // Prevenir que el input pierda foco al hacer scroll
        messageInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (document.activeElement !== messageInput) {
                    // Solo reenfocar si no se hizo clic en otro elemento interactivo
                }
            }, 100);
        });

        // Ajustar altura al aparecer/desaparecer teclado en móvil
        const setVH = () => {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };

        setVH();
        window.addEventListener('resize', setVH);

        // Detectar cambio de orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });

        // Enfocar input al cargar (con delay para evitar conflictos)
        setTimeout(() => {
            messageInput.focus();
        }, 500);

        // Mensaje de bienvenida automático
        setTimeout(() => {
            if (!conversationStarted) {
            addMessage('Hola, soy tu asistente IA de MORE BI conectado con Groq. Puedo ayudarte con analitica, predicciones y automatizacion. ¿Que quieres analizar hoy?', 'ai');
                welcomeScreen.classList.add('hidden');
                conversationStarted = true;
                scrollToBottom();
            }
        }, 2500);

        console.log('%c🤖 MORE BI AI', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
        console.log('%cSistema de inteligencia analítica activado', 'color: #67e8f9;');
 