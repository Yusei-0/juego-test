# Notas del Parche

## Versión 1.1

Esta versión introduce el nuevo sistema de Puntos de Magia y varias mejoras de jugabilidad.

### Características Principales
-   **Nuevo Sistema de Puntos de Magia (PM):**
    -   Los jugadores comienzan cada partida con 50 PM.
    -   Invocar unidades ahora cuesta PM y consume el turno completo del jugador.
    -   Ciertas habilidades de unidades (ej. la curación del Sanador) ahora consumen PM.
    -   Se obtienen 10 PM al eliminar una unidad enemiga.
-   **Unidades Actualizadas para el Sistema de PM:**
    -   **Sanador:** Ahora requiere 10 PM para usar su habilidad de curación. Costo de Invocación: 25 PM.
    -   **Unidad Voladora:** Unidad aérea ágil. Costo de Invocación: 25 PM.
    -   (Costos de invocación actualizados para otras unidades como Guerrero: 15 PM, Arquero: 20 PM, Gigante: 30 PM).
-   **Condiciones de Derrota Ajustadas:**
    -   Un jugador ahora pierde si no puede realizar ninguna acción con sus unidades existentes Y, además, no posee suficientes PM para invocar la unidad más barata disponible. Esto evita derrotas prematuras si un jugador tiene recursos para reponer sus fuerzas.
-   **Mejoras en la Inteligencia Artificial (IA):**
    -   La IA ahora es capaz de invocar unidades utilizando sus Puntos de Magia, tomando decisiones básicas sobre qué invocar y dónde.
-   **Interfaz de Usuario (UI) Mejorada:**
    *   Se ha añadido un nuevo menú para la invocación de unidades, accesible durante el turno del jugador.
    *   Los Puntos de Magia del jugador actual ahora se muestran visiblemente en la interfaz.
-   **Tutorial Actualizado:**
    *   El tutorial del juego ha sido actualizado para reflejar todas las nuevas mecánicas del sistema de Puntos de Magia.

### Corrección de Errores
-   Solucionado un error que causaba una derrota instantánea incorrecta al inicio de la partida si el jugador 2 no tenía unidades móviles.
-   Corregidos varios errores de JavaScript relacionados con la declaración y exportación de funciones entre módulos.
-   Asegurada la correcta funcionalidad del botón "Invocar Unidad".

---

## Versión 1.0
- Cambios iniciales de jugabilidad y unidades.

### Datos de Unidades (Valores Iniciales)

**Base:**
- Puntos de Vida (HP): 25
- Ataque: 0
- Movimiento: 0
- Rango: 0

**Guerrero:**
- Puntos de Vida (HP): 20
- Ataque: 8
- Movimiento: 2
- Rango: 1

**Arquero:**
- Puntos de Vida (HP): 15
- Ataque: 6
- Movimiento: 2
- Rango: 3

**Gigante:**
- Puntos de Vida (HP): 35
- Ataque: 10
- Movimiento: 1
- Rango: 1
