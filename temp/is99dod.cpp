#include <stdio.h>

#include <stdlib.h>



int main(int argc, char *argv[]) 

{

	int selNum = 0;

	int strContent[128] = {0,};

	

	printf("숫자를 입력하시오\n");

	scanf( "%d", &selNum );

	printf(" 입력한 숫자는  [%d]\n", selNum);

	

	printf("문자를 입력하시오(127byte)\n");

	scanf( "%s", &strContent );

	printf(" 입력한 문자는  [%s]\n", strContent);

	return 0;

}



