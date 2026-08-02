# 🗺️ Estratégia B2B via Google Maps — aplicada ao app da Carol

**Data:** 02/08/2026
**Premissa:** a tática do "pega no Google Maps, entrega pronto, cobra depois" aplicada ao software odontológico que já existe neste repositório.

---

## 1. O que da história é verdade e o que é isca

Separar isso primeiro evita construir em cima de número inventado.

**É isca:**
- Taquería pagando US$ 4.800 numa noite por uma página feita em 20 minutos. Ticket de agência para artefato de commodity — não é o preço de mercado, é o print que vende o curso.
- A curva 800 → 4.100 → 10.400 em 3 meses. É a curva que se mostra, não a que se vive.
- "0$ de investimento". Domínio, builder, e-mail frio, ferramenta de extração — tudo custa. Pouco, mas não zero.

**É verdade e é o que importa:**
1. **O Google Maps é um banco de dados B2B gratuito, filtrável e com sinal de dor visível.** Nota, número de avaliações, site (ou ausência dele), telefone, horário, fotos. Nenhum outro cadastro público entrega intenção comercial assim.
2. **Entregar o artefato pronto antes de pedir dinheiro mata a objeção de venda fria.** Ninguém compra "eu poderia fazer". Todo mundo reage a "olha isso com o nome da sua clínica dentro".
3. **O gargalo real é produção, não prospecção.** A história inteira gira em torno do builder que monta em 20 minutos. Sem o equivalente disso, a tática vira trabalho braçal e morre no cliente 3.

O item 3 é o único que decide se isso funciona aqui.

---

## 2. O que transfere pro app da Carol

| Na história | Aqui |
|---|---|
| Busca "tacos filadélfia" | Busca "clínica odontológica" / "dentista" por cidade e bairro |
| Sinal de dor: site de 2013 | Sinal de dor: **agenda em papel/Google Agenda, sem prontuário digital** |
| Artefato: landing page | Artefato: **instância do app já semeada com os dados da clínica** |
| Builder monta em 20 min | Script de seed de tenant (ainda **não existe** — ver §4) |
| Venda: R$ X uma vez | Venda: **mensalidade recorrente** (ver §6) |

A adaptação central: a página de restaurante é descartável, o prontuário não. Ninguém troca de sistema de prontuário duas vezes por ano. Isso é uma faca de dois gumes:

- **Contra:** o ciclo de venda é mais longo. Dentista não compra sistema clínico às 23h no celular vendo um link.
- **A favor:** quem entra, fica anos. Churn baixo. É por isso que o alvo aqui é recorrência, não ticket único.

E existe um trunfo que a história não tem: **este repositório já resolveu o problema de migração**. `scripts/importar-pacientes.mjs` + `api/agenda-import.js` puxaram 387 eventos da Google Agenda e viraram 212 pacientes cadastrados. Esse é o argumento de venda mais forte que existe nesse mercado — "seus pacientes já estarão dentro quando você abrir" — porque o motivo nº 1 de dentista não trocar de sistema é não querer redigitar a base.

---

## 3. O bloqueio: hoje não dá pra vender pra uma segunda clínica

Isto não é ressalva, é o estado do código. Vender antes de resolver cria passivo, não receita.

### 3.1 Não existe conceito de clínica no banco
Tabelas em uso: `patients`, `agenda`, `user_events`. Nenhuma tem `clinic_id` — a busca por `clinic_id|tenant|clinica_id` em `src/` e `api/` não retorna nada. Os pacientes da clínica B cairiam na mesma tabela dos da Carol, sem separação de nenhum tipo.

