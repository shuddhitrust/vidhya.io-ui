## About

This repo contains the Angular-based UI for the Vidhya.io app. This README file details everything you need to know about this project.

## Versions

- Node 14.17.0
- Angular CLI 12.0.0
- Docker 20.10.6, build 370c289
- Docker Compose 1.29.1, build c34c88b2

## Environment Setup

The following instructions assumes that you are attempting to setup the project on an Ubuntu 20.04 machine. The responsibility of making necessary adjustments to the steps below rests on the follower of these instructions.

1. [Setup Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
2. [Setup Docker Compose](https://docs.docker.com/compose/install/)
3. [Setup Node using NVM](https://stackabuse.com/using-nvm-to-install-node/)
4. Setup Angular CLI globally `npm install -g @angular/cli`

## Starting Project

1. Ensure that you are in the `dev` branch.
2. cd into the ui repo.
3. Execute `npm start`

## Project Setup

1. Create the new project with `ng new vidhya-ui` and use the following options for configuration:-
   1. Would you like to add Angular routing? Yes
   2. Which stylesheet format would you like to use? SCSS
2. Enter the project folder with `cd`
3. Build and tag a Docker image with `docker build -t vidhya-ui:dev .`
4. Spin up the Docker container with `docker run -v ${PWD}:/app -v /app/node_modules -p 4201:4200 --rm vidhya-ui:dev`
   1. The application should be available on `https://localhost/4201`

## Netlify Deployment

1. Install Scully with `npm install @scullyio/init`
2. Build the app with `ng build`
3. Run scully with `npm run scully`
4. Test the build with `npm run scully serve`
5. Once tested successfully, go to Netlify dashboard and create a new site from git and connect the Git branch that needs to be deployed. Use the following configuration:-
   1. Leave the base directory field empty
   2. publish directory should be `dist/static/`
   3. Build command should be `npm run build`, which actually runs `rm dist -rf && ng build --prod && npm run scully && git add . && git commit -m'Rebuild and deploy' && git push origin scully`
   4. Set the `Build image` field under `Build & Deploy` to "Ubuntu Xenial 16.04". By default this would be "Ubuntu Focal 20.04" or whichever is the latest version of Ubuntu, but this would create issues with Puppeteer. Setting it to 16.04 averts the issue.
   5. Trigger a deploy and it should work.

## Important Quirks to Note

1. We're recognizing User Groups through User Roles and they are identified not by the id of the User Role record, but by name. So the names of the User Roles need to be constant and standard. They're stored in the UI in the `shared/common/constants.ts` file and the same object can be found in teh API in the `common.constants.py`. So when creating these User Roles in the DB for the first, the same names must be used as in these constants files.

## Useful Links

1. [Setup Docker for an Angular application](https://mherman.org/blog/dockerizing-an-angular-app/)
