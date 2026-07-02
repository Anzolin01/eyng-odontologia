# 🔧 Trilha de Correções — Auditoria completa de 02/07/2026

**Origem:** auditoria com 4 agentes paralelos (App.jsx núcleo / Agenda+Financeiro+Caixa / Odontograma+dashboards / APIs+segurança), achados verificados. 44 achados brutos → 35 tarefas deduplicadas.

**Instruções pra quem for executar (Sonnet):**
- Uma tarefa por vez, na ordem das fases. Commit individual por tarefa (`fix: T## — descrição curta`).
- NÃO refatorar além do escopo da tarefa. NÃO mudar visual/UX que não esteja descrito.
- Após cada fase: `npm run build` tem que passar; push dispara deploy no Vercel.
- Tarefas marcadas **[CLEBER]** precisam de ação humana em painel (Supabase/Vercel) — preparar o material (SQL, instruções) e avisar o Cleber, não pular.
- Convenções do projeto: tabelas Supabase usam coluna JSONB `data` (`{id: uuid, data: {...}}`); objetos locais carregam `supabaseId` (patients) ou `_dbId` (agenda). Anon key hardcoded é por design.

---

## FASE 1 — URGENTE (dado clínico errado ou perdido; a Carol pode usar o app HOJE)

### T01 🔴 Odontograma: arcada inferior espelhada
- **Arquivo:** `src/Odontograma2D.jsx:430` e `:458`
- **Problema:** `LOWER_R = [48..41]` já está em ordem de exibição (igual `UPPER_R = [18..11]` que renderiza direto), mas a linha 430 faz `teeth={[...LOWER_R].reverse()}` → dente 41 renderiza na ponta externa e 48 na linha média. Quadrante 4 inteiro espelhado. Mesmo bug nos decíduos (linha 458, `LOWER_R_DEC`).
- **Fix:** trocar `teeth={[...LOWER_R].reverse()}` por `teeth={LOWER_R}` e `teeth={[...LOWER_R_DEC].reverse()}` por `teeth={LOWER_R_DEC}`.
- **Verificar:** no arco inferior renderizado, 41 deve encostar na linha média (embaixo do 11) e 48 na ponta direita externa (embaixo do 18).

### T02 🔴 Retornos atrasados nunca aparecem (returnStatus estático)
- **Arquivo:** `src/App.jsx` — gravações em :366, :801, :1143; leituras em :701-702, :757-758
- **Problema:** `returnStatus` só é calculado no momento do save. Se a data do retorno passa sem ninguém editar a ficha, o paciente fica `"ok"` pra sempre → painel "Retornos atrasados" (função central do app) mostra vazio; badge exibe "Em -37d".
- **Fix:** criar helper `statusOf(nextReturn)` que calcula em tempo de render (`!nextReturn → "none"`, `days<0 → "overdue"`, `days===0 → "due_today"`, senão `"ok"`), e trocar TODAS as leituras de `p.returnStatus` por `statusOf(p.nextReturn)`. Manter o campo gravado só por compat (ou parar de gravar).
- **Atenção:** depende do T04 (getDays correto).

### T03 🔴 Erro de rede no load troca pacientes reais pelos 6 de demonstração
- **Arquivo:** `src/App.jsx:1802-1814`
- **Problema:** `if (!error && data.length>0) {...} else { setPatients(PATIENTS) }` — qualquer erro transitório do select mostra os pacientes demo (Maria Eduarda Conti etc.) no lugar dos 212 reais; edições neles caem no buraco do T05. Banco legitimamente vazio também injeta demos sem forma de excluir.
- **Fix:** em caso de `error`, mostrar tela de erro com botão "Tentar novamente" (não renderizar demos). Com banco vazio, mostrar estado vazio normal ("Nenhum paciente ainda"). Demos só atrás de flag explícita (ex: `?demo=1`).

