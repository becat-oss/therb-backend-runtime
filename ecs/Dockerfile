FROM python:3.9-buster as base

COPY ecs /app/ecs

WORKDIR /app

RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

RUN ["chmod", "+x", "ecs/entrypoint.sh"]

ENTRYPOINT ["sh","ecs/entrypoint.sh"]