const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Feedback = require('../models/Feedback');

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/feedbackDB');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const student1Password = await bcrypt.hash('student123', 10);
    const student2Password = await bcrypt.hash('student456', 10);
    const student3Password = await bcrypt.hash('student789', 10);

    // Create users
    const users = await User.insertMany([
      {
        username: 'admin',
        password: adminPassword,
        role: 'admin'
      },
      {
        username: 'student_eligible',
        password: student1Password,
        role: 'student',
        attendancePercentage: 92
      },
      {
        username: 'student_ineligible',
        password: student2Password,
        role: 'student',
        attendancePercentage: 68
      },
      {
        username: 'another_student',
        password: student3Password,
        role: 'student',
        attendancePercentage: 85
      }
    ]);

    console.log('Created users:', users.length);

    // Create sample feedback
    const sampleFeedbacks = [
      {
        feedback: 'The college facilities are excellent and well-maintained. The library has a great collection of books and the computer labs are modern.',
        type: 'College',
        sentiment: { score: 5, label: 'positive' },
        userId: users[1]._id,
        username: 'student_eligible',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        feedback: 'Some professors are very helpful and knowledgeable, but others seem disinterested in teaching.',
        type: 'Faculty',
        sentiment: { score: 1, label: 'positive' },
        userId: users[1]._id,
        username: 'student_eligible',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        feedback: 'The campus is beautiful but the parking situation is terrible. Always difficult to find a spot.',
        type: 'Campus',
        sentiment: { score: -2, label: 'negative' },
        userId: users[3]._id,
        username: 'another_student',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        feedback: 'The syllabus is comprehensive but some courses have outdated content that needs updating.',
        type: 'Syllabus',
        sentiment: { score: -1, label: 'negative' },
        userId: users[1]._id,
        username: 'student_eligible',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        feedback: 'Overall, I am satisfied with my college experience. The support staff is friendly and helpful.',
        type: 'Other',
        sentiment: { score: 3, label: 'positive' },
        userId: users[3]._id,
        username: 'another_student',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        feedback: 'The cafeteria food quality has improved significantly this semester. Much better variety and taste.',
        type: 'Campus',
        sentiment: { score: 4, label: 'positive' },
        userId: users[1]._id,
        username: 'student_eligible',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        feedback: 'Some of the course materials are not available online and it makes studying difficult.',
        type: 'Syllabus',
        sentiment: { score: -3, label: 'negative' },
        userId: users[3]._id,
        username: 'another_student',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      {
        feedback: 'The college administration is responsive to student concerns and takes feedback seriously.',
        type: 'College',
        sentiment: { score: 2, label: 'positive' },
        userId: users[1]._id,
        username: 'student_eligible',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      }
    ];

    const feedbacks = await Feedback.insertMany(sampleFeedbacks);
    console.log('Created feedback:', feedbacks.length);

    console.log('\n=== SEEDING COMPLETE ===');
    console.log('Sample users created:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Student (eligible): username=student_eligible, password=student123, attendance=92%');
    console.log('Student (ineligible): username=student_ineligible, password=student456, attendance=68%');
    console.log('Student (eligible): username=another_student, password=student789, attendance=85%');
    console.log('\nSample feedback created:', feedbacks.length, 'entries');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();


