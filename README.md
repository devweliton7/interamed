# InteraMed

O **InteraMed** é uma ferramenta mobile-first de apoio à decisão clínica, focada na segurança do paciente. Ele auxilia enfermeiros e técnicos de enfermagem na verificação rápida de interações medicamentosas e no gerenciamento de horários de administração.

## 🎯 O Problema
No ambiente hospitalar, é comum que pacientes recebam prescrições complexas com 10, 15 ou até 29 medicamentos diferentes. A checagem manual de interações medicamentosas (se um remédio anula o efeito do outro ou causa reações adversas) é suscetível a erros, especialmente com equipes sobrecarregadas. 

## 💡 A Solução
O InteraMed resolve isso com uma interface minimalista, inspirada no design da Apple e Nike, que permite:
- Inserir os medicamentos em segundos.
- Visualizar interações graves, moderadas e leves com clareza visual.
- Organizar os horários de administração em blocos editáveis.
- Receber alertas inteligentes sobre janelas de risco (como a troca de plantão).

## 🛠️ Stack Técnica
- **Framework:** [TanStack Start](https://tanstack.com/start) (SSR) + React 19
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4
- **Ícones:** Lucide React
- **Persistência:** LocalStorage (via custom hook `use-persistent-state`)

## 🚀 Como rodar o projeto localmente

Você precisará do [Node.js](https://nodejs.org/) instalado em sua máquina.

```sh
# 1. Clone o repositório
git clone https://github.com/jwelitonlima/interamed-v-2-0

# 2. Entre na pasta do projeto
cd interamed

# 3. Instale as dependências
npm install

# 4. Rode o servidor de desenvolvimento
npm run dev
