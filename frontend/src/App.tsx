import { useEffect } from 'react'
import './App.css'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:4000'

function App() {
  useEffect(() => {
    const cleanups: Array<() => void> = []

    const initDataStreams = () => {
      const dataContainer = document.getElementById('dataStreams')
      if (!dataContainer) return

      dataContainer.innerHTML = ''
      const chars =
        '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
      const streamCount = 20

      for (let i = 0; i < streamCount; i += 1) {
        const stream = document.createElement('div')
        stream.className = 'data-stream'
        stream.style.left = `${Math.random() * 100}%`
        stream.style.animationDuration = `${Math.random() * 10 + 10}s`
        stream.style.animationDelay = `${Math.random() * 5}s`
        stream.style.opacity = `${Math.random() * 0.5 + 0.1}`

        let text = ''
        for (let j = 0; j < 50; j += 1) {
          text += `${chars[Math.floor(Math.random() * chars.length)]}<br>`
        }
        stream.innerHTML = text
        dataContainer.appendChild(stream)
      }
    }

    const initSmoothScroll = () => {
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
      links.forEach((link) => {
        const handler = (e: Event) => {
          e.preventDefault()
          const targetId = link.getAttribute('href')
          if (!targetId) return
          const targetSection = document.querySelector<HTMLElement>(targetId)
          if (!targetSection) return

          const navHeight = 80
          const targetPosition = targetSection.offsetTop - navHeight
          window.scrollTo({ top: targetPosition, behavior: 'smooth' })
        }

        link.addEventListener('click', handler)
        cleanups.push(() => link.removeEventListener('click', handler))
      })
    }

    const initParallax = () => {
      const video = document.querySelector<HTMLElement>('.video-bg')
      if (!video) return

      let ticking = false
      const onScroll = () => {
        if (ticking) return
        ticking = true
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset
          video.style.transform = `translateY(${scrolled * 0.5}px)`
          ticking = false
        })
      }

      window.addEventListener('scroll', onScroll)
      cleanups.push(() => window.removeEventListener('scroll', onScroll))
    }

    const initScrollAnimations = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              el.style.opacity = '1'
              el.style.transform = 'translateY(0)'
            }
          })
        },
        { threshold: 0.1 },
      )

      const animateElements = document.querySelectorAll<HTMLElement>(
        '.service-card, .stat-card, .tech-card',
      )
      animateElements.forEach((el, index) => {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        el.style.transition = `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`
        observer.observe(el)
      })

      cleanups.push(() => observer.disconnect())
    }

    const initCounters = () => {
      const counters = document.querySelectorAll<HTMLElement>('.stat-number')

      const animateCounter = (
        element: HTMLElement,
        start: number,
        end: number,
        duration: number,
        suffix: string,
      ) => {
        const startTime = performance.now()
        const isDecimal = end % 1 !== 0

        const update = (currentTime: number) => {
          const elapsed = currentTime - startTime
          const progress = Math.min(elapsed / duration, 1)
          const easeOut = 1 - (1 - progress) ** 3
          const current = start + (end - start) * easeOut

          element.innerText = `${isDecimal ? current.toFixed(1) : Math.floor(current)}${suffix}`

          if (progress < 1) {
            window.requestAnimationFrame(update)
          } else {
            element.innerText = `${end}${suffix}`
          }
        }

        window.requestAnimationFrame(update)
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            const counter = entry.target as HTMLElement
            const target = counter.innerText.trim()

            if (target.includes('/')) {
              observer.unobserve(counter)
              return
            }

            const numericValue = Number.parseFloat(target.replace(/[^0-9.]/g, ''))
            const suffix = target.replace(/[0-9.]/g, '')

            if (!Number.isNaN(numericValue)) {
              animateCounter(counter, 0, numericValue, 1800, suffix)
            }

            observer.unobserve(counter)
          })
        },
        { threshold: 0.5 },
      )

      counters.forEach((counter) => observer.observe(counter))
      cleanups.push(() => observer.disconnect())
    }

    const initFormHandler = () => {
      const form = document.querySelector<HTMLFormElement>('.contact-form')
      if (!form) return

      const onSubmit = async (e: Event) => {
        e.preventDefault()
        const button = form.querySelector<HTMLButtonElement>('.submit-button')
        if (!button) return

        const formData = new FormData(form)
        const readTextField = (field: string): string => {
          const value = formData.get(field)
          return typeof value === 'string' ? value.trim() : ''
        }

        const payload = {
          empresa: readTextField('empresa'),
          email: readTextField('email'),
          proyecto: readTextField('proyecto'),
          mensaje: readTextField('mensaje'),
        }

        if (!payload.empresa || !payload.email) {
          button.innerText = 'COMPLETA EMPRESA Y EMAIL'
          button.disabled = true
          globalThis.setTimeout(() => {
            button.innerText = 'ENVIAR CONSULTA'
            button.disabled = false
          }, 2200)
          return
        }

        const originalText = button.innerText
        button.innerText = 'ENVIANDO...'
        button.disabled = true

        try {
          const response = await fetch(`${API_BASE_URL}/api/consultas`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          if (!response.ok) {
            throw new Error('No se pudo guardar la consulta')
          }

          button.innerText = 'MENSAJE ENVIADO'
          button.style.background = 'linear-gradient(45deg, #16a34a, #22c55e)'
          form.reset()
        } catch (error) {
          console.error('Error enviando consulta:', error)
          button.innerText = 'ERROR DE CONEXION'
          button.style.background = 'linear-gradient(45deg, #b91c1c, #ef4444)'
        }

        globalThis.setTimeout(() => {
          button.innerText = originalText
          button.disabled = false
          button.style.background = ''
        }, 2600)
      }

      form.addEventListener('submit', onSubmit)
      cleanups.push(() => form.removeEventListener('submit', onSubmit))
    }

    initDataStreams()
    initSmoothScroll()
    initParallax()
    initScrollAnimations()
    initCounters()
    initFormHandler()

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  return (
    <div className="grid-bg">
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/img/video-fondo.mov" type="video/mp4" />
      </video>
      <div className="overlay" />
      <div id="dataStreams" />

      <nav className="fixed w-full z-50 bg-black/30 backdrop-blur-md border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/img/logo-morebi.png" alt="morebi" className="h-16 w-auto opacity-80" />
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#inicio" className="nav-link">INICIO</a>
            <a href="#analitica" className="nav-link">ANALITICA</a>
            <a href="#robotica" className="nav-link">ROBOTICA IA</a>
            <a href="#servicios" className="nav-link">SERVICIOS</a>
            <a href="#contacto" className="nav-link">CONTACTO</a>
          </div>
          <div className="flex gap-2">
            <div className="robot-eye" />
            <div className="robot-eye" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      </nav>

      <section id="inicio" className="min-h-screen flex items-center justify-center relative pt-20">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="float">
            <h1 className="font-orbitron text-6xl md:text-8xl font-black mb-6 glitch neon-text" data-text="INTELIGENCIA">
              INTELIGENCIA
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                ANALITICA
              </span>
            </h1>
            <p className="hero-description">
              Transformando datos en decisiones. Fusionando analitica avanzada con robotica inteligente para construir el futuro de tu empresa.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button className="neon-button">EXPLORAR SOLUCIONES</button>
              <button
                className="outline-button"
                onClick={() => window.open('/ia-demo.html', '_blank', 'width=1200,height=800,scrollbars=yes')}
              >
                VER DEMO IA
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Precision Predictiva</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Robots Desplegados</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">10x</div>
              <div className="stat-label">ROI Promedio</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Operacion Continua</div>
            </div>
          </div>
        </div>
      </section>

      <section id="analitica" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title gradient-purple-cyan">ANALITICA AVANZADA</h2>
              <p className="section-description">
                Nuestra plataforma de Business Intelligence utiliza algoritmos de machine learning para procesar millones de datos en tiempo real. Visualizaciones interactivas que revelan patrones ocultos y oportunidades de crecimiento.
              </p>
              <ul className="feature-list">
                <li className="feature-item">
                  <div className="feature-dot" />
                  <span>Dashboards predictivos en tiempo real</span>
                </li>
                <li className="feature-item">
                  <div className="feature-dot" />
                  <span>Analisis de comportamiento del consumidor</span>
                </li>
                <li className="feature-item">
                  <div className="feature-dot" />
                  <span>Optimizacion de procesos con IA</span>
                </li>
                <li className="feature-item">
                  <div className="feature-dot" />
                  <span>Alertas inteligentes automaticas</span>
                </li>
              </ul>
            </div>

            <div className="relative">
              <div className="dashboard-card">
                <div className="space-y-4">
                  <div className="metric-row">
                    <span className="metric-label">Procesamiento Datos</span>
                    <div className="bar-chart">
                      <div className="bar bar-1" />
                      <div className="bar bar-2" />
                      <div className="bar bar-3" />
                      <div className="bar bar-4" />
                    </div>
                  </div>

                  <div className="metric-row">
                    <span className="metric-label">Predicciones ML</span>
                    <span className="metric-value cyan">99.2%</span>
                  </div>

                  <div className="metric-row">
                    <span className="metric-label">Latencia</span>
                    <span className="metric-value green">&lt;2ms</span>
                  </div>

                  <div className="chart-container">
                    <svg className="wave-chart" viewBox="0 0 400 100" preserveAspectRatio="none">
                      <path className="wave-purple" d="M0,50 Q50,10 100,50 T200,50 T300,30 T400,60">
                        <animate
                          attributeName="d"
                          values="M0,50 Q50,10 100,50 T200,50 T300,30 T400,60;M0,60 Q50,30 100,40 T200,60 T300,20 T400,50;M0,50 Q50,10 100,50 T200,50 T300,30 T400,60"
                          dur="4s"
                          repeatCount="indefinite"
                        />
                      </path>
                      <path className="wave-cyan" d="M0,60 Q50,40 100,60 T200,50 T300,40 T400,70">
                        <animate
                          attributeName="d"
                          values="M0,60 Q50,40 100,60 T200,50 T300,40 T400,70;M0,50 Q50,60 100,40 T200,60 T300,50 T400,60;M0,60 Q50,40 100,60 T200,50 T300,40 T400,70"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ecosistema-img" id="ecosistema">
        <div className="max-w-7xl mx-auto px-6">
          <div className="ecosistema-shell">
            <div className="ecosistema-copy">
              <span className="ecosistema-kicker">Integracion MORE BI + ROBOT-IARG</span>
              <h2 className="section-title gradient-cyan-purple">Ecosistema de Negocio</h2>
              <p className="section-description">
                Unificamos analitica, automatizacion y operacion inteligente en una sola capa de decision para escalar tu negocio con mayor velocidad y control.
              </p>

              <div className="ecosistema-pills">
                <span>Analitica en tiempo real</span>
                <span>Automatizacion inteligente</span>
                <span>Trazabilidad integral</span>
              </div>
            </div>

            <div className="ecosistema-visual" aria-label="Diagrama del ecosistema de negocio">
              <img src="/img/ecosistema.png" alt="Diagrama de integracion entre MORE BI y ROBOT-IARG" />
              <div className="flujo-luz" />
            </div>
          </div>
        </div>
      </section>

      <section id="robotica" className="py-24 relative bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title gradient-cyan-purple">ROBOT-IARG</h2>
            <p className="section-subtitle">
              Autonomia inteligente para la industria 4.0. Nuestros sistemas roboticos aprenden, adaptan y optimizan operaciones complejas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="service-card">
              <div className="service-icon bg-purple-blue">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="service-title">Vision por Computadora</h3>
              <p className="service-text">Sistemas de vision artificial que identifican defectos, clasifican objetos y navegan entornos complejos con precision milimetrica.</p>
            </div>

            <div className="service-card">
              <div className="service-icon bg-pink-purple">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="service-title">Automatizacion Inteligente</h3>
              <p className="service-text">RPA potenciado por IA que aprende de patrones historicos para optimizar flujos de trabajo y reducir errores operativos.</p>
            </div>

            <div className="service-card">
              <div className="service-icon bg-cyan-blue">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="service-title">Laboratorios Autonomos</h3>
              <p className="service-text">Robots colaborativos que trabajan junto a humanos, aprendiendo tareas complejas y mejorando continuamente.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="section-title text-center gradient-purple-pink mb-16">ECOSISTEMA DIGITAL</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="tech-card">
              <div className="tech-bar bg-purple" />
              <h4 className="tech-title text-purple">Big Data</h4>
              <p className="tech-desc">Procesamiento de petabytes de informacion estructurada y no estructurada.</p>
            </div>
            <div className="tech-card">
              <div className="tech-bar bg-cyan" />
              <h4 className="tech-title text-cyan">Machine Learning</h4>
              <p className="tech-desc">Modelos predictivos personalizados para tu industria especifica.</p>
            </div>
            <div className="tech-card">
              <div className="tech-bar bg-pink" />
              <h4 className="tech-title text-pink">IoT Conectado</h4>
              <p className="tech-desc">Redes de sensores inteligentes comunicandose en tiempo real.</p>
            </div>
            <div className="tech-card">
              <div className="tech-bar bg-green" />
              <h4 className="tech-title text-green">Cloud AI</h4>
              <p className="tech-desc">Infraestructura escalable en la nube para computacion intensiva.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 relative bg-gradient-to-t from-purple-900/20 to-transparent">
        <div className="max-w-4xl mx-auto px-6">
          <div className="contact-card">
            <h2 className="contact-title">INICIA TU TRANSFORMACION</h2>
            <form className="contact-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="empresa">EMPRESA</label>
                  <input id="empresa" name="empresa" type="text" className="form-input" placeholder="Tu empresa" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">EMAIL</label>
                  <input id="email" name="email" type="email" className="form-input" placeholder="correo@empresa.com" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="proyecto">PROYECTO</label>
                <select id="proyecto" name="proyecto" className="form-input form-select" defaultValue="Analitica de Datos">
                  <option>Analitica de Datos</option>
                  <option>Automatizacion Robotica</option>
                  <option>Inteligencia Artificial</option>
                  <option>Consultoria Integral</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mensaje">MENSAJE</label>
                <textarea id="mensaje" name="mensaje" rows={4} className="form-input form-textarea" placeholder="Describe tu proyecto..." />
              </div>

              <button type="submit" className="submit-button">ENVIAR CONSULTA</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/img/logo-morebi.png" alt="MORE BI" className="h-10 w-auto opacity-80" />
          </div>
          <div className="footer-text">© 2026 MORE BI. Tecnologia analitica y robotica inteligente.</div>
          <div className="social-links">
            <div className="social-icon">in</div>
            <div className="social-icon">@</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
