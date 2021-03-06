#include <stdio.h>
#include <stdlib.h>
#include <time.h>
void main(void)
{    int users, computers;                   // 사용자와 컴퓨터의 선택
    int win_user = 0, win_computer = 0;       // 사용자와 컴퓨터의 전적
    char *str[3] = { "Gai", "Bai", "Bo" };   // 가위, 바위, 보 문자열 저장
    srand( (unsigned)time( NULL ) );       // 랜덤 함수 초기화
    printf("Enjoy Gai Bai Bo!\n");
    printf("1. Gai 2. Bai 3. Bo\n\n");
    for (int i=0;i<3;i++) {                               // 무한 루프
        computers = (rand() % 3) + 1;       // 1, 2, 3 중의 하나를 선택
        printf("Enter your choice: ");
        scanf("%d", &users);
        if ( users == 0 )
            break;
        else if ( users < 1 || users > 3 )
            continue;
        printf("You: %s, Computer: %s\n", str[users - 1], str[computers - 1]);
        switch (computers) {
        case 1:
            if ( users == 2 ) {
                printf("You win!\n");
                win_user++;
            }
            else if ( users == 3 ) {
                printf("You lose!\n");
                win_computer++;
            }
            else
                printf("We have the same thing.\n");
            break;
        case 2:
            if ( users == 3 ) {
                printf("You win!\n");
                win_user++;
            }
            else if ( users == 1 ) {
                printf("You lose!\n");
                win_computer++;
            }
            else
                printf("We have the same thing.\n");
            break;
        case 3:
            if ( users == 1 ) {
                printf("You win!\n");
                win_user++;
            }
            else if ( users == 2 ) {
                printf("You lose!\n");
                win_computer++;
            }
            else
                printf("We have the same thing.\n");
            break;
        default:
            printf("Error!\n");
        }
    }
    printf("You win: %d, You lose: %d\n", win_user, win_computer);
    printf("Bye!\n");
}
