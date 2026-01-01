# Act Debug

Perform CI performed by Github Action in a local environment

Install [`act`](https://github.com/nektos/act) and Start `Docker` for local environment.

## Setup

1. add .env file in the root directory ref .env.example
2. add .secrets file in the root directory ref .secrets.example

## Run

```sh
# run all workflows
act --container-architecture linux/amd64\
 --secret-file ./.github/act/.secrets\
 --env-file ./.github/act/.env\
 --defaultbranch main

# run specific workflow
act --container-architecture linux/amd64\
 --secret-file ./.github/act/.secrets\
 --env-file ./.github/act/.env\
 --defaultbranch main\
 -W "target-flow"
```
