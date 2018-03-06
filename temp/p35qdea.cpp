#include <iostream>
using namespace std;
class Car {
//cin
  	cin>>
      public:

             int gear;

             string color;

             int speeddown();

             int speedup();

             int getspeed();

             void setspeed(int i);

      private: 

             int speed;

};



int Car:: speedup(){

   return  speed += 10;

}



int Car :: speeddown(){

    return speed -= 10;

}



int Car :: getspeed(){

    return speed;

}



void Car :: setspeed(int i){

     speed = i;

}    







int main(int argc, char *argv[])

{

    

    Car c;

    c.setspeed(100);

    c.color = "white";

    cout << "현재 c차의 속도는 " << c.getspeed() << endl;

    cout << "현재 c차의 색깔은 " << c.color << endl; 

    cout << "현재 c차의 속도는 " << c.speedup() << endl; 

   

    



    return 0;

}




