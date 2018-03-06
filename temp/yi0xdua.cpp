#include<stdio.h>

//Prosto

int ReturnPlusOne(int n) {
	//scanf
	return n + 1;

}

int main(void) {

	int number = 3;

	printf("%d\n", number);



	number = 5;

	printf("%d\n", number);



	number = ReturnPlusOne(number);

	printf("%d\n", number);



	return 0;

}
