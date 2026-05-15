# Build stage
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN apk add --no-cache git
RUN go build -o gouland ./cmd/api
RUN go build -o seed ./cmd/seed

# Final image
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/gouland /app/gouland
COPY --from=builder /app/seed /app/seed
COPY migrations/ /app/migrations/
RUN mkdir -p /data/uploads
EXPOSE 4000
ENV PORT=4000
CMD ["/app/gouland"]
