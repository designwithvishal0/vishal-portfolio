// Approved home copy (Phase 1, 2026-10-08). Source of truth for every direction.
const img = (id: string) => `https://framerusercontent.com/images/${id}?scale-down-to=1024`;

export const intro = {
  name: 'Vishal Yadav, product designer',
  positioning: 'I design for the moment people are unsure.',
  supporting:
    'Product (UI/UX) designer in Gurugram. 4.5 years in design, 2+ of them in core UI/UX. I work on B2C and B2B products in commerce and fintech, from the first research session to the screens that ship.',
  availability: 'Open to product design roles and freelance projects',
  links: [
    { label: 'Resume', href: '#' },
    { label: 'Book a call', href: 'https://cal.com/designwvishal' },
  ],
};

export type Work = {
  slug: string;
  name: string;
  headline: string;
  problem: string;
  role: string;
  type: string;
  year: string;
  detail: string;
  // Direction C only. New copy, not yet approved.
  question: string;
  image: string;
  alt: string;
};

export const work: Work[] = [
  {
    slug: 'ixigo-trains',
    name: 'ixigo Trains',
    headline: 'The four hours nobody designs for',
    problem:
      'A waitlisted passenger waits four hours for the chart, and the app shows a status when they need a decision.',
    role: 'Research, flow, UI, copy',
    type: 'Self initiated concept',
    year: '2026',
    detail: '1 hub, 6 journey states',
    question: 'Will I travel tonight?',
    image: img('koB2fjrEzJwcseu22ei43G30SI.png'),
    alt: 'ixigo Trains post booking redesign, the waiting state with odds and a countdown',
  },
  {
    slug: 'split-and-request',
    name: 'Google Pay Split and Request',
    headline: 'The split that stays alive',
    problem:
      'Google Pay only opens when money has to move, and a split is over the moment you send it.',
    role: 'Research, flows, UI, interface copy, prototype',
    type: 'Self initiated concept',
    year: '2026',
    detail: '5 flows, 40+ screens',
    question: 'Has everyone paid me back?',
    image: img('6XJ129lhXDLdgdUkSFRyQsb7v9o.png'),
    alt: 'Google Pay Split and Request redesign, the shared board after a split',
  },
  {
    slug: 'twelve',
    name: 'Twelve',
    headline: 'Plans in years, not months.',
    problem:
      'The bank says ₹84,000, and nothing mentions the ₹18,000 insurance renewal coming in March.',
    role: 'Solo: research, concept, IA, UI, identity, copy',
    type: 'Self initiated concept',
    year: '2026',
    detail: '9 screens, each a different way the AI shows up',
    question: 'Am I okay this month?',
    image: img('kuxfbvAC0UkDAKqn73xqLYvDw.png'),
    alt: 'Twelve, an AI finance app showing one safe to spend number',
  },
  {
    slug: 'staqu-jarvis',
    name: 'Staqu JARVIS Alerts',
    headline: 'Alerts worth waking up for',
    problem:
      'A store manager swipes away a false alert at 3 AM, and nothing tells them it counted.',
    role: 'Solo: problem framing, flow, UI, copy',
    type: 'Independent B2B concept',
    year: '2026',
    detail: 'Built in 1 day',
    question: 'Is this alert real?',
    image: 'https://framerusercontent.com/assets/LcvPY6k6LxQU60K2x3tVDpZ8.png',
    alt: 'JARVIS Alerts, a false alert flow on a phone',
  },
];

// Live ixigo case study header, word for word.
export const caseHeader = {
  eyebrow: 'ixigo Trains · Post booking Experience redesign',
  title: 'The four hours nobody designs for',
  summary:
    'Four hours before departure, a chart decides whether you travel at all. ixigo helps you brilliantly up to payment, then goes quiet through the exact window where the outcome is still unknown. This is a redesign of that window, and of everything that follows it, from a delay to a missed train to a waitlist that never clears.',
  facts: [
    ['Role', 'Product and UX design'],
    ['Scope', 'Research, flow, UI, copy'],
    ['Type', 'Self initiated'],
    ['Year', '2026'],
  ] as [string, string][],
  image: work[0].image,
};
