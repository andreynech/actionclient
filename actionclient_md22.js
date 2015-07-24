var WebSocket = require('ws')
var ws = new WebSocket('wss://actionserver.herokuapp.com');
//var ws = new WebSocket('ws://localhost:5000');

var i2c = require('i2c');

// Configure 
var address = 0xB0 >> 1;
// point to your i2c address, debug provides REPL interface
var wire = new i2c(address, {device: '/dev/i2c-1'});

// Helper function for motor control

function setOperationMode(mode) {
    wire.writeBytes(0, [mode], function(err) {});
}

function stopRotation() {
    wire.writeBytes(1, [128], function(err) {});
    wire.writeBytes(2, [128], function(err) {});
}

function setMotorsWithTurn(speed, turn) {
    wire.writeBytes(1, [speed], function(err) {});
    wire.writeBytes(2, [turn], function(err) {});
}

setOperationMode(4);
stopRotation();



ws.on('open', function() 
      {
          console.log('connected');
      });

ws.on('close', function() 
      {
          stopRotation();
          console.log('disconnected');
      });

var ctrl_msg = null;
var encoder_timer = null;
var encoder1 = 0;

function encoder_calculator()
{
    // Send control signal and read actual encoder values
    setMotorsWithTurn(ctrl_msg.speed, ctrl_msg.turn);
    
    if(ctrl_msg.encoder1 > 0)
    {
        ctrl_msg.encoder1 -= 1;
    }
    else
    {
        if(encoder_timer != null)
            clearInterval(encoder_timer);
        ws.send('OK');
    }
};


ws.on('message', function(message) 
      {
          console.log('received: %s', message);

          try
          {
              ctrl_msg = JSON.parse(message);
              encoder_timer = setInterval(encoder_calculator, 100);
          }
          catch(err) // Handle json.parse synchronous errors
          {
              ws.send('NOK');
              console.error('message parsing error: ' + err);
          }
      });
