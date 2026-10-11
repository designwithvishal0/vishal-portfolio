// Approved home copy (Phase 1, 2026-10-08). Source of truth for every direction.
const img = (id: string) => `https://framerusercontent.com/images/${id}?scale-down-to=1024`;

export const intro = {
  name: 'Vishal Yadav, product designer',
  positioning: 'I design for the moment people are unsure.',
  supporting:
    'Product designer in Gurugram, with 4.5 years in design and 2+ in core UI/UX. I design from what people actually do: at CashKaro I read the session recordings before I touched a flow. My recent concepts take on fintech and B2B.',
  availability: 'Open to product design roles and freelance projects',
  links: [
    { label: 'Resume', href: '/Vishal_Yadav_Resume.pdf' },
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
    role: 'Solo: research, flow, UI, copy',
    type: 'Concept',
    year: '2026',
    detail: '1 hub, 6 journey states, 2 decision sheets',
    question: 'Will I travel tonight?',
    image: img('koB2fjrEzJwcseu22ei43G30SI.png'),
    alt: 'ixigo Trains post booking hub: a waitlisted booking on track to confirm, with 94% and 70% seat odds and seats decided around 5:40 PM, then the chart prepared with both passengers confirmed in coach S6',
  },
  {
    slug: 'split-and-request',
    name: 'Google Pay Split and Request',
    headline: 'The split that stays alive',
    problem:
      'Google Pay only opens when money has to move, and a split is over the moment you send it.',
    role: 'Solo: research, flows, UI, interface copy, prototype',
    type: 'Concept',
    year: '2026',
    detail: 'A shared board replaces the reminder, so a split returns 4 times',
    question: 'Has everyone paid me back?',
    image: img('6XJ129lhXDLdgdUkSFRyQsb7v9o.png'),
    alt: 'Google Pay Split and Request: the shared Dinner at Social board, where Nidhi’s payment arrives and the bill moves from 1 of 3 paid to 2 of 3, with ₹2,560 of ₹2,910 back',
  },
  {
    slug: 'twelve',
    name: 'Twelve',
    headline: 'Plans in years, not months.',
    problem:
      'The bank says ₹84,000, and nothing mentions the ₹18,000 insurance renewal coming in March.',
    role: 'Solo: research, concept, IA, UI, identity, copy',
    type: 'Concept',
    year: '2026',
    detail: 'A 12 month plan behind one safe to spend number, with model confidence on all 9 screens',
    question: 'Am I okay this month?',
    image: img('kuxfbvAC0UkDAKqn73xqLYvDw.png'),
    alt: 'Twelve home screen showing ₹1,850 safe to spend today, then scrolling to the year’s upcoming costs, each with a confidence level',
  },
  {
    slug: 'staqu-jarvis',
    name: 'Staqu JARVIS Alerts',
    headline: 'Alerts worth waking up for',
    problem:
      'A store manager swipes away a false alert at 3 AM, and nothing tells them it counted.',
    role: 'Solo: problem framing, flow, UI, copy',
    type: 'Concept',
    year: '2026',
    detail: 'A 3 tier priority system and an operator feedback loop to cut alert fatigue',
    question: 'Is this alert real?',
    image: 'https://framerusercontent.com/assets/LcvPY6k6LxQU60K2x3tVDpZ8.png',
    alt: 'JARVIS Alerts: marking an Unknown Car alert as false, choosing Something else, typing that it was their own car, then a note that 27 similar alerts won’t interrupt them again',
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

// Everything below was in the home page file; it lives here so every look uses the same locked copy.
// Preview: case studies still live on the Framer site until each one moves here.
export const live = (slug: string) => `https://designwvishal.framer.website/work/${slug}`;
export const behance = (id: string) => `https://www.behance.net/gallery/${id}`;
export const email = 'design.vishaly@gmail.com';
// his Contra profile, shown in Contact instead of repeating the footer's LinkedIn and Behance. Empty until Vishal sends the link.
export const contra = '';
export const social = [
  ['LinkedIn', 'https://www.linkedin.com/in/vishaldesigns'],
  ['Behance', 'https://www.behance.net/design_vishaly'],
  ['X', 'https://x.com/design_vishaly'],
  ['Instagram', 'https://www.instagram.com/vishal.y0109'],
];

// Loop file names in /public/loops, in the same order as work.
export const loops = ['ixigo', 'split', 'twelve', 'jarvis'];
// Each number counts up from zero the first time it scrolls into view.
export const results = [
  { n: '60%', label: 'conversion lift on critical flows, with my UI on the homepage modules, collections and landing pages' },
  { n: '50%', label: 'click through lift on campaign landing pages, after Hotjar and Clarity showed me where people dropped off and I rebuilt the hierarchy and CTAs' },
  { n: '30%', label: 'faster campaign turnaround, from one design system I built in Figma for product and marketing' },
];
export const more = [
  { img: 'reward', name: 'Unified Reward Centre', line: 'Every reward a player has earned, on one screen.', href: behance('256413187') },
  { img: 'onebanc', name: 'OneBanc', line: 'Plan the month your salary has to last.', href: live('onebanc') },
];
export const lead = { img: 'pwl', name: 'Profit Wala Love, CashKaro', tag: 'Shipped, February 2026', line: "Valentine’s week campaign across app, web and social: seven days, seven ways to earn.", href: 'https://dribbble.com/shots/27168211-Valentines-Day-Landing-Page', stats: [['1,542', 'transactions'], ['₹9.89 lakh', 'GMV'], ['+51%', 'retailer commission']] };
export const pages = [
  { img: 'bbb', name: 'Big Birthday Bash, EarnKaro', tag: 'Shipped, July 2026', line: 'A week long campaign landing page, plus the 777 Jackpot game with a new deal every day.', href: behance('256577531') },
  { img: 'basil', name: 'Basil product page', tag: 'Concept', line: 'Sell the set, not the second product.', href: behance('256493837') },
  { img: 'pdp', name: 'Beauty product page', tag: 'Concept', line: 'Will this shade match me?', href: behance('256556067') },
  { img: 'cosiq', name: 'CosIQ landing page', tag: 'Shipped, January 2026', line: 'Build your own routine.', href: behance('230420275') },
];
export const how = [
  { h: 'Start where people drop off', p: 'I read the recordings and the reviews before I draw anything. At CashKaro that meant hours of Hotjar and Clarity sessions, and the results at the top of this page came out of them.', link: 'See the results', href: '#results' },
  { h: 'Design the uncertain moment', p: "The waitlist before the chart. The split nobody has paid back. The alert at 3 AM. That’s where people give up, so that’s where I spend the work.", link: 'Staqu JARVIS Alerts', href: '/work/staqu-jarvis/' },
  { h: 'Honest copy over comforting copy', p: "If the seat odds are 70%, the screen says 70%. A promise the product can’t keep costs more trust than saying nothing.", link: 'ixigo Trains', href: live('ixigo-trains') },
];
export const jobs = [
  ['CashKaro', 'UI/UX and Graphic Designer', '2023 to 2026'],
  ['Fabulous Media', 'Graphic Designer', '2022 to 2023'],
  ['EKarma India', 'UI/UX Design Trainee', '2021 to 2022'],
];