### T04 🔴 Datas em UTC — depois das 21h o app inteiro pula pro dia seguinte
- **Arquivos:** `src/App.jsx:40-41,1830`, `src/Agenda.jsx:42`, `src/CaixaDia.jsx:14`, `src/FinanceiroModule.jsx:24`, `src/IntelDashboard.jsx:135,141`
- **Problema:** `new Date().toISOString().split("T")[0]` é UTC; Brasil é UTC-3. Das 21h às 23h59: Caixa grava recebimento com data de amanhã (some do fechamento), "Fechar o Dia" manda agenda do dia errado no WhatsApp, agenda abre no dia seguinte, parcela que vence hoje aparece vencida, "Recebido/mês" zera na noite do último dia do mês.
- **Fix:** criar UM helper local compartilhado (ex: em novo `src/dateUtils.js`): `hojeISO()` montando YYYY-MM-DD com `getFullYear/getMonth/getDate` locais. Substituir todas as ocorrências nos 5 arquivos. No IntelDashboard, agrupar por dia com `new Date(e.occurred_at).toLocaleDateString("sv-SE")`.
- **Bônus na mesma tarefa (App.jsx:36-38):** `TODAY` é congelado no load do módulo e `getDays` usa `Math.ceil` que erra por 1 de manhã (retorno de hoje aparece "em 1d"). Fix: calcular `new Date()` dentro da função e comparar datas truncadas à meia-noite local.

### T05 🔴 Gravações no Supabase falham em silêncio + paciente sem supabaseId nunca salva
- **Arquivo:** `src/App.jsx:1819-1826` (updatePatient), `:1959-1967` (novo paciente), `src/Agenda.jsx:748-766` (saveAppt/updateAppt), load da agenda `:736-746`
- **Problema:** (a) retorno `{error}` dos `.update()/.insert()` é ignorado — rede caiu/RLS bloqueou = UI diz salvo, banco ficou velho; (b) se `u.supabaseId` não existe, updatePatient não grava NADA silenciosamente (caminhos reais: insert que falhou, import com erro); (c) na Agenda, insert que falha ainda adiciona o agendamento na tela ("fantasma" que some no reload); (d) select da agenda com erro renderiza grid vazio sem aviso.
- **Fix:** criar componente/helper de toast simples (ou `alert()` como mínimo). Checar `error` de TODA escrita Supabase (App.jsx e Agenda.jsx): em falha, avisar "Não foi possível salvar — verifique a internet" e NÃO atualizar o estado local (ou marcar visualmente como não-salvo). Paciente sem `supabaseId`: tentar `insert` em vez de pular. Load com erro: tela de erro + retry.
- **Nota:** é a maior tarefa da fase; pode ser quebrada em 5a (App.jsx) e 5b (Agenda.jsx).

### T06 🔴 Campo de valor apaga o que foi digitado ao pôr vírgula (impossível cadastrar R$ 150,50)
- **Arquivos:** `src/FinanceiroModule.jsx:83` (Nova Cobrança), `src/CaixaDia.jsx:164`
- **Problema:** `onChange={e => set("valor", parseFloat(e.target.value) || "")}` em `<input type="number">` — valor incompleto ("150,") faz o browser reportar `""` → estado zera → campo limpa na hora que digita a vírgula. Digitar "0" primeiro também apaga (0 é falsy).
- **Fix:** guardar a string crua no estado e aplicar `parseFloat` só no salvar (padrão que o ModalPagamento já usa em FinanceiroModule.jsx:129).

---

## FASE 2 — SEGURANÇA (obrigatório antes de divulgar/cobrar; LGPD com dado de saúde)

