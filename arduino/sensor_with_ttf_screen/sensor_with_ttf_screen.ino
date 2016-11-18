#include <SparkFunBME280.h>
#include "Wire.h"

#include <Time.h>
#include <TimeLib.h>

#include <avr/io.h>
#include <avr/interrupt.h>

#include <URTouch.h>
#include <URTouchCD.h>

#include <memorysaver.h>
#include <UTFT.h>

// Declare which fonts we will be using
extern uint8_t SmallFont[];
extern uint8_t BigFont[];
extern uint8_t SevenSegNumFont[];


// Initialize display
// ------------------
// Set the pins to the correct ones for your development board
// -----------------------------------------------------------
// Standard Arduino Uno/2009 Shield            : <display model>,19,18,17,16
// Standard Arduino Mega/Due shield            : <display model>,38,39,40,41
// CTE TFT LCD/SD Shield for Arduino Due       : <display model>,25,26,27,28
// Teensy 3.x TFT Test Board                   : <display model>,23,22, 3, 4
// ElecHouse TFT LCD/SD Shield for Arduino Due : <display model>,22,23,31,33
//
// Remember to change the model parameter to suit your display module!
UTFT myGLCD(ITDB43,38,39,40,41);

// Initialize touchscreen
// ----------------------
// Set the pins to the correct ones for your development board
// -----------------------------------------------------------
// Standard Arduino Uno/2009 Shield            : 15,10,14, 9, 8
// Standard Arduino Mega/Due shield            :  6, 5, 4, 3, 2
// CTE TFT LCD/SD Shield for Arduino Due       :  6, 5, 4, 3, 2
// Teensy 3.x TFT Test Board                   : 26,31,27,28,29
// ElecHouse TFT LCD/SD Shield for Arduino Due : 25,26,27,29,30
//
URTouch  myTouch( 6, 5, 4, 3, 2);

//Global sensor object
BME280 bmeSensor;

#define IRQ_GATE_IN 13

#define NOISE_IN A0
#define LIGHT_IN A1

#define NOISE_SWITCH 8
#define TEMPERATURE_SWITCH 9
#define LIGHT_SWITCH 10

#define SAMPLE_SIZE 20

typedef struct {
  int width;
  int height;
} SCREEN;

typedef enum {
  NOISE, TEMPERATURE, PRESSURE, HUMIDITY, LIGHT
} GRAPH;

typedef struct {
  int sample; // the number of current sampling
  bool noise_on;
  int noise_values[20];
  bool temperature_on;
  int temperature_values[20];
  bool pressure_on;
  long pressure_values[20];
  bool humidity_on;
  int humidity_values[20];
  bool light_on;
  int light_values[20];
} SENSOR;

SCREEN screen;
long x, y;  // placeholder for the touch poisiotn on the screen
SENSOR sensor;
GRAPH graph;

void readTouchPos() {
  myTouch.read();
  x = screen.width - myTouch.getY() * 2;
  y = screen.height - myTouch.getX();
}

