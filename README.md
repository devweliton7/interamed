# 🏥 InteraMed — Triagem de Interações Medicamentosas com IA

![Status](https://img.shields.io/badge/status-MVP%20Funcional-success)
![React](https://img.shields.io/badge/React-19-blue)
![TanStack Start](https://img.shields.io/badge/TanStack-Start-black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-cyan)
![Groq](https://img.shields.io/badge/AI-Llama%204%20Scout-orange)

O **InteraMed** é um MVP mobile-first de apoio à enfermagem para checagem rápida de interações medicamentosas. O aplicativo resolve um problema real do ambiente hospitalar: a checagem manual de interações é lenta, e o uso de IAs genéricas (como ChatGPT) é perigoso devido ao alto risco de alucinação em contexto clínico.

## 🧠 Arquitetura "AI First, but Safe"

O grande diferencial do InteraMed não é apenas usar IA, mas sim **como** ela é usada. A arquitetura foi desenhada para garantir que a IA faça o trabalho de extração (onde ela é excelente), mas o motor de decisão seja determinístico (onde a IA falha).

**O fluxo funciona em 3 camadas:**

1. **OCR Inteligente (AI First):** A imagem da receita é processada pelo **Llama 4 Scout (via Groq)**. Atuando como um "farmacêutico clínico", a IA não só transcreve, mas faz o *Data Cleaning*: remove sais (ex: "Cloridrato de Amiodarona" → "Amiodarona"), ignora dosagens/assinaturas e **proíbe traduções** (evitando "Dipirona" → "Dipyrone").
2. **Motor Determinístico (Guardrail):** A lista limpa pela IA é cruzada com uma **Base Local** curada (baseada nas diretrizes ISMP e bulas da FDA). Se o par for encontrado, o app exibe a gravidade e a conduta clínica.
3. **Fallback Honesto (Zero Alucinação):** Se o par não estiver na base local, o app tenta a API da **OpenFDA** (domínio público). Se nenhuma base retornar dados, o app exibe o status **"Não Verificado" (cinza)**. O sistema **nunca** exibe "Seguro" para indicar ausência de dados — ausência de evidência não é evidência de ausência.

## ✨ Funcionalidades

- **📸 OCR via LLM (Groq):** Upload de foto ou PDF da receita médica com extração e normalização automática do princípio ativo.
- **⚠️ Classificação de Risco:** Cards visuais divididos entre Risco Grave (vermelho), Moderado (amarelo) e Não Verificado (cinza).
- **⏰ Aprazamento Inteligente:** Lógica de distribuição de horários que evita a administração de medicamentos com interação no mesmo intervalo.
- **🔒 Privacidade (LGPD):** Sessão temporária (expira em 15 min), uso de `sessionStorage` (não `localStorage`) e banner de consentimento. Nenhum dado real de paciente é armazenado em servidor.

## 🛠️ Stack Tecnológica

- **Frontend:** React + Vite + TypeScript
- **Roteamento e Server Functions:** TanStack Start (Nitro)
- **Estilização:** Tailwind CSS v4 (UI premium estilo Apple/Nike)
- **IA (OCR):** Groq API (Llama 4 Scout)
- **APIs de Dados:** OpenFDA (Bulas dos EUA) e RxNorm (Normalização)
- **Manipulação de PDF:** PDF.js

## 🚀 Como Rodar o Projeto

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/interamed.git

# 2. Instale as dependências
npm install

# 3. Configure a chave da Groq
echo "GROQ_API_KEY=sua_chave_aqui" > .env.local

# 4. Rode o projeto
npm run dev