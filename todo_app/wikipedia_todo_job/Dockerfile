FROM busybox:1.38 AS base

FROM base AS runner
WORKDIR /app

RUN addgroup -g 1001 -S job
RUN adduser -u 1001 -S -D -G job jobuser

COPY --chown=jobuser:job wikipedia_random_link_todo.sh ./

USER jobuser

ENTRYPOINT ["sh"]

CMD [ "wikipedia_random_link_todo.sh" ]