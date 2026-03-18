
        // Elementos del DOM
        const messageInput = document.getElementById('messageInput');
        const messagesArea = document.getElementById('messagesArea');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const suggestionsContainer = document.getElementById('suggestionsContainer');
        const sendBtn = document.getElementById('sendBtn');

        let conversationStarted = false;

        // Respuestas predefinidas de la IA
        const aiResponses = {
            'hola': '¡Saludos! Soy MORE BI Assistant, tu especialista en analítica de datos y automatización. ¿En qué puedo ayudarte hoy?',
            'ventas': 'Analizando tus datos de ventas... 📊\n\nBasado en tu historial, detecto un patrón de crecimiento del 23% en el último trimestre. Te recomiendo enfocarte en los productos de la categoría A que muestran mayor margen de beneficio.',
            'prediccion': 'Procesando modelos predictivos... 🔮\n\nCon un 94% de confianza, proyectamos:\n• Aumento del 15% en demanda Q1 2026\n• Estacionalidad alta en marzo-abril\n• Oportunidad de expansión en mercado B2B',
            'robot': 'Sistemas robóticos activos... 🤖\n\nTu flota actual:\n• 12 unidades operando al 98% eficiencia\n• 3 en mantenimiento preventivo\n• ROI acumulado: 340% desde implementación',
            'optimiza': 'Analizando procesos... ⚙️\n\nOportunidades identificadas:\n1. Reducir tiempo de ciclo en estación 3 (ahorro potencial: 12%)\n2. Implementar visión por computadora en QC\n3. Automatizar reporte de inventario',
            'reporte': 'Generando informe ejecutivo... 📈\n\n**Métricas Clave (Último mes):**\n• Precisión predictiva: 98.2%\n• Tiempo de respuesta: <2ms\n• Costos operativos: -18% vs mes anterior\n• Satisfacción del cliente: 94/100',
            'default': 'Entiendo tu consulta. Permíteme procesarla con nuestros algoritmos de análisis avanzado... \n\nBasado en tus datos históricos y patrones de mercado, te sugiero revisar el dashboard de "Performance Analytics" donde encontrarás insights detallados. ¿Te gustaría que profundice en algún aspecto específico?'
        };

        // Función para enviar mensaje
        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;

            // Ocultar pantalla de bienvenida y sugerencias
            if (!conversationStarted) {
                welcomeScreen.classList.add('hidden');
                conversationStarted = true;
            }

            // Agregar mensaje del usuario
            addMessage(text, 'user');
            messageInput.value = '';
            messageInput.focus(); // Mantener foco

            // Scroll al final
            scrollToBottom();

            // Mostrar indicador de escritura
            showTypingIndicator();

            // Simular respuesta de IA
            setTimeout(() => {
                removeTypingIndicator();
                const response = generateResponse(text);
                addMessage(response, 'ai');
                scrollToBottom();
            }, 1500 + Math.random() * 1000);
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

        // Generar respuesta basada en palabras clave
        function generateResponse(text) {
            const lowerText = text.toLowerCase();
            
            for (const [keyword, response] of Object.entries(aiResponses)) {
                if (lowerText.includes(keyword)) {
                    return response;
                }
            }
            
            return aiResponses['default'];
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
                addMessage('¡Hola! Soy tu asistente de MORE BI. Estoy listo para ayudarte con análisis de datos, predicciones y optimización de procesos. ¿Qué te gustaría explorar hoy?', 'ai');
                welcomeScreen.classList.add('hidden');
                conversationStarted = true;
                scrollToBottom();
            }
        }, 2500);

        console.log('%c🤖 MORE BI AI', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
        console.log('%cSistema de inteligencia analítica activado', 'color: #67e8f9;');
 