#include <iostream>
#include <ios>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
 ㅇㄹㅎ
using std::cin; using std::setprecision;
using std::cout; using std::string;
using std::endl; using std::streamsize;
using std::vector; using std::sort;
 
int main(){
    //학생의 이름을 묻고 읽어들임
    cout<<"Please enter your first name : ";
    string name;
    cin>>name;
    cout<<"Hello, "<<name<<"!"<<endl;
 
    //중간고사와 기말고사 성적을 묻고 읽어들임
    cout<<"Please enter your midterm and final exam grades : ";
    double midterm, final;
    cin>>midterm>>final;
 
    //과제성적을 요구함
    cout<<"Enter all your homework grades, ""followed by endoffile : ";
    vector<double> homework;
    double x;
    //불변식 : homework는 모든 과제성적을 담습니다.
    while (cin >> x)
        homework.push_back(x);
 
    //학생이 과제성적을 입력했는지를 확인
    typedef vector<double>::size_type vec_sz;
    vec_sz size = homework.size();
    if(size == 0){
        cout<<endl<<"You must enter your grades."
            "Please try again."<<endl;
        return 1;
    }
     
    //성적 정렬
    sort(homework.begin(), homework.end());
 
    //과제성적의 중앙 값 계산
    vec_sz mid = size/2;
    double median;
    median = size % 2 == 0 ? (homework[mid] + homework[mid]) / 2 : homework[mid];
 
    //최종 성적을 계산
 
    streamsize prec = cout.precision();
    cout<<"Your final grade is " << setprecision(3)
        <<0.2*midterm + 0.4* final + 0.4 * median
        <<setprecision(prec)<<endl;
 
    return 0;
}


