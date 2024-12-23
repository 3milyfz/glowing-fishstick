FROM ubuntu:latest

# Install GCC and G++
RUN apt-get update && \
    apt-get install -y gcc

RUN apt-get install -y g++ libstdc++6

# Install Java (OpenJDK)
RUN apt-get install -y openjdk-11-jdk

# Install Python
RUN apt-get install -y python3 python3-pip

# Install Node.js
RUN apt-get install -y nodejs npm

# typescript
# RUN apt-get install -y node-typescript

# perl
RUN apt-get install -y perl

# Add TypeScript and Node.js type definitions
# RUN npm install -g typescript @types/node

# Install C# compiler for single-file
RUN apt-get install -y mono-mcs

# Ruby
RUN apt-get install -y ruby

# Bash is done

# PHP
RUN apt-get install -y php

# Clean up
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/*
