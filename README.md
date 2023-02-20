# Machi Koro

This is an implementation of the Machi Koro board game.
For the basic game rules, [click here](https://www.fgbradleys.com/rules/rules2/MachiKoro-rules.pdf).
This app was developed using the React framework and the <a href="https://boardgame.io/">boardgame.io</a> game engine.

**Disclaimer**: We do not own a license to the game.
Images were taken _without_ permission from <a href="https://www.yucata.de/en">yucata.de</a> and <a href="https://machi-koro.fandom.com/">machi-koro.fandom.com</a>.

## Play

The app is online and free to play at <a href="http://playmachikoro.herokuapp.com/">playmachikoro.herokuapp.com</a>.

## Development

First, install [Node.js](https://nodejs.org/en/).
Then, clone this repo and install the project dependencies.

```bash
git clone git@github.com:kevinddchen/machikoro.git
cd machikoro
npm install
```

We recommend using [VS Code](https://code.visualstudio.com/) as your code editor.
Some contribution guidelines:

- Run `npm run lint:fix` to run code linting and check for syntax errors.
- Run `npm run prettier` to autoformat the code.

### Run locally in debug mode

In a terminal window, run the following command:

```bash
npm run serve
```

This will start the game server.
Without closing the window, open a new terminal window and run:

```bash
npm run start
```

This will open the app in development mode at `localhost:3000` in your browser.
There are some debugging tools which become unavailable in the production version of the app.
Additionally, any changes made in the source code will be automatically updated in the browser, which is very convenient.

### Run locally in production mode

You must first build the app by running,

```bash
npm run build
```

Once the app has been built, you start the game server by running the same command as above,

```bash
npm run serve
```

The app will be hosted at `localhost:80`.
If you open multiple browsers and go to the link (e.g. incognito mode) you can play with yourself.
The downside is that any changes in the code will not be reflected in the app until it is rebuilt.

## Deploy to Heroku

First, install the Heroku CLI and log in by running `heroku login`.
From the project root directory, run `heroku git:remote -a playmachikoro` to add the Heroku remote to Git.
To deploy your local app, run

```bash
git push heroku master
```

This will only work if you are a collaborator.
