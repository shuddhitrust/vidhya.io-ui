## About

This repo contains the Angular-based UI for the Vidhya.io app. This README file details everything you need to know about this project.

## Versions
* Node 14.17.0
* Angular CLI 12.0.0
* Docker 20.10.6, build 370c289
* Docker Compose 1.29.1, build c34c88b2
## Environment Setup

The following instructions assumes that you are attempting to setup the project on an Ubuntu 20.04 machine. The responsibility of making necessary adjustments to the steps below rests on the follower of these instructions.

1. [Setup Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)   
2. [Setup Docker Compose](https://docs.docker.com/compose/install/)
3. [Setup Node using NVM](https://stackabuse.com/using-nvm-to-install-node/)
4. Setup Angular CLI globally `npm install -g @angular/cli`

## Project Setup

1. Create the new project with `ng new vidhya-ui` and use the following options for configuration:-
   1. Would you like to add Angular routing? Yes
   2. Which stylesheet format would you like to use? SCSS
2. Enter the project folder with `cd`
3. Build and tag a Docker image with `docker build -t vidhya-ui:dev .`
4. Spin up the Docker container with `docker run -v ${PWD}:/app -v /app/node_modules -p 4201:4200 --rm vidhya-ui:dev`
   1. The application should be available on `https://localhost/4201`


## Useful Links
1. [Setup Docker for an Angular application](https://mherman.org/blog/dockerizing-an-angular-app/)