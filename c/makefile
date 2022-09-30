CC = gcc

CFLAGS += $(shell pkg-config --cflags json-c)
LDFLAGS += $(shell pkg-config --libs json-c)

default:
	$(CC) $(CFLAGS) $(LDFLAGS) client.c
