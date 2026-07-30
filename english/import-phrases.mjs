// One-off import: parses the pasted diary text below and inserts rows into the
// Supabase "phrases" table (same project/anon key used by index.html).
// Run with: node import-phrases.mjs
// Requires Node 18+ (uses global fetch).

const SB_URL = 'https://ysnwsrndphmgdtynwxtu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzbndzcm5kcGhtZ2R0eW53eHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MTIxODEsImV4cCI6MjEwMDQ4ODE4MX0.HzO38CqXLw0JIa0B2uDEzA5CWRSYsuMdbCjRCJgICag';

// ===== same parser used by the "Diário de frases" modal in index.html =====
function pjStripMarker(s) { return s.replace(/^\d+\s*[.\-)]\s*/, '').replace(/^[*\-]\s+/, '').trim(); }
function pjParseDateLine(line) {
  const m = line.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m) return null;
  let d = m[1].padStart(2, '0'), mo = m[2].padStart(2, '0'), y = m[3];
  if (!y) y = String(new Date().getFullYear());
  else if (y.length === 2) y = '20' + y;
  return `${y}-${mo}-${d}`;
}
function pjTrySplitGlued(line) {
  const m = line.match(/^(.*?[A-Za-zÀ-ÖØ-öø-ÿ0-9][.!?])(?=[A-ZÀ-Ö])(.+)$/);
  if (!m) return null;
  const left = m[1].trim(), right = m[2].trim();
  if (!left || !right) return null;
  return [left, right];
}
function parsePhrasesText(raw, fallbackDate) {
  let curDate = fallbackDate;
  const items = [];
  raw.split('\n').forEach(rawLine => {
    let line = rawLine.trim();
    if (!line) return;
    const d = pjParseDateLine(line);
    if (d) { curDate = d; return; }
    line = line.replace(/\*\*/g, '');
    const tm = line.match(/^(.*?)\s*tradu[cç][aã]o\s*:?\s*(.+)$/i);
    if (tm && tm[1].trim() && tm[2].trim()) {
      const left = pjStripMarker(tm[1].trim()), right = tm[2].trim();
      if (left) items.push({ date: curDate, text: left });
      if (right) items.push({ date: curDate, text: right });
      return;
    }
    const cleaned = pjStripMarker(line);
    if (!cleaned) return;
    const glued = pjTrySplitGlued(cleaned);
    if (glued) { items.push({ date: curDate, text: glued[0] }); items.push({ date: curDate, text: glued[1] }); return; }
    items.push({ date: curDate, text: cleaned });
  });
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push({ date: items[i].date, en: items[i].text, pt: items[i + 1] ? items[i + 1].text : '' });
  }
  return rows;
}

