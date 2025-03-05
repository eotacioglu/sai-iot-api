FROM node:22
WORKDIR /usr/src/app
EXPOSE 3000
CMD ["node", "index.js"]


# docker run -d \
# --name sai-iot-api-service \
# --network IoT \
# -p 3000:3000 \
# -v /Users/kaanemre/Documents/GitHub/sai-iot-api:/usr/src/app \
# -w /usr/src/app \
# saiiotapi