### T07 🔴 [CLEBER] RLS aberto: qualquer um lê/edita/apaga todos os prontuários
- **Evidência:** `scripts/importar-pacientes.mjs` e `limpar-importacao.mjs` fazem select/insert/update/delete com anon key SEM login — e funcionaram em produção. Logo o role `anon` tem acesso total a `patients` (e `agenda`, `user_events`).
- **Fix (preparar e entregar ao Cleber):** SQL pra rodar no SQL Editor do Supabase: habilitar RLS em `patients`, `agenda`, `user_events` com políticas exigindo `authenticated`. Ex:
  ```sql
  alter table patients enable row level security;
  create policy "authenticated_all" on patients for all to authenticated using (true) with check (true);
  -- repetir para agenda e user_events
  ```
- **Efeito colateral A:** os scripts `scripts/*.mjs` param de funcionar com anon key → documentar no topo deles que passam a exigir `SUPABASE_SERVICE_ROLE_KEY` via env local (NUNCA commitar).
- **Efeito colateral B:** `api/ping.js` usa anon key → o count vai falhar. Ajustar ping pra não depender de tabela (ex: `select 1` via rpc, ou simplesmente aceitar que auth falhe mas a conexão conte como atividade — TESTAR se query negada ainda conta como atividade; se não contar, usar service key na env da Vercel).
- **Efeito colateral C:** confirmar que o app continua funcionando logado (session do `signInWithPassword`).
- **Verificar:** `curl` de select com anon key puro deve retornar vazio/erro; app logado continua funcionando.

### T08 🔴 [CLEBER] Bucket de arquivos de pacientes é público
- **Arquivo:** `src/App.jsx:1164` (BUCKET), `:1417` (getPublicUrl)
- **Problema:** radiografias/fotos clínicas com URL pública e path previsível.
- **Fix:** instruir Cleber a tornar o bucket `arquivos-pacientes` privado no painel; trocar `getPublicUrl` por `createSignedUrl(path, 3600)` (código). Como as URLs são gravadas no JSONB do paciente, trocar pra gravar o `path` e gerar signed URL na hora de exibir.

### T09 🟠 Endpoints da API sem autenticação
- **Arquivos:** `api/agenda-import.js`, `api/google-calendar.js`, `api/interpret-voice.js`
- **Problema:** qualquer estranho com a URL: lista nomes de pacientes+consultas (agenda-import), cria eventos na agenda real do João (google-calendar), queima créditos Anthropic ilimitados (interpret-voice).
- **Fix (solução simples adequada ao porte):** criar env `API_SHARED_SECRET` na Vercel; os 3 endpoints exigem header `x-app-key` igual ao secret (401 se não); o frontend manda o header (o secret fica no bundle — proteção fraca contra quem descompila, mas elimina o acesso casual por URL; documentar o tradeoff). Remover `details` dos corpos de erro (agenda-import:131, google-calendar:71).
- **[CLEBER]** criar a env na Vercel.

### T10 🟠 Apagar `api/test-key.js` (vaza 26 chars da chave Anthropic + confirma validade)
- **Fix:** deletar o arquivo e a referência no `vercel.json` (rewrite). Deletar também `netlify/functions/interpret-voice.mjs` (código morto que duplica o proxy sem auth com modelo mais caro) e a pasta `netlify/` se ficar vazia.

### T11 🟠 interpret-voice: endurecer contra abuso e crash
- **Arquivo:** `api/interpret-voice.js`
- **Problema:** (a) `req.body` destruturado fora do try (linha 11) — POST sem body = TypeError não tratado; (b) sem limite de tamanho do transcript; (c) `JSON.parse` da resposta do modelo sem validação de schema; (d) `patientContext` vem do cliente e é interpolado no system prompt.
- **Fix:** mover leitura do body pro try; validar `transcript` (string, max 8KB) e responder 400; validar shape do JSON parseado (campos esperados) antes de devolver; sanitizar `patientContext` (aceitar só `{name, allergies}` como strings curtas).

