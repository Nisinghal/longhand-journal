/**
 * Rotating reflective prompts.
 *
 * PLACEHOLDER COPY — Nishtha to replace. These are written to open a door
 * rather than ask for a report: concrete, answerable in one sentence if that's
 * all there is, and never therapeutic in tone.
 *
 * The prompt is chosen deterministically from the date so it is stable through
 * the day (you can close the app and come back to the same question) and does
 * not repeat inside a cycle.
 */

export type Prompt = { id: string; text: string };

export const PROMPTS: Prompt[] = [
  { id: 'p01', text: 'What did you keep putting off today, and what was underneath it?' },
  { id: 'p02', text: 'Who did you think about more than you expected to?' },
  { id: 'p03', text: 'What took more out of you than it should have?' },
  { id: 'p04', text: 'Where did the day go quiet?' },
  { id: 'p05', text: 'What did you say yes to that you meant to decline?' },
  { id: 'p06', text: 'What were you doing when you last lost track of the time?' },
  { id: 'p07', text: 'What is one thing you noticed today that nobody else would have?' },
  { id: 'p08', text: 'What did you want to say and not say?' },
  { id: 'p09', text: 'What felt easier today than it did a month ago?' },
  { id: 'p10', text: 'What were you avoiding by staying busy?' },
  { id: 'p11', text: 'Where did you extend yourself, and was it returned?' },
  { id: 'p12', text: 'What small thing went right?' },
  { id: 'p13', text: 'What has been sitting at the back of your mind all week?' },
  { id: 'p14', text: 'Who would you like to hear from?' },
  { id: 'p15', text: 'What did you decide today, even by not deciding?' },
  { id: 'p16', text: 'What would you like tomorrow to be lighter than?' },
  { id: 'p17', text: 'What made you laugh?' },
  { id: 'p18', text: 'What are you carrying that is not actually yours?' },
  { id: 'p19', text: 'Where did you feel most like yourself today?' },
  { id: 'p20', text: 'What did you notice about your own patience today?' },
  { id: 'p21', text: 'What is the honest version of how today went?' },
  { id: 'p22', text: 'What did you give attention to, and what did that cost?' },
  { id: 'p23', text: 'What would you tell someone who asked how you have been?' },
  { id: 'p24', text: 'What are you looking forward to, however small?' },
];

/** Stable per calendar day. */
export function promptForDay(day: string): Prompt {
  let h = 0;
  for (let i = 0; i < day.length; i++) h = (h * 31 + day.charCodeAt(i)) | 0;
  return PROMPTS[Math.abs(h) % PROMPTS.length];
}

export function promptById(id: string | null | undefined): Prompt | undefined {
  return PROMPTS.find((p) => p.id === id);
}
