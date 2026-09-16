Speaksy — Estado del proyecto

Última actualización: 29 de agosto de 2026.

Cambio de arquitectura: se descartó el plan de Flask + PostgreSQL (carpetas backend/ y database/ de más abajo) a favor de un solo archivo speaksy.html con Firebase Authentication + Firestore, para poder abrir la app directo en el navegador sin instalar nada. El resto de este documento describe el estado del enfoque anterior (Flask/Postgres) tal cual quedó — se conserva como referencia, no se sigue desarrollando. El estado del nuevo enfoque está más abajo, en "Estado de speaksy.html". Este archivo existe para que cualquier persona o IA que retome el proyecto sepa, sin adivinar, qué está construido, qué es solo apariencia (mock) y qué no existe todavía. Léelo antes de tocar código.

Leyenda: ✅ funciona de verdad · 🟡 construido pero no conectado/probado · ⚪ no existe

Resumen en una frase

Existe un prototipo visual e interactivo del frontend (funciona en el navegador, con datos de ejemplo fijos) y un esqueleto de backend en Flask + modelos de PostgreSQL (código escrito siguiendo el PRD, pero nunca ejecutado ni conectado a una base de datos real, porque este entorno no tiene acceso a red para instalar dependencias ni levantar Postgres). Frontend y backend NO están conectados entre sí todavía.

Por fase (sección 32 del PRD original)
Fase	Contenido	Estado
1	Arquitectura + diseño + PostgreSQL	🟡 Estructura de carpetas creada (frontend/, backend/, database/). Diseño visual definido y aplicado. schema.sql escrito, sin ejecutar.
2	Registro + Login + usuarios	🟡 Endpoints /api/auth/register y /api/auth/login escritos en app.py con hashing real (werkzeug.security) y JWT. Nunca ejecutados. No hay pantallas de login/registro en el frontend todavía.
3	Onboarding	⚪ No construido.
4	Dashboard	✅ Interfaz funcional con datos de ejemplo fijos (hardcodeados). 🟡 No lee datos reales del backend.
5	Sistema de ejercicios	🟡 Selector de tipo de ejercicio + duración + generador de rutina funciona en el frontend (lógica en el navegador). No hay tabla exercises poblada ni llamada real a /api/exercises.
6	Respiración	✅ Ejercicio interactivo real (círculo animado, temporizador 4-2-6, iniciar/pausar/terminar) funciona en el navegador. 🟡 No guarda la sesión en ningún backend.
7	Lectura y práctica de voz	🟡 Pantalla de lectura funciona (temporizador de grabación), pero no graba audio real ni analiza nada; muestra un aviso explícito en pantalla de que es una vista previa. Palabras "leídas" está inventado a modo de ejemplo.
8	Conversación con IA	⚪ No construido en frontend. Backend: rutas creadas (/api/conversations...) pero devuelven 501 No implementado. ai_service.py tiene el prompt de sistema con las reglas del PRD (nunca presionar, nunca criticar la velocidad) pero lanza NotImplementedError a propósito — no hay ninguna llamada real a un proveedor de IA.
9	Análisis de voz	⚪ No implementado. /api/voice/analyze devuelve 501 a propósito. No hay integración con ninguna Speech-to-Text API. Nunca se debe simular un resultado de análisis como si fuera real (regla explícita del PRD, respetada).
10	Progreso + historial + metas	🟡 Pantalla de progreso (/progress) funciona visualmente con datos de ejemplo. Rutas de backend (/api/progress, /api/history, /api/goals) escritas pero no probadas ni conectadas al frontend.
11	Logros	🟡 Pantalla visual con 6 logros de ejemplo (algunos "desbloqueados" a modo de muestra). No hay lógica real que detecte cuándo se cumple un logro.
12	Perfil + configuración	🟡 Pantalla de perfil básica con datos de ejemplo. No hay /settings ni edición real.
13	Seguridad + privacidad + accesibilidad	🟡 Accesibilidad: contraste revisado, estados de foco visibles, layout responsive mobile-first con nav inferior. Privacidad: solo hay una nota de aviso en el perfil; no existe la sección /privacy ni el flujo de consentimiento antes de grabar, ni "eliminar grabaciones/cuenta". Seguridad backend: passwords con hash y JWT están escritos pero sin probar en ejecución real.
14	Testing + deployment	⚪ No hecho. Nada de esto se ha ejecutado: no hay Postgres corriendo, no se instalaron dependencias de Python, no hay tests automatizados, no hay despliegue.
Qué es real hoy mismo (se puede abrir y usar)
frontend/speaksy-app.jsx — prototipo React que corre en el navegador: landing, dashboard, selector de práctica + generador de rutina, ejercicio de respiración funcional de verdad (temporizador real), pantalla de lectura con temporizador de grabación, progreso, logros y perfil — todo con datos de ejemplo, sin persistencia real.
Qué es solo esqueleto (código escrito, cero ejecución/prueba)
backend/app.py, backend/models.py, backend/ai_service.py
database/schema.sql
Motivo: este entorno de trabajo no tiene acceso a internet, así que no se pudo hacer pip install, levantar PostgreSQL, ni correr el servidor Flask ni una sola vez. Nadie debe asumir que estos archivos funcionan simplemente porque están escritos. Antes de confiar en ellos hay que:
Instalar dependencias (pip install -r backend/requirements.txt).
Crear una base Postgres real y correr database/schema.sql.
Configurar .env a partir de .env.example.
Levantar backend/app.py y probar cada endpoint con datos reales.
Conectar el frontend a esos endpoints (hoy el frontend no hace ninguna llamada HTTP; todo es estado local de React).
Qué no existe en absoluto
Onboarding.
Conversación con IA funcionando de verdad (solo el prompt de reglas).
Análisis de voz real (Speech-to-Text).
Página /privacy, flujo de consentimiento de grabación, borrado de datos.
/settings.
Seed data cargada en una base real.
Cualquier tipo de test o despliegue.
Estado de speaksy.html (enfoque actual, Firebase)

