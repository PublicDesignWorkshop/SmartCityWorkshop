int switchPin1 = 2;
int switchPin2 = 3;
int switchPin3 = 4;

int sensorPin1 = 2;
int sensorPin2 = 13;
int sensorPin3 = 3;

long anVolt, inches, cm;
int sum = 0; //Create sum variable so it can be averaged
int avgrange = 60; //Quantity of values to average (sample size)

void setup() {
  
  pinMode(switchPin1, INPUT);
  pinMode(switchPin2, INPUT);
  pinMode(switchPin3, INPUT);
  
  pinMode(sensorPin2, INPUT);
  Serial.begin(9600);

}

void loop() {

  int listSize = 3;

  String list[listSize];
  list[0] = "";
  list[1] = "";
  list[2] = "";

  int switchvalue1 = digitalRead(switchPin1);
  int switchvalue2 = digitalRead(switchPin2);
  int switchvalue3 = digitalRead(switchPin3);

  
  float sensorValue1 = analogRead(sensorPin1);
  
  

  float pulse = pulseIn(sensorPin2, HIGH);
  //147uS per inch
  float sensorValue2 = pulse / 147;

  float sensorValue3 = analogRead(sensorPin3);

  if (switchvalue1 == HIGH) {
    list[0] = "{\"type\": \"potentiometer\", \"model\": \"B100KOhm\", \"value\": " + String(sensorValue1) + "}";
  }

  if (switchvalue2 == HIGH) {
    list[1] = "{\"type\": \"sonar\", \"model\": \"LV-MaxSonar-EZ4\", \"value\": " + String(sensorValue2) + "}";
  }

  if (switchvalue3 == HIGH) {
    list[2] = "{\"type\": \"light\", \"model\": \"Photocell\", \"value\": " + String(sensorValue3) + "}";
  }

  String str = "";
  boolean prevExist = false;
  for (int i=0; i<listSize; i++) {    
    if (list[i] != "" && prevExist) {
      str += ", ";
    }
    str += list[i];
    if (list[i] != "") {
      prevExist = true;
    } else {
      prevExist = false;
    }
  }


  Serial.println("{\"sensors\": [ " + str + " ]}");

  delay(1000);

}
