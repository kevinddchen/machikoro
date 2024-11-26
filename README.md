# Machi Koro

This is an implementation of the Machi Koro board game.
This app was developed using the React framework and the <a href="https://boardgame.io/">boardgame.io</a> game engine.

**Disclaimer**: We do not own a license to the game.

## Play

The app is online and free to play at <a href="https://playmachikoro.herokuapp.com/">playmachikoro.herokuapp.com</a>.

### Rules

- [Base game rules](https://www.dropbox.com/s/ktmenu7uvn9kirn/Machi%20Koro%20Rulebook.pdf?dl=0).
- [Expansions rules](https://www.dropbox.com/s/cesd1sxmd4n3twr/Machi%20Koro%20Expansions%20Rulebook.pdf?dl=0).
- [Machi Koro 2 rules](https://www.dropbox.com/s/g6cfyld8i77djip/Machi%20Koro%202%20Rulebook.pdf?dl=0).

### Supply variants

- **Total**: All establishments are available for purchase. This is the official supply variant of Machi Koro.
- **Variable**: 10 establishments are available for purchase. This is the official supply variant of the expansions.
- **Hybrid**: 5 establishments with rolls 1-6, 5 establishments with rolls 7+, and 2 major establishments are available for purchase. This is the official supply variant of Machi Koro 2.

### Implementation details

In the Millionaire's Row expansion, there are certain uncommon plays that are not possible:

- `Demolition Company` cannot be activated after `Corn Field`. This is uncommon because you could get fewer coins.
- `Loan Office` cannot be activated after `Forest` or `Flower Shop`. This is uncommon because you could get fewer coins.
- `Moving Company` cannot be activated before `Mine`, `Winery`, or `Apple Orchard`. This is done because (i) you could get fewer coins, and (ii) it is ambiguous whether establishments you give away should be activated, so this keeps things simple.
- `Renovation Company` cannot be activated before `Tax Office`. This is uncommon because you could get fewer coins.
- `Exhibit Hall` cannot be activated before `Tech Startup` (e.g. to activate `Loan Office`). While this could give you more coins, (i) it is quite rare, and (ii) activating `Tech Startup` first makes it more clean how many coins you have which can help with picking the establishment to activate.

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
- Run `npm run prettier:fix` to autoformat the code.
- Run `npm run version:fix` to update the version in [src/version.ts](src/version.ts) with the version in [package.json](package.json).

### Run locally in debug mode

In a terminal window, run the following command:

```bash
npm run dev
```

The app will be hosted at `localhost:80`.
If you open multiple browsers and go to the link (e.g. incognito mode) you can play with yourself.

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
git push heroku main
```

This will only work if you are a collaborator.