Un solo archivo, se abre haciendo doble clic o sirviéndolo con cualquier servidor estático. Usa React vía CDN + Babel en el navegador (sin paso de build) y el SDK "compat" de Firebase vía CDN.

✅ Funciona de verdad, una vez que se configura firebaseConfig:

Registro / login / logout con Firebase Authentication (email y contraseña).
Guardado real de sesiones de respiración y lectura en Firestore (/users/{uid}/sessions), con duración medida de verdad en el navegador.
Cálculo de racha de días (/users/{uid}/daily/{fecha}) y estadísticas (sesiones totales, minutos totales) leídas directamente de Firestore, no hardcodeadas.
Logros que se desbloquean solos según sesiones y racha reales (/users/{uid}/achievements).
firestore.rules — reglas de seguridad para que cada usuario solo pueda leer/escribir sus propios datos. Hay que pegarlas en la consola de Firebase manualmente; el archivo HTML no las aplica solo.

🟡 No probado por mí: nunca ejecuté este archivo contra un proyecto de Firebase real (este entorno no tiene acceso a internet), así que no hay garantía de que compile o corra sin ajustes al primer intento. Antes de confiar en él: crea un proyecto en Firebase, activa Authentication (email/contraseña) y Firestore, pega tus claves en firebaseConfig, pega las reglas de firestore.rules, y ábrelo en el navegador para probar registro → respiración → ver que aparece en el dashard.

⚪ Sigue sin existir aquí: onboarding, /privacy con borrado de grabaciones y cuenta, logros de "30 sesiones" con más de 200 sesiones (la consulta actual solo trae las últimas 200 sesiones por simplicidad).

Lectura en voz alta — resaltado en vivo, fluidez y pronunciación real

✅ Funciona (gratis, sin backend):

Resaltado de palabras en vivo mientras lees, usando la Web Speech API del navegador (gratis, sin backend). Solo compara si dijiste las palabras correctas en orden — no mide pronunciación.
Métricas de fluidez reales calculadas a partir de los tiempos entre palabras reconocidas: ritmo (palabras por minuto) y número de pausas mayores a 1.2s. Esto sí es una señal real, no inventada — pero sigue sin ser un diagnóstico ni un análisis clínico.
Manejo de errores del micrófono corregido: antes el archivo silenciaba cualquier error (permiso denegado, sin micrófono, etc.) sin avisar, lo que hacía parecer que "no funcionaba". Ahora se muestra un mensaje claro.

🟡 Análisis de pronunciación real — código escrito, NO desplegado ni probado:

