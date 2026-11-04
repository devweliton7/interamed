// src/lib/mockDatabase.ts

const NOMES = ["Ana", "Carlos", "Mariana", "João", "Beatriz", "Lucas", "Fernanda", "Rafael", "Camila", "Gustavo", "Juliana", "Rodrigo", "Patrícia", "Felipe", "Larissa", "Thiago", "Amanda", "Bruno", "Letícia", "Diego"];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa"];
const LEITOS = ["UTI - Leito", "Enfermaria - Leito", "Apartamento - Leito", "Pronto-Socorro - Leito"];

const MEDICAMENTOS = [
  { nome: "Ciprofloxacino", via: "VO", frequenciaHoras: 12, observacao: "Antibiótico" },
  { nome: "Omeprazol", via: "VO", frequenciaHoras: 24, observacao: "Protetor Gástrico" },
  { nome: "Dexametasona", via: "VO", frequenciaHoras: 24, observacao: "Corticoide" },
  { nome: "Furosemida", via: "EV", frequenciaHoras: 12, observacao: "Diurético" },
  { nome: "Dipirona", via: "VO", frequenciaHoras: 6, observacao: "Analgésico" },
  { nome: "Ceftriaxona", via: "EV", frequenciaHoras: 12, observacao: "Antibiótico" },
  { nome: "Losartana", via: "VO", frequenciaHoras: 12, observacao: "Anti-hipertensivo" },
  { nome: "Metformina", via: "VO", frequenciaHoras: 12, observacao: "Antidiabético" },
  { nome: "Sinvastatina", via: "VO", frequenciaHoras: 24, observacao: "Estatina" },
  { nome: "Heparina", via: "SC", frequenciaHoras: 8, observacao: "Anticoagulante" },
];

export type PacienteMock = {
  id: string;
  paciente: string;
  leito: string;
  medicamentos: typeof MEDICAMENTOS;
};

// Gera um único paciente aleatório
export function gerarPacienteAleatorio(): PacienteMock {
  const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
  const sobrenome = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  const tipoLeito = LEITOS[Math.floor(Math.random() * LEITOS.length)];
  const numeroLeito = Math.floor(Math.random() * 50) + 1;
  
  // Sorteia entre 3 a 8 medicamentos diferentes
  const qtdMedicamentos = Math.floor(Math.random() * 6) + 3;
  const medsEmbaralhados = [...MEDICAMENTOS].sort(() => 0.5 - Math.random()).slice(0, qtdMedicamentos);

  return {
    id: `RX-${Math.floor(Math.random() * 10000)}`,
    paciente: `${nome} ${sobrenome}`,
    leito: `${tipoLeito} ${numeroLeito}`,
    medicamentos: medsEmbaralhados,
  };
}

// Gera a base com 120 pacientes (para simular um banco de dados)
export const BASE_PACIENTES: PacienteMock[] = Array.from({ length: 120 }).map(() => gerarPacienteAleatorio());