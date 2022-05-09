# Machikoro

We do not own a license to the game.
Images were taken without permission from <a href="https://www.yucata.de/en">yucata.de</a> and <a href="https://machi-koro.fandom.com/">machi-koro.fandom.com</a>.

Developed using React and <a href="https://boardgame.io/">boardgame.io</a>.

## Play

App is online at <a href="http://playmachikoro.herokuapp.com/">playmachikoro.herokuapp.com</a>.

## Local Install

```bash
git clone git@github.com:kevinddchen/machikoro.git
cd machikoro
npm install .
npm run build
npm run serve
```

The app will be hosted at `localhost:80`.
If you open multiple browsers and go to the link (e.g. incognito mode) you can play with yourself.

## Development

Run the commands above on one console and `npm start` on another console.
This will open the app in development mode at `localhost:3000`, which has some additional debugging tools.
You can play against other browser windows opened up to `localhost:80`.

If any changes are made to the source code, the client will automatically update.
But if any changes need to be updated on the server, you will have to re-run `npm run build` and `npm run serve`.

- Run `npm run lint` to run code linting and check for syntax errors.
- Run `npm run prettier` to autoformat the code.

## Deploy to Heroku

First, install the Heroku CLI and log in by running `heroku login`.
From the project root directory, run `heroku git:remote -a playmachikoro` to add the Heroku remote to Git.
To deploy your local app, run

```bash
git push heroku master
```

This will only work if you are a collaborator.
