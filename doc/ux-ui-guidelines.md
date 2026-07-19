# EKOU Tracking — Guía de UX / UI

> Documento de negocio orientado a producto y diseño. Los valores aquí provienen del documento de diseño "EKOU Tracking — Pantallas completas" (Claude Design).

## 1. Principios de UX

1. **1 toque = hecho.** Marcar un hábito no debe costar más de un toque, desde la Home o el widget.
2. **La racha vive con ≥ 1 hábito al día.** Un solo hábito basta; el producto premia la constancia, no la perfección.
3. **Lo prioritario, siempre arriba.** El hábito del momento aparece primero para no obligar a buscar.
4. **La voz es copiloto.** El orbe central deja crear hábitos hablando; EKOU interpreta y el usuario confirma.
5. **Arquitectura mínima.** Una sola Home + *sheets* (Crear hábito, Voz, Calendario, Ajustes vía avatar). Sin barra de pestañas. Menos navegación = menos pasos.
6. **Local y portable.** Todo vive en el iPhone; datos exportables a JSON. Sin cuentas.
7. **Accesible al tacto.** Objetivos táctiles ≥ 44 px.

## 2. Sistema visual

### 2.1 Paleta (valores finales)

| Nombre | HEX | Uso |
|--------|-----|-----|
| Marino | `#001A70` | Texto y estructura |
| Aguamarina | `#2DCCD3` | Hecho / éxito |
| Teal profundo | `#0E7C81` | Texto sobre aguamarina |
| Morado | `#AF0F7D` | Prioridad / racha |
| Ciruela | `#4B1268` | Punto medio del degradado |

**Neutros:** `#101C4D`, `#6B7290`, `#8A90A8`, `#C3C8D9`, `#F1F3FA`, `#F9F9F9`.
**Superficies:** superficie `#fff`, fondo de app `#F9F9F9`, hairline `rgba(0,26,112,.07)`.

### 2.2 Gradientes

| Nombre | Definición | Uso |
|--------|-----------|-----|
| Principal | `linear-gradient(135deg, #001A70, #AF0F7D)` | Racha, voz y CTA |
| Inmersivo | `linear-gradient(165deg, #001A70, #4B1268 58%, #AF0F7D)` | Onboarding y hero |
| Anillo de progreso | `conic-gradient(from -90deg, #2DCCD3, #AF0F7D)` | Anillo de la racha |

### 2.3 Tipografía

- **Familia:** SF Pro (system / `-apple-system`).
- **Escala:** Título 34/800 · H1 24–26/800 · cuerpo 15–16/600 · caption 12–13/500.
- **Radios:** 24 (tarjetas), 16–20 (íconos), pill 20+.

## 3. Inventario de pantallas

### 3.1 Onboarding (`1.1`)
Una sola pantalla: apodo/alias + un CTA ("Empezar mi racha"). Sin cuentas; el nombre alimenta el saludo de la Home. Mensaje de confianza: *"Sin cuentas ni correos. Todo vive en tu iPhone."*

### 3.2 Home · estados de racha (`1.2`)
Cuatro estados, cada uno en su pantalla, más una variante de layout:
- **1.2a Día cero** — kit de inicio con hábitos sugeridos, sin racha.
- **1.2b En riesgo** — ningún hábito hecho; CTA para salvar la racha.
- **1.2c Asegurada** — anillo de progreso (p. ej. "2 de 5").
- **1.2d Día completo** — día perfecto.
- **1.2e Variante Agenda** — racha + tira semanal (L–D).

Estructura de la Home: saludo + fecha + avatar; bloque **"Ahora · esta mañana"** (hábito prioritario); bloque **"Hoy"** (resto de hábitos); acceso a voz.

### 3.3 Crear hábito · por texto (`2.1`)
Stepper de 3 pasos (con estados intermedios):
- **2.1a** Paso 1 · Nombre + ícono.
- **2.1b** Paso 2 · Frecuencia (*Todos los días* / *Entre semana* / *Elegir días*).
- **2.1c** Paso 2 · Selector de días desplegado (L–D).
- **2.1d** Paso 3 · Horario + recordatorio (Mañana / Tarde / Noche + recordatorio opcional).
- **2.1e** Sheet · Ícono con IA (propuestas al tocar ✨; opción de describir uno propio o generar más).

### 3.4 Crear hábito · por voz (`2.2`)
Tres fases del dictado:
- **2.2a** Fase 1 · "Te escucho" (onda de audio).
- **2.2b** Fase 2 · Procesando ("Entendí lo que dijiste → Eligiendo ícono y horario…").
- **2.2c** Fase 3 · Resultado interpretado, editable, listo para confirmar. Salida a escritura manual siempre disponible.

### 3.5 Calendario / historial (`3`)
- **3a** Mes con un anillo de cumplimiento por día (leyenda: completo / parcial / hoy) + % de cumplimiento y mejor racha.
- **3b** Al tocar un día anterior se abre un *bottom sheet* para recuperarlo: se marca lo que se hizo y la racha se recalcula.

## 4. Tono y voz

EKOU habla en **primera persona**, cálido y breve (*"Hola, soy EKOU. Guardo tus hábitos y cuido tu racha."*). Refuerza la idea del eco y de la constancia sin culpabilizar: celebra el día cumplido y ofrece rescatar la racha en vez de castigar el fallo.

## 5. Documentación relacionada

- [doc/requirements.md](requirements.md) — necesidad, alcance y reglas de negocio.
- [README.md](../README.md) — visión general y demo.
