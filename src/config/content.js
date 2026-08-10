/**
 * content.js — Single source of truth for Mujeeb Lawal's immersive portfolio.
 *
 * This replaces the original author's external Sanity CMS. The hooks in
 * src/hooks/useSanityData.js read from here, so the app is fully self-contained
 * (no external requests, no CORS, no CMS account required).
 *
 * Data was mirrored from the classic CV site (https://mujeeb-lawal.replit.app).
 * `imageSource` fields point at the live screenshots on that site and are
 * downloaded into /public/textures during the imagery pass (Stage 3); until
 * then, rooms use the placeholder textures already shipped in the repo.
 */

// The classic (2D) CV site — the "current view" this immersive mode toggles to.
export const CLASSIC_SITE_URL = 'https://mujeeb-lawal.replit.app/';

// ---------------------------------------------------------------------------
// Profile & identity
// ---------------------------------------------------------------------------
export const PROFILE = {
    name: 'Mujeeb Lawal',
    firstName: 'Mujeeb',
    title: 'Transformation Lead',
    tagline: 'Senior Program Manager & Transformation Lead',
    status: 'Open to new opportunities',
    location: 'Between the UAE and the UK',
    bio: [
        "Companies bring me in when they need someone who doesn't need handholding and can bring clarity and process to ambiguity, and liaise with cross-functional teams to achieve the project, program or business objective.",
        "I've operated primarily as a strategic contractor delivering results fast, in unfamiliar environments, strict budget and limited runway. It's made me adaptable and structured enough to deliver across most industries and environments.",
        'Currently open to senior permanent or long-term contract roles as a Transformation Lead, Program Manager, or PMO Lead. British national, based between the UAE and the UK, open to relocation and remote work.',
    ],
    stats: [
        { value: '£50M+', label: 'Programmes led' },
        { value: '17 yrs', label: 'Experience' },
        { value: '34', label: 'Largest team' },
    ],
    pastEmployers: [
        'Marsh & McLennan — Mercer',
        'Marsh & McLennan — JLT',
        'GSMA',
        'Caravan and Motorhome Club',
    ],
};

// ---------------------------------------------------------------------------
// Flagship wins — headline achievements
// ---------------------------------------------------------------------------
export const FLAGSHIP_WINS = [
    {
        title: 'Built PMO from Ground Up',
        company: 'Novocycle Technology',
        period: '2024',
        metrics: ['36% efficiency gain', '6+ team members', 'EU-funded programmes'],
    },
    {
        title: 'Created a Bespoke Project Management Tool',
        company: 'Novocycle Technology',
        period: '2025',
        metrics: ['Reduced manual reporting by 36%', 'EU grant projects', 'EU project governance'],
    },
    {
        title: 'Project Efficiency Improvement',
        company: 'JLT Specialty (Marsh & McLennan)',
        period: '2018',
        metrics: ['34% efficiency gain', 'Insurance sector · Process optimisation'],
    },
    {
        title: 'Energy Reduction for 2030 UN SDGs',
        company: 'GSMA',
        period: '2019-2020',
        metrics: ['35% energy reduction', '10 telecom operators onboarded at launch', 'UN SDG alignment'],
    },
];

