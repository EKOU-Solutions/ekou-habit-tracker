# EKOU Tracking — Requerimientos de negocio

> Documento de negocio. La documentación técnica y de arquitectura se lleva por separado.

## 1. Referencias de diseño

- **Demo interactiva (pantallas completas):** https://claude.ai/code/artifact/5f9c9f21-9cf2-49ca-9b48-bee7f2690612
- **Proyecto en Claude Design (pantallas y flujo):** https://claude.ai/design/p/40184b50-35f3-49a7-aa52-068de6bbea10?file=EKOU+Traking+-+Pantallas+completas.dc.html
- **Demos en GIF (flujo completo):** ver [`README.md`](../README.md#demo) → carpeta [`doc/assets/`](assets/).

## 2. Necesidad de negocio

Las apps de hábitos suelen perder al usuario en dos puntos: el **alta** (crear cuenta, configurar todo antes de empezar) y el **mantenimiento diario** (demasiados pasos para marcar algo como hecho). El resultado es abandono temprano y rachas que se rompen por fricción, no por falta de intención.

**EKOU** ataca ese problema con una propuesta deliberadamente mínima:

- **Empezar en segundos**, sin cuentas ni correos.
- **Marcar un hábito con un solo toque**, desde la Home o desde un widget.
- **Una sola métrica que importa: la racha.** Con cumplir **un** hábito al día basta para mantenerla viva.

La promesa de marca — *"un hábito al día para que el eco no se apague"* — se traduce directamente en la regla central del producto: la racha sobrevive mientras el usuario complete al menos un hábito por día.

## 3. Objetivos

| # | Objetivo | Cómo se refleja en el producto |
|---|----------|-------------------------------|
| O1 | Minimizar la fricción de alta | Onboarding de una sola pantalla: apodo + un CTA. Se puede saltar. |
| O2 | Minimizar la fricción diaria | 1 toque = hecho. Hábito prioritario siempre arriba. Objetivos táctiles ≥ 44 px. |
| O3 | Sostener la motivación | Racha viva, estados visuales de la racha e historial con "mejor racha". |
| O4 | Bajar la barrera para crear hábitos | Creación por texto (stepper corto) y por voz (dictado interpretado por EKOU). |
| O5 | Respetar la privacidad | Todo local en el iPhone; sin cuentas; datos exportables a JSON. |

## 4. Alcance

### 4.1 Dentro del alcance (MVP)

1. **Onboarding** — alta local con apodo/alias; el nombre alimenta el saludo de la Home.
2. **Home** — una sola pantalla con la racha, la lista de hábitos del día y el acceso a voz; con sus cuatro estados de racha y una variante de layout "Agenda" con tira semanal.
3. **Crear hábito · por texto** — stepper de 3 pasos: nombre + ícono → frecuencia → horario/recordatorio, con generación de ícono por IA.
4. **Crear hábito · por voz** — dictado en 3 fases: escuchar → procesar → resultado interpretado listo para confirmar.
5. **Calendario / historial** — mes con anillos de cumplimiento por día y recuperación de días anteriores (recálculo de la racha).

### 4.2 Fuera del alcance (por ahora)

- Cuentas de usuario, login, sincronización en la nube o multi-dispositivo.
- Componente social / compartir / retos con amigos.
- Métricas o analítica avanzada más allá del historial y el porcentaje de cumplimiento.
- **Arquitectura técnica** (la cubre otro documento a cargo del equipo).
- El panel de *"Tweaks"* que aparece en el documento de diseño es una herramienta interna de prototipado, **no** una funcionalidad del producto.

## 5. Reglas de negocio

Estas reglas se derivan directamente del documento de diseño (sección "Principios UX" y el flujo de pantallas).

### 5.1 Racha (concepto central)

- **RN-01** — La racha **se mantiene viva si el usuario completa ≥ 1 hábito en el día**. Con uno basta.
- **RN-02** — La racha tiene cuatro estados, cada uno con su representación en la Home:
  - **Día cero** — sin racha todavía; se muestra un *kit de inicio* con hábitos sugeridos (p. ej. Tomar agua, Meditar, Leer) para "encender" la racha.
  - **En riesgo** — aún no se ha completado ningún hábito hoy; se avisa que completar 1 salva la racha (p. ej. *"1 hábito y salvas tus 12 días"*).
  - **Asegurada** — ya se completó ≥ 1 hábito hoy; se muestra el anillo de progreso del día (p. ej. *"asegurada · 2 de 5"*).
  - **Día completo / perfecto** — se completaron todos los hábitos del día.
- **RN-03** — Se conserva y se muestra la **mejor racha histórica** ("mejor: 21 días").

### 5.2 Marcado y prioridad

- **RN-04** — Marcar un hábito como hecho debe requerir **un solo toque**, disponible desde la Home o desde el widget.
- **RN-05** — El **hábito principal (prioritario) del momento** se muestra siempre en la parte superior de la Home (sección "Ahora · esta mañana"). Su selección sigue esta lógica:
  - **Al inicio (día 1):** el hábito principal es el **primero que crea el usuario**.
  - **A medida que avanzan los días:** el principal pasa a ser el hábito con **mayor racha individual**, es decir, el que el usuario **más ha completado** en el periodo transcurrido. *Ejemplo:* con 3 hábitos, en el día 10 el hábito principal que aparece al comenzar el día es el que **más veces se completó** en esos 10 días.
  - **Empate:** si dos o más hábitos tienen la misma racha individual, gana el **creado primero** _(criterio a confirmar con negocio)_.
- **RN-06** — Todos los objetivos táctiles miden **≥ 44 px** (accesibilidad / usabilidad táctil).

### 5.3 Creación de hábitos

- **RN-07** — Para crear un hábito **solo el nombre es obligatorio**; frecuencia y horario son opcionales ("saltar — con el nombre basta").
- **RN-08** — **Frecuencia** admite: *Todos los días*, *Entre semana* o *Elegir días* (selección L–D).
- **RN-09** — **Momento del día**: *Mañana*, *Tarde* o *Noche*. El momento **agrupa** el hábito dentro del día.
- **RN-10** — El **recordatorio** es una alerta puntual **opcional e independiente** del momento; se pueden usar ambos a la vez.
- **RN-11** — Frecuencia y horario **se pueden cambiar en cualquier momento** después de crear el hábito.
- **RN-12** — El **ícono** puede elegirse manualmente o generarse con IA a partir del nombre (y se pueden pedir más propuestas o describir uno propio).

### 5.4 Creación por voz

- **RN-13** — La voz funciona como **copiloto** (orbe central). El usuario dicta el hábito en lenguaje natural (p. ej. *"quiero meditar 10 minutos cada noche"*).
- **RN-14** — EKOU **interpreta** el dictado y propone nombre, ícono, frecuencia y horario; el usuario **confirma o edita** antes de crear. Siempre hay salida a escritura manual si no se entiende.

### 5.5 Historial y recuperación

- **RN-15** — El historial muestra un **calendario mensual** con un anillo por día (completo / parcial / hoy) y el **porcentaje de cumplimiento** del mes.
- **RN-16** — El usuario puede **recuperar un día anterior**: al tocarlo, marca lo que hizo ese día y **la racha se recalcula**.

### 5.6 Privacidad y datos

- **RN-17** — **No hay cuentas ni correos.** Todos los datos viven en el iPhone del usuario.
- **RN-18** — Los datos son **exportables a JSON**.

## 6. Flujo principal

```
Onboarding → Home → 🎙️ Voz → Confirmar → Check ✓ → Racha +1
```

El flujo empieza en el Onboarding y desemboca siempre en la Home, que es el centro de la app. Crear hábito (texto o voz), Calendario y Ajustes se abren como *sheets* sobre la Home.

## 7. Supuestos y notas

- **Nombre del producto:** el producto se llama **EKOU**. En los archivos de diseño aparece como "EKOU Traking" (con una errata en "Tracking") y en metadatos internos como *"Echo Tracking MVP"*; se recomienda unificar a **EKOU Tracking**.
- **Plataforma:** el diseño está construido sobre patrones de **iOS** (una sola Home, sheets, widget). Un port a otras plataformas queda fuera de este alcance.
- Las fechas y datos que aparecen en las pantallas (julio de 2026, "Jouler", rachas de ejemplo) son **datos de maqueta** para pruebas con usuarios.

## 8. Documentación relacionada

- [doc/ux-ui-guidelines.md](ux-ui-guidelines.md) — principios de UX, sistema visual e inventario de pantallas.
- [README.md](../README.md) — visión general del producto y demo.
