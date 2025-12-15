/**
 * Demo Data Generator
 * Creates realistic demo data for ChatGPT Wrapped
 */

const DemoData = {
  /**
   * Generate demo conversations for 2025
   */
  generate() {
    const conversations = [];
    const topics = [
      'Help with Python debugging',
      'Recipe ideas for dinner',
      'Understanding machine learning',
      'Email writing help',
      'JavaScript async/await',
      'Workout routine suggestions',
      'Book recommendations',
      'SQL query optimization',
      'Travel tips for Japan',
      'React hooks explanation',
      'Interview preparation',
      'Git branching strategies',
      'CSS Grid vs Flexbox',
      'Startup ideas brainstorm',
      'Docker basics explained',
      'Meditation getting started',
      'API design best practices',
      'Morning routine tips',
      'TypeScript generics help',
      'Salary negotiation advice',
      'Home office setup ideas',
      'Learning Spanish tips',
      'Debugging CSS issues',
      'Writing better code reviews',
      'Managing work stress',
      'Planning a birthday party',
      'Building a portfolio site',
      'Understanding REST vs GraphQL',
      'Improving presentation skills',
      'Healthy meal prep ideas'
    ];

    const models = ['gpt-4o', 'gpt-4o', 'gpt-4o', 'gpt-4', 'o1', 'gpt-4o-mini'];
    
    // Generate conversations throughout 2025
    // More activity on weekdays, less on weekends
    // Peak hours: 9-11am, 2-4pm, 8-10pm
    
    const year = 2025;
    let convId = 1;
    
    // January to current date (or December for demo)
    for (let month = 0; month < 12; month++) {
      // Varying activity per month (building up over year)
      const baseConvosPerMonth = 20 + Math.floor(month * 3) + Math.floor(Math.random() * 15);
      
      for (let i = 0; i < baseConvosPerMonth; i++) {
        const day = 1 + Math.floor(Math.random() * 28); // Avoid edge cases
        const date = new Date(year, month, day);
        
        // Skip some weekends (lower activity)
        if ((date.getDay() === 0 || date.getDay() === 6) && Math.random() > 0.4) {
          continue;
        }
        
        // Peak hours distribution
        let hour;
        const hourRoll = Math.random();
        if (hourRoll < 0.25) {
          hour = 9 + Math.floor(Math.random() * 3); // 9-11am
        } else if (hourRoll < 0.5) {
          hour = 14 + Math.floor(Math.random() * 3); // 2-4pm
        } else if (hourRoll < 0.8) {
          hour = 20 + Math.floor(Math.random() * 3); // 8-10pm
        } else {
          hour = Math.floor(Math.random() * 24); // Any hour
        }
        
        const minute = Math.floor(Math.random() * 60);
        date.setHours(hour, minute, 0, 0);
        
        const createTime = date.getTime() / 1000;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        const model = models[Math.floor(Math.random() * models.length)];
        
        // Generate 2-8 message pairs
        const messagePairs = 2 + Math.floor(Math.random() * 7);
        const mapping = this.generateMapping(messagePairs);
        
        conversations.push({
          id: `conv-${convId}`,
          title: topic,
          create_time: createTime,
          update_time: createTime + (messagePairs * 60),
          default_model_slug: model,
          mapping: mapping
        });
        
        convId++;
      }
    }
    
    // Add a streak in March (14 consecutive days)
    for (let day = 5; day <= 18; day++) {
      const date = new Date(year, 2, day, 21, 30);
      const createTime = date.getTime() / 1000;
      
      conversations.push({
        id: `conv-streak-${day}`,
        title: topics[day % topics.length],
        create_time: createTime,
        update_time: createTime + 300,
        default_model_slug: 'gpt-4o',
        mapping: this.generateMapping(3)
      });
    }
    
    // Sort by create_time
    conversations.sort((a, b) => a.create_time - b.create_time);
    
    return conversations;
  },

  /**
   * Generate message mapping with realistic content
   */
  generateMapping(pairs) {
    const mapping = {};
    const userPhrases = [
      'Can you help me with',
      'I need assistance understanding',
      'How do I approach',
      'What would be the best way to',
      'Could you explain',
      'I\'m trying to figure out',
      'What are your thoughts on',
      'Help me understand'
    ];
    
    const assistantStarts = [
      'I\'d be happy to help with that.',
      'Great question!',
      'Let me explain this step by step.',
      'Here\'s what I would suggest:',
      'That\'s an interesting problem.',
      'I can definitely help with that.',
      'Here are some approaches you could take:'
    ];
    
    for (let i = 0; i < pairs; i++) {
      const userMsgId = `msg-user-${i}`;
      const assistantMsgId = `msg-assistant-${i}`;
      
      // Generate varying length content
      const userWordCount = 10 + Math.floor(Math.random() * 50);
      const assistantWordCount = 50 + Math.floor(Math.random() * 200);
      
      mapping[userMsgId] = {
        id: userMsgId,
        message: {
          author: { role: 'user' },
          content: {
            content_type: 'text',
            parts: [this.generateText(userPhrases, userWordCount)]
          }
        }
      };
      
      mapping[assistantMsgId] = {
        id: assistantMsgId,
        message: {
          author: { role: 'assistant' },
          content: {
            content_type: 'text',
            parts: [this.generateText(assistantStarts, assistantWordCount)]
          }
        }
      };
    }
    
    return mapping;
  },

  /**
   * Generate placeholder text of approximate word count
   */
  generateText(starters, wordCount) {
    const filler = [
      'the process of understanding this concept',
      'various approaches that could work',
      'considering the specific requirements',
      'taking into account best practices',
      'implementation details and patterns',
      'optimizing for performance and clarity',
      'following established conventions',
      'building upon existing knowledge',
      'exploring different possibilities',
      'addressing the core challenges'
    ];
    
    let text = starters[Math.floor(Math.random() * starters.length)] + ' ';
    
    while (text.split(' ').length < wordCount) {
      text += filler[Math.floor(Math.random() * filler.length)] + '. ';
    }
    
    return text.trim();
  }
};
