# Roteiro de Testes — Eyng Odontologia
**Para:** Dra. Caroline / Dr. João  
**Versão:** 15/05/2026  
**App:** https://eyng-odontologia.vercel.app

---

## Como entrar no app

1. Abre o link acima no celular ou computador
2. Faz login com as credenciais da clínica
3. Você cai direto na tela de **Retornos**

---

## Teste 1 — Painel inicial (Dashboard)

**O que aparece:**
- Total de pacientes cadastrados
- Pacientes com retorno atrasado (vermelho)
- Inadimplentes
- Valor recebido no mês
- Valor a receber

**O que testar:**
- Confirmar se os números batem com a realidade da clínica
- Clicar nos cards para navegar

---

## Teste 2 — Retornos

**Onde:** aba "🔔 Retornos" (aparece ao entrar)

**O que aparece:**
- Pacientes com retorno vencido (vermelho, seção de cima)
- Pacientes com retorno nos próximos 30 dias (seção de baixo)
- Para cada um: botão WhatsApp, Ligar, Agendar, Ver ficha

**O que testar:**
- [ ] Clicar em **WhatsApp** → deve abrir o WhatsApp com a mensagem pronta para o número do paciente
- [ ] Clicar em **Ligar** → deve iniciar ligação (no celular)
- [ ] Clicar em **Ver ficha →** → deve abrir a ficha completa do paciente

---

## Teste 3 — Ficha do paciente

**Como chegar:** Retornos → Ver ficha → (ou aba Pacientes → escolher paciente)

**O que aparece no topo:**
- Nome, especialidade, dentista responsável
- Telefone e data de nascimento
- Alergias (clica no ✕ para remover; clica em "+ alergia" para adicionar)
- Status financeiro (EM DIA / PENDENTE — clica para alternar)

**O que testar:**
- [ ] Adicionar uma alergia fictícia e confirmar que aparece
- [ ] Remover a alergia
- [ ] Alternar o status financeiro e ver se muda a cor

---

## Teste 4 — Registrar por Voz (IA)

**Onde:** dentro da ficha do paciente, botão "🎙 Registrar por Voz"

**O que faz:** a dentista fala em voz alta o que foi feito na consulta. A IA da Claude interpreta e preenche automaticamente os campos: procedimento, próximo retorno, observações, alergias.

**Como testar:**
1. Abre a ficha de um paciente
2. Clica em "🎙 Registrar por Voz"
3. Clica no microfone e fala algo como:
   > *"Paciente fez profilaxia hoje, voltou bem. Próximo retorno em 3 meses. Ela tem alergia a dipirona."*
4. Clica em "Interpretar"
5. Confirma os campos que apareceram preenchidos
6. Clica em "Salvar" para aplicar

**Observações:**
- Funciona melhor no celular (microfone mais sensível)
- A IA corrige erros de pronúncia de termos odontológicos automaticamente
- Falar de forma natural, como se fosse um áudio de WhatsApp

---

## Teste 5 — Confirmar retorno via WhatsApp

**Onde:** seção "Próximo Retorno" dentro da ficha do paciente

**O que aparece:** data e hora do retorno + botão verde "Confirmar via WhatsApp"

**O que testar:**
1. Abre ficha de paciente com retorno marcado
2. Clica em **"✉ Confirmar via WhatsApp"**
3. Deve abrir o WhatsApp com mensagem já escrita confirmando a consulta
4. Confere se o nome e a data estão corretos na mensagem

---

## Teste 6 — Criar evento no Google Agenda ⭐ NOVO

**Onde:** seção "Próximo Retorno" dentro da ficha do paciente

**O que faz:** cria automaticamente um evento no Google Agenda da clínica (conta `dr.joaobeno@gmail.com`) com o nome do paciente, horário, plano de tratamento e lembretes de 1h antes e 1 dia antes.

**Como testar:**
1. Abre ficha de paciente com retorno marcado
2. Na seção "Próximo Retorno", clica em **"🗓 Criar no Google Agenda"**
3. O botão deve virar verde **"✅ Criado!"** em alguns segundos
4. Abre o Google Agenda da clínica e vai até a data do retorno
5. Confirma que aparece o evento: **"Consulta – [Nome do Paciente]"**

**O que deve ter no evento:**
- Título: "Consulta – [nome]"
- Horário correto
- Descrição: plano de tratamento do paciente
- Lembrete: 1 hora antes
- Lembrete: 1 dia antes

**Se aparecer "❌ Erro":** avisar o Cleber com print da tela.

---

## Teste 7 — Registrar Procedimento

**Onde:** dentro da ficha → botão "+ Procedimento"

**O que testar:**
1. Clica em "+ Procedimento"
2. Preenche o que foi feito e a data
3. Salva
4. Confirma que aparece no histórico de procedimentos abaixo

---

## Teste 8 — Receituário

**Onde:** ficha do paciente → aba "Receituário" (ícone de pergaminho)

**O que testar:**
- Verificar se o template do receituário carrega corretamente
- Preencher um medicamento de teste
- Confirmar visualização/impressão

---

## Teste 9 — Odontograma

**Onde:** ficha do paciente → aba "Odontograma" (ícone de dente)

**O que testar:**
- Clicar nos dentes e verificar se marcam corretamente
- Verificar se as marcações ficam salvas ao sair e voltar

---

## O que reportar ao Cleber

Para cada teste, anotar:
- ✅ Funcionou normal
- ⚠️ Funcionou mas tem algo estranho: descrever o quê
- ❌ Não funcionou: tirar print e descrever o que aconteceu

**Canal preferido:** WhatsApp do Cleber ou áudio — ele processa tudo.

---

*Documento gerado em 15/05/2026*
