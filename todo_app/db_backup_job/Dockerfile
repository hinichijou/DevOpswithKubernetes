FROM postgres:18-alpine3.24 AS base

FROM base AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache jq

RUN addgroup -g 1001 -S job
RUN adduser -u 1001 -S -D -G job jobuser

COPY --chown=jobuser:job db_backup.sh ./

USER jobuser

ENTRYPOINT ["sh"]

CMD [ "db_backup.sh" ]