// ---------------------------------------------------------------------------
// Career timeline
// ---------------------------------------------------------------------------
export const CAREER = [
    {
        role: 'Project Engineer',
        company: 'Alfa Laval',
        industry: 'Engineering',
        period: 'Sep 2008 - Nov 2013',
        pegYear: '2008–13',
        employmentType: 'Permanent',
        description: 'Delivered technical engineering packages for iconic infrastructure projects, including The Shard and the London 2012 Olympic Aquatic Centre. Managed the design, testing, and installation phases for high-performance energy systems.',
        keyAchievements: ['Major Infrastructure: Delivered energy-efficient systems for high-profile global landmarks', 'Commercial Success: Achieved record sales performance for high-end heat transfer solutions'],
    },
    {
        role: 'Technical Project Manager',
        company: 'BSS Industrial',
        industry: 'Engineering',
        period: 'Nov 2013 - Aug 2014',
        pegYear: '2013–14',
        employmentType: 'Permanent',
        description: 'Managed the end-to-end delivery of sustainable engineering and construction projects. Acted as the central coordinator between design, engineering, and on-site commercial teams to ensure strict safety and technical compliance.',
        keyAchievements: ['Operational Delivery: Delivered complex fit-out projects within tight operational deadlines', 'Cross-Functional Leadership: Bridged the gap between technical design and commercial execution'],
    },
    {
        role: 'Senior Implementation/Digital Transformation Manager',
        company: 'Dictate.IT',
        industry: 'Healthcare',
        period: 'Sep 2014 - May 2016',
        pegYear: '2014–16',
        employmentType: 'Permanent',
        description: 'Delivered digital transformation across NHS Trusts, replacing analogue workflows with digital systems.',
        keyAchievements: ['Reduced post-implementation queries by 28% by automating the training process for healthcare staff.'],
    },
    {
        role: 'Project & Implementation Consultant',
        company: 'JLT-Jardine Lloyd Thompson',
        industry: 'Insurance',
        period: 'Jan 2017 - Jan 2019',
        pegYear: '2017–19',
        employmentType: 'Permanent',
        description: 'Directed enterprise SaaS implementations for multinational clients, managing end-to-end data migration and platform onboarding across complex stakeholder environments.',
        keyAchievements: ['Delivered SaaS implementations for enterprise clients, including Hitachi and AS Watson, managing cross-functional teams.', 'Raised delivery efficiency by 34% by redesigning migration processes and automating technical workflows.'],
    },
    {
        role: 'Freelance Technical Writer - Fintech & Blockchain',
        company: 'Finimize',
        industry: 'Blockchain',
        period: 'Jun 2018 - Jan 2020',
        pegYear: '2018–20',
        employmentType: 'Contract',
        description: 'Produced technical market analysis on cryptocurrency and blockchain technology. Translated complex decentralised finance concepts for a mass audience during a period of rapid industry evolution.',
        keyAchievements: ['Market Analysis: Created insightful technical content on crypto market trends', 'Brand Growth: Contributed to audience expansion through high-quality technical writing', 'Simplification: Translated complex blockchain mechanisms for non-technical users'],
    },
    {
        role: 'Project Manager',
        company: 'GSMA',
        industry: 'Telecoms',
        period: 'Jan 2019 - Mar 2020',
        pegYear: '2019–20',
        employmentType: 'Contract',
        description: 'Delivered a global sustainability program aligned to the UN 2030 Goals, engaging C-suite leaders and regulators across major international telecoms operators.',
        keyAchievements: ['Enabled global operators, including Vodafone, Verizon, and Etisalat to achieve up to 35% energy reduction via the Future Network Program.', 'Influenced industry-wide adoption by engaging regulators and C-suite leaders to drive strategic change.'],
    },
    {
        role: 'Digital Transformation Project Manager',
        company: 'Best Future Education Centre',
        industry: 'Education',
        period: 'Mar 2020 - Dec 2020',
        pegYear: '2020–20',
        employmentType: 'Contract',
        description: 'Led the digital transformation of an education provider during COVID-19, transitioning from in-person to fully virtual delivery.',
        keyAchievements: ['Rolled out remote learning platforms and data systems to maintain business continuity for staff and students.', 'Established remote working frameworks that kept the organisation operational throughout the crisis.'],
    },
    {
        role: 'Senior International Project Manager',
        company: '6Connex',
        industry: 'Events Tech',
        period: 'Jul 2020 - Mar 2022',
        pegYear: '2020–22',
        employmentType: 'Contract',
        description: 'Managed global virtual event delivery across EMEA, North America, and APAC during peak COVID demand.',
        keyAchievements: ['Coordinated Agile software teams across six time zones to meet high-pressure schedules during peak COVID demand.', 'Boosted delivery efficiency by 30% by automating manual project management processes.'],
    },
    {
        role: 'Program Manager',
        company: 'Mercer',
        industry: 'Insurance',
        period: 'Oct 2021 - Jun 2022',
        pegYear: '2021–22',
        employmentType: 'Contract',
        description: 'Led multi-country SaaS platform rollouts for global enterprise clients, including Amazon and Estée Lauder, coordinating across technical, commercial, and regional HR functions across EMEA and North America.',
        keyAchievements: ['Led concurrent platform migration and multi‐country deployments with full ownership of the delivery process and budget.', 'Created standardised onboarding playbooks to ensure consistent global adoption and scalability.', 'Maintained strict regulatory compliance and dependency management across multiple jurisdictions.'],
    },
    {
        role: 'Program Manager',
        company: 'Simply Business',
        industry: 'Insurance',
        period: 'Aug 2022 - Mar 2023',
        pegYear: '2022–23',
        employmentType: 'Contract',
        description: 'Accountable for a £1.2m insurance product delivery and two FCA compliance programs, managing technical delivery, operational governance, and regulatory audit readiness simultaneously.',
        keyAchievements: ['Delivered a new microservices and API-based digital insurance product on time and within the £1.2m program budget.', 'Led FCA Operational Resilience and Consumer Duty programs, ensuring zero compliance breaches and audit readiness.', 'Implemented a sprint cadence and live portfolio-level dashboard to improve team visibility and remove recurring blockers.'],
    },
    {
        role: 'Senior Technical Project Manager',
        company: 'CAMC-Caravan & Motorhome Club',
        industry: 'Insurance',
        period: 'Oct 2022 - Nov 2023',
        pegYear: '2022–23',
        employmentType: 'Contract',
        description: 'Led the end-to-end transformation of two core insurance products for one of the UK\'s largest membership insurance providers, addressing margin erosion and operational fragility across the product lines.',
        keyAchievements: ['Directed 9 concurrent workstreams to redesign two products from process through to pricing, restoring product profitability.', 'Led vendor selection and managed supplier relationships through commercial negotiations, maintaining delivery. assurance throughout.', 'Facilitated cross-functional workshops with underwriters, technical teams, and senior business stakeholders to surface and resolve margin inefficiencies.'],
    },
    {
        role: 'Head of Projects & PMO Lead',
        company: 'Novocycle Technology',
        industry: 'Engineering Tech',
        period: 'Apr 2024 - Present',
        pegYear: '2024–now',
        employmentType: 'Permanent',
        description: 'Hired as an Agile Project Manager and evolved the role to establish a group-wide PMO function for a fast-growing battery recycling technology company, overseeing OKRs and a $5m portfolio of EU-funded programs across Europe and the Middle East.',
        keyAchievements: ['Managed a team of 6 reporting to the executive leadership teams and created a portfolio dashboard for greater visibility.', 'Reduced manual reporting effort by 36% by designing an AI-enabled reporting framework across Jira and Confluence.', 'Aligned engineering, commercial and research teams under a single delivery operating model to improve scalability.'],
    },
    {
        role: 'Independent Transformation Consultant',
        company: 'Freelance',
        industry: 'HR SaaS',
        period: 'Nov 2025 - Present 2026',
        pegYear: '2025–now',
        employmentType: 'Freelance',
        description: 'Providing AI-enabled delivery and operational improvement advisory to early-stage and growth-stage organisations.',
        keyAchievements: ['Built and launched a SaaS platform applying AI workflow design and product delivery from concept to live deployment.', 'Applied PMO governance frameworks to improve delivery visibility and reporting in resource-constrained environments', 'Developed decision-support tooling to improve execution focus and reduce process bottlenecks'],
    },
];

