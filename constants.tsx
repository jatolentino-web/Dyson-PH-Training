
import { ChecklistItem } from './types';

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // S1: Foundation (Total: 20 Base) - Indices 6-22
  { id: 's1-1', category: 'S1: Foundation | Professional Image', task: 'Makeup (Women), Facial Hair (Men)', maxPoints: 1 },
  { id: 's1-2', category: 'S1: Foundation | Professional Image', task: 'Smell', maxPoints: 1 },
  { id: 's1-3', category: 'S1: Foundation | Professional Image', task: 'Hair', maxPoints: 2 },
  { id: 's1-4', category: 'S1: Foundation | Professional Image', task: 'Nails', maxPoints: 1 },
  { id: 's1-5', category: 'S1: Foundation | Professional Image', task: 'Uniform', maxPoints: 2 },
  { id: 's1-6', category: 'S1: Foundation | Professional Image', task: 'Appropriate Accessories', maxPoints: 1 },
  { id: 's1-7', category: 'S1: Foundation | Professional Image', task: 'Self-introduce to Shopper', maxPoints: 1 },
  { id: 's1-8', category: 'S1: Foundation | Professional Image', task: 'Welcome shoppers, greetings', maxPoints: 1 },
  { id: 's1-9', category: 'S1: Foundation | Professional Image', task: 'Engaging the shopper', maxPoints: 2 },
  { id: 's1-10', category: 'S1: Foundation | Retail Excellence', task: 'Observe: Store Cleanliness', maxPoints: 1 },
  { id: 's1-11', category: 'S1: Foundation | Retail Excellence', task: 'Observe: Retail machine display', maxPoints: 1 },
  { id: 's1-12', category: 'S1: Foundation | Retail Excellence', task: 'Observe: Retail tools & accessories', maxPoints: 1 },
  { id: 's1-13', category: 'S1: Foundation | Retail Excellence', task: 'Observe: Debris readiness', maxPoints: 1 },
  { id: 's1-14', category: 'S1: Foundation | Retail Excellence', task: 'Demo: Machine/Tools organization', maxPoints: 1 },
  { id: 's1-15', category: 'S1: Foundation | Retail Excellence', task: 'Reset: Store cleanliness', maxPoints: 1 },
  { id: 's1-16', category: 'S1: Foundation | Retail Excellence', task: 'Reset: Retail machine reset', maxPoints: 1 },
  { id: 's1-17', category: 'S1: Foundation | Retail Excellence', task: 'Reset: Retail tools & accessories', maxPoints: 1 },

  // S2: Engage (Total: 20 Base) - Indices 23-34
  { id: 's2-1', category: 'S2: Engage | Building Rapport', task: 'Customer observations: Giving compliments', maxPoints: 1 },
  { id: 's2-2', category: 'S2: Engage | Confidence', task: 'Body language: Store behaviour', maxPoints: 1 },
  { id: 's2-3', category: 'S2: Engage | Confidence', task: 'Body language: Arms & feet', maxPoints: 1 },
  { id: 's2-4', category: 'S2: Engage | Confidence', task: 'Body posture: Stage blocking', maxPoints: 1 },
  { id: 's2-5', category: 'S2: Engage | Confidence', task: 'Body posture: Confidence & enthusiasm', maxPoints: 2 },
  { id: 's2-6', category: 'S2: Engage | Confidence', task: 'Facial expression: Appropriate facial expression', maxPoints: 1 },
  { id: 's2-7', category: 'S2: Engage | Confidence', task: 'Facial expression: Appropriate eye contact', maxPoints: 1 },
  { id: 's2-8', category: 'S2: Engage | Confidence', task: 'Versatility with different shopper types', maxPoints: 4 },
  { id: 's2-9', category: 'S2: Engage | Confidence', task: 'Voice expression: volume and tone', maxPoints: 1 },
  { id: 's2-10', category: 'S2: Engage | Confidence', task: 'Voice expression: vocal delivery', maxPoints: 1 },
  { id: 's2-11', category: 'S2: Engage | Questioning Skills', task: 'Elicit questioning (e.g. How big is your home?)', maxPoints: 4 },
  { id: 's2-12', category: 'S2: Engage | Questioning Skills', task: 'Elaboration questions (open ended questions)', maxPoints: 2 },

  // S3: Excite (20 Base + Bonus points) - Indices 36-44
  { id: 's3-1', category: 'S3: Excite | Reflecting Skills', task: 'Paraphrasing', maxPoints: 4 },
  { id: 's3-2', category: 'S3: Excite | Demo Initiation', task: 'Demo Initiation', maxPoints: 2 },
  { id: 's3-3', category: 'S3: Excite | Demo Initiation', task: 'Demo plinth usage', maxPoints: 1 },
  { id: 's3-4', category: 'S3: Excite | Demo Skills', task: 'Product Demo 1: Technique', maxPoints: 5 },
  { id: 's3-5', category: 'S3: Excite | Demo Skills', task: 'Product Demo 2: Technique', maxPoints: 5 },
  { id: 's3-6', category: 'S3: Excite | Bonus Metrics', task: 'Bonus: One more demo', maxPoints: 5, isBonus: true },
  { id: 's3-7', category: 'S3: Excite | Bonus Metrics', task: 'Bonus: Explain difference with competitor products', maxPoints: 1, isBonus: true },
  { id: 's3-8', category: 'S3: Excite | Maintenance', task: 'Ease of maintenance (2,1,0)', maxPoints: 2 },
  { id: 's3-9', category: 'S3: Excite | Maintenance', task: 'MyDyson App (1,0)', maxPoints: 1 },

  // S4: Explain (20 Base + Bonus point) - Indices 46-54
  { id: 's4-1', category: 'S4: Explain | Storytelling skills', task: 'Narrative: Captivating story', maxPoints: 2 },
  { id: 's4-2', category: 'S4: Explain | Storytelling skills', task: 'Talk about Social media (Bonus)', maxPoints: 1, isBonus: true },
  { id: 's4-3', category: 'S4: Explain | Storytelling skills', task: 'Relate and interact with the Shopper', maxPoints: 2 },
  { id: 's4-4', category: 'S4: Explain | Storytelling skills', task: 'Share personal stories and build connections', maxPoints: 2 },
  { id: 's4-5', category: 'S4: Explain | Storytelling skills', task: 'Rediscovery: Layman terms to explain technology', maxPoints: 6 },
  { id: 's4-6', category: 'S4: Explain | Storytelling skills', task: 'Eagerness to relate story to Shopper', maxPoints: 2 },
  { id: 's4-7', category: 'S4: Explain | Active listening skills', task: 'Attentiveness', maxPoints: 2 },
  { id: 's4-8', category: 'S4: Explain | Active listening skills', task: 'Listening', maxPoints: 2 },
  { id: 's4-9', category: 'S4: Explain | Active listening skills', task: 'Acknowledgement', maxPoints: 2 },

  // S5: Execute (20 Base + Bonus points) - Indices 56-64
  { id: 's5-1', category: 'S5: Execute | Negotiation Skills', task: 'Counter objection: Displays confidence', maxPoints: 2 },
  { id: 's5-2', category: 'S5: Execute | Negotiation Skills', task: 'Counter objection: Offer alternative solutions', maxPoints: 3 },
  { id: 's5-3', category: 'S5: Execute | Negotiation Skills', task: 'Positivity: Demonstrate positivity', maxPoints: 4 },
  { id: 's5-4', category: 'S5: Execute | Negotiation Skills', task: 'Convincing: Demonstration ability to relate', maxPoints: 3 },
  { id: 's5-5', category: 'S5: Execute | Negotiation Skills', task: 'Sales initiation: Confidence & creativity', maxPoints: 2 },
  { id: 's5-6', category: 'S5: Execute | Negotiation Skills', task: 'Attempt to upsell', maxPoints: 1 },
  { id: 's5-7', category: 'S5: Execute | Negotiation Skills', task: 'Cross category initiation', maxPoints: 1 },
  { id: 's5-8', category: 'S5: Execute | Negotiation Skills', task: 'Warranty and after-sales service', maxPoints: 2 },
  { id: 's5-9', category: 'S5: Execute | Negotiation Skills', task: 'Shopper downloads app (Bonus)', maxPoints: 1, isBonus: true },

  // S5 Follow-up - Indices 66-72
  { id: 's5-10', category: 'S5: Execute | Follow-up: Purchase', task: 'Initiate Warranty Registration', maxPoints: 1 },
  { id: 's5-11', category: 'S5: Execute | Follow-up: Purchase', task: 'Invitation to revisit – Look for me or my colleagues', maxPoints: 0.5 },
  { id: 's5-12', category: 'S5: Execute | Follow-up: Purchase', task: 'Personalize Service', maxPoints: 0.5 },
  { id: 's5-13', category: 'S5: Execute | Follow-up: Purchase', task: 'Offer assistance to Shopper (Bonus)', maxPoints: 1, isBonus: true },
  { id: 's5-14', category: 'S5: Execute | Follow-up: Non-purchase', task: 'Future prospecting', maxPoints: 1 },
  { id: 's5-15', category: 'S5: Execute | Follow-up: Non-purchase', task: 'Successful data collection (Bonus)', maxPoints: 1, isBonus: true },
  { id: 's5-16', category: 'S5: Execute | Follow-up: Non-purchase', task: 'Invitation to revisit', maxPoints: 1 },
];

export const DYSON_COLORS = {
  black: '#000000',
  nickel: '#8e8e8e',
  purple: '#6E2CF3',
  blue: '#0055ff',
  iron: '#4b4b4b'
};