### T12 🟠 tracking.js envia nome do paciente pra telemetria
- **Arquivos:** `src/App.jsx:886` (origem), `src/tracking.js`, `src/IntelDashboard.jsx:369-370`
- **Problema:** `track("patient_open", { patient_id, patient_name, specialty })` — dado de saúde identificável em tabela de analytics.
- **Fix:** remover `patient_name` e `specialty` do evento (patient_id basta). **[CLEBER]** rodar delete/update na tabela `user_events` pra limpar os já gravados (preparar SQL).

### T13 🟡 Higiene: .gitignore e ping
- **Fix:** (a) adicionar `.env` e `.env*` ao `.gitignore` (hoje só cobre `*.local`); (b) `api/ping.js`: checar `req.method === "GET"` e remover `pacientes: count` da resposta (só `{ok, timestamp}`).

---

## FASE 3 — FINANCEIRO CORRETO (dinheiro da clínica)

### T14 🟠 Caixa do Dia força "Em dia" e esconde dívida
- **Arquivo:** `src/CaixaDia.jsx:393-399`
- **Problema:** paciente devendo R$ 800 paga R$ 150 da consulta → `financialStatus: "Em dia"` fixo, `balance` intocado → some do filtro de cobranças.
- **Fix:** importar `calcResumo` do FinanceiroModule e replicar a lógica do saveFin: `financialStatus: tp===0||tpg>=tp-0.005 ? "Em dia":"Pendente"`, `balance: Math.max(0, tp-tpg)`.

### T15 🟠 Voz "Pago" cria pagamento sem cobrança → saldo negativo envenena cobranças futuras
- **Arquivo:** `src/App.jsx:373-383`
- **Problema:** ramo "Pago" só cria o pagamento; `calcResumo` espera par cobrança+pagamento → consulta avulsa paga gera saldo −200 que "quita" sozinho a próxima cobrança real.
- **Fix:** no ramo "Pago", criar TAMBÉM a parcela com `status:"pago"` (mesmo valor, `tipo:"avulso"`) junto do pagamento (vincular `parcelaId`).

### T16 🟠 Valor por voz: parseFloat não entende "1.200,50"
- **Arquivo:** `src/App.jsx:372`
- **Fix:** normalizar antes: `parseFloat(String(lf.valor).replace(/\./g,"").replace(",", "."))||0`. Cuidado com o caso "1.5" digitado à americana — regra: se tem vírgula, ponto é milhar; se só ponto e ≤2 casas após, é decimal (documentar a heurística no código).

### T17 🟠 Excluir pagamento vinculado deixa parcela travada em "Pago"
- **Arquivo:** `src/FinanceiroModule.jsx:187-189`
- **Fix:** em `excluirPagamento`, se o pagamento tinha `parcelaId`, reverter a parcela pra `status:"pendente"`.

### T18 🟡 Pagamento parcial vinculado quita a parcela inteira
- **Arquivo:** `src/FinanceiroModule.jsx:176-178`
- **Fix:** só marcar `"pago"` se `valor >= parcela.valor - 0.005`; senão manter pendente (e opcionalmente ajustar o valor restante da parcela).

### T19 🟡 Comparação de dinheiro com float
- **Arquivo:** `src/FinanceiroModule.jsx:32-34,164`
- **Fix:** tolerância de meio centavo em toda comparação `tpg >= tp` → `tpg >= tp - 0.005`. (Mesma coisa no T14.)

### T20 🟡 Toggle manual de status financeiro no header da ficha esconde dívida
- **Arquivo:** `src/App.jsx:920`
- **Fix:** remover o onClick do chip; status passa a ser sempre derivado de `calcResumo` (exibição pura).

### T21 🟢 `brl()` com 3 casas decimais
- **Arquivos:** helper `brl` em `src/CaixaDia.jsx`, `src/FinanceiroModule.jsx`, `src/App.jsx` (onde existir)
- **Fix:** adicionar `maximumFractionDigits: 2` (R$ 100/3 hoje mostra "R$ 33,333").

---

## FASE 4 — ROBUSTEZ / UX

