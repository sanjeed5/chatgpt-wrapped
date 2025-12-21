import type { Conversation } from '../types';

const titles = [
  'Help me write a cover letter',
  'Explain quantum computing',
  'Debug my Python code',
  'Recipe for pasta carbonara',
  'JavaScript async/await help',
  'Marketing strategy ideas',
  'React hooks explanation',
  'Travel planning for Japan',
  'Creative writing prompt',
  'SQL query optimization',
  'Machine learning basics',
  'Investment advice',
  'Meditation techniques',
  'Docker container setup',
  'CSS Grid vs Flexbox',
  'Email draft review',
  'Book recommendations',
  'Workout routine',
  'API design best practices',
  'Interview preparation',
];

const models = ['gpt-4', 'gpt-4o', 'gpt-4o', 'gpt-4o', 'o1', 'gpt-4'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDemoData(): Conversation[] {
  const conversations: Conversation[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Generate conversations for current year (more) and previous year (less)
  const currentYearCount = randomInt(180, 350);
  const previousYearCount = randomInt(80, 150);
  
  // Previous year conversations
  for (let i = 0; i < previousYearCount; i++) {
    const month = randomInt(0, 11);
    const day = randomInt(1, 28);
    const hour = randomInt(8, 23);
    const date = new Date(currentYear - 1, month, day, hour, randomInt(0, 59));
    
    conversations.push(createConversation(date));
  }
  
  // Current year conversations with realistic distribution
  const daysInYear = Math.floor((now.getTime() - new Date(currentYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < currentYearCount; i++) {
    const dayOffset = randomInt(0, daysInYear);
    const date = new Date(currentYear, 0, 1);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(randomInt(9, 22), randomInt(0, 59), 0, 0);
    
    conversations.push(createConversation(date));
  }
  
  // Add some very first conversations (2+ years ago)
  const firstConvoDate = new Date(currentYear - 2, randomInt(0, 11), randomInt(1, 28));
  conversations.push(createConversation(firstConvoDate, 'My first ChatGPT conversation'));
  
  return conversations.sort((a, b) => a.create_time - b.create_time);
}

function createConversation(date: Date, customTitle?: string): Conversation {
  const title = customTitle || randomChoice(titles);
  const messageCount = randomInt(2, 12);
  const mapping: Conversation['mapping'] = {};
  
  // Generate realistic message chain
  let currentTime = date.getTime() / 1000;
  
  for (let i = 0; i < messageCount; i++) {
    const isUser = i % 2 === 0;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const wordCount = isUser ? randomInt(10, 100) : randomInt(50, 300);
    const words = Array(wordCount).fill('lorem').join(' ');
    
    // Add some polite words randomly for user messages
    let content = words;
    if (isUser && Math.random() > 0.7) {
      content = Math.random() > 0.5 ? `Please ${content}` : `${content}. Thanks!`;
    }
    
    mapping[messageId] = {
      id: messageId,
      message: {
        id: messageId,
        author: { role: isUser ? 'user' : 'assistant' },
        content: {
          content_type: 'text',
          parts: [content],
        },
        create_time: currentTime,
      },
    };
    
    currentTime += randomInt(30, 300);
  }
  
  return {
    id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    create_time: date.getTime() / 1000,
    default_model_slug: randomChoice(models),
    mapping,
  };
}