// ---------------------------------------------------------------------------
// Certifications & education — mapped to the About room "awards" / recognition
// ---------------------------------------------------------------------------
export const CERTIFICATIONS = [
    { label: 'PRINCE2 — AXELOS', date: '2015', category: 'certification' },
    { label: 'Scrum Master I & II — Scrum.org', date: '2018', category: 'certification' },
    { label: 'PMP — in progress', date: '2026', category: 'certification' },
    { label: 'PRINCE2 Agile', date: '', category: 'certification' },
];

export const EDUCATION = [
    { degree: 'MSc, Renewable Energy, Enterprise & Management', institution: 'Newcastle University', location: 'Newcastle, UK' },
    { degree: 'BEng, Engineering', institution: 'Newcastle University', location: 'Newcastle, UK' },
];

// ---------------------------------------------------------------------------
// Programmes & projects — feeds the Gallery room
// (imageSource = live screenshot to be downloaded to /public in Stage 3)
// ---------------------------------------------------------------------------
const LIVE = 'https://mujeeb-lawal.replit.app';
const G = '/textures/gallery/mujeeb'; // local composited card images (Stage 3)
export const PROGRAMMES = [
    { title: 'Program Management Dashboard', description: 'Full-stack governance-compliant PM tool: timesheet approvals, expense tracking, audit trails and multi-tenant support. Reduced manual reporting by 36%.', url: null, techStack: ['Node.js / Express', 'Drizzle ORM', 'Tailwind CSS', 'Replit'], image: `${G}/pm-dashboard.webp` },
    { title: 'Risk Radar — AI Program Risk Monitor', description: 'AI-driven programme risk monitoring tool built for Careem, surfacing delivery risks in real time.', url: 'https://carreemriskradar.replit.app', techStack: ['Node.js', 'OpenAI API', 'REST API'], image: `${G}/risk-radar.webp` },
    { title: 'Executive Dashboard for Program Management', description: 'Executive-level programme dashboard with AI-generated MD pack summaries, responsive across desktop and mobile.', url: 'https://Moove-Executive-Dashboard.replit.app', techStack: ['Node.js / Express', 'Chart.js', 'JavaScript'], image: `${G}/exec-dashboard.webp` },
    { title: 'Energy Consumption Benchmark Tool', description: 'GSMA benchmarking tool helping telecom operators monitor and reduce their energy consumption, aligned to the UN 2030 SDGs.', url: 'https://www.gsma.com/solutions-and-impact/technologies/networks/digest/gsma-beta-labs-launches-energy-benchmarking-tool-to-help-operators-monitor-their-energy-consumptions/', techStack: [], image: `${G}/energy-benchmark.webp` },
    { title: 'This Portfolio — Full-Stack CV Platform', description: 'Full-stack portfolio with admin CMS, blog engine, CV download gate and AI chatbot. Built end-to-end on Replit.', url: `${LIVE}/`, techStack: ['React', 'TypeScript', 'Drizzle ORM', 'PostgreSQL'], image: `${G}/portfolio.webp` },
    { title: 'Digital Transformation — e-commerce', description: 'Delivered an e-commerce digital transformation for Novocycle, standing up an online storefront and fulfilment flow.', url: 'https://shop.novocycle.com/', techStack: [], image: `${G}/ecommerce.webp` },
];

