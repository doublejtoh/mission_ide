int hash(unsigned long key);

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>


int main()
{
    printf("%d\n", hash(inet_addr("127.0.0.1")));
    printf("%d\n", hash(inet_addr("248.251.2.1")));
}


#define HASH_SIZE   1024
int hash(unsigned long key)
{
    key += ~(key << 15);
    key ^=  (key >> 10);
    key +=  (key << 3);
    key ^=  (key >> 6);
    key += ~(key << 11);
    key ^=  (key >> 16);
    return key%HASH_SIZE;
}