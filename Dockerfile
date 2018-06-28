FROM python:3.6

ENV TZ=Europe/Berlin
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY . /usr/src/volley/
WORKDIR /usr/src/volley/
RUN pip install -e .

EXPOSE 6543
ENTRYPOINT pserve production.ini

