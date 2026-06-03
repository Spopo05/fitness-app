const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user.model');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ DB connected');
    await assignCoachesToUsers();
    mongoose.disconnect();
  })
  .catch(console.error);

async function assignCoachesToUsers() {
  const usersWithoutCoach = await User.find({ role: 'user', coach: { $exists: false } });
  const coaches = await User.find({ role: 'coach' });

  if (coaches.length === 0) {
    console.log('❌ No coaches available');
    return;
  }

  if (usersWithoutCoach.length === 0) {
    console.log('✅ All users already have coaches assigned');
    return;
  }

  console.log(`🔎 Assigning coaches to ${usersWithoutCoach.length} users`);

  for (let i = 0; i < usersWithoutCoach.length; i++) {
    const user = usersWithoutCoach[i];
    
    // Option: assign randomly
    const randomCoach = coaches[Math.floor(Math.random() * coaches.length)];

    user.coach = randomCoach._id;
    await user.save();

    console.log(`✅ Assigned coach ${randomCoach.name} to user ${user.name}`);
  }

  console.log('🎉 Done assigning coaches.');
}