### T22 🟠 Microfone continua gravando após fechar o modal de voz
- **Arquivo:** `src/App.jsx:287` (onend com restart), `:286` (onerror não zera ref), `:1147-1151`
- **Fix:** no VoiceModule, `useEffect(() => () => { isRecordingRef.current = false; recognitionRef.current?.stop(); }, [])`; no `onerror` (`not-allowed`), zerar `isRecordingRef.current`.

### T23 🟠 Agenda aceita encaixe duplo invisível (um bloco em cima do outro)
- **Arquivo:** `src/Agenda.jsx:123-138` (validação), `:322-330` (render)
- **Fix:** (a) em `handleSave`, checar sobreposição (mesma data+profissional, intervalos cruzando) e pedir confirmação explícita ("Já existe consulta nesse horário — encaixar mesmo assim?"); (b) no grid, quando 2+ blocos se sobrepõem, dividir a largura (side-by-side) pra nenhum ficar invisível; (c) remover slots de almoço do select do modal (grid já bloqueia).

### T24 🟠 WhatsApp: helper único (55 duplicado, telefone vazio, texto sem encode)
- **Arquivos:** `src/App.jsx:742` (pior caso — 55 incondicional, sem encode), `:574-575`, `:1009-1010`, `src/Agenda.jsx:295,500`
- **Fix:** criar `waLink(phone, msg)` em util compartilhado: remove não-dígitos; se 12-13 dígitos começando com 55, usa direto; se 10-11 dígitos, prefixa 55; se vazio/inválido, retorna null (botão mostra aviso "sem telefone" em vez de abrir link quebrado); sempre `encodeURIComponent(msg)`. Substituir TODAS as ocorrências.

### T25 🟡 Duplo clique cria paciente/agendamento duplicado
- **Arquivos:** `src/App.jsx:1959-1967` (novo paciente), `src/Agenda.jsx:247` (confirmar agendamento), `:768-773` (deleteAppt)
- **Fix:** estado `saving` desabilitando o botão durante o await nos dois modais; em `deleteAppt`, deletar TODAS as linhas do banco com aquele `id` lógico (limpa duplicatas históricas).

### T26 🟡 Odontograma: edições descartadas sem aviso ao trocar de aba
- **Arquivo:** `src/Odontograma2D.jsx:234-235` + `src/App.jsx:1119-1127`
- **Fix:** flag `dirty` no Odontograma; se desmontar com dirty (cleanup do useEffect), chamar `onSave` automaticamente (auto-save é melhor que confirm aqui — decisão: auto-salvar).

### T27 🟡 Confirmação em operações destrutivas
- **Arquivos:** `src/App.jsx:912` (chip alergia), `:1632-1636` (× arquivo), `src/Agenda.jsx:307` (excluir agendamento), `src/FinanceiroModule.jsx:242` (× parcela), `:268` (× pagamento)
- **Fix:** `window.confirm` nos 5 pontos (mensagens claras: "Remover a alergia 'Penicilina' da ficha?"). No arquivo, checar `error` do `storage.remove`. Parcelas canceladas: exibir riscadas numa seção colapsada "canceladas (N)" com botão reativar, em vez de sumir.

### T28 🟡 Sync Google: jaExiste por substring bloqueia/duplica
- **Arquivo:** `src/Agenda.jsx:593-599`
- **Fix:** comparar tokens inteiros: `const tokens = nome => nome.toLowerCase().split(/\s+/).filter(Boolean);` — existe se TODOS os tokens do nome do calendário estão presentes como PALAVRAS INTEIRAS no nome do paciente. Nome só com palavras <3 chars: comparar nome completo normalizado em vez de retornar false.

### T29 🟡 Fila de espera só no localStorage de um navegador
- **Arquivo:** `src/Agenda.jsx:471-567`
- **Fix:** migrar pra tabela `lista_espera` no Supabase (padrão JSONB). **[CLEBER]** criar a tabela (preparar SQL; lembrar do GRANT + política RLS pós-T07).

