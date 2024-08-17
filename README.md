# hacker news duel

an interactive web game where you guess which of two hacker news posts has a higher score. compete to see how well you know the popular stories on hacker news!

![image](https://github.com/user-attachments/assets/621fffda-c490-466d-b2ac-a26634c412ba)


## features

- **gameplay**: guess which post has a higher score between two given options.
- **score tracking**: keep track of your score, current streak, and longest streak.
- **timer**: a countdown timer challenges you to make quick decisions.
- **pause and resume**: pause the game if needed and resume when you're ready.
- **responsive design**: play the game on various devices with a mobile-friendly layout.

## installation

to get started with **hacker news duel**, follow these steps:

1. **clone the repository**

   ```bash
   git clone https://github.com/intincrab/hackernews-duel.git
   cd hackernews-duel
   ```

2. **install dependencies**

   ensure you have [node.js](https://nodejs.org/) installed. then run:

   ```bash
   npm install
   ```

3. **run the development server**

   ```bash
   npm run dev
   ```

   your application should now be running on [http://localhost:3000](http://localhost:3000).

## usage

1. **play the game**

   when the game starts, you'll see two hacker news posts. your task is to guess which post has a higher score. click on one of the posts to make your guess.

2. **scoring and streaks**

   - correct guesses increase your score and current streak.
   - incorrect guesses decrease your score and reset the streak.
   - your longest streak is also tracked.

3. **timer**

   you have 5 seconds to make a decision for each pair of posts. if the timer runs out, a new pair will be presented.

4. **pause and resume**

   you can pause the game if needed and resume it later.

5. **view post details**

   after making a guess, click on the post to view its details on hacker news.

## contributing

feel free to submit issues or pull requests.

## license

this project is licensed under the [LICENSE](LICENSE).
