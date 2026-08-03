export interface Interview {
  id: string;
  role: string;
  level: string;
  techStack: string;
  questionsCount: number;
  createdAt: string;
  status: 'pending' | 'completed';
  transcript?: { role: 'user' | 'assistant'; text: string }[];
  feedback?: {
    overallScore: number;
    communicationScore: number;
    technicalScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string;
  };
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
}

const IS_CLIENT = typeof window !== 'undefined';

// Mock Profiles for instant login selection
export const MOCK_USERS: UserProfile[] = [
  {
    uid: 'user-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@dev.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@dev.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200'
  }
];

export function getLoggedInUser(): UserProfile | null {
  if (!IS_CLIENT) return null;
  const userStr = localStorage.getItem('prepwise_user');
  if (!userStr) {
    // Auto-login first mock user by default for instant onboarding
    setLoggedInUser(MOCK_USERS[0]);
    return MOCK_USERS[0];
  }
  return JSON.parse(userStr);
}

export function setLoggedInUser(user: UserProfile | null): void {
  if (!IS_CLIENT) return;
  if (user) {
    localStorage.setItem('prepwise_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('prepwise_user');
  }
}

export function getInterviews(): Interview[] {
  if (!IS_CLIENT) return [];
  const listStr = localStorage.getItem('prepwise_interviews');
  if (!listStr) {
    // Insert some default mock history so the dashboard looks loaded and premium from the start!
    const mockHistory: Interview[] = [
      {
        id: 'mock-int-1',
        role: 'React Frontend Engineer',
        level: 'Mid-Level',
        techStack: 'React, Next.js, Tailwind',
        questionsCount: 5,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        transcript: [
          { role: 'assistant', text: 'Hello! Welcome to your interview. Can you explain the difference between state and props in React?' },
          { role: 'user', text: 'State is managed within the component, whereas props are passed from parent to child components and are immutable.' },
          { role: 'assistant', text: 'Excellent. How does Next.js App Router render client components?' }
        ],
        feedback: {
          overallScore: 84,
          communicationScore: 90,
          technicalScore: 78,
          strengths: ['Clear definition of state/props', 'Good structure of technical responses', 'Articulate speech delivery'],
          weaknesses: ['Could expand more on Server Components vs Client Components hybrid rendering flow'],
          recommendations: 'Study client component boundary execution and Server Actions state handling.'
        }
      },
      {
        id: 'mock-int-2',
        role: 'Full-Stack Developer',
        level: 'Senior',
        techStack: 'Node.js, PostgreSQL, TypeScript',
        questionsCount: 8,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        transcript: [],
        feedback: {
          overallScore: 91,
          communicationScore: 88,
          technicalScore: 94,
          strengths: ['Great backend architecture design approach', 'Strong understanding of databases indexes', 'Analytical problem solving'],
          weaknesses: ['Slightly rushed delivery in the introductory behavioral questions'],
          recommendations: 'Practice pacing during behavioral introduction answers.'
        }
      }
    ];
    localStorage.setItem('prepwise_interviews', JSON.stringify(mockHistory));
    return mockHistory;
  }
  return JSON.parse(listStr);
}

export function saveInterview(interview: Interview): void {
  if (!IS_CLIENT) return;
  const list = getInterviews();
  const index = list.findIndex((i) => i.id === interview.id);
  if (index > -1) {
    list[index] = interview;
  } else {
    list.unshift(interview);
  }
  localStorage.setItem('prepwise_interviews', JSON.stringify(list));
}

export function getInterviewById(id: string): Interview | undefined {
  const list = getInterviews();
  return list.find((i) => i.id === id);
}

export function deleteInterview(id: string): void {
  if (!IS_CLIENT) return;
  const list = getInterviews();
  const filtered = list.filter((i) => i.id !== id);
  localStorage.setItem('prepwise_interviews', JSON.stringify(filtered));
}