// Screen size: 480 x 270
void setup() {
  // initialize Timer1
  cli();          // disable global interrupts
  TCCR1A = 0;     // set entire TCCR1A register to 0
  TCCR1B = 0;     // same for TCCR1B

  // set compare match register to desired timer count:
  OCR1A = 15624 * 0.1;  // Intterupt timer every 0.1 second.
  // turn on CTC mode:
  TCCR1B |= (1 << WGM12);
  // Set CS10 and CS12 bits for 1024 prescaler:
  TCCR1B |= (1 << CS10);
  TCCR1B |= (1 << CS12);
  // enable timer compare interrupt:
  TIMSK1 |= (1 << OCIE1A);
  // enable global interrupts:
  sei();

  // Initiate Screen
  myGLCD.InitLCD();
  myGLCD.clrScr();
  myTouch.InitTouch();
  myTouch.setPrecision(PREC_HI);

  // Serial Setting
  Serial.begin(9600);

  screen = { 480, 270 };
  sensor = { 
    0, 
    false,  // nose_on
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // noise_values
    false,  // temperature_on
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // temperature_values
    false,  // pressure_on
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // pressure_values
    false,  // humidity_on
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // humidity_values
    false,  // light_on
    {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}, // light_values
  };
  graph = NOISE;
  pinMode(NOISE_SWITCH, INPUT);
  pinMode(TEMPERATURE_SWITCH, INPUT);
  pinMode(LIGHT_SWITCH, INPUT);

  setTime(11, 27, 00, 16, 11, 2016);
  hourFormat12();

  //For I2C, enable the following and disable the SPI section
  bmeSensor.settings.commInterface = I2C_MODE;
  bmeSensor.settings.I2CAddress = 0x77;
  bmeSensor.settings.runMode = 3; //Forced mode
  bmeSensor.settings.tStandby = 0;
  bmeSensor.settings.filter = 0;
  bmeSensor.settings.tempOverSample = 1;
  bmeSensor.settings.pressOverSample = 1;
  bmeSensor.settings.humidOverSample = 1;
  bmeSensor.begin();

  home();
}

ISR(TIMER1_COMPA_vect) {
  digitalWrite(IRQ_GATE_IN, !digitalRead(IRQ_GATE_IN));
  sensor.sample += 1;
  measureNoise();
  measureTemperature();
  measurePressure();
  measureHumidity();
  measureLight();
  syncTime();
  if (sensor.sample >= 10) {
    sensor.sample = 0;
  }
}

void syncTime() {
  if (sensor.sample >= 10) {
    String monthStr;
    switch(month()) {
      case 1: {monthStr = "JAN"; break;}
      case 2: {monthStr = "FEB"; break;}
      case 3: {monthStr = "MAR"; break;}
      case 4: {monthStr = "APR"; break;}
      case 5: {monthStr = "MAY"; break;}
      case 6: {monthStr = "JUN"; break;}
      case 7: {monthStr = "JUL"; break;}
      case 8: {monthStr = "AUG"; break;}
      case 9: {monthStr = "SEP"; break;}
      case 10: {monthStr = "OCT"; break;}
      case 11: {monthStr = "NOV"; break;}
      case 12: {monthStr = "DEC"; break;}
    }
    myGLCD.setColor(255, 255, 255);
    if (isAM()) {
      myGLCD.print("CURRENT TIME: " + (String) day() + " " + monthStr + " " + (String) year() + " - " + (String) hour() + ":" + (String) minute() + ":" + (String) second() + "AM", 10, 50);
    } else {
      myGLCD.print("CURRENT TIME: " + (String) day() + " " + monthStr + " " + (String) year() + " - " + (String) hour() + ":" + (String) minute() + ":" + (String) second() + "PM", 10, 50);
    }
  }
}

