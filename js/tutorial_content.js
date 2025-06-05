export const tutorialHTMLContent = `
    <h2>1. ¿Qué es Tácticas del Río Revuelto?</h2>
    <p>Tácticas del Río Revuelto es un juego de estrategia por turnos donde dos jugadores compiten por el control del territorio y la destrucción de la base enemiga. Cada jugador comanda un ejército de unidades con diferentes habilidades y características. El campo de batalla está dividido por un río con puentes, añadiendo un elemento táctico crucial al movimiento y posicionamiento de las unidades.</p>

    <h2>2. Objetivo del Juego</h2>
    <p>El objetivo principal es <strong>destruir la Base enemiga</strong>. La Base es una unidad especial que no puede moverse ni atacar, pero su destrucción significa la victoria inmediata.</p>
    <p>Alternativamente, un jugador también puede ganar si <strong>elimina todas las unidades móviles del oponente</strong>.</p>

    <h2>3. Puntos de Magia</h2>
    <h3>¿Qué son los Puntos de Magia?</h3>
    <p>Los Puntos de Magia (PM) son un recurso crucial que necesitarás para traer unidades al campo de batalla y utilizar poderosas habilidades. Gestionar tus Puntos de Magia eficazmente es clave para la victoria.</p>

    <h3>Inicio del Juego y Puntos de Magia</h3>
    <ul>
        <li>Al comenzar la partida, cada jugador recibe <strong>50 Puntos de Magia</strong>.</li>
        <li>Los jugadores ya no comienzan con un conjunto predefinido de unidades móviles. En su lugar, deberán invocar a sus unidades usando Puntos de Magia. Tu Base inicial sigue estando presente.</li>
    </ul>

    <h3>¿Cómo Obtener Puntos de Magia?</h3>
    <ul>
        <li><strong>Eliminando Unidades Enemigas:</strong> Cada vez que destruyes una unidad enemiga, ganas <strong>10 Puntos de Magia</strong>.</li>
    </ul>

    <h3>Usar Puntos de Magia</h3>
    <p>Los Puntos de Magia se utilizan principalmente para dos cosas:</p>
    <ol>
        <li><strong>Invocar Unidades:</strong>
            <ul>
                <li>Durante tu turno, puedes gastar Puntos de Magia para invocar nuevas unidades al campo de batalla.</li>
                <li>Cada tipo de unidad tiene un costo de invocación diferente.</li>
                <li>La invocación de una unidad <strong>consume tu turno completo</strong> (no podrás mover ni atacar con otras unidades después de invocar).</li>
                <li>Para invocar, busca el botón "Invocar Unidad", selecciona la unidad que deseas y luego una casilla válida en tu zona de despliegue.</li>
            </ul>
        </li>
        <li><strong>Activar Habilidades Especiales:</strong>
            <ul>
                <li>Algunas unidades, como el Sanador, tienen habilidades que consumen Puntos de Magia para ser activadas. Por ejemplo, la habilidad de curar del Sanador tiene un costo en PM.</li>
            </ul>
        </li>
    </ol>

    <h2>4. Unidades</h2>
    <p>Existen varios tipos de unidades, cada una con sus propias estadísticas y costos:</p>
    <ul>
        <li><strong>Base:</strong> PV: 25, ATQ: 0, MOV: 0. No se puede invocar. Es el objetivo principal.</li>
        <li><strong>Guerrero:</strong> PV: 20, ATQ: 8, MOV: 2. Costo: 15 PM. Unidad estándar.</li>
        <li><strong>Arquero:</strong> PV: 15, ATQ: 6, MOV: 2, Rango: 3. Costo: 20 PM. Ataca a distancia.</li>
        <li><strong>Gigante:</strong> PV: 35, ATQ: 10, MOV: 1. Costo: 30 PM. Lento pero poderoso.</li>
        <li><strong>Sanador:</strong> PV: 25, ATQ: 10, MOV: 2. Cura: 10 PV (Rango 1). Costo Invocación: 25 PM. Costo Curar: 10 PM.</li>
        <li><strong>Unidad Voladora:</strong> PV: 18, ATQ: 7, MOV: 2. Costo: 25 PM. Vuela sobre obstáculos.</li>
    </ul>

    <h2>5. ¿Cómo se Juega?</h2>
    <p>El juego se desarrolla por turnos. En cada turno, un jugador puede realizar UNA acción principal con UNA de sus unidades activas, o invocar una unidad.</p>

    <h3>5.1. Inicio del Juego</h3>
    <ul>
        <li>Cada jugador comienza con su <strong>Base</strong> ya desplegada y <strong>50 Puntos de Magia</strong>. Las demás unidades se invocan.</li>
        <li>El Jugador 1 siempre comienza.</li>
    </ul>

    <h3>5.2. Desarrollo del Turno</h3>
    <p>Cuando sea tu turno, puedes optar por una de las siguientes acciones principales:</p>
    <ol>
        <li><strong>Mover una Unidad:</strong> Selecciona tu unidad y luego una casilla verde resaltada.</li>
        <li><strong>Atacar con una Unidad:</strong> Selecciona tu unidad y luego un enemigo en rojo.</li>
        <li><strong>Usar una Habilidad Especial (ej. Curar):</strong> Selecciona la unidad, luego el objetivo si es necesario. Consume PM.</li>
        <li><strong>Invocar Unidad (Consume el Turno):</strong> Haz clic en "Invocar Unidad", elige una unidad que puedas pagar, y luego una casilla válida en tu zona. Esta acción termina tu turno.</li>
        <li><strong>Pasar el Turno:</strong> Si no puedes o no quieres realizar ninguna acción.</li>
    </ol>
    <p><strong>Importante:</strong> Una unidad <em>NO PUEDE</em> moverse y atacar en el mismo turno, ni moverse y usar habilidad, ni atacar y usar habilidad. Invocar una unidad también termina tu turno.</p>

    <h3>5.3. El Tablero</h3>
    <ul>
        <li><strong>Río:</strong> Divide el mapa. Unidades terrestres cruzan por puentes, voladoras lo ignoran.</li>
        <li><strong>Puentes:</strong> Puntos estratégicos clave para unidades terrestres.</li>
    </ul>

    <h2>6. Modos de Juego</h2>
    <ul>
        <li><strong>Multijugador Local:</strong> Dos jugadores, un dispositivo.</li>
        <li><strong>VS IA:</strong> Juega contra la IA (diferentes dificultades).</li>
        <li><strong>Multijugador Online:</strong> Juega contra otros por internet.</li>
    </ul>

    <h2>7. Consejos Estratégicos</h2>
    <ul>
        <li><strong>Protege tu Base:</strong> Es tu principal vulnerabilidad.</li>
        <li><strong>Gestiona tus PM:</strong> Ahorra para unidades clave o habilidades. No gastes todo de golpe.</li>
        <li><strong>Flujo de PM:</strong> Eliminar unidades enemigas te da más PM para reforzar tu ejército.</li>
        <li><strong>Controla los Puentes:</strong> Limitan el movimiento y pueden crear cuellos de botella.</li>
        <li><strong>Conoce tus Unidades:</strong> Utiliza las fortalezas de cada tipo de unidad.</li>
        <li><strong>Posicionamiento:</strong> Evita agrupar demasiado tus unidades. Protege unidades débiles con las resistentes.</li>
        <li><strong>Sacrificios Tácticos:</strong> A veces, perder una unidad menor puede darte una ventaja mayor.</li>
    </ul>
    <p>¡Buena suerte en el campo de batalla!</p>
`;