// ===== raw diary text pasted by the user =====
// The first block (30 sentences, no date header) was intentionally left out —
// the user asked to ignore whichever block had no date attached to it.
const RAW = String.raw`
17/06

1. In today's world, there's an ancient truth: the brain is a comfort junkie.
   * No mundo de hoje, há uma verdade antiga: o cérebro é um viciado em conforto.
2. At the moment you need to start a big project, the logical decision is to watch just one episode on Netflix.
   * No momento em que você precisa iniciar um grande projeto, a decisão lógica é assistir apenas um episódio.
3. The restless brain works best in the morning at a specific time.
   * O cérebro inquieto funciona melhor de manhã em um horário específico.
4. A restless mind in the evening needs a meditation, not an episode.
   * Uma mente inquieta à noite precisa de uma meditação, não um episódio.
5. In the middle of a big project, an ancient habit returns: procrastination at the worst time.
   * No meio de um grande projeto, um hábito antigo retorna: procrastinação no pior momento.
6. The logical decision in this situation is a 10-minute meditation at noon.
   * A decisão lógica nesta situação é uma meditação de 10 minutos ao meio-dia.
7. At night, the comfort junkie brain wants an episode, but the logical mind chooses silence.
   * À noite, o cérebro viciado em conforto quer um episódio, mas a mente lógica escolhe o silêncio.
8. In the world of procrastination, a big project becomes an enemy, not a goal.
   * No mundo da procrastinação, um grande projeto se torna um inimigo, não uma meta.
9. The ancient practice of meditation in the morning at 6am clears a restless mind.
   * A prática antiga de meditação de manhã às 6 da manhã limpa uma mente inquieta.
10. A comfort junkie's journey in 180 days starts at the moment they choose an uncomfortable truth.
   * A jornada de um viciado em conforto em 180 dias começa no momento em que escolhem uma verdade desconfortável.

18/06/2026

1. I'm a .NET developer working in the cloud ecosystem.
   1. Sou um desenvolvedor .NET trabalhando no ecossistema de nuvem.
2. I work with a Visual Studio IDE and the Azure platform daily.
   1. Trabalho com um IDE Visual Studio e a plataforma Azure diariamente.
3. We are a software development company that builds enterprise solutions.
   1. Somos uma empresa de desenvolvimento de software que constrói soluções empresariais.
4. The codebase is complex, and the database is well-optimized.
   1. A base de código é complexa, e o banco de dados é bem otimizado.
5. We have developers, architects, and QA testers in the team.
   1. Temos desenvolvedores, arquitetos e testadores de QA no time.
6. She is an engineer responsible for the DevOps infrastructure.
   1. Ela é uma engenheira responsável pela infraestrutura DevOps.
7. I use an API that integrates with the legacy system.
   1. Uso uma API que se integra com o sistema legado.
8. This is a fintech startup building a blockchain solution.
   1. Esta é uma startup de fintech construindo uma solução blockchain.
9. The deployment was smooth, and the application is running without errors.
   1. O deploy foi suave, e a aplicação está rodando sem erros.
10. Features, bugs, and performance metrics are tracked in the backlog.
   1. Features, bugs e métricas de performance são rastreadas no backlog.

22/06/2026

1. He plays basketball every weekend
   1. Ele joga basquete todo fim de semana
2. She raps with incredible flow
   1. Ela canta rap com um flow incrível
3. My brother plays guitar in a rock band
   1. Meu irmão toca guitarra em uma banda de rock
4. She prepares sushi with precision
   1. Ela prepara sushi com precisão
5. It requires focus and discipline
   1. Isso requer foco e disciplina
6. He builds startups that change the market
   1. Ele constrói startups que mudam o mercado
7. The stoic accepts what he cannot control
   1. O estoico aceita o que não pode controlar
8. She watches football matches religiously
   1. Ela assiste partidas de futebol religiosamente
9. The producer mixes beats that shake the speaker
   1. O produtor mistura batidas que balançam o speaker
10. Every successful entrepreneur maximizes every hour
   1. Todo empreendedor bem-sucedido maximiza cada hora
11. He focuses on one task at a time
   1. Ele se concentra em uma tarefa de cada vez
12. She eliminates distractions from her workspace
   1. Ela elimina distrações do seu espaço de trabalho
13. My mentor organizes his day with precision
   1. Meu mentor organiza seu dia com precisão
14. It matters how you spend your morning
   1. Importa como você gasta sua manhã
15. He launches businesses that solve real problems
   1. Ele lança negócios que resolvem problemas reais
16. She scales her company with strategic decisions
   1. Ela escala sua empresa com decisões estratégicas
17. The entrepreneur takes calculated risks every day
   1. O empreendedor corre riscos calculados todo dia
18. The wise man accepts what he cannot change
   1. O homem sábio aceita o que não pode mudar
19. She practices virtue in every decision
   1. Ela pratica virtude em cada decisão
20. It teaches us that external things don't matter
   1. Isso nos ensina que coisas externas não importam

24/03/26
1 - He develops applications with C# and .NET

* Ele desenvolve aplicações com C# e .NET

1 - He's a skilled C# developer

* Ele é um desenvolvedor C# habilidoso

2 - She deploys microservices on AWS every day

* Ela implementa microsserviços no AWS todo dia

2 - She's an AWS expert

* Ela é uma especialista em AWS

3 - The architect designs cloud infrastructure for scalability

* O arquiteto projeta infraestrutura em nuvem para escalabilidade

3 - He's thinking about cloud solutions

* Ele está pensando em soluções em nuvem

4 - It requires strong knowledge of cloud databases

* Isso requer forte conhecimento de bancos de dados em nuvem

4 - It's essential for modern development

* É essencial para desenvolvimento moderno

5 - He manages AWS resources with precision

* Ele gerencia recursos AWS com precisão

5 - He's responsible for our infrastructure

* Ele é responsável pela nossa infraestrutura

6 - She writes clean code in C# daily

* Ela escreve código limpo em C# diariamente

6 - She's committed to code quality

* Ela está comprometida com a qualidade do código

7 - The programmer optimizes cloud costs continuously

* O programador otimiza custos de nuvem continuamente

7 - He's focused on efficiency

* Ele está focado em eficiência

8 - It connects multiple services through cloud APIs

* Isso conecta múltiplos serviços através de APIs em nuvem

8 - It's the backbone of our system

* É o coração do nosso sistema

9 - He uses .NET frameworks to build robust applications

* Ele usa frameworks .NET para construir aplicações robustas

9 - He's experienced with .NET ecosystem

* Ele é experiente com o ecossistema .NET

10 - She passes all her AWS certification exams

* Ela passa em todos seus exames de certificação AWS

10 - She's certified in cloud architecture

* Ela é certificada em arquitetura em nuvem

27/07/2026
1.
Your team uses microservices for the payment module, right?
Seu time usa microsserviços para o módulo de pagamento, certo?
2.
He manages the Azure infrastructure while she develops the backend services?
Ele gerencia a infraestrutura Azure enquanto ela desenvolve os serviços backend?
3.
The interviewer mentions that performance optimization matters significantly.
O entrevistador menciona que otimização de desempenho importa significativamente.
4.
Does the role require expertise with Azure Service Bus?
O papel requer expertise com Azure Service Bus?
5.
My former manager emphasizes that code quality reduces technical debt long-term.
Meu gerente anterior enfatiza que qualidade de código reduz débito técnico a longo prazo.
6.
The architect proposes that we refactor the monolith into microservices.
O arquiteto propõe que refatoremos o monolito em microsserviços.
7.
She argues that the SQL approach offers better performance than NoSQL for transactions.
Ela argumenta que a abordagem SQL oferece melhor desempenho que NoSQL para transações.
8.
When you negotiate the offer, the company emphasizes that performance matters for this role.
Quando você negocia a oferta, a empresa enfatiza que desempenho importa para esse papel.
9.
The company values clean code, and the interviewer focuses questions on design patterns.
A empresa valoriza código limpo, e o entrevistador foca perguntas em padrões de design.
10.
My colleague recommends that we implement caching because it improves response times significantly.
Meu colega recomenda que implementemos cache porque melhora significativamente os tempos de resposta.
`;

const today = new Date().toISOString().slice(0, 10);
const rows = parsePhrasesText(RAW, today);

console.log(`Parsed ${rows.length} sentence pairs. Preview of first 3:`);
console.log(rows.slice(0, 3));

const payload = rows.map(r => ({ phrase_date: r.date, en: r.en, pt: r.pt }));

const res = await fetch(`${SB_URL}/rest/v1/phrases`, {
  method: 'POST',
  headers: {
    'apikey': SB_KEY,
    'Authorization': `Bearer ${SB_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify(payload)
});

if (!res.ok) {
  const text = await res.text();
  console.error(`Insert failed: ${res.status} ${res.statusText}\n${text}`);
  process.exit(1);
}

console.log(`Inserted ${rows.length} rows into "phrases" successfully.`);