void measureLight() {
  if (digitalRead(LIGHT_SWITCH) == HIGH) {
    sensor.light_on = true;
    sensor.light_values[SAMPLE_SIZE-1] = (sensor.light_values[SAMPLE_SIZE-1] * sensor.sample + analogRead(LIGHT_IN)) / (sensor.sample + 1);
    if (sensor.sample >= 10) {
      myGLCD.setFont(SmallFont);
      if (sensor.light_values[SAMPLE_SIZE-2] && sensor.light_values[SAMPLE_SIZE-2] > sensor.light_values[SAMPLE_SIZE-1]) {
        myGLCD.setColor(0, 0, 0);
        myGLCD.print((String) sensor.light_values[SAMPLE_SIZE-2] + "Lx", 174, 190);
      }
      myGLCD.setColor(255, 255, 255);
      myGLCD.print((String) sensor.light_values[SAMPLE_SIZE-1] + "Lx", 174, 190);
      myGLCD.setColor(0, 255, 0);
      myGLCD.print("ON", 100, 190);
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("OFF", 124, 190);
  
      if (graph == LIGHT) {
        myGLCD.setColor(0, 0, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.light_values[i], 0), 0, 1000, 190, 90);
          int graphY2 = map(max(sensor.light_values[i+1], 0), 0, 1000, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
      
      for (int i=0; i<19; i++) {
        sensor.light_values[i] = sensor.light_values[i+1];
      }
      sensor.light_values[SAMPLE_SIZE-1] = 0;
  
      if (graph == LIGHT) {
        myGLCD.setColor(0, 255, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.light_values[i], 0), 0, 1000, 190, 90);
          int graphY2 = map(max(sensor.light_values[i+1], 0), 0, 1000, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
    }
  } else {
    sensor.light_on = false;
    sensor.light_values[SAMPLE_SIZE-1] = (sensor.light_values[SAMPLE_SIZE-1] * sensor.sample + 0) / (sensor.sample + 1);
    if (sensor.sample >= 10) {
      myGLCD.setColor(0, 0, 0);
      myGLCD.setBackColor(0, 0, 0);
      myGLCD.fillRect(152, 190, 220, 210);
      if (graph == LIGHT) {
        myGLCD.fillRect(281, 75, 465, 203);
      }
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("ON", 100, 190);
      myGLCD.setColor(255, 0, 0);
      myGLCD.print("OFF", 124, 190);

      for (int i=0; i<SAMPLE_SIZE-1; i++) {
        sensor.light_values[i] = sensor.light_values[i+1];
      }
      sensor.light_values[SAMPLE_SIZE-1] = 0;
    }
  }
}

void measureHumidity() {
  if (digitalRead(TEMPERATURE_SWITCH) == HIGH) {
    sensor.humidity_on = true;
    if (sensor.sample >= 10) {
      myGLCD.setFont(SmallFont);
      if (sensor.humidity_values[SAMPLE_SIZE-2] && sensor.humidity_values[SAMPLE_SIZE-2] > sensor.humidity_values[SAMPLE_SIZE-1]) {
        myGLCD.setColor(0, 0, 0);
        myGLCD.print((String) sensor.humidity_values[SAMPLE_SIZE-2] + "%", 148, 130);
      }
      myGLCD.setColor(255, 255, 255);
      myGLCD.print((String) sensor.humidity_values[SAMPLE_SIZE-1] + "%", 148, 130);
      myGLCD.setColor(0, 255, 0);
      myGLCD.print("ON", 84, 130);
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("OFF", 108, 130);
  
      if (graph == HUMIDITY) {
        myGLCD.setColor(0, 0, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.humidity_values[i], 0), 0, 100, 190, 90);
          int graphY2 = map(max(sensor.humidity_values[i+1], 0), 0, 100, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
      
      for (int i=0; i<19; i++) {
        sensor.humidity_values[i] = sensor.humidity_values[i+1];
      }
      sensor.humidity_values[SAMPLE_SIZE-1] = 0;
  
      if (graph == HUMIDITY) {
        myGLCD.setColor(0, 255, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.humidity_values[i], 0), 0, 100, 190, 90);
          int graphY2 = map(max(sensor.humidity_values[i+1], 0), 0, 100, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
    }
  } else {
    sensor.humidity_on = false;
    sensor.humidity_values[SAMPLE_SIZE-1] = (sensor.humidity_values[SAMPLE_SIZE-1] * sensor.sample + 0) / (sensor.sample + 1);
    if (sensor.sample >= 10) {
      myGLCD.setColor(0, 0, 0);
      myGLCD.setBackColor(0, 0, 0);
      myGLCD.fillRect(136, 130, 220, 150);
      if (graph == HUMIDITY) {
        myGLCD.fillRect(281, 75, 465, 203);
      }
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("ON", 84, 130);
      myGLCD.setColor(255, 0, 0);
      myGLCD.print("OFF", 108, 130);

      for (int i=0; i<SAMPLE_SIZE-1; i++) {
        sensor.humidity_values[i] = sensor.humidity_values[i+1];
      }
      sensor.humidity_values[SAMPLE_SIZE-1] = 0;
    }
  }
}

void measurePressure() {
  if (digitalRead(TEMPERATURE_SWITCH) == HIGH) {
    sensor.pressure_on = true;
    if (sensor.sample >= 10) {
      myGLCD.setFont(SmallFont);
      if (sensor.pressure_values[SAMPLE_SIZE-2] && sensor.pressure_values[SAMPLE_SIZE-2] > sensor.pressure_values[SAMPLE_SIZE-1]) {
        myGLCD.setColor(0, 0, 0);
        myGLCD.print((String) sensor.pressure_values[SAMPLE_SIZE-2] + "kPA", 148, 110);
      }
      myGLCD.setColor(255, 255, 255);
      myGLCD.print((String) sensor.pressure_values[SAMPLE_SIZE-1] + "kPA", 148, 110);
      myGLCD.setColor(0, 255, 0);
      myGLCD.print("ON", 84, 110);
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("OFF", 108, 110);
  
      if (graph == PRESSURE) {
        myGLCD.setColor(0, 0, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.pressure_values[i], 80000), 80000, 120000, 190, 90);
          int graphY2 = map(max(sensor.pressure_values[i+1], 80000), 80000, 120000, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
      
      for (int i=0; i<19; i++) {
        sensor.pressure_values[i] = sensor.pressure_values[i+1];
      }
      sensor.pressure_values[SAMPLE_SIZE-1] = 0;
  
      if (graph == PRESSURE) {
        myGLCD.setColor(0, 255, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(max(sensor.pressure_values[i], 80000), 80000, 120000, 190, 90);
          int graphY2 = map(max(sensor.pressure_values[i+1], 80000), 80000, 120000, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
    }
  } else {
    sensor.pressure_on = false;
    sensor.pressure_values[SAMPLE_SIZE-1] = (sensor.pressure_values[SAMPLE_SIZE-1] * sensor.sample + 0) / (sensor.sample + 1);
    if (sensor.sample >= 10) {
      myGLCD.setColor(0, 0, 0);
      myGLCD.setBackColor(0, 0, 0);
      myGLCD.fillRect(136, 110, 220, 130);
      if (graph == PRESSURE) {
        myGLCD.fillRect(281, 75, 465, 203);
      }
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("ON", 84, 110);
      myGLCD.setColor(255, 0, 0);
      myGLCD.print("OFF", 108, 110);

      for (int i=0; i<SAMPLE_SIZE-1; i++) {
        sensor.pressure_values[i] = sensor.pressure_values[i+1];
      }
      sensor.pressure_values[SAMPLE_SIZE-1] = 0;
    }
  }
}

void measureTemperature() {
  if (digitalRead(TEMPERATURE_SWITCH) == HIGH) {
    sensor.temperature_on = true;
    if (sensor.sample >= 10) {
      myGLCD.setFont(SmallFont);
      if (sensor.temperature_values[SAMPLE_SIZE-2] && sensor.temperature_values[SAMPLE_SIZE-2] > sensor.temperature_values[SAMPLE_SIZE-1]) {
        myGLCD.setColor(0, 0, 0);
        myGLCD.print((String) sensor.temperature_values[18] + "`F", 172, 90);
      }
      myGLCD.setColor(255, 255, 255);
      myGLCD.print((String) sensor.temperature_values[19] + "`F", 172, 90);
      myGLCD.setColor(0, 255, 0);
      myGLCD.print("ON", 108, 90);
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("OFF", 132, 90);
  
      if (graph == TEMPERATURE) {
        myGLCD.setColor(0, 0, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(sensor.temperature_values[i], -20, 120, 190, 90);
          int graphY2 = map(sensor.temperature_values[i+1], -20, 120, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
      
      for (int i=0; i<19; i++) {
        sensor.temperature_values[i] = sensor.temperature_values[i+1];
      }
      sensor.temperature_values[SAMPLE_SIZE-1] = 0;
  
      if (graph == TEMPERATURE) {
        myGLCD.setColor(0, 255, 0);
        for (int i=0; i<SAMPLE_SIZE-2; i++) {
          int graphY1 = map(sensor.temperature_values[i], -20, 120, 190, 90);
          int graphY2 = map(sensor.temperature_values[i+1], -20, 120, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
    }
  } else {
    sensor.temperature_on = false;
    sensor.temperature_values[SAMPLE_SIZE-1] = (sensor.temperature_values[SAMPLE_SIZE-1] * sensor.sample + 0) / (sensor.sample + 1);
    if (sensor.sample >= 10) {
      myGLCD.setColor(0, 0, 0);
      myGLCD.setBackColor(0, 0, 0);
      myGLCD.fillRect(160, 90, 220, 110);
      if (graph == TEMPERATURE) {
        myGLCD.fillRect(281, 75, 465, 203);
      }
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("ON", 108, 90);
      myGLCD.setColor(255, 0, 0);
      myGLCD.print("OFF", 132, 90);

      for (int i=0; i<SAMPLE_SIZE-1; i++) {
        sensor.temperature_values[i] = sensor.temperature_values[i+1];
      }
      sensor.temperature_values[SAMPLE_SIZE-1] = 0;
    }
  }
}


void measureNoise() {
  if (digitalRead(NOISE_SWITCH) == LOW) {
    sensor.noise_on = false;
    sensor.noise_values[19] = (sensor.noise_values[19] * sensor.sample + 0) / (sensor.sample + 1);
    
    if (sensor.sample >= 10) {
      myGLCD.setColor(0, 0, 0);
      myGLCD.setBackColor(0, 0, 0);
      myGLCD.fillRect(160, 70, 220, 90);
      if (graph == NOISE) {
        myGLCD.fillRect(281, 75, 465, 203);
      }
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("ON", 108, 70);
      myGLCD.setColor(255, 0, 0);
      myGLCD.print("OFF", 132, 70);
      
      for (int i=0; i<19; i++) {
        sensor.noise_values[i] = sensor.noise_values[i+1];
      }
      sensor.noise_values[19] = 0;
    }
  } else {
    sensor.noise_on = true;
    sensor.noise_values[19] = (sensor.noise_values[19] * sensor.sample + analogRead(NOISE_IN)) / (sensor.sample + 1);
  
    if (sensor.sample >= 10) {
      myGLCD.setFont(SmallFont);
      if (sensor.noise_values[18] && sensor.noise_values[18] > sensor.noise_values[19]) {
        myGLCD.setColor(0, 0, 0);
        myGLCD.print((String) sensor.noise_values[18] + "dB", 172, 70);
      }
      myGLCD.setColor(255, 255, 255);
      myGLCD.print((String) sensor.noise_values[19] + "dB", 172, 70);
      myGLCD.setColor(0, 255, 0);
      myGLCD.print("ON", 108, 70);
      myGLCD.setColor(64, 64, 64);
      myGLCD.print("OFF", 132, 70);
  
      if (graph == NOISE) {
        myGLCD.setColor(0, 0, 0);
        for (int i=0; i<18; i++) {
          int graphY1 = map(min(sensor.noise_values[i], 100), 0, 100, 190, 90);
          int graphY2 = map(min(sensor.noise_values[i+1], 100), 0, 100, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
      
      for (int i=0; i<19; i++) {
        sensor.noise_values[i] = sensor.noise_values[i+1];
      }
      sensor.noise_values[19] = 0;
  
      if (graph == NOISE) {
        myGLCD.setColor(0, 255, 0);
        for (int i=0; i<18; i++) {
          int graphY1 = map(min(sensor.noise_values[i], 100), 0, 100, 190, 90);
          int graphY2 = map(min(sensor.noise_values[i+1], 100), 0, 100, 190, 90);
          myGLCD.drawLine(294 + 9 * i, graphY1, 294 + 9 * (i + 1), graphY2);
        }
      }
    }
  }
}

void home() {
  myGLCD.clrScr();
  myGLCD.setBackColor(0, 0, 0);
  myGLCD.setColor(255, 255, 255);
  myGLCD.setFont(BigFont);
  myGLCD.print("PDW SMART CITY WORKSHOP", CENTER, 14);
  myGLCD.setFont(SmallFont);
  
  myGLCD.print("NOISE LEVEL:", 10, 70);
  myGLCD.print("TEMPERATURE:", 10, 90);
  myGLCD.print("PRESSURE:", 10, 110);
  myGLCD.print("HUMIDITY:", 10, 130);
  myGLCD.print("DUST LEVEL:", 10, 150);
  myGLCD.print("CO LEVEL:", 10, 170);
  myGLCD.print("BRIGHTNESS:", 10, 190);
  myGLCD.print("WIFI SIGNALS:", 10, 210);

  myGLCD.setFont(BigFont);
  myGLCD.setColor(0, 255, 0);
  myGLCD.print("START RECORDING", 12, 244);
  myGLCD.setColor(255, 255, 0);
  myGLCD.print("SNAPSHOT(0)", 274, 244);

  myGLCD.setColor(255, 255, 255);
  myGLCD.drawLine(280, 74, 280, 204);
  myGLCD.drawLine(280, 204, 466, 204);
  myGLCD.setFont(SmallFont);
  myGLCD.print("-0s", 446, 214);
  myGLCD.print("-10s", 366, 214);
  myGLCD.print("-20s", 280, 214);

  switch(graph) {
    case NOISE: {
      myGLCD.print(">", 220, 70);
      myGLCD.print("100dB", 236, 80);
      myGLCD.print(" 50dB", 236, 130);
      myGLCD.print("  0dB", 236, 180);
      break;
    }
  }
}


void loop()
{
  if (myTouch.dataAvailable()) {
    readTouchPos();
    if (x < 240 && y > 40 && y < 60) {
      if (graph != NOISE) {
        graph = NOISE;
        myGLCD.setColor(255, 255, 255);
        myGLCD.drawLine(280, 74, 280, 204);
        myGLCD.drawLine(280, 204, 466, 204);
        
        myGLCD.setColor(0, 0, 0);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.fillRect(281, 74, 465, 203);
        myGLCD.fillRect(236, 80, 279, 200);
        myGLCD.setColor(0, 0, 0);
        myGLCD.print(">", 220, 90);
        myGLCD.print(">", 220, 110);
        myGLCD.print(">", 220, 130);
        myGLCD.print(">", 220, 150);
        myGLCD.print(">", 220, 170);
        myGLCD.print(">", 220, 190);
        
        myGLCD.setColor(255, 255, 255);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.print(">", 220, 70);
        myGLCD.print("100dB", 236, 80);
        myGLCD.print(" 50dB", 236, 130);
        myGLCD.print("  0dB", 236, 180);
      }
    } else if (x < 240 && y > 60 && y < 80) {
      if (graph != TEMPERATURE) {
        graph = TEMPERATURE;
        myGLCD.setColor(255, 255, 255);
        myGLCD.drawLine(280, 74, 280, 204);
        myGLCD.drawLine(280, 204, 466, 204);
        
        myGLCD.setColor(0, 0, 0);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.fillRect(281, 74, 465, 203);
        myGLCD.fillRect(236, 80, 279, 200);
        myGLCD.setColor(0, 0, 0);
        myGLCD.print(">", 220, 70);
        myGLCD.print(">", 220, 110);
        myGLCD.print(">", 220, 130);
        myGLCD.print(">", 220, 150);
        myGLCD.print(">", 220, 170);
        myGLCD.print(">", 220, 190);
        
        myGLCD.setColor(255, 255, 255);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.print(">", 220, 90);
        myGLCD.print("120`F", 236, 80);
        myGLCD.print(" 50`F", 236, 130);
        myGLCD.print("-20`F", 236, 180);
      }
    } else if (x < 240 && y > 80 && y < 100) {
      if (graph != PRESSURE) {
        graph = PRESSURE;
        myGLCD.setColor(255, 255, 255);
        myGLCD.drawLine(280, 74, 280, 204);
        myGLCD.drawLine(280, 204, 466, 204);
        
        myGLCD.setColor(0, 0, 0);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.fillRect(281, 74, 465, 203);
        myGLCD.fillRect(236, 80, 279, 200);
        myGLCD.setColor(0, 0, 0);
        myGLCD.print(">", 220, 70);
        myGLCD.print(">", 220, 90);
        myGLCD.print(">", 220, 130);
        myGLCD.print(">", 220, 150);
        myGLCD.print(">", 220, 170);
        myGLCD.print(">", 220, 190);
        
        myGLCD.setColor(255, 255, 255);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.print(">", 220, 110);
        myGLCD.print("120mPa", 236, 80);
        myGLCD.print("100mPa", 236, 130);
        myGLCD.print(" 80mPa", 236, 180);
      }
    } else if (x < 240 && y > 100 && y < 120) {
      if (graph != HUMIDITY) {
        graph = HUMIDITY;
        myGLCD.setColor(255, 255, 255);
        myGLCD.drawLine(280, 74, 280, 204);
        myGLCD.drawLine(280, 204, 466, 204);
        
        myGLCD.setColor(0, 0, 0);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.fillRect(281, 74, 465, 203);
        myGLCD.fillRect(236, 80, 279, 200);
        myGLCD.setColor(0, 0, 0);
        myGLCD.print(">", 220, 70);
        myGLCD.print(">", 220, 90);
        myGLCD.print(">", 220, 110);
        myGLCD.print(">", 220, 150);
        myGLCD.print(">", 220, 170);
        myGLCD.print(">", 220, 190);
        
        myGLCD.setColor(255, 255, 255);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.print(">", 220, 130);
        myGLCD.print("100%", 236, 80);
        myGLCD.print(" 50%", 236, 130);
        myGLCD.print("  0%", 236, 180);
      }
    } else if (x < 240 && y > 180 && y < 200) {
      if (graph != LIGHT) {
        graph = LIGHT;
        myGLCD.setColor(255, 255, 255);
        myGLCD.drawLine(280, 74, 280, 204);
        myGLCD.drawLine(280, 204, 466, 204);
        
        myGLCD.setColor(0, 0, 0);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.fillRect(281, 74, 465, 203);
        myGLCD.fillRect(236, 80, 279, 200);
        myGLCD.setColor(0, 0, 0);
        myGLCD.print(">", 220, 70);
        myGLCD.print(">", 220, 90);
        myGLCD.print(">", 220, 110);
        myGLCD.print(">", 220, 130);
        myGLCD.print(">", 220, 150);
        myGLCD.print(">", 220, 170);
        
        myGLCD.setColor(255, 255, 255);
        myGLCD.setBackColor(0, 0, 0);
        myGLCD.print(">", 220, 190);
        myGLCD.print(" 1kLx", 236, 80);
        myGLCD.print("500Lx", 236, 130);
        myGLCD.print("  0Lx", 236, 180);
      }
    }
  }
  sensor.temperature_values[SAMPLE_SIZE-1] = (int) bmeSensor.readTempF();
  sensor.pressure_values[SAMPLE_SIZE-1] = (long) bmeSensor.readFloatPressure();
  sensor.humidity_values[SAMPLE_SIZE-1] = (long) bmeSensor.readFloatHumidity();
  delay(150);
}

