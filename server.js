const app = require('express')();
let server = {};
// if (process.argv[2] && process.argv[2] === '-ssl') {
//  var fs = require('fs');
 //  var options = {
  //   key: fs.readFileSync('key.pem'),
  //   cert: fs.readFileSync('cert.pem'),
  //   requestCert: false,
  //   rejectUnauthorized: false
  //};
  // server = require('https').createServer(options, app);
  // log('Using https.');
 //} else {
 // server = require('http').createServer(app);
 // log('Using http.');
 // }

server = require('http').createServer(app);
log('Using http.');

const io = require('socket.io')(server, { cors: {
    origin: '*',
    methods:['GET','POST']
  }});
const signalServer = require('simple-signal-server')(io)
const port = process.env.PORT || 3000;
const rooms = new Map()

app.get('/', function (req, res) {
   var sum = 0;
   rooms.forEach((v, k) => sum = sum + v.size);
   html=`
         <style>
                    
            body {
               font-size: 10px;
               font-family:Calibri;
            }     
            table {
               font-size: 24px;
               font-family:Calibri;
               width: 375px;
            }
            .card{
               margin: 0;
               padding: 0;
               display: flex;
               justify-content:center;
               items-align: center;
            }
                                    
         </style>
                                    
         <div class="card">
            <table>
               <tr>
                  <th align="center">LOBBY SERVER</th>
               </tr>
               <tr>
                  <th align="center" style="color: gray;">waiting connections...</th>
               </tr>
               <tr>
                  <td align ="left">Rooms</td>
                  <td align ="right">${rooms.size}</td>
               </tr>
               <tr>
                  <td align ="left">Members</td>
                  <td align ="right">${sum}</td>
               </tr>       
            </table>
         </div>  
   `
   //'Lobby server<br/>rooms: ${rooms.size}<br/>members: ${sum}
   res.send(html);
});

signalServer.on('discover', (request) => {
   log('discover');
   let memberId = request.socket.id;
   log(request.discoveryData);
   let roomId = request.discoveryData ? request.discoveryData : '475784';
   let members = rooms.get(roomId);
   if (!members) {
      members = new Set();
      rooms.set(roomId, members);
   }
   members.add(memberId);
   request.socket.roomId = roomId;
   request.discover({
      peers: Array.from(members)
   });
   log(request.discoveryData, request.socket.id )
   log('joined ' + roomId + ' ' + memberId)
})

signalServer.on('disconnect', (socket) => {
   let memberId = socket.id;
   let roomId = socket.roomId;
   let members = rooms.get(roomId);
   if (members) {
      members.delete(memberId)
   }
   log('left ' + roomId + ' ' + memberId)
})

signalServer.on('request', (request) => {
   request.forward()
   log('requested')
})

function log(message, data) {
   if (true) {
      console.log(message);
      if (data != null) {
         console.log(data);
      }
   }
}

server.listen(port, () => {
   log('Lobby server running on port ' + port);
});
