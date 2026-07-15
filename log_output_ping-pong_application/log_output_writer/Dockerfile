FROM python:3.10.20-alpine3.24 AS base

FROM base AS builder

WORKDIR /app

RUN addgroup --system --gid 1001 python
RUN adduser --system --uid 1001 logger

COPY --chown=logger:python logger.py ./

USER logger

CMD [ "python", "./logger.py" ]