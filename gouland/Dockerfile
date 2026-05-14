# Build stage
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache git
RUN go build -o gouland ./cmd/api
RUN go build -o migrate ./cmd/migrate

# Final image
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/gouland /app/gouland
COPY --from=builder /app/migrate /app/migrate
RUN mkdir -p /data/uploads
EXPOSE 4000
ENV PORT=4000
CMD ["/bin/sh","-c","/app/migrate && /app/gouland"]
