CC = gcc

# get json-c at https://github.com/json-c/json-c

CFLAGS += $(shell pkg-config --cflags json-c)
LDFLAGS += $(shell pkg-config --libs json-c)

default:
	$(CC) $(CFLAGS) $(LDFLAGS) *.c
