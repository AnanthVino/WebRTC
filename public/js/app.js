  
  var socket = io.connect('192.168.1.36:8080');
  var mediaConstraints = {'mandatory': { 
                          'OfferToReceiveAudio':true, 
                          'OfferToReceiveVideo':true }};
                          started=false;
                          busy=false;
 function webrtc(){
  }

  webrtc.prototype.getusermedia=function()
  {
  	navigator.webkitGetUserMedia({audio:true,video:true},success,err);
  	function success(stream)
  	{
           var source=document.getElementById('sourceVideo');
    source.src=webkitURL.createObjectURL(stream);
                 localStream=stream;
  	}
  	function err(err)
  	{
            alert(err);
  	}
  	
  }
  
 webrtc.prototype.createPeer=function()
 {
 	var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
 	peerRTC=new webkitRTCPeerConnection(pc_config);
 	peerRTC.onicecandidate=onicecandidate;
 	peerRTC.addStream(localStream);
 	peerRTC.onaddstream=remoteStream;
 	peerRTC.onremovestream=remotestreamremoved;
 	started=true;
 	docall();
 }
 webrtc.prototype.answerPeer=function()
 {
 	var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
 	peerRTC=new webkitRTCPeerConnection(pc_config);
 	peerRTC.addStream(localStream);
 	peerRTC.onicecandidate=onicecandidate;
 	peerRTC.onaddstream=remoteStream;
 	peerRTC.onremovestream=remotestreamremoved;
 	started=true;
 	answer();
 }
function onicecandidate(event) {
  if (event.candidate) {
    sendMessage({type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate});
  } else {
    console.log("End of candidates.");
  }
}

function remoteStream(event) {
  var source=document.getElementById('destiVideo');
    source.src=webkitURL.createObjectURL(event.stream);
    busy=true;

}

function remotestreamremoved()
{
     started=false;
     busy=false;
}

function setLocalAndSendMessage(sessionDescription) {
  peerRTC.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

function answer() {
  console.log("Sending answer to peer.");
  peerRTC.createAnswer(setLocalAndSendMessage, null, mediaConstraints);
}

function sendMessage(message) {
  socket.emit('sendChat',{msg:message,peerid:peerid});
         
}
socket.on('receivePeer',function(data)
{
            processSignalingMessage(data);
});
function processSignalingMessage(data) {
  var msg=data.msg;
  peerid=data.peerid;

  if (msg.type === 'offer') {
    // Callee creates PeerConnection
    if (!started)
      webrtc.answerPeer();

    peerRTC.setRemoteDescription(new RTCSessionDescription(msg));
    answer();
  } else if (msg.type === 'answer' && started) {
    peerRTC.setRemoteDescription(new RTCSessionDescription(msg));
  } else if (msg.type === 'candidate' && started) {
    var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label,
                                         candidate:msg.candidate});
    peerRTC.addIceCandidate(candidate);
  } else if (msg.type === 'bye' && started) {
    
  }
}

function docall() {
  console.log("Sending offer to peer.");
  peerRTC.createOffer(setLocalAndSendMessage, null, mediaConstraints);
}



function videoController($rootScope,$scope)
{
	
	$scope.call=function(id)
	{
		socket.emit('callRequest',{peerid:id});
	}
	socket.emit('myname',{username:sessionStorage.username});
	socket.on('onlineuser',function(data){
		console.log(data);
		var result=[];
		angular.forEach(data,function(value,key){
                       if(value==sessionStorage.username)
                       {     
                       }else
                       {
                       	result.push(value);
                       }
		});
         $scope.$apply(function(){
                $scope.onlineuser=result;
                console.log(result);
 
         });
	});
	socket.on('callRequest',function(data){
		if(busy)
		{
           socket.emit('busy',{peerid:data.peerid});
		}else{
                      var r=confirm("You have a call from" +data.peerid);
                   if (r==true)
                        {
                        	peerid=data.peerid;
                        	webrtc.createPeer();
  
                                }
                                   else
                                       {
                                socket.emit('decline',{peerid:data.peerid});
                                             }
		}
		
	});
	socket.on('busy',function(data)
	{
		alert('user busy with other call');
	})
	socket.on('accept',function(data){
		console.log(data.peerid);
               alert('call accept');
	});
	socket.on('decline',function(data){
               alert('call decline');
	});

}
	var webrtc=new webrtc();
webrtc.getusermedia();