# Machi Koro

This is an implementation of the Machi Koro board game.

- [Base game rules](https://www.fgbradleys.com/rules/rules2/MachiKoro-rules.pdf).
- [Harbor expansion rules](https://www.gokids.com.tw/tsaiss/gokids/rules/MK%20HABOR%20RULE%20EN.pdf).
- [Machi Koro 2 rules](https://tesera.ru/images/items/1959687/machi-koro-2_Rulebook-FINAL.pdf).

This app was developed using the React framework and the <a href="https://boardgame.io/">boardgame.io</a> game engine.

**Disclaimer**: We do not own a license to the game.

## Play

The app is online and free to play at <a href="https://playmachikoro.herokuapp.com/">playmachikoro.herokuapp.com</a>.

## Development

First, install [Node.js](https://nodejs.org/en/).
Then, clone this repo and install the project dependencies.

```bash
git clone git@github.com:kevinddchen/machikoro.git
cd machikoro
npm install
```

Note: If you are on Windows, you may need to install the `cross-env` package to avoid a `NODE_PATH` keyword issue when starting a local server.

- Run `npm install cross-env` to install the package.

We recommend using [VS Code](https://code.visualstudio.com/) as your code editor.
Some contribution guidelines:

- Run `npm run lint:fix` to run code linting and check for syntax errors.
- Run `npm run prettier:fix` to autoformat the code.
- Run `npm run version:fix` to update the version in [src/version.ts](src/version.ts) with the version in [package.json](package.json).

### Run locally in debug mode

In a terminal window, run the following command:

```bash
npm run serve:dev
```

This will start the game server.
Without closing the window, open a new terminal window and run:

```bash
npm run start
```

This will open the app in development mode at `localhost:3000` in your browser.
There are some debugging tools which become unavailable in the production version of the app.
Additionally, any changes made in the source code will be automatically updated in the browser, which is very convenient.

To change the debug game settings, edit `debugSetupData` in [src/game/machikoro.ts](src/game/machikoro.ts).

### Run locally in production mode

You must first build the app by running,

```bash
npm run build
```

Once the app has been built, you start the game server by running the same command as above,

```bash
npm run serve:prod
```

The app will be hosted at `localhost:80`.
If you open multiple browsers and go to the link (e.g. incognito mode) you can play with yourself.
The downside is that any changes in the code will not be reflected in the app until it is rebuilt.

## Deploy to Heroku

First, install the Heroku CLI and log in by running `heroku login`.
From the project root directory, run `heroku git:remote -a playmachikoro` to add the Heroku remote to Git.
To deploy your local app, run

```bash
git push heroku main
```

This will only work if you are a collaborator.
