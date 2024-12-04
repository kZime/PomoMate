const User = require("../models/User");




// get user tasks
const getUserTasks = async (userId) => {
    const user = await User.findById(userId, 'tasks');
    return user.tasks;
};

module.exports = { getUserTasks };
