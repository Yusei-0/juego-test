export const tutorialHTMLContent = `
    <h2>1. ¿Qué es Tácticas del Río Revuelto?</h2>
    <p>Tácticas del Río Revuelto es un juego de estrategia por turnos donde dos jugadores compiten por el control del territorio y la destrucción de la base enemiga. Cada jugador comanda un ejército de unidades con diferentes habilidades y características. El campo de batalla está dividido por un río con puentes, añadiendo un elemento táctico crucial al movimiento y posicionamiento de las unidades.</p>

    <h2>2. Objetivo del Juego</h2>
    <p>El objetivo principal es <strong>destruir la Base enemiga</strong>. La Base es una unidad especial que no puede moverse ni atacar, pero su destrucción significa la victoria inmediata.</p>
    <p>Alternativamente, un jugador también puede ganar si <strong>elimina todas las unidades móviles del oponente</strong>.</p>

    <h2>3. Unidades</h2>
    <p>Existen varios tipos de unidades, cada una con sus propias estadísticas de Puntos de Vida (PV), Ataque (ATQ) y Movimiento (MOV):</p>
    <ul>
        <li><strong>Base:</strong> PV: 25, ATQ: 0, MOV: 0. Es el objetivo principal.</li>
        <li><strong>Guerrero:</strong> PV: 20, ATQ: 8, MOV: 2. Unidad estándar de combate.</li>
        <li><strong>Arquero:</strong> PV: 15, ATQ: 6, MOV: 2. Ataca a distancia (Rango 3).</li>
        <li><strong>Gigante:</strong> PV: 35, ATQ: 10, MOV: 1. Lento pero poderoso y resistente.</li>
    </ul>

    <h2>4. ¿Cómo se Juega?</h2>
    <p>El juego se desarrolla por turnos. En cada turno, un jugador puede realizar acciones con CADA UNA de sus unidades activas.</p>

    <h3>4.1. Inicio del Juego</h3>
    <ul>
        <li>Cada jugador comienza con un conjunto predefinido de unidades, incluyendo una Base.</li>
        <li>El Jugador 1 siempre comienza.</li>
    </ul>

    <h3>4.2. Desarrollo del Turno</h3>
    <ol>
        <li><strong>Seleccionar una Unidad:</strong> Haz clic en una de tus unidades. Se resaltarán sus posibles movimientos (verde) y ataques (rojo).</li>
        <li><strong>Mover:</strong> Haz clic en una casilla verde para mover. No se puede mover a través de otras unidades o agua (excepto puentes).</li>
        <li><strong>Atacar:</strong> Haz clic en una unidad enemiga resaltada en rojo. El daño es igual al ATQ de tu unidad.</li>
        <li><strong>Importante:</strong> Una unidad <em>NO PUEDE</em> moverse y atacar en el mismo turno.</li>
    </ol>

    <h3>4.3. El Tablero</h3>
    <ul>
        <li><strong>Río:</strong> Divide el mapa, solo se cruza por puentes.</li>
        <li><strong>Puentes:</strong> Puntos estratégicos clave.</li>
    </ul>

    <h2>5. Modos de Juego</h2>
    <ul>
        <li><strong>Multijugador Local:</strong> Dos jugadores, un dispositivo.</li>
        <li><strong>VS IA:</strong> Juega contra la IA (diferentes dificultades).</li>
        <li><strong>Multijugador Online:</strong> Juega contra otros por internet.</li>
    </ul>

    <h2>6. Consejos Estratégicos</h2>
    <ul>
        <li>Protege tu Base.</li>
        <li>Controla los puentes.</li>
        <li>Usa las fortalezas de cada unidad (Arqueros a distancia, Guerreros/Gigantes en frente).</li>
        <li>Buen posicionamiento es clave.</li>
        <li>Considera sacrificios tácticos.</li>
    </ul>
    <p>¡Buena suerte en el campo de batalla!</p>
`;
