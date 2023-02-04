export DOCKER_USER_ID := $(shell id -u)
export DOCKER_GROUP_ID := $(shell id -g)

local:
	echo ${DOCKER_USER}
	docker-compose stop && docker-compose up --build --remove-orphans
