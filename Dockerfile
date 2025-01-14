FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
#RUN npm install -g nodemon

# Install required dependencies for Puppeteer to run Chromium in the container
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxrandr2 \
  libgbm1 \
  libxss1 \
  libxtst6 \
  libdbus-1-3 \
  xdg-utils \
  && rm -rf /var/lib/apt/lists/*

COPY . .
EXPOSE 3001

CMD ["npm", "run", "prod"]
