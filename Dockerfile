FROM node:16.11.0 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM steebchen/nginx-spa:stable
COPY --from=builder /app/dist /app
EXPOSE 80
CMD ["nginx"]