functions/index.js — una Cloud Function de Firebase que recibe audio real grabado en el navegador y llama a Azure Speech Pronunciation Assessment (servicio de pago, con nivel gratuito limitado) para puntuar exactitud, fluidez y completitud por palabra. La clave de Azure vive solo en el servidor, nunca en el HTML.
El botón "Análisis de pronunciación (beta)" en speaksy.html graba audio real con el micrófono, lo convierte a WAV, y llama a esa función.
Para que esto funcione hace falta, fuera de este entorno:
Crear un recurso de Azure Speech (tiene nivel gratuito F0, ~5h de audio/mes).
Pasar el plan de Firebase de "Spark" (gratis) a "Blaze" (pago por uso) — las Cloud Functions que llaman a servicios externos lo requieren. El uso bajo suele quedar dentro del nivel gratuito de Firebase igual.
Instalar Firebase CLI (npm install -g firebase-tools), correr firebase login, firebase init apuntando a este proyecto, configurar firebase functions:config:set azure.key="..." azure.region="...", y firebase deploy --only functions.
Copiar la URL que te da el deploy y pegarla en FUNCTIONS_URL al inicio del script de speaksy.html.
Nunca probé este flujo de punta a punta (sin red ni cuenta de Azure en este entorno). Es razonablemente probable que necesite algún ajuste al primer intento — revísalo con calma, no asumas que compila a la primera.
Análisis de pronunciación real (Azure) — YA DESPLEGADO Y FUNCIONANDO

Se completó el despliegue real de functions/index.js a speaksy-9c32d (Cloud Functions Gen 1, Node.js 20, región us-central1). El botón "Análisis de pronunciación (beta)" en speaksy.html ya tiene su FUNCTIONS_URL real configurada y fue probado por el usuario. Detalles que costó resolver, por si se repite un despliegue futuro:

firebase functions:config:set está descontinuado (Google lo apagó a fines de 2025) — la configuración va en functions/.env (AZURE_KEY=... / AZURE_REGION=...).
El plan Blaze de Firebase es obligatorio para funciones que llaman servicios externos.
Node.js 18 fue descontinuado; functions/package.json quedó fijado en "node": "20".
Si una función quedó creada como 2ª generación y el redeploy intenta 1ª generación (por la versión de firebase-functions instalada), hay que borrarla primero con firebase functions:delete <nombre> --region <region> y desplegar limpio.
Cuestionario de autoreporte y articulación (nuevo)
Cuestionario al registrarse (OnboardingQuestionnaire): multi-selección de áreas (tartamudez, sonidos específicos, coordinación del habla, claridad, velocidad, voz, resonancia, u otra), con opción de "prefiero no decirlo" y de saltarlo. Se guarda en Firestore como focusAreas dentro del documento del usuario. Es autoreporte explícito del usuario, no un diagnóstico generado por la app — se repite ese aviso en la pantalla. No probado en un despliegue real todavía.
"Recomendado para ti" en el dashboard: usa focusAreas para sugerir 2-3 accesos directos a ejercicios existentes (respiración, lectura, articulación) con contexto — no crea contenido nuevo por trastorno, solo prioriza lo que ya existe.
Ejercicio nuevo "Sonidos y articulación" (ArticulationPage): el usuario elige un sonido (r, rr, s, l, t — banco chico en SOUND_BANK, fácil de ampliar), y practica en 3 pasos con el mismo resaltado en vivo que Lectura: sílabas → palabras → frase. Guarda la sesión en Firestore.
Lo que esto NO es: no hay motores dedicados y distintos para apraxia, disartria, taquilalia, disfonía o problemas de resonancia más allá de recomendar/enrutar hacia respiración, lectura o articulación — un calentamiento vocal real para disfonía o un metrónomo para taquilalia siguen sin existir.
Perfil y configuración (nuevo)
ProfilePage: editar el nombre para mostrar, editar las respuestas del cuestionario de autoreporte (focusAreas), y un interruptor de privacidad real: "Permitir análisis de pronunciación con Azure" (allowPronunciationAnalysis en Firestore, apagado por defecto). Cuando está apagado, el botón de análisis en Lectura queda reemplazado por una nota explicando cómo activarlo — el audio nunca sale del navegador si el usuario no lo permite explícitamente.
El resaltado en vivo de palabras (Web Speech API) es independiente de este permiso — ese ya usa el motor de voz del propio navegador y nunca se envía a Azure ni a ningún backend propio.
Se agregó index.html: página de aterrizaje estática (sin Firebase), mismo lenguaje visual, con un anillo de respiración interactivo como elemento de marca, que enlaza a speaksy.html. Debe vivir en la misma carpeta que speaksy.html para que el enlace relativo funcione.
No probado en un despliegue real — mismo motivo de siempre.
Ranking de constancia (XP) — nuevo

