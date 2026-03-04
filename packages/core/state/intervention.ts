export type InterventionIntensity = 'high' | 'medium' | 'low';

export interface Intervention {
  intensity: InterventionIntensity;
  action: string;
  secondary: string;
  duration?: number;
}

export function computeIntervention(state: 'GREEN' | 'YELLOW' | 'RED'): Intervention {
  switch (state) {
    case 'GREEN':
      return {
        intensity: 'high',
        action: 'Deep work block 90 min',
        secondary: 'Strength training',
      };
    case 'YELLOW':
      return {
        intensity: 'medium',
        action: 'Light cognitive work',
        secondary: '20 min walk',
        duration: 30,
      };
    case 'RED':
      return {
        intensity: 'low',
        action: 'Recovery protocol',
        secondary: 'Breathing 5 min',
        duration: 15,
      };
  }
}