### T30 🟡 "Fechar o Dia" usa a data em exibição, não o hoje real
- **Arquivo:** `src/Agenda.jsx:359`
- **Fix:** `const amanha = addD(todayISO(), 1)` (com todayISO local do T04).

### T31 🟡 Receituário: escapar HTML (documento truncado + XSS armazenado)
- **Arquivo:** `src/App.jsx:1234-1272` (gerarHTML, baixarWord, imprimir)
- **Problema:** posologia com "<8h" engole o resto do documento impresso; nome malicioso executa script.
- **Fix:** função `esc(s)` (& < > ") aplicada a `patient.name`, `m.nome`, `m.posologia`, `texto` antes de interpolar.

### T32 🟢 Odontograma: quadrante decíduo errado + badge conta superfícies
- **Arquivo:** `src/Odontograma2D.jsx:36-41` (quadrant retorna 1 pro dente 55; deveria ser 5) e `:275-283` (1 dente ausente mostra "5× Ausente")
- **Fix:** `quadrant = n => Math.floor(n/10)` (definição FDI direta); badge de condições de dente inteiro (ausente/implante/coroa) contar por dente, não por superfície.

### T33 🟢 IntelDashboard: funil vazio + truncamento silencioso
- **Arquivo:** `src/IntelDashboard.jsx:152` (`|| 1` mata o empty state), `:117` (limit 2000), `:261`
- **Fix:** testar `funnelCounts[0].count === 0` pro empty state; `Math.min(pct,100)` nas barras; aviso visual quando `events.length === 2000`.

### T34 🟢 Miudezas
- `src/App.jsx:1280`: nome do arquivo Word perde acentos (`Receiturio_`) — regex que preserve letras acentuadas.
- `src/App.jsx:1601` + `:39`: grupo "sem data" imprime "undefined/undefined" — fallback no fmtDate.
- `src/App.jsx:1842`: splash reinicia em loop se `loading` demora — só re-renderizar Splash se `splash===true`, mostrar spinner simples enquanto `loading`.
- `src/App.jsx:389` + `:1149`: tela de sucesso da voz nunca aparece (modal fecha antes) — segurar o fechamento ~1.2s mostrando o check verde, ou remover o estágio morto.
- `scripts/importar-pacientes.mjs:29-33`: dedup também DENTRO do lote (comparar `aInserir` contra si mesmo antes de inserir).
- `api/agenda-import.js:190`: data de evento com dateTime não normaliza timezone — derivar com `toLocaleDateString("sv-SE", {timeZone:"America/Sao_Paulo"})`.

### T35 🟢 Deletar código morto
- `src/eyng-max.jsx` (mockup órfão com dados fictícios, relógio congelado em abril, botões que não fazem nada — ninguém importa o arquivo). Confirmar com grep que nada importa antes de deletar.

---

## O que a auditoria confirmou que está OK (não mexer)
- vercel.json rewrites não interferem nas rotas /api/*
- keep-alive.yml (grep correto)
- servicos.js (35 IDs únicos, valores consistentes)
- FinanceiroModule não muta props; CaixaDia não conta pagamento em dobro
- `addD` da Agenda é timezone-safe (usa T12:00:00)
- Odontograma não vaza estado entre pacientes (desmonta ao trocar)
- Nenhum segredo commitado no repo

## Ordem sugerida de execução
1. **Fase 1 inteira** (T01-T06) — imediato, são bugs que corrompem dado clínico em uso normal.
2. **T22, T24, T25, T27** da Fase 4 — UX perigosa, rápidas.
3. **Fase 3 inteira** (T14-T21) — antes da clínica usar o financeiro pra valer.
4. **Fase 2** (T07-T13) — coordenar com Cleber (ações de painel); obrigatória antes de divulgar o app ou colocar 2º cliente.
5. Resto da Fase 4 (T23, T26, T28-T35).