// ---------------------------------------------------------------------------
// Insights & thought leadership — feeds the Studio room
// ---------------------------------------------------------------------------
export const INSIGHTS = [
    { title: 'The New Normal: Your CV Needs a Home, Not Just a File', platform: 'linkedin', description: 'Why a living, interactive portfolio beats a static PDF CV in 2026.', url: `${LIVE}/insights`, readTime: '2 min', date: '2026-05-01' },
    // Flagship wins double as case-study "screens" until more written insights exist.
    { title: 'Case Study: Building a PMO from the Ground Up', platform: 'blog', description: 'How a group-wide PMO for a battery-recycling scale-up drove a 36% efficiency gain across a $5m EU-funded portfolio.', url: `${LIVE}/case-studies`, readTime: '4 min', date: '2024-09-01' },
    { title: 'Case Study: Energy Reduction for the UN 2030 SDGs', platform: 'blog', description: 'Delivering a 35% energy reduction across 10 telecom operators, aligned to the UN Sustainable Development Goals.', url: `${LIVE}/case-studies`, readTime: '4 min', date: '2020-01-01' },
];

// ---------------------------------------------------------------------------
// Contact — feeds the Contact room barrels
// TODO(Mujeeb): confirm the public email / social handles to surface here.
// ---------------------------------------------------------------------------
export const CONTACT = {
    cta: 'Open to senior Transformation Lead, Program Manager and PMO Lead roles.',
    links: [
        { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
        { platform: 'website', label: 'Classic CV site', url: `${LIVE}/` },
    ],
};
