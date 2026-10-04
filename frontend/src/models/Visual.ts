export interface Alerta {
  id: number;
  localidade: string;
  problema: string;
  severidade: 'Alto' | 'Médio' | 'Baixo';
  horario: string;
  tipo: 'map' | 'shield' | 'home';
}