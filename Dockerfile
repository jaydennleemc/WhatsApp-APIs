FROM  node:14.16.0-buster-slim

RUN  apt-get update \
    && apt-get install sudo -y \
    && apt-get install nano -y \
    && apt-get install -y wget gnupg ca-certificates procps libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    # We install Chrome to get all the OS level dependencies, but Chrome itself
    # is not actually used as it's packaged in the node puppeteer library.
    # Alternatively, we could could include the entire dep list ourselves
    # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
    # but that seems too easy to get out of date.
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/* \
    && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
    && chmod +x /usr/sbin/wait-for-it.sh

RUN apt-get update -y
RUN apt-get install zip unzip -y

RUN useradd -m bubu && echo "bubu:bubu" | chpasswd && adduser bubu sudo

WORKDIR /home/bubu/app

COPY . .

RUN chown -R bubu:bubu /home/bubu/app

USER 1000:1000
USER bubu

RUN npm install

EXPOSE 3000

CMD ["node","index.js"]

