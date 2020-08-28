# Cargoshift

## About the project

Cargoshift makes it easy to recover precious SSD space without having to worry about if games will break by moving them around folders. Since Windows will still see the game at its original path, any system-level configuration (regedit, config files etc) that rely on that path will still work, and so will the game.

Cargoshift was inspired by [SteamMover](https://www.traynier.com/software/steammover), as there were a couple of extra features I wanted.

* Moving multiple folders at once
* Easy folder traversal
* Configurable concurrent folder moving
* A log to see all links that were created through the tool
* Sorting the list by name / filesize

## Getting started

### Prerequisities

* node 10+
* npm / yarn
* Windows

### Installing and running locally

```sh
$ npm install
$ npm start
```

### Creating an executable

```sh
$ npm run build
$ npm run electron-build
```

## Creating a new release

1. Update the version in your project's package.json file (e.g. 1.2.3)
2. Commit that change (git commit -am v1.2.3)
3. Tag your commit (git tag v1.2.3). Make sure your tag name's format is v*.*.*. Your workflow will use this tag to detect when to create a release
4. Push your changes to GitHub (git push && git push --tags)

## Contributing

Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request