# ProFlow

## What Is This?

When working on projects of any scale, managing tasks and tracking progress is essential to success. ProFlow is a web application that enables teams to do just this. By making an account, creating a project, and inviting members, managing a project will become simple. Members of a project can add columns, subprojects, and tasks as the project evolves!

## Prerequisites

ProFlow attempts to minimize the number of required packages by taking advantage of [Docker](https://docs.docker.com/get-docker/) containerization. So, in order to run ProFlow, you will need to install

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/linux/)
- [GNU Make](https://www.gnu.org/software/make/)

## Running

Once all of the prerequisites have been installed, simply run the following commands to get up and running.

```
git clone https://github.com/CS35L-ProFlow/ProFlow.git
cd ProFlow
cp env.Sample .env
make
```

This will start up the containers and servers. This usually takes about 30 seconds in total. 

## .env

The `.env` file contains environment variables that ProFlow uses to configure itself, including ports, constants, and more. If, for example, you are running the server on a machine that is using port `6000`, then you can switch the port in `.env` to something else, like `9000`

## Acknowledgements

### Team Members

[David Spector](https://github.com/davidspector67)

[Brandon Shihabi](https://github.com/Bricktheworld)

[David Jin](https://github.com/davidjin9294)

[Artyom Sapa](https://github.com/artySapa)

[Zeckria Kamrany](https://github.com/zeckria)

(Order of team names listed using `cat README.md | grep -v "^$" | tail -n 6 | head -n 5 | shuf`)
