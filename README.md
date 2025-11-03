
# PomoMate – A smart Pomodoro timer that helps you stay focused, organize tasks, and boost productivity with AI-driven suggestions

## Languages/Frameworks used 
 
 React, Node.js, MongoDB

## Functionality

- Users can register, login, and logout.
- Users can create a tomato clock, setting the working time and pause time.
- The tomato clock can add some note, tag or category after finishing.
- Logged-in users can edit and delete their previous tomato clock.
- Database contains Users, Tomato clocks with the necessary collections and fields to maintain the above functionality.


## Creative Portion  
Integrating OpenAI API to generate information for tomato clock:

- Users can submit content, which is processed by OpenAI API to generate relevant tags, format the notes, and select the category.
- The AI can generate some suggestions next tomato clock for the user based on the work that has already been done, and the user can choose one of the suggestions to start the next Tomato Clock

## How to start

1. Clone the repositorie to your local machine.
2. Install the required dependencies by running `npm install` in both `./client` and `./backend` directory.
3. Start the backend server by running `npm start` in both `./client` and `./backend` directory.
