var WebSocket = require('ws')
  , ws = new WebSocket('ws://localhost:8080');


ws.on('open', function() 
      {
          //ws.send('something');
          console.log('connected');
      });

var ctrl_msg = null;
var encoder_timer = null;
var encoder1 = 0;

function encoder_calculator()
{
    // Send control signal and read actual encoder values

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