Se agregó gamificación, pero a propósito no por "fluidez": rankear a personas con dificultades del habla por qué tan fluida es su voz sería comparar discapacidades entre sí, algo que el propio PRD original ya advertía evitar ("progreso personal > comparación con otros"). En su lugar:

XP por constancia: cada sesión completada da 20 + duración/10 XP (xpForSession en el código), guardado en users/{uid}.xp.
Niveles (LEVEL_TITLES / levelFor): Empezando → Constante → Enfocado → Dedicado → Referente de práctica, según XP acumulado. Se muestran en el dashboard con una barra de "cuánto falta para el siguiente".
Ranking opcional: colección pública leaderboard/{uid} con displayName y xp. Nadie aparece ahí por defecto — el usuario tiene que activarlo explícitamente en Perfil → Privacidad y permisos, y puede desactivarlo cuando quiera (borra su fila del ranking al instante).
firestore.rules actualizado: cualquier usuario con sesión puede leer la colección leaderboard completa, pero solo puede escribir su propio documento — hay que volver a publicar las reglas actualizadas en la consola de Firebase, las viejas no incluyen esto.
No probado en un despliegue real todavía.
Sistema de niveles estilo Duolingo — nuevo, real, no es solo maqueta

Se agregó una pestaña "Niveles" con progresión desbloqueable en las 4 áreas, sin quitar los ejercicios libres que ya existían (respiración, lectura, conversación y articulación libres siguen ahí, intactas).

Lo que es real y funciona:

6 niveles de Respiración, 6 de Lectura, 7 de Conversación, 10 de Articulación (incluyendo trabalenguas de dificultad creciente), todos con contenido real escrito (no placeholders).
El primer nivel de cada área empieza desbloqueado; los demás muestran 🔒 hasta completar el anterior. Completado se guarda de verdad en Firestore (users/{uid}/levelProgress/{area}), sobrevive a cerrar la app.
Estrellas (1-3) calculadas por cobertura del ejercicio (palabras reconocidas, ciclos de respiración completados, preguntas respondidas), nunca por velocidad — así lo pediste explícitamente para articulación.
Cada nivel completado da XP real, que alimenta el mismo sistema de niveles de constancia y el ranking que ya existían.
Los "runners" de Lectura y Articulación reutilizan el mismo componente (ArticulationStage, ya existente) en vez de duplicar código.

Simplificaciones honestas frente a lo que pediste:

Las "estrellas" para Respiración con palabras (niveles 4-6) usan una detección simple de "¿hubo algo de voz durante la exhalación?", no una verificación de que dijiste exactamente esa palabra — verificarlo exacto durante una animación en curso es bastante más complejo y no lo prioricé.
Conversación mide participación (si respondiste algo, no si la respuesta fue "buena") — coherente con lo que ya establecimos antes sobre no evaluar el contenido de lo que alguien dice.
El diseño visual del camino es una lista vertical simple con líneas conectoras, no el mapa serpenteante ilustrado de Duolingo — mantuve el lenguaje visual ya establecido de Speaksy en vez de construir un editor de mapas nuevo.
firestore.rules actualizado con la subcolección levelProgress — hay que volver a publicar las reglas en la consola de Firebase.
No probado en un despliegue real todavía — motivo de siempre (sin navegador ni Firebase real en este entorno).
Notas de diseño

Paleta y tipografía se alejaron a propósito de la referencia visual (imagen "HablaFácil") porque el PRD original pide explícitamente evitar interfaces infantiles y colores agresivos (sección 3). Se mantuvo la idea de esa referencia — panel con tarjetas redondeadas, tono cálido y acompañante — pero con una paleta más adulta (tinta verde-azulada, menta, ámbar solo para la racha) y tipografía Fraunces + Inter + IBM Plex Mono para los datos.

Siguiente paso recomendado

Antes de seguir agregando pantallas nuevas: conectar el login real del frontend al backend y probar el ciclo completo de un solo ejercicio (iniciar → completar → guardar en Postgres → verlo en el historial). Eso valida que la arquitectura de las fases 1-6 realmente funciona de punta a punta antes de construir IA y análisis de voz encima.