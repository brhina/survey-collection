import mongoose, { Types } from 'mongoose';
import { env } from './config/env';
import User from './models/User';
import Survey from './models/Survey';
import Response from './models/Response';

const connect = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB for database seeding...');
};

const runSeed = async () => {
  try {
    await connect();

    // 1. Clean existing collections
    console.log('Clearing existing records...');
    await Promise.all([
      User.deleteMany({}),
      Survey.deleteMany({}),
      Response.deleteMany({})
    ]);

    // 2. Seed Users
    console.log('Creating sample users...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@surveyflow.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    const creatorUser = await User.create({
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@university.edu',
      password: 'creator123',
      role: 'creator',
      isActive: true
    });

    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@student.edu',
      password: 'student123',
      role: 'respondent',
      isActive: true
    });

    console.log(`Created 3 users:
  - Admin: admin@surveyflow.com / admin123
  - Creator: elena.rostova@university.edu / creator123
  - Respondent: alex.rivera@student.edu / student123`);

    // 3. Define Sample Surveys
    console.log('Creating sample surveys...');

    // Survey 1: Campus Experience
    const survey1Questions = [
      {
        _id: new Types.ObjectId(),
        type: 'multiple-choice' as const,
        questionText: 'What is your primary academic faculty?',
        options: [
          'Computer Science & AI',
          'Business & Economics',
          'Engineering & Robotics',
          'Humanities & Social Sciences',
          'Health & Natural Sciences'
        ],
        isRequired: true,
        order: 0
      },
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'How would you rate the overall quality of campus facilities and libraries?',
        isRequired: true,
        order: 1
      },
      {
        _id: new Types.ObjectId(),
        type: 'checkbox' as const,
        questionText: 'Which campus amenities and digital services do you utilize on a weekly basis?',
        options: [
          '24/7 Library Study Rooms',
          'Campus High-Speed WiFi',
          'Student Dining Commons',
          'Fitness & Gym Center',
          'Career Counseling Hub'
        ],
        isRequired: true,
        order: 2
      },
      {
        _id: new Types.ObjectId(),
        type: 'dropdown' as const,
        questionText: 'What is your current year of study?',
        options: [
          'First Year (Freshman)',
          'Second Year (Sophomore)',
          'Third Year (Junior)',
          'Final Year (Senior)',
          'Graduate / Masters',
          'PhD Researcher'
        ],
        isRequired: true,
        order: 3
      },
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'How satisfied are you with academic advising, professor office hours, and mentorship?',
        isRequired: true,
        order: 4
      },
      {
        _id: new Types.ObjectId(),
        type: 'long-text' as const,
        questionText: 'What key improvements or facilities would you most like to see added to campus next academic year?',
        isRequired: false,
        order: 5
      }
    ];

    const survey1 = await Survey.create({
      title: 'University Campus Experience & Student Satisfaction 2026',
      description:
        'Annual university-wide survey assessing academic quality, campus facilities, digital infrastructure, and student support services.',
      category: 'survey',
      creatorId: creatorUser._id,
      status: 'published',
      settings: {
        isAnonymous: false,
        allowMultipleSubmissions: false,
        requireAuth: false
      },
      questions: survey1Questions,
      responseCount: 0
    });

    // Survey 2: Remote Work & Engineering Wellness
    const survey2Questions = [
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'How manageable has your overall workload and sprint pace been over the past 30 days?',
        isRequired: true,
        order: 0
      },
      {
        _id: new Types.ObjectId(),
        type: 'multiple-choice' as const,
        questionText: 'What is your ideal remote vs. in-office work distribution?',
        options: [
          '100% Fully Remote',
          '4 Days Remote / 1 Day In-Office',
          '3 Days Remote / 2 Days In-Office',
          '2 Days Remote / 3 Days In-Office',
          '100% In-Office'
        ],
        isRequired: true,
        order: 1
      },
      {
        _id: new Types.ObjectId(),
        type: 'checkbox' as const,
        questionText: 'Which collaboration tools have the most positive impact on your daily productivity?',
        options: [
          'Slack & Async Messaging',
          'GitHub Pull Requests & Code Reviews',
          'Figma Design System',
          'Notion Knowledge Base',
          'Loom Async Video Walkthroughs'
        ],
        isRequired: true,
        order: 2
      },
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'How connected, valued, and aligned do you feel with your direct engineering team?',
        isRequired: true,
        order: 3
      },
      {
        _id: new Types.ObjectId(),
        type: 'long-text' as const,
        questionText: 'What is one policy, practice, or tool that could significantly boost your daily deep focus?',
        isRequired: false,
        order: 4
      }
    ];

    const survey2 = await Survey.create({
      title: 'Remote Work & Engineering Team Wellness Pulse',
      description:
        'Quarterly engineering wellness feedback evaluating workload sustainability, team alignment, and focus culture.',
      category: 'feedback',
      creatorId: adminUser._id,
      status: 'published',
      settings: {
        isAnonymous: false,
        allowMultipleSubmissions: false,
        requireAuth: false
      },
      questions: survey2Questions,
      responseCount: 0
    });

    // Survey 3: Product Usability Feedback
    const survey3Questions = [
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'Overall ease of creating, distributing, and completing surveys on SurveyFlow',
        isRequired: true,
        order: 0
      },
      {
        _id: new Types.ObjectId(),
        type: 'multiple-choice' as const,
        questionText: 'How frequently do you create or administer surveys?',
        options: [
          'Daily or multiple times a week',
          'Once a week',
          'A few times a month',
          'Only for quarterly or annual reviews'
        ],
        isRequired: true,
        order: 1
      },
      {
        _id: new Types.ObjectId(),
        type: 'checkbox' as const,
        questionText: 'Which platform features are most essential to your daily workflow?',
        options: [
          'Live Survey Preview Pane',
          'Drag-and-Drop Question Builder',
          'CSV and JSON Export',
          'Auto-Save and Draft Recovery',
          'Mobile-Optimized Wizard Mode'
        ],
        isRequired: true,
        order: 2
      },
      {
        _id: new Types.ObjectId(),
        type: 'rating' as const,
        questionText: 'How likely are you to recommend SurveyFlow to a colleague or peer?',
        isRequired: true,
        order: 3
      },
      {
        _id: new Types.ObjectId(),
        type: 'text' as const,
        questionText: 'What is the top feature or integration you would love to see next?',
        isRequired: false,
        order: 4
      }
    ];

    const survey3 = await Survey.create({
      title: 'Product Experience & Usability Audit - DataCollector',
      description:
        'Help our product engineering team refine the data collection builder, analytics visualizations, and export features.',
      category: 'inspection',
      creatorId: creatorUser._id,
      status: 'published',
      settings: {
        isAnonymous: false,
        allowMultipleSubmissions: false,
        requireAuth: false
      },
      questions: survey3Questions,
      responseCount: 0
    });

    // Collector 4: Registration
    const survey4Questions = [
      {
        _id: new Types.ObjectId(),
        type: 'text' as const,
        questionText: 'Full Legal Name',
        isRequired: true,
        order: 0
      },
      {
        _id: new Types.ObjectId(),
        type: 'email' as const,
        questionText: 'Primary Work / University Email',
        isRequired: true,
        order: 1
      },
      {
        _id: new Types.ObjectId(),
        type: 'phone' as const,
        questionText: 'Mobile / WhatsApp Contact Number',
        isRequired: true,
        order: 2
      },
      {
        _id: new Types.ObjectId(),
        type: 'dropdown' as const,
        questionText: 'Primary Hackathon Track',
        options: [
          'Autonomous AI Agents & Workflows',
          'Full-Stack Web & Cloud Systems',
          'Real-time Data & Analytics Platforms',
          'Open Innovation & Social Impact'
        ],
        isRequired: true,
        order: 3
      },
      {
        _id: new Types.ObjectId(),
        type: 'number' as const,
        questionText: 'Expected Team Size (1 to 5 members)',
        isRequired: true,
        order: 4
      },
      {
        _id: new Types.ObjectId(),
        type: 'long-text' as const,
        questionText: 'Dietary preferences, accessibility requirements, or special notes',
        isRequired: false,
        order: 5
      }
    ];

    const survey4 = await Survey.create({
      title: 'AI & Cloud Hackathon 2026 - Participant Registration',
      description:
        'Official attendee intake and team registration form. Guarantees 1 registration per unique email address.',
      category: 'registration',
      creatorId: creatorUser._id,
      status: 'published',
      settings: {
        isAnonymous: false,
        allowMultipleSubmissions: false,
        requireAuth: false
      },
      questions: survey4Questions,
      responseCount: 0
    });

    // 4. Pre-populate Sample Responses for Realistic Analytics
    console.log('Seeding realistic responses for instant visualizations...');

    // Helper to generate responses for Survey 1
    const survey1SampleData = [
      {
        faculty: 'Computer Science & AI',
        facRating: 5,
        amenities: ['24/7 Library Study Rooms', 'Campus High-Speed WiFi', 'Fitness & Gym Center'],
        year: 'Third Year (Junior)',
        advisingRating: 4,
        feedback: 'Extend library hours during finals week and add more power outlets near study carrels.'
      },
      {
        faculty: 'Business & Economics',
        facRating: 4,
        amenities: ['Student Dining Commons', 'Campus High-Speed WiFi'],
        year: 'Second Year (Sophomore)',
        advisingRating: 5,
        feedback: 'The career counseling workshops were immensely helpful for landing summer internships!'
      },
      {
        faculty: 'Engineering & Robotics',
        facRating: 4,
        amenities: ['24/7 Library Study Rooms', 'Campus High-Speed WiFi', 'Career Counseling Hub'],
        year: 'Final Year (Senior)',
        advisingRating: 4,
        feedback: 'More lab space and newer 3D printers would make senior design projects much smoother.'
      },
      {
        faculty: 'Humanities & Social Sciences',
        facRating: 3,
        amenities: ['Student Dining Commons', 'Fitness & Gym Center'],
        year: 'First Year (Freshman)',
        advisingRating: 4,
        feedback: 'More quiet zones on the 3rd floor of the campus center.'
      },
      {
        faculty: 'Health & Natural Sciences',
        facRating: 5,
        amenities: ['24/7 Library Study Rooms', 'Campus High-Speed WiFi', 'Fitness & Gym Center'],
        year: 'Graduate / Masters',
        advisingRating: 5,
        feedback: 'Excellent research facilities and supportive department chairs.'
      },
      {
        faculty: 'Computer Science & AI',
        facRating: 4,
        amenities: ['Campus High-Speed WiFi', '24/7 Library Study Rooms'],
        year: 'First Year (Freshman)',
        advisingRating: 3,
        feedback: 'Introductory advising could use clearer roadmap guidance on course prerequisites.'
      },
      {
        faculty: 'Business & Economics',
        facRating: 5,
        amenities: ['Student Dining Commons', 'Career Counseling Hub', 'Campus High-Speed WiFi'],
        year: 'Third Year (Junior)',
        advisingRating: 4,
        feedback: 'Loved the guest speakers from fintech and venture capital.'
      },
      {
        faculty: 'Engineering & Robotics',
        facRating: 5,
        amenities: ['24/7 Library Study Rooms', 'Fitness & Gym Center'],
        year: 'PhD Researcher',
        advisingRating: 5,
        feedback: 'Conference travel grant process was fast and transparent.'
      }
    ];

    const survey1Emails = [
      'alex.rivera@student.edu',
      'elena.rostova@university.edu',
      'marcus.vance@campus.edu',
      'priya.sharma@campus.edu',
      'david.chen@engineering.edu',
      'sarah.miller@humanities.edu',
      'jordan.lee@business.edu',
      'hannah.brown@science.edu',
      'carlos.rodriguez@cs.edu',
      'aisha.noor@gradstudies.edu'
    ];

    const survey1Docs = survey1SampleData.map((item, idx) => ({
      surveyId: survey1._id,
      respondentEmail: survey1Emails[idx] || `student${idx + 1}@university.edu`,
      respondentId: idx === 0 ? studentUser._id : null,
      answers: [
        { questionId: survey1Questions[0]._id, questionType: 'multiple-choice', answer: item.faculty },
        { questionId: survey1Questions[1]._id, questionType: 'rating', answer: item.facRating },
        { questionId: survey1Questions[2]._id, questionType: 'checkbox', answer: item.amenities },
        { questionId: survey1Questions[3]._id, questionType: 'dropdown', answer: item.year },
        { questionId: survey1Questions[4]._id, questionType: 'rating', answer: item.advisingRating },
        { questionId: survey1Questions[5]._id, questionType: 'long-text', answer: item.feedback }
      ],
      completionTimeSeconds: 85 + idx * 10,
      submittedAt: new Date(Date.now() - (idx * 3600000 * 5 + 1800000))
    }));

    await Response.insertMany(survey1Docs);
    await Survey.updateOne({ _id: survey1._id }, { responseCount: survey1Docs.length });

    // Helper to generate responses for Survey 2
    const survey2SampleData = [
      {
        paceRating: 4,
        dist: '100% Fully Remote',
        tools: ['Slack & Async Messaging', 'GitHub Pull Requests & Code Reviews', 'Notion Knowledge Base'],
        teamRating: 5,
        focus: 'No-meeting Wednesdays has been a game-changer for deep architecture work.'
      },
      {
        paceRating: 3,
        dist: '4 Days Remote / 1 Day In-Office',
        tools: ['Slack & Async Messaging', 'Figma Design System', 'Loom Async Video Walkthroughs'],
        teamRating: 4,
        focus: 'Encourage short Loom videos over 30-minute sync meetings.'
      },
      {
        paceRating: 5,
        dist: '3 Days Remote / 2 Days In-Office',
        tools: ['GitHub Pull Requests & Code Reviews', 'Notion Knowledge Base'],
        teamRating: 5,
        focus: 'Clear sprint definition of done reduces context switching.'
      },
      {
        paceRating: 4,
        dist: '100% Fully Remote',
        tools: ['Slack & Async Messaging', 'GitHub Pull Requests & Code Reviews', 'Loom Async Video Walkthroughs'],
        teamRating: 4,
        focus: 'Standardize pull request templates across all repositories.'
      },
      {
        paceRating: 4,
        dist: '4 Days Remote / 1 Day In-Office',
        tools: ['Slack & Async Messaging', 'Figma Design System'],
        teamRating: 4,
        focus: 'Allow flexible working hours across timezones.'
      }
    ];

    const survey2Emails = [
      'dev.marcus@techcorp.io',
      'elena.frontend@techcorp.io',
      'sam.architect@techcorp.io',
      'priya.devops@techcorp.io',
      'alex.mobile@techcorp.io'
    ];

    const survey2Docs = survey2SampleData.map((item, idx) => ({
      surveyId: survey2._id,
      respondentEmail: survey2Emails[idx],
      answers: [
        { questionId: survey2Questions[0]._id, questionType: 'rating', answer: item.paceRating },
        { questionId: survey2Questions[1]._id, questionType: 'multiple-choice', answer: item.dist },
        { questionId: survey2Questions[2]._id, questionType: 'checkbox', answer: item.tools },
        { questionId: survey2Questions[3]._id, questionType: 'rating', answer: item.teamRating },
        { questionId: survey2Questions[4]._id, questionType: 'long-text', answer: item.focus }
      ],
      completionTimeSeconds: 60 + idx * 8,
      submittedAt: new Date(Date.now() - (idx * 3600000 * 6 + 3600000))
    }));

    await Response.insertMany(survey2Docs);
    await Survey.updateOne({ _id: survey2._id }, { responseCount: survey2Docs.length });

    // Helper to generate responses for Survey 3
    const survey3SampleData = [
      {
        ease: 5,
        freq: 'Daily or multiple times a week',
        features: ['Live Survey Preview Pane', 'Drag-and-Drop Question Builder', 'CSV and JSON Export'],
        rec: 5,
        next: 'Webhook triggers for Slack and email notifications.'
      },
      {
        ease: 5,
        freq: 'Once a week',
        features: ['Mobile-Optimized Wizard Mode', 'Auto-Save and Draft Recovery', 'CSV and JSON Export'],
        rec: 5,
        next: 'Dark mode option for late-night survey creators.'
      },
      {
        ease: 4,
        freq: 'A few times a month',
        features: ['Live Survey Preview Pane', 'Drag-and-Drop Question Builder'],
        rec: 4,
        next: 'Custom branding and primary color pickers.'
      },
      {
        ease: 5,
        freq: 'Daily or multiple times a week',
        features: ['Live Survey Preview Pane', 'CSV and JSON Export', 'Mobile-Optimized Wizard Mode'],
        rec: 5,
        next: 'Conditional logic jumps based on previous question answers.'
      }
    ];

    const survey3Emails = [
      'ux.researcher@product.org',
      'product.manager@startup.com',
      'qa.lead@qa-lab.net',
      'cto@enterprise-solutions.com'
    ];

    const survey3Docs = survey3SampleData.map((item, idx) => ({
      surveyId: survey3._id,
      respondentEmail: survey3Emails[idx],
      answers: [
        { questionId: survey3Questions[0]._id, questionType: 'rating', answer: item.ease },
        { questionId: survey3Questions[1]._id, questionType: 'multiple-choice', answer: item.freq },
        { questionId: survey3Questions[2]._id, questionType: 'checkbox', answer: item.features },
        { questionId: survey3Questions[3]._id, questionType: 'rating', answer: item.rec },
        { questionId: survey3Questions[4]._id, questionType: 'text', answer: item.next }
      ],
      completionTimeSeconds: 45 + idx * 12,
      submittedAt: new Date(Date.now() - (idx * 3600000 * 8 + 7200000))
    }));

    await Response.insertMany(survey3Docs);
    await Survey.updateOne({ _id: survey3._id }, { responseCount: survey3Docs.length });

    // Seed sample responses for Collector 4 (Registration)
    const survey4Docs = [
      {
        surveyId: survey4._id,
        respondentEmail: 'jordan.taylor@innovate.dev',
        answers: [
          { questionId: survey4Questions[0]._id, questionType: 'text', answer: 'Jordan Taylor' },
          { questionId: survey4Questions[1]._id, questionType: 'email', answer: 'jordan.taylor@innovate.dev' },
          { questionId: survey4Questions[2]._id, questionType: 'phone', answer: '+1 (555) 234-5678' },
          { questionId: survey4Questions[3]._id, questionType: 'dropdown', answer: 'Autonomous AI Agents & Workflows' },
          { questionId: survey4Questions[4]._id, questionType: 'number', answer: 4 },
          { questionId: survey4Questions[5]._id, questionType: 'long-text', answer: 'Vegetarian lunch request.' }
        ],
        completionTimeSeconds: 52,
        submittedAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        surveyId: survey4._id,
        respondentEmail: 'maya.lin@cloudscale.net',
        answers: [
          { questionId: survey4Questions[0]._id, questionType: 'text', answer: 'Maya Lin' },
          { questionId: survey4Questions[1]._id, questionType: 'email', answer: 'maya.lin@cloudscale.net' },
          { questionId: survey4Questions[2]._id, questionType: 'phone', answer: '+1 (555) 987-6543' },
          { questionId: survey4Questions[3]._id, questionType: 'dropdown', answer: 'Full-Stack Web & Cloud Systems' },
          { questionId: survey4Questions[4]._id, questionType: 'number', answer: 3 },
          { questionId: survey4Questions[5]._id, questionType: 'long-text', answer: 'Wheelchair ramp access required.' }
        ],
        completionTimeSeconds: 64,
        submittedAt: new Date(Date.now() - 3600000 * 12)
      }
    ];

    await Response.insertMany(survey4Docs);
    await Survey.updateOne({ _id: survey4._id }, { responseCount: survey4Docs.length });

    console.log(`
======================================================
  DATABASE SEED COMPLETED SUCCESSFULLY!
======================================================
  Data Collectors & Surveys Seeded: 4
    1. "${survey1.title}" [${survey1.category}] (${survey1Docs.length} unique responses)
    2. "${survey2.title}" [${survey2.category}] (${survey2Docs.length} unique responses)
    3. "${survey3.title}" [${survey3.category}] (${survey3Docs.length} unique responses)
    4. "${survey4.title}" [${survey4.category}] (${survey4Docs.length} unique responses)

  Sample Logins:
    Admin: admin@surveyflow.com / admin123
    Creator: elena.rostova@university.edu / creator123
    Respondent: alex.rivera@student.edu / student123
======================================================
`);

    await mongoose.disconnect();
    console.log('Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seed execution error:', error);
    process.exit(1);
  }
};

runSeed();
