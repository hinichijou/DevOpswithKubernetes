FROM postgres:18-alpine3.24 AS base

FROM base AS runner

RUN apk add --no-cache jq

RUN addgroup -g 1001 -S job
RUN adduser -u 1001 -S -D -G job jobuser

RUN mkdir /usr/src/app && \
    chown jobuser:job /usr/src/app && \
    chmod 755 /usr/src/app

WORKDIR /usr/src/app

COPY --chown=jobuser:job db_backup.sh ./

USER jobuser

ENTRYPOINT ["sh"]

CMD [ "db_backup.sh" ]
