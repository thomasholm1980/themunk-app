import { MunkStateCode, ConfidenceLevel } from './brief-v2-types';

interface TemplateEntry {
  headline: string;
  summary: string;
  template_id: string;
}

type TemplateMap = Record<MunkStateCode, Record<ConfidenceLevel, TemplateEntry>>;

export const BRIEF_V2_TEMPLATES: TemplateMap = {
  GREEN: {
    HIGH: {
      headline: 'Strong signals across the board. This is a day to push.',
      summary: 'All indicators support high cognitive load and structured training today.',
      template_id: 'DBV2-GREEN-HIGH',
    },
    MEDIUM: {
      headline: 'Recovery base is solid. Use the day actively.',
      summary: 'Your signals support high cognitive load and strength training today.',
      template_id: 'DBV2-GREEN-MEDIUM',
    },
    LOW: {
      headline: 'Signals lean positive — proceed with awareness.',
      summary: 'Available data suggests a productive day. Manual input would improve confidence.',
      template_id: 'DBV2-GREEN-LOW',
    },
  },
  YELLOW: {
    HIGH: {
      headline: 'Mixed signals. Manage load carefully today.',
      summary: 'Your system shows moderate capacity. Prioritise focused work over volume.',
      template_id: 'DBV2-YELLOW-HIGH',
    },
    MEDIUM: {
      headline: 'Proceed with structure. Avoid overcommitting.',
      summary: 'Moderate signals detected. Light cognitive work and controlled recovery are advised.',
      template_id: 'DBV2-YELLOW-MEDIUM',
    },
    LOW: {
      headline: 'Unclear picture. Default to conservative protocol.',
      summary: 'Insufficient signal quality. Follow the standard recovery structure for today.',
      template_id: 'DBV2-YELLOW-LOW',
    },
  },
  RED: {
    HIGH: {
      headline: 'System stress confirmed. Protect recovery today.',
      summary: 'Clear indicators of elevated load. Training is suspended. Prioritise sleep and stillness.',
      template_id: 'DBV2-RED-HIGH',
    },
    MEDIUM: {
      headline: 'Recovery day. Do less than you think you should.',
      summary: 'Your signals indicate elevated strain. Light movement and cognitive rest are the protocol.',
      template_id: 'DBV2-RED-MEDIUM',
    },
    LOW: {
      headline: 'Low signal quality — default to rest.',
      summary: 'Data is limited but leans toward strain. Treat today as a recovery day.',
      template_id: 'DBV2-RED-LOW',
    },
  },
};

export const FALLBACK_EXPLANATION =
  'Insufficient data to generate a personalised explanation. Follow the protocol for your current state.';
