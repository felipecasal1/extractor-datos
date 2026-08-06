import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const textoReseña = `La verdad compré esta cafetera hace como dos semanas y estoy
medio decepcionado. Anda bien pero hace un ruido tremendo y el tanque de agua
es re chico, lo tengo que llenar todo el tiempo. Le pondría un 2 de 5.`;

// ── LA HERRAMIENTA ──────────────────────────────────────────────
// Acá definimos el "molde". No es código que se ejecuta: es una DESCRIPCIÓN
// de la estructura que queremos que Claude complete.
const herramientaExtractor = {
  name: 'guardar_resena',              // nombre de la herramienta
  description: 'Guarda los datos estructurados extraídos de una reseña de producto',

  // input_schema es el JSON Schema: la forma exacta de los datos.
  input_schema: {
    type: 'object',
    properties: {
      producto:    { type: 'string', description: 'El producto reseñado' },
      sentimiento: {
        type: 'string',
        enum: ['positivo', 'negativo', 'neutral'], // solo estos 3 valores permitidos
        description: 'El sentimiento general de la reseña',
      },
      puntuacion:  { type: 'number', description: 'Puntuación del 1 al 5' },
      temas:       {
        type: 'array',
        items: { type: 'string' },                  // un array de strings
        description: 'Los temas o aspectos mencionados',
      },
      resumen:     { type: 'string', description: 'Resumen en una frase' },
    },
    // Estos campos son OBLIGATORIOS: el modelo no puede omitirlos.
    required: ['producto', 'sentimiento', 'puntuacion', 'temas', 'resumen'],
  },
};

async function extraer() {
  const respuesta = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: 0,

    // Le pasamos la herramienta que definimos arriba (en un array: puede haber varias).
    tools: [herramientaExtractor],

    // tool_choice FUERZA a que use esta herramienta sí o sí, en vez de dejarlo elegir.
    tool_choice: { type: 'tool', name: 'guardar_resena' },

    messages: [
      { role: 'user', content: `Analizá esta reseña: ${textoReseña}` }
    ],
  });

  // ── SACAR LOS DATOS ─────────────────────────────────────────────
  // Cuando el modelo usa una herramienta, la respuesta trae un bloque
  // de tipo 'tool_use'. Lo buscamos dentro del content.
  const bloqueTool = respuesta.content.find((b) => b.type === 'tool_use');


  const datos = bloqueTool.input;
console.log(respuesta.usage);
  console.log('Producto:   ', datos.producto);
  console.log('Sentimiento:', datos.sentimiento);
  console.log('Puntuación: ', datos.puntuacion);
  console.log('Temas:      ', datos.temas);
  console.log('Resumen:    ', datos.resumen);
}

extraer();