### 3.2 RLS aberto + anon key no bundle
`src/supabase.js:2-4` tem a anon key hardcoded (por design, documentado). O problema é o outro lado: `scripts/importar-pacientes.mjs` e `scripts/limpar-importacao.mjs` fizeram select/insert/update/**delete** em produção com essa key sem login — ou seja, o role `anon` tem acesso total. Já é grave com uma clínica (é a tarefa **T07** de `TAREFAS_CORRECAO.md`); com duas, é um cliente lendo o prontuário do outro.

Dado de saúde sob LGPD. No momento em que se cobra de terceiros, o papel muda de "fiz um app pra clínica da família" para **operador de dados de saúde de terceiros**, com as obrigações que vêm junto.

### 3.3 Bucket público
`src/App.jsx:1164` (`BUCKET`) e `:1417` (`getPublicUrl`) — radiografias e fotos clínicas com URL pública e caminho previsível. Tarefa **T08**.

### 3.4 A clínica está escrita no código, não em configuração
Cada um destes é um lugar onde "Eyng" precisa virar dado:

- `src/App.jsx:1172` — objeto `CLINICA`: nome, CNPJ, endereço, telefone, CROs. Usado no receituário, atestado, termo LGPD, orçamento.
- `src/Agenda.jsx:10` — `PROFS = ["Dra. Caroline", "Dr. João Beno"]`.
- `src/Agenda.jsx:17` — `PROF_CONTATOS` com os WhatsApps reais dos dois.
- `src/Agenda.jsx:8-9,12` — expediente 8h–18h e almoço 12:00–13:30 fixos.
- `src/App.jsx:817,828` e `src/eyng-max.jsx:375,459` — filtros com as chaves `"caroline"` e `"joao"` embutidas na UI.
- `src/servicos.js` — tabela de preços fixa (R$ 2.500 aparelho metálico etc.). Preço é a coisa que cada clínica mais quer mudar.
- `src/App.jsx:44-49` — 6 pacientes de demonstração que ainda entram como fallback em erro de rede (**T03**).
- `api/agenda-import.js:160` — `AGENDA_CLINICA_IDS` com default `dr.joaobeno@gmail.com`.

### 3.5 APIs sem autenticação
`api/agenda-import.js`, `api/google-calendar.js`, `api/interpret-voice.js` — sem auth (**T09**). E `api/test-key.js` vaza prefixo da chave Anthropic (**T10**).

**Leitura honesta:** a Fase 1 e a Fase 2 de `TAREFAS_CORRECAO.md` já são, por acaso, exatamente o pré-requisito de vender pra fora. Não é trabalho novo — é o trabalho que já estava na fila, com um motivo comercial a mais.

---

## 4. O "construtor de páginas" equivalente

Na história, o builder é o que faz a coisa escalar. Aqui o equivalente é um **seed de tenant**: dado um resultado do Maps, sobe uma instância de demonstração com a cara da clínica em minutos.

O que precisa existir, na ordem:

1. **Tabela `clinics`** e coluna `clinic_id` em `patients`, `agenda`, `user_events`. Políticas de RLS por `clinic_id` (extensão natural do T07 — fazer junto, não depois).
2. **Config por clínica no banco**, substituindo os hardcodes do §3.4: nome, CNPJ, endereço, telefone, lista de profissionais com CRO e WhatsApp, expediente, almoço, tabela de serviços. O `CLINICA` de `App.jsx:1172` vira `useClinica()`.
3. **`scripts/seed-demo.mjs`** — entrada: nome, endereço, telefone e nomes dos dentistas (tudo visível na ficha do Maps). Saída: clínica criada, ~15 pacientes fictícios com nomes locais plausíveis, agenda da semana preenchida, financeiro com movimento, login temporário. É isso que dá o "isso somos nós?" ao abrir o link.
4. **Expiração automática** da demo (7 dias) — cria urgência e evita lixo acumulado no banco.

Sem os passos 1 e 2, cada demo é um fork manual. Com eles, a demo é um comando.

---

## 5. Playbook de prospecção

### Filtro no Maps
Busca: `clínica odontológica <cidade>` / `dentista <bairro>`. Chapecó e região primeiro — vale o argumento "sou daqui", e o WhatsApp com DDD 49 responde mais.

**Alvo bom:**
- 4,3 a 4,9 estrelas com 30–300 avaliações → tem movimento e se importa com reputação
- 1 a 4 dentistas → decisor é o dono, não um comitê
- Sem site, ou site em plataforma de portfólio, ou Linktree como "site"
- Perfil com fotos antigas / horário desatualizado → ninguém cuida do digital
- Avaliação mencionando "demorei pra conseguir horário", "não confirmaram", "esqueceram do meu retorno"

**Alvo ruim:**
- Rede/franquia (OdontoCompany, Sorridents) — sistema é imposto pela matriz
- Menos de 10 avaliações — provavelmente não tem volume pra pagar
- Site recente e polido — já tem fornecedor de tecnologia

### Sequência
1. **Semeia a demo** (§4) com o nome real da clínica e dos dentistas.
2. **Manda o link pronto**, sem pedir reunião. Uma mensagem, no WhatsApp que está no próprio Maps:

   > Dra. [Nome], boa noite. Montei um sistema de prontuário e agenda pra uma clínica aqui de Chapecó e adaptei pra [Nome da Clínica] pra você ver como ficaria — já está com seus dados dentro: [link]. Sem compromisso, é só olhar. Se não fizer sentido, ignora que eu não insisto.

3. **Não fala preço na primeira mensagem.** Quem responde "quanto custa?" já se vendeu sozinho.
4. **Fechamento com a migração:** "eu importo sua Google Agenda — os pacientes já entram cadastrados." Esse é o passo que os concorrentes não fazem.
5. **Prova social local:** a Eyng é o caso real. Uma clínica de Chapecó que usa isso todo dia vale mais que qualquer portfólio.

### Ritmo sustentável
10 demos por semana é o teto de uma pessoa fazendo isso à noite. Taxa de resposta realista em WhatsApp frio B2B com artefato pronto: 15–25%. Fechamento sobre quem responde: 10–20%. Ou seja, **1 a 2 clientes por mês no começo** — não 10 por semana.

---

## 6. Números reais deste mercado

O mercado é ocupado: Dental Office, Simples Dental, Clinicorp cobram R$ 150–400/mês por clínica. Não dá pra cobrar ticket de agência e não faz sentido cobrar menos que isso — barato levanta suspeita em software clínico.

Cenário de trabalho:
- **Mensalidade:** R$ 250–400/clínica (posicionar acima do piso — o diferencial é migração feita e suporte de quem atende pessoalmente)
- **Setup/migração:** R$ 500–1.500 uma vez, cobrado pela importação da base
- **Para R$ 10.000/mês recorrentes:** ~30 clínicas a R$ 330

Trinta clínicas não se conquista em 6 meses trabalhando à noite. Se conquista em 18–24 meses. O que se conquista em 6 meses é 5–8 clínicas (R$ 1.500–2.500/mês recorrente) — e essa é a base que prova que o produto aguenta gente de fora.

**Custo que aparece junto:** suporte. Uma clínica é a Carol te mandando mensagem. Trinta clínicas é telefone tocando na terça de manhã porque a agenda não abriu. Isso precisa entrar na conta antes do cliente 5, não depois.

---

## 7. Ordem de execução

**Etapa 0 — Fase 1 do `TAREFAS_CORRECAO.md` (T01–T06).**
Bugs de dado clínico. A Carol usa hoje e é o caso de referência de tudo. Nada de venda antes.

**Etapa 1 — Fase 2 (T07–T10) + multi-tenancy.**
Fazer RLS já com `clinic_id` em vez de fazer RLS agora e refazer depois. Bucket privado com signed URL. APIs autenticadas. **Este é o divisor entre "app da família" e "produto".**

**Etapa 2 — Configuração por clínica.**
Tirar Eyng do código (§3.4). Sem isso não existe segundo cliente.

**Etapa 3 — `seed-demo.mjs`.**
O builder. Só depois disso a prospecção escala.

**Etapa 4 — 10 demos, uma cidade.**
Chapecó. Mede resposta e fechamento com número real antes de investir mais.

---

## 8. Resumo em três linhas

A tática é boa e o ativo mais difícil — o software funcionando numa clínica real, com migração de agenda resolvida — **já existe**. O que falta não é marketing: é isolar os dados por clínica, fechar o RLS e o bucket, e tirar "Eyng" de dentro do código. E o número honesto é R$ 250–400/mês por clínica com ciclo de venda de semanas, não R$ 4.800 numa terça à noite.
