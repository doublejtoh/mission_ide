/* map example */
#include <map>
#include <string>
#include <iostream>

using std::map;
using std::string;
using std::cout;
using std::endl;

int main(void){
	// <int, string> fair map test
	map<int, string> m;
	map<int, string>::iterator i;

	m.insert( map<int, string>::value_type(1, "Hello") );
	m.insert( map<int, string>::value_type(2, "World") );

	// map 순회
	for(i = m.begin(); i != m.end(); i++){
		cout << "[" << i->first << "] " << i->second << endl;
	}

	// direct select
	cout << m[1] << endl;

	// <string, string> fair map test
	map<string, string> m2;
	map<string, string>::iterator j;

	m2.insert( map<string, string>::value_type("a", "Hello") );
	m2.insert( map<string, string>::value_type("123", "World") );

	// map 순회
	for(j = m2.begin(); j != m2.end(); j++){
		cout << "[" << j->first << "] " << j->second << endl;
	}

	// direct select
	cout << m2["123"] << endl;
}

