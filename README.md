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
npm install
npm run build
npm run serve
```

The app will be hosted at `localhost:80`.

## Development

Run `npm run serve` on one console and `npm start` on another console.
This will open the app in development mode.
If any changes are made to the source code, re-run the `npm run serve` command to update the app.

## Deploy to Heroku

First, install the Heroku CLI and log in by running `heroku login`.
From the project root directory, run `heroku git:remote -a playmachikoro` to add the Heroku remote to Git.
To deploy your local app, run

```bash
git push heroku master
```

This will only work if you are a collaborator.
