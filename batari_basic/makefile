# The bB generic-Unix makefile. Should work with most unixy OSes.
SHELL=/bin/sh
CHMOD=chmod
CP=cp
RM=rm
CFLAGS=-O0 
#CFLAGS=-O2 -g
CC=cc
LEX=lex
LEXFLAGS=-t

all: 2600basic preprocess postprocess optimize bbfilter

2600basic: 2600bas.c statements.c keywords.c statements.h keywords.h
	${CC} ${CFLAGS} -o 2600basic 2600bas.c statements.c keywords.c

postprocess: postprocess.c
	${CC} ${CFLAGS} -o postprocess postprocess.c

preprocess: preprocess.lex
	${LEX} ${LEXFLAGS}<preprocess.lex>lex.yy.c
	${CC} ${CFLAGS} -o preprocess lex.yy.c
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
	${RM} -f a.out core 2600basic preprocess postprocess optimize bbfilter

love:
	@echo "not war"
