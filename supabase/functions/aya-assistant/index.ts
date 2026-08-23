// ====================================================================
// AYA ASSISTANT — SUPABASE EDGE FUNCTION (Deno runtime)
// "Una casa digital para la relación" — Manifesto Edition
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AYARequest {
  userId: string;
  coupleId: string;
  question: string;
  mode: 'mediate' | 'understand_partner' | 'reflect' | 'daily_insight';
  consentScope: 'shared_only' | 'shared_and_my_private' | 'all_consented';
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Configuración del servidor incompleta (Missing API keys)" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, coupleId, question, mode, consentScope }: AYARequest = await req.json();

    if (!userId || !coupleId || !question || !mode) {
      return new Response(
        JSON.stringify({ error: "Parámetros requeridos ausentes (userId, coupleId, question, mode)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // 1. VERIFICAR DOBLE CONSENTIMIENTO (Regla de oro: AYA solo ve lo que AMBOS autorizan)
    const { data: consent, error: consentErr } = await supabase
      .from("aya_consents")
      .select("user1_consent, user2_consent")
      .eq("couple_id", coupleId)
      .single();

    if (consentErr || !consent?.user1_consent || !consent?.user2_consent) {
      return new Response(
        JSON.stringify({
          error: "Doble consentimiento requerido. La privacidad es el pilar de Andrea: ambos debéis activar AYA en Ajustes > Privacidad para continuar.",
          requiresBothConsent: true
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. RECUPERAR CONTEXTO Y PERFILES
    const { data: context } = await supabase
      .from("aya_context_cache")
      .select("summary_text")
      .eq("couple_id", coupleId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, partner_id")
      .eq("id", userId)
      .single();

    const userName = profile?.name || "Tú";

    // 3. BUSCAR ENTRADAS RELEVANTES (RAG) CON PGVECTOR (SOLO LO CONSENTIDO)
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
      dimensions: 1536
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const { data: relevantEntries } = await supabase.rpc("match_aya_entries", {
      query_embedding: queryEmbedding,
      couple_id_param: coupleId,
      match_threshold: 0.70,
      match_count: 8,
      consent_scope: consentScope || "shared_only",
      requesting_user_id: userId
    });

    const entriesList = relevantEntries || [];

    // 4. CONSTRUIR SYSTEM PROMPT CON EL MANIFIESTO DE ANDREA
    const systemPrompt = buildAYAManifestoSystemPrompt(mode, userName, context?.summary_text || "", entriesList);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.65,
      max_tokens: 850
    });

    const reply = completion.choices[0]?.message?.content || "No pude generar una respuesta en este momento.";

    return new Response(
      JSON.stringify({
        response: reply,
        sources: entriesList.map((e: any) => ({
          id: e.id,
          date: e.entry_date,
          type: e.type,
          mood: e.mood_tag
        }))
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildAYAManifestoSystemPrompt(
  mode: string,
  userName: string,
  summary: string,
  entries: any[]
): string {
  const manifestoFoundations = `Eres AYA, una acompañante de reflexión y cuidado para parejas dentro de Andrea.
Andrea es una casa digital, un álbum íntimo y un refugio de conexión, NO una herramienta de productividad, evaluación o vigilancia.

PRINCIPIO GUÍA FUNDAMENTAL:
"Andrea no mide el amor. Lo ayuda a hacerse visible, recordable y más fácil de cuidar."
Una relación NO es una métrica. Nunca uses puntajes, rachas ni juicios de quién participa más o menos.

REGLAS DE ORO DE AYA:
1. HABLAR CON CALIDEZ Y HUMILDAD: Valida emociones siempre antes de ofrecer preguntas o hipótesis. Pregunta antes de concluir.
2. PRIVACIDAD INVIOLABLE: NUNCA reveles ni insinúes el contenido o pensamientos de un diario privado de un usuario al otro.
3. ROLES VIVOS (NO ETIQUETAS): No diagnostiques ("eres evitativo", "eres dependiente"). Describe momentos temporales ("En estas últimas semanas, parece que tú has iniciado más planes y tu pareja ha aportado calma... ¿Os reconocéis en esto?").
4. COMUNICACIÓN NO VIOLENTA (CNV): Transforma quejas en necesidades universales y peticiones amables.
5. NO TOMAR PARTIDO: Tu objetivo es ser un puente de empatía mutua, no juzgar quién tiene la razón.
6. ACOMPAÑAR, NO EXIGIR: Ofrece un tono sereno que permita a la persona reflexionar sin culpa ni presión.`;

  let modeDirective = "";
  switch (mode) {
    case "mediate":
      modeDirective = `MODO MEDIACIÓN Y COMUNICACIÓN:
Ayuda a ${userName} a estructurar lo que siente para comunicárselo a su pareja con ternura y claridad: hechos observables -> cómo se siente -> qué necesidad tiene -> qué petición concreta y positiva puede proponer.`;
      break;
    case "understand_partner":
      modeDirective = `MODO ENTENDER A MI PAREJA:
Ayuda a ${userName} a ponerse en el lugar de su pareja con compasión, explorando hipótesis de cuidado y ritmo emocional, sin asumir malas intenciones ni vulnerar la privacidad.`;
      break;
    case "reflect":
      modeDirective = `MODO INTROSPECCIÓN PERSONAL:
Guía a ${userName} a explorar sus propias reacciones y emociones con preguntas suaves y acogedoras. Ayúdale a encontrar calma y auto-compasión.`;
      break;
    case "daily_insight":
    default:
      modeDirective = `MODO INSIGHT Y CUIDADO COTIDIANO:
Ofrece una observación breve, cariñosa y llena de agradecimiento sobre los pequeños gestos que sostienen vuestra historia compartida.`;
      break;
  }

  const entriesContext = entries.length > 0
    ? `HISTORIA COMPARTIDA Y CONSENTIDA:\n` + entries.map(e => `- ${e.entry_date} (${e.type}): estado de ánimo ${e.mood_tag || 'tranquilo'}`).join("\n")
    : "Sin entradas adicionales recientes.";

  return `${manifestoFoundations}

${modeDirective}

RESUMEN CONSENTIDO DE LA PAREJA:
${summary || "Vuestro refugio compartido recién comenzado."}

${entriesContext}`;
}
