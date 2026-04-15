export interface Employer {
  id: string;
  name: string;
  logo?: string;
  description: string;
  location: string;
  size: string;
  type: "law-firm" | "corporate" | "legal-tech" | "consulting" | "government";
  website: string;
  openPositions: number;
  featured: boolean;
}

export const employers: Employer[] = [
  {
    id: "kirkland-ellis",
    name: "Kirkland & Ellis",
    description: "Global law firm with leading practices in private equity, litigation, and restructuring. Known for entrepreneurial culture and innovative legal solutions.",
    location: "Chicago, IL",
    size: "3,000+ attorneys",
    type: "law-firm",
    website: "https://www.kirkland.com",
    openPositions: 8,
    featured: true,
  },
  {
    id: "latham-watkins",
    name: "Latham & Watkins",
    description: "International law firm with a globally integrated partnership and deep expertise across industries and practice areas.",
    location: "Los Angeles, CA",
    size: "3,000+ attorneys",
    type: "law-firm",
    website: "https://www.lw.com",
    openPositions: 5,
    featured: true,
  },
  {
    id: "relativity",
    name: "Relativity",
    description: "Legal technology company building software to help users organize data, discover the truth, and act on it. Makers of RelativityOne.",
    location: "Chicago, IL",
    size: "1,500+ employees",
    type: "legal-tech",
    website: "https://www.relativity.com",
    openPositions: 12,
    featured: true,
  },
  {
    id: "deloitte-legal",
    name: "Deloitte Legal",
    description: "Global legal practice combining legal expertise with Deloitte's multidisciplinary approach to provide technology-enabled legal services.",
    location: "New York, NY",
    size: "2,500+ professionals",
    type: "consulting",
    website: "https://www.deloitte.com",
    openPositions: 6,
    featured: true,
  },
  {
    id: "skadden",
    name: "Skadden, Arps, Slate, Meagher & Flom",
    description: "One of the highest-grossing law firms in the world, with a preeminent M&A practice and broad capabilities across capital markets and litigation.",
    location: "New York, NY",
    size: "1,700+ attorneys",
    type: "law-firm",
    website: "https://www.skadden.com",
    openPositions: 4,
    featured: false,
  },
  {
    id: "thomson-reuters",
    name: "Thomson Reuters",
    description: "Global content and technology company powering the legal industry with Westlaw, Practical Law, and AI-driven legal research tools.",
    location: "Eagan, MN",
    size: "25,000+ employees",
    type: "legal-tech",
    website: "https://www.thomsonreuters.com",
    openPositions: 15,
    featured: true,
  },
  {
    id: "davis-polk",
    name: "Davis Polk & Wardwell",
    description: "Premier law firm known for its market-leading capital markets, M&A, and white-collar defense practices.",
    location: "New York, NY",
    size: "1,000+ attorneys",
    type: "law-firm",
    website: "https://www.davispolk.com",
    openPositions: 3,
    featured: false,
  },
  {
    id: "elevate",
    name: "Elevate",
    description: "Law company providing consulting, technology, and services to law departments and law firms to improve efficiency and outcomes.",
    location: "Los Angeles, CA",
    size: "1,500+ professionals",
    type: "consulting",
    website: "https://elevateservices.com",
    openPositions: 7,
    featured: false,
  },
  {
    id: "wachtell",
    name: "Wachtell, Lipton, Rosen & Katz",
    description: "Elite New York firm renowned for its M&A, corporate governance, and litigation practices, consistently ranked among the most prestigious.",
    location: "New York, NY",
    size: "275+ attorneys",
    type: "law-firm",
    website: "https://www.wlrk.com",
    openPositions: 2,
    featured: false,
  },
  {
    id: "littler",
    name: "Littler Mendelson",
    description: "The world's largest employment and labor law practice, representing management in all aspects of employment law.",
    location: "San Francisco, CA",
    size: "1,800+ attorneys",
    type: "law-firm",
    website: "https://www.littler.com",
    openPositions: 5,
    featured: false,
  },
];

export const featuredEmployers = employers.filter((e) => e.featured);
