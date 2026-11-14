# 🩺 InteraMed

MVP mobile-first de apoio à equipe de enfermagem: lê receitas por foto ou PDF (OCR com LLM) e verifica interações com base nas bulas da OpenFDA, sugerindo horários de administração (aprazamento) que evitam a troca de plantão.

🔗 **Demo:** https://interamed-v-2-0.vercel.app
> Aviso: protótipo de apoio. Não substitui o julgamento clínico e não foi validado em ambiente hospitalar.

[INSERIR 2 PRINTS OU UM GIF DA TELA AQUI]

## Problema
No SUS, um paciente pode ter de 10 a 29 medicamentos prescritos. A checagem manual de interações é lenta e sujeita a erro. Mapeei essa dor com um acadêmico de Enfermagem da UFPI e tive orientação de um professor de Farmacologia para as regras clínicas.

## Como funciona
**Foto da receita → LLM extrai os nomes → dicionário normaliza → OpenFDA valida → aprazamento**

1. **Extração (OCR):** o frontend comprime a imagem e envia ao Llama 4 Scout (via Groq). O prompt instrui o modelo a extrair apenas os princípios ativos, ignorando datas, assinaturas e posologias.
2. **Normalização:** um dicionário interno traduz termos PT-BR (ex: "AAS" → "aspirin") e a API **RxNorm (NIH)** padroniza o princípio ativo para a busca internacional.
3. **Validação (Bula Oficial):** o sistema consulta a API da **OpenFDA** e extrai o campo `drug_interactions` da bula do medicamento. O código faz uma varredura textual (busca bidirecional) para verificar se o outro remédio é citado.
4. **Classificação de Gravidade (Regras Heurísticas):** como a OpenFDA não classifica a gravidade, o motor de regras analisa o texto da bula. Se encontrar `"contraindicated"` ou `"avoid concomitant use"`, classifica como **Grave** (tendo precedência sobre outras palavras). Se encontrar `"monitor"` ou `"caution"`, classifica como **Moderada**.
5. **Fallback Local (Resiliência):** se a API da OpenFDA sofrer timeout (limite de 4s) ou falhar, o sistema cai automaticamente para a **Base Local (`meds.ts`)**.

## Quem faz a checagem de segurança?
Não é o LLM. O modelo só lê a imagem (OCR). A decisão sobre interações vem do motor de regras e das APIs, porque modelos de linguagem podem alucinar e isso não é aceitável em segurança de medicação. 

**Caso testado:** A combinação de **Clopidogrel + Omeprazol** retornou um alerta **Grave** a partir da bula oficial da FDA (EUA). O classificador identificou a expressão *"avoid concomitant use"* no texto americano e elevou a gravidade corretamente.

**Limitações Transparentes do MVP:**
- **Bulas Americanas:** A integração atual consulta a FDA (EUA). A integração com a ANVISA (PT-BR) está no roadmap para produção.
- **Falsos Positivos/Negativos:** Como a checagem na OpenFDA é baseada em menção textual de livre escrita na bula, pode haver falhas. Por isso, o app sempre orienta a "Consultar protocolo institucional".
- **Base Local Limitada:** O recorte de medicamentos locais cobre os mais comuns, mas não substitui uma base clínica completa como a DrugBank (planejada para o futuro).

## Dados
- **Simulados:** a integração com prontuário ("Simular Recebimento") usa pacientes fictícios.
- **Reais:** o OCR processa fotos de receitas enviadas pelo usuário.
- **Privacidade:** a imagem é enviada à API da Groq. Não use dados reais de pacientes na demo.

## Erros do LLM que encontrei e como tratei
1. **Lixo no PDF:** em um PDF de 29 medicamentos, o modelo transcrevia rodapés ("Página 1", assinatura, datas), gerando interações falsas. Refinei o prompt para ser literal e adicionei um filtro com lista de exclusão em `documentParser.ts`.
2. **Truncamento:** em receitas densas o modelo cortava a lista. Aumentei o limite de tokens para 8000 e a escala de renderização do PDF de 1.5 para 2.0.
3. **Timeout da API DDInter:** o processamento chegava a minutos quando a API antiga estava lenta. Passei a consultar com concorrência controlada (`Promise.all`) e timeout de 4 s, com fallback para a base local. (Posteriormente, migrei a validação para a OpenFDA).

## Como foi construído
Usei o **DeepSeek** como assistente de código: pedi o esqueleto, corrigi erros, refinei os prompts e direcionei a arquitetura (LLM só no OCR, validação por regras e APIs). Eu defini o problema, as regras e as decisões, e testei e ajustei o resultado.

## Stack
TanStack Start (React + Vite), TypeScript, Tailwind CSS v4, Nitro Server Functions (Vercel), Groq (Llama 4 Scout), OpenFDA API, RxNorm API, PDF.js.

## Como rodar
```bash
git clone https://github.com/jwelitonlima/interamed-v-2-0
cd interamed-v-2-0
npm install
cp .env.example .env.local   # defina GROQ_API_KEY
npm run dev