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
    
    // More diverse topics organized by category
    const codingTopics = [
      'Python debugging memory leak',
      'JavaScript async promises explained',
      'React hooks useEffect dependencies',
      'TypeScript generics with interfaces',
      'API design REST principles',
      'SQL query performance optimization',
      'Git merge conflict resolution',
      'Docker container networking',
      'Algorithm complexity analysis',
      'Database indexing strategies',
      'Testing Jest mock functions',
      'Node.js event loop explained',
      'CSS flexbox layout patterns',
      'Redux state management',
      'GraphQL schema design'
    ];
    
    const workTopics = [
      'Email writing professional tone',
      'Project management best practices',
      'Team meeting agenda template',
      'Business proposal structure',
      'Presentation skills improvement',
      'Salary negotiation strategies',
      'Career growth planning',
      'Interview preparation tips',
      'Resume writing keywords',
      'Performance review preparation'
    ];
    
    const creativeTopics = [
      'Writing engaging blog posts',
      'Story ideas science fiction',
      'Content strategy planning',
      'Creative brainstorming techniques',
      'Design thinking process',
      'Marketing campaign ideas',
      'Video script writing',
      'Copywriting persuasive techniques'
    ];
    
    const learningTopics = [
      'Understanding machine learning basics',
      'Learning Spanish conversation',
      'Mathematics linear algebra',
      'History World War II',
      'Philosophy existentialism intro',
      'Economics supply demand',
      'Psychology cognitive biases',
      'Science climate change'
    ];
    
    const personalTopics = [
      'Healthy meal prep ideas',
      'Workout routine building',
      'Recipe ideas dinner vegetarian',
      'Travel planning Japan itinerary',
      'Morning routine productivity',
      'Meditation mindfulness practice',
      'Book recommendations fiction',
      'Home office setup ergonomic',
      'Time management techniques',
      'Stress management strategies'
    ];
    
    const topics = [
      ...codingTopics,
      ...workTopics,
      ...creativeTopics,
      ...learningTopics,
      ...personalTopics
    ];

    const models = ['gpt-4o', 'gpt-4o', 'gpt-4o', 'gpt-4', 'o1', 'gpt-4o-mini'];
    
    let convId = 1;
    
    // Add first conversation from early 2023 (the beginning of the journey)
    const firstConvoDate = new Date(2023, 0, 15, 14, 30); // Jan 15, 2023
    conversations.push({
      id: 'conv-first-ever',
      title: 'What is ChatGPT and how does it work?',
      create_time: firstConvoDate.getTime() / 1000,
      update_time: firstConvoDate.getTime() / 1000 + 600,
      default_model_slug: 'gpt-3.5-turbo',
      mapping: this.generateMapping(3)
    });
    convId++;
    
    // Add some 2023 conversations (sporadic usage)
    for (let i = 0; i < 15; i++) {
      const month = Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);
      const date = new Date(2023, month, day, 10 + Math.floor(Math.random() * 10), 30);
      
      conversations.push({
        id: `conv-2023-${i}`,
        title: topics[Math.floor(Math.random() * topics.length)],
        create_time: date.getTime() / 1000,
        update_time: date.getTime() / 1000 + 300,
        default_model_slug: Math.random() > 0.5 ? 'gpt-3.5-turbo' : 'gpt-4',
        mapping: this.generateMapping(2 + Math.floor(Math.random() * 4))
      });
      convId++;
    }
    
    // Add 2024 conversations (growing usage)
    for (let i = 0; i < 120; i++) {
      const month = Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);
      const date = new Date(2024, month, day, 9 + Math.floor(Math.random() * 12), 30);
      
      conversations.push({
        id: `conv-2024-${i}`,
        title: topics[Math.floor(Math.random() * topics.length)],
        create_time: date.getTime() / 1000,
        update_time: date.getTime() / 1000 + 400,
        default_model_slug: Math.random() > 0.3 ? 'gpt-4' : 'gpt-4o',
        mapping: this.generateMapping(2 + Math.floor(Math.random() * 6))
      });
      convId++;
    }
    
    // Generate conversations throughout 2025
    // More activity on weekdays, less on weekends
    // Peak hours: 9-11am, 2-4pm, 8-10pm
    
    const year = 2025;
    
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
        mapping: this.generateMapping(3, true) // Add politeness
      });
    }
    
    // Add a super long conversation (to showcase longest convo stat)
    const longConvoDate = new Date(year, 4, 15, 14, 30); // Mid-May
    conversations.push({
      id: 'conv-longest-epic',
      title: 'Building a full-stack app with React and Node.js',
      create_time: longConvoDate.getTime() / 1000,
      update_time: longConvoDate.getTime() / 1000 + 7200,
      default_model_slug: 'gpt-4o',
      mapping: this.generateMapping(25, true) // 25 message pairs = 50 messages!
    });
    
    // Add some late night sessions (for night owl detection)
    for (let i = 0; i < 8; i++) {
      const lateDay = 10 + i * 3;
      const lateDate = new Date(year, 7, lateDay, 2 + Math.floor(Math.random() * 2), 30);
      conversations.push({
        id: `conv-night-${i}`,
        title: topics[Math.floor(Math.random() * topics.length)],
        create_time: lateDate.getTime() / 1000,
        update_time: lateDate.getTime() / 1000 + 600,
        default_model_slug: 'o1',
        mapping: this.generateMapping(4)
      });
    }
    
    // Sort by create_time
    conversations.sort((a, b) => a.create_time - b.create_time);
    
    return conversations;
  },

  /**
   * Generate message mapping with realistic content
   */
  generateMapping(pairs, includePoliteness = false) {
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
    
    const politePhrases = [
      'Could you please help me with',
      'I would really appreciate if you could',
      'Thank you so much for',
      'Please explain',
      'I\'d be grateful if you could',
      'Thanks for helping me understand'
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
      
      // Mix in polite phrases occasionally
      const usePolite = includePoliteness || (Math.random() < 0.3);
      const phrases = usePolite && Math.random() < 0.5 ? politePhrases : userPhrases;
      
      mapping[userMsgId] = {
        id: userMsgId,
        message: {
          author: { role: 'user' },
          content: {
            content_type: 'text',
            parts: [this.generateText(phrases, userWordCount)]
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
