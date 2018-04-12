slug.tgz: utils/Dockerfile
	docker build -t tmp -f utils/Dockerfile .
	id=`docker create tmp` && \
	   docker cp $$id:slug.tgz slug.tgz && \
	   docker rm $$id

publish: slug.tgz
	$(MAKE) -f utils/pub.mk

clean:
	rm -rf slug.tgz
	rm -rf downloads

.PHONY: slug.tgz publish clean
