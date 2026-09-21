FROM busybox:1.38 AS base

FROM base AS runner
WORKDIR /app

RUN addgroup -g 1001 -S job
RUN adduser -u 1001 -S -D -G job jobuser

RUN chown jobuser:job /app

COPY --chown=jobuser:job wikipedia_page_fetcher.sh ./

USER jobuser

RUN mkdir page

ENTRYPOINT ["sh"]

CMD [ "wikipedia_page_fetcher.sh" ]
