// src/lib/aprazamento.ts

// Horários de passagem de plantão típicos (ex: 07h e 19h)
const HORARIOS_PLANTAO = [7, 19];
const MARGEM_SEGURANCA = 1; // 1 hora antes e depois do plantão

export type HorarioSugerido = {
  hora: string;
  horaNumero: number;
  alerta?: string;
};

export function gerarSugestaoAprazamento(
  frequenciaHoras: number,
  medicamentoNome: string = "",
  observacao?: string, 
  horaInicioSugerida: number = 8
): HorarioSugerido[] {
  const sugestoes: HorarioSugerido[] = [];
  const totalDoses = 24 / frequenciaHoras;
  
  for (let i = 0; i < totalDoses; i++) {
    let horaAtual = (horaInicioSugerida + i * frequenciaHoras) % 24;
    let alerta: string | undefined;

    // REGRA 1: Diurético não pode ser à noite (a partir das 20h)
    const isDiuretico = medicamentoNome.toLowerCase().includes("furosemida") || 
                        observacao?.toLowerCase().includes("diurético");
                        
    if (isDiuretico && (horaAtual >= 20 || horaAtual < 6)) {
      alerta = "Evitar noturno";
      horaAtual = 8; // Joga forçadamente para a manhã
    }

    // REGRA 2: Evitar passagem de plantão (com margem de segurança)
    const conflitoPlantao = HORARIOS_PLANTAO.find(
      p => Math.abs(horaAtual - p) <= MARGEM_SEGURANCA
    );
    
    if (conflitoPlantao !== undefined && !alerta) {
      alerta = "Perto do plantão";
      // Desloca 2 horas para frente para fugir do plantão
      horaAtual = (horaAtual + MARGEM_SEGURANCA + 1) % 24; 
    }

    const horaFormatada = `${String(horaAtual).padStart(2, "0")}:00`;
    
    if (!sugestoes.find(s => s.hora === horaFormatada)) {
      sugestoes.push({ 
        hora: horaFormatada, 
        horaNumero: horaAtual,
        alerta 
      });
    }
  }

  return sugestoes.sort((a, b) => a.horaNumero - b.horaNumero);
}