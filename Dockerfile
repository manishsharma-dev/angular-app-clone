FROM nginx
#FROM public.ecr.aws/nginx/nginx:latest
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY  default.conf /etc/nginx/conf.d/default.conf
COPY ./dist/nddb /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
