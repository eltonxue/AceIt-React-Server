# AceIt
Web application for helping students practice interviewing. Main features include custom question banks and mock interviews that provide feedback based on voice and tone analytics.

# How to Get Started
1. Clone master branch onto own computer
2. In terminal, change directory into projects directory
3. In the projects directory, run this command:
  ```
  npm install
  ```
3. Download and install Postgres at https://postgresapp.com/
4. Open the Postgres App and initialize your server
5. Open up the command line within the App with psql by double-clicking any of the default databases
6. Create 2 new databases by running the commands:
  ```
  CREATE DATABASE "aceit-devs";
  ```
  ```
  CREATE DATABASE "test-aceit-devs";
  ```
8. Create your superuser's username and password by running the command:
  ```
  CREATE USER "aceit-postgres" WITH PASSWORD 'password';
  ```
  ```
  ALTER USER "aceit-postgres" WITH SUPERUSER;
  ```
9. Back in the projects directory, run these commands to launch Sequelize migrations:
  ```
  sequelize db:migrate
  ```
  ```
  NODE_ENV=test sequelize db:migrate
  ```
10. Then, launch the website by running this command:
  ```
  npm start
  ```
11. In your web browser, navigate to http://localhost:3000 to see the web application's home page
12. After creating and starting the "test-aceit-devs" database, run this command to begin Mocha testing:
  ```
  npm test
  ```

# Features
Home Page:
  1. Displays the top 3 most recent questions asked (none if database is empty)
    - if logged in, able to access other user profiles and also implemented web sockets for real-time updates
  2. Description of web application

Mock Interview Page:
  1. Choose a question bank
  3. Users will be given at most 1 minute to respond to each question (questions order is randomized)
  4. Steps for each response (used web sockets to update progress bar):
    - Used ResponsiveVoice.js library to ask questions
    - Audio is recorded
    - Uploaded as an audio file using Media Recorder API and the Multer package
    - Converted to text using IBM Watson's Speech-to-Text API
    - Text analyzed using IBM Watson's Tone Analyzer API
    - Used Chart.js library to visually display feedback results to users
    - Users may playback their audio files
    ***NOTE*** For testing purposes, try reading a paragraph of text that lasts for at least 20 seconds. Otherwise, the tone analyzer API will return empty feedback results (the audio file is still playable for review)
  5. Redirects to other pages

Registration Page:
  1. Create a user and logs them in as session user
  2. Watches out for username/email/password restrictions (i.e. username already exists)

Login Page:
  1. Logs user in as session user
  2. Watches out for restrictions (i.e. username does not exist or incorrect password)

My Account Page:
  1. Users may update their password
  2. Restrictions (i.e. wrong password)

Question Banks Page:
  1. Add/remove question banks
  2. Add/remove questions in question banks
  3. Search question banks by title
  4. Recently updated question banks hoisted to the top (timestamps located on the bottom of each bank)

History Page:
  1. Used Chart.js library to visually display ALL feedback results pertaining to session user
  2. Users may playback their audio files
  3. Most recent feedback results hoisted to the top of the page

Search Results Page:
  1. Users may search for other users by username

User Profiles:
  1. Displays specific user's question banks
  2. Session user may choose to add the other user's question banks to their own

# Technologies Used
Front-end:
- HTML/CSS
- Javascript/jQuery
- Bootstrap
- SASS
- EJS Templating

Back-end:
- Node.js
- ExpressJS
- PostgresQL
- Sequelize

Packages:
- Axios
- Client sessions
- Socket.io
- Nodemon
- Node-sass
- Watson Developer Cloud
- more...

APIs:
- Media Recorder API
- IBM Watson's Speech-to-Text API
- IBM Watson's Tone Analyzer API
- ResponsiveVoice.js
- Chart.js

Testing:
- Mocha
- Chai
- Chai-http
# AceIt-React-Server
# AceIt-React-Server
