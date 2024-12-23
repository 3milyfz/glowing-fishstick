#! /bin/bash

# TODO maybe don't refresh the database if we don't want to
# but for grading, probably best to do this to not run into any conflicts

# run as root
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

# Docker Install, NOT TESTED
# https://github.com/docker/docker-install
if command -v docker &> /dev/null
then
  echo "Docker is installed."
else
  echo "installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
fi

echo "building docker image for isolation..."
docker build --network=host -t test-env -f testEnv.Dockerfile .

# the command for docker run is now:
# docker run -rm -v $(pwd):/code test-env python3 /code/test.py

# echo "removing dev db..."
# rm prisma/dev.db

# install packages
echo "installing packages with npm..."
npm install

# do the migration, should not need to give a name
echo "migrating prisma..."
npx prisma migrate dev

# for now, let's just delete the .env file and manually write it
# rm .env

# make an env file if it doesn't exist
if ! test -f ".env"; then
  echo "Creating blank .env file..."
  echo "" > .env
else
  echo ".env already created, will not overwrite..."
fi

# TODO check compilers/interpreters
# echo "checking compilers and interpreters..."
# languageCommands=(
#   "gcc"       # C
#   "g++"       # C++
#   "javac"     # Java compiler
#   "java"      # Java interpreter
#   "python3"   # Python 3
#   "node"      # JavaScript
# )

# Function to check if a command exists. command -v checks if command is available in a system"s PATH
# check_command() {
#   if command -v "$1" &> /dev/null; then
#     echo "$1 is installed"
#   else
#     echo "[ERROR] $1 is NOT installed"
#   fi
# }

# for cmd in "${languageCommands[@]}"; do
#   check_command "$cmd"
# done

# test for python vs python3
# if command -v "python" &> /dev/null; then
#   echo "python command is 'python'"
#   echo "PYTHON_COMMAND=python" >> .env
#   PYTHON_COMMAND=python
# else
#   echo "assuming python command is 'python3'"
#   echo "PYTHON_COMMAND=python3" >> .env
#   PYTHON_COMMAND=python3
# fi

# create admin user by runnin server then sending requests
# UPDATE: no need to do this, we will have pre-populated DB
# echo "Creating admin user..."
# echo "Running server in background..."
# npm run dev &
# sleep 5 # may need to extend if server takes a while to load

# echo "Running python script to create new user, you must have the requests package installed"
# $PYTHON_COMMAND new_admin_user.py

# echo "Killing next server..."
# pkill -f next

echo "Done. Please read for ERRORs and press any key to continue"
read exit;