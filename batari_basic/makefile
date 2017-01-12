# The bB generic-Unix makefile. Should work with most unixy OSes.
SHELL=/bin/sh
CHMOD=chmod
CP=cp
RM=rm
#CFLAGS=-O0 -ansi -Wall
CFLAGS=-Wall -std=c90 -Wno-implicit -s NO_EXIT_RUNTIME=1
#CFLAGS=-O2 -g
CC=emcc
LEX=flex
LEXFLAGS=-t

all: 2600basic preprocess postprocess optimize bbfilter

2600basic.em.js: 2600bas.c statements.c keywords.c statements.h keywords.h
	${CC} ${CFLAGS} -o 2600basic.em.js 2600bas.c statements.c keywords.c

postprocess: postprocess.c
	${CC} ${CFLAGS} -o postprocess postprocess.c

preprocess.em.js: preprocess.lex
	${LEX} ${LEXFLAGS}<preprocess.lex>lex.yy.c
	${CC} ${CFLAGS} -o preprocess.em.js lex.yy.c
	${RM} -f lex.yy.c

optimize: optimize.lex
	${LEX} ${LEXFLAGS} -i<optimize.lex>lex.yy.c
	${CC} ${CFLAGS} -o optimize lex.yy.c
	${RM} -f lex.yy.c

bbfilter: bbfilter.c
	${CC} ${CFLAGS} -o bbfilter bbfilter.c

distclean:
	make -f makefile.linux32 clean
	make -f makefile.xcmp.win32 clean
	make -f makefile.xcmp.osx clean

dist:
	make clean
	make distclean
	make -f makefile.linux32
	make -f makefile.xcmp.win32
	make -f makefile.xcmp.osx

install: all

clean:
	${RM} -f a.out core 2600basic preprocess postprocess optimize bbfilter *.em.js

love:
	@echo "not war"
