export interface AIAlert {
  descricao: string;
  citacao: string;
  tag: string;
}

export interface AIAnalysis {
  nivel_risco: 'Baixo' | 'Médio' | 'Alto';
  resumo: string;
  alertas: AIAlert[];
}