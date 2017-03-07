FROM mhart/alpine-node:6.9

# Create app directory
WORKDIR /src

# Bundle app source
COPY . .

CMD [ "npm", "run",  "aws" ]
