/* ==========================================================================
   OUR TIME — CENTRAL CONFIGURATION MODULE
   ========================================================================== */

const AppConfig = {
    appName: "NUESTRA CONSTANTE",
    tagline: "Nuestra única constante vital.",
    
    // Free Cloud Realtime Database Configuration (Supabase / Firebase)
    supabase: {
        url: "https://lssecgytpirrplzdgiyk.supabase.co",
        anonKey: "sb_publishable_ho9eFiczRfwDzG6UCBwOUQ_li6AEl91"
    },

    // Romantic quotes & Daily letters collection
    introQuotes: {
        step1: "Hay momentos que empiezan como cualquier otro...",
        step2: "...y terminan cambiándolo todo.",
        question: "¿Quieres ser mi novia?",
        hearItQuote: "Entonces tendrás que decírmelo mirándome a los ojos.",
        yesSubtitle: "Entonces... comienza nuestra historia.",
        yesTitle: "Bienvenida a NUESTRA CONSTANTE. ❤️",
        letterLine1: "No sé cuánto tiempo tendremos para escribir esta historia.",
        letterLine2: "Pero sí sé con quién quiero escribirla."
    },

    // 365 Unique Daily Romantic Letters Generator
    dailyLetters: (function() {
        const medicalQuotes = [
            { title: "La doctora de mi alma", line1: "Sanaste dudas que no sabía que tenía,", line2: "y te convertiste en mi única constante vital. ❤️" },
            { title: "Diagnóstico definitivo", line1: "Revisé todos mis latidos y el diagnóstico es claro:", line2: "estoy irremediablemente enamorado de ti. 🩺" },
            { title: "Receta del día", line1: "Prescripción médica para hoy:", line2: "un abrazo apretado y un beso antes de dormir. ✨" },
            { title: "Mi constante favorita", line1: "En un mar de variables e incertidumbres,", line2: "tú eres la única constante que le da sentido a todo. 💎" },
            { title: "La mejor especialista", line1: "Eres experta en medicina,", line2: "pero tu mayor talento es hacerme sonreír con solo mirarme. 😊" }
        ];

        const trainingQuotes = [
            { title: "Entrenando la vida", line1: "No importa cuán duro sea el entrenamiento o la guardia,", line2: "saber que te veré al final lo vale todo. 🥋" },
            { title: "Cinto negro de amor", line1: "Nuestra disciplina y cariño crecen cada día,", line2: "construyendo un equipo invencible. 🏆" },
            { title: "Fuerza compartida", line1: "Tú me das la fuerza para superar cualquier meta,", line2: "y juntos no hay desafío que no podamos vencer. 💪" },
            { title: "Compañeros de combate", line1: "En este combate llamado vida,", line2: "elegí a la mejor compañera para ganar cada round. ❤️" }
        ];

        const paintingQuotes = [
            { title: "Arte en movimiento", line1: "Si nuestra historia fuera un lienzo en blanco,", line2: "tus sonrisas serían las pinceladas más brillantes. 🎨" },
            { title: "La obra maestra", line1: "He visto muchas obras hermosas,", line2: "pero nada se compara con la luz de tus ojos. ✨" },
            { title: "Pinceladas de destino", line1: "Cada día juntos agregamos un nuevo color", line2: "a este cuadro hermoso que estamos dibujando. 🌙" }
        ];

        const romanticQuotes = [
            { title: "Desde aquel momento...", line1: "No sé cuánto tiempo tendremos para escribir esta historia,", line2: "pero sí sé con quién quiero escribirla. ❤️" },
            { title: "Mi lugar seguro", line1: "En un mundo que nunca se detiene,", line2: "tu abrazo es el único lugar donde encuentro paz. 💫" },
            { title: "Nuestra coincidencia", line1: "Coincidir contigo no fue suerte,", line2: "fue lo mejor que le ha pasado a mi vida. 🌹" },
            { title: "Promesa de hoy", line1: "Hoy te elijo de nuevo,", line2: "como lo haré todos los días que nos queden por delante. 👑" },
            { title: "Un segundo eterno", line1: "Un segundo a tu lado vale más", line2: "que mil horas en cualquier otro lugar. ⏱️" }
        ];

        const pool = [...medicalQuotes, ...trainingQuotes, ...paintingQuotes, ...romanticQuotes];
        const result = [];

        // Generate 365 rich variations
        for (let i = 0; i < 365; i++) {
            const base = pool[i % pool.length];
            const dayNum = i + 1;
            result.push({
                day: dayNum,
                title: `${base.title} (Día #${dayNum})`,
                line1: base.line1,
                line2: base.line2
            });
        }
        return result;
    })(),

    // Medical Vitals Config
    vitals: {
        status: "Enamorados ❤️",
        rhythm: "Juntos (Sincrónico)",
        diagnosis: "Irremediablemente nosotros",
        prognosis: "Largo plazo",
        prescription: "Una cita conmigo. Repetir indefinidamente."
    },

    // Default Training Achievements
    achievements: [
        { id: "begin", icon: "🏆", title: "El comienzo", desc: "El día en que comenzó nuestro tiempo", lockedText: "El comienzo", autoUnlock: "immediate" },
        { id: "first_date", icon: "☕", title: "Primera cita", desc: "Nuestra primera salida juntos", lockedText: "Primera cita", autoUnlock: "manual" },
        { id: "first_kiss", icon: "💋", title: "Primer beso", desc: "Un instante inolvidable", lockedText: "Primer beso", autoUnlock: "manual" },
        { id: "first_month", icon: "🌙", title: "Primer mes", desc: "30 días compartiendo historias", lockedText: "Primer mes", autoUnlock: "days:30" },
        { id: "first_photo", icon: "📸", title: "Primera foto juntos", desc: "Un recuerdo para siempre", lockedText: "Primera foto juntos", autoUnlock: "manual" },
        { id: "first_trip", icon: "✈️", title: "Primer viaje", desc: "Descubriendo un lugar juntos", lockedText: "Primer viaje", autoUnlock: "manual" },
        { id: "first_anniversary", icon: "👑", title: "Primer aniversario", desc: "365 días escribiendo nuestro libro", lockedText: "Primer aniversario", autoUnlock: "days:365" }
    ]
};
