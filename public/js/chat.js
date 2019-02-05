var socket = io.connect("http://localhost:8080");
var pseudo = "";
var clientCo = [];


document.addEventListener("DOMContentLoaded", function(e){
	var btnCo = document.getElementById('btnConnecter');
	btnCo.addEventListener("click",function() {
		document.getElementById("radio2").checked = true;
		document.getElementById("radio1").checked = false;
		pseudo = document.getElementById("pseudo").value;
		socket.emit("login", pseudo);
		document.getElementById("login").innerHTML = pseudo;
	});
	
	
	socket.on("liste", function(client) {
		var tmp = "";
		clientCo = client;
		for (var i = 0, c  = client.length; i < c; i++) {
			tmp += client[i]+"<br>";
		}
		var aside = document.getElementsByTagName('aside')[0];
		aside.innerHTML = tmp;
	});
	
	socket.on("message", function(msgRe) {
		var tms = new Date()
		var tmp = "";
		var msgFrom = msgRe.from;
		var msgText = msgRe.text;
		var classe = "";
		if (msgRe.from === null) {
			msgFrom = "[admin]";
			classe = "system";
		}
		if (msgRe.to !== null) {
			msgFrom += " (à "+msgRe.to+")";
			classe = "mp";
		}
		if (msgRe.from === pseudo) {
			classe = "moi";
		}
		if (msgText.substring(0,5) === "[img:" && msgText.substring(msgText.length-1) ==="]") {
			msgText = msgText.substring(5, msgText.length-1);
			msgText = "<img src=\""+msgText+"\"/>";
		}
		var rire = /:D/;
		if(msgText.match(rire)){
			msgText = msgText.replace(rire, "<img class=\"emoji rire\"/>");
		}
		var zzz = /zzz/;
		if(msgText.match(zzz)){
			msgText = msgText.replace(zzz, "<img class=\"emoji zzz\"/>");
		}
		var love = /<3D/;
		if(msgText.match(love)){
			msgText = msgText.replace(love, "<img class=\"emoji love\"/>");
		}
		var holala = /:'\//gi;
		if(msgText.match(holala)){
			msgText = msgText.replace(holala, "<img class=\"emoji holala\"/>");
		}
		var grrr = /:{/;
		if(msgText.match(grrr)){
			msgText = msgText.replace(grrr, "<img class=\"emoji grrr\"/>");
		}
		var triste = /:'\(/gi;
		if(msgText.match(triste)){
			msgText = msgText.replace(triste, "<img class=\"emoji triste\"/>");
		}
		var sourire = /:\)/gi;
		if(msgText.match(sourire)){
			msgText = msgText.replace(sourire, "<img class=\"emoji sourire\"/>");
		}
		var banane = /:\'D/gi;
		if(msgText.match(banane)){
			msgText = msgText.replace(banane, "<img class=\"emoji banane\"/>");
		}
		var malade = /:&/gi;
		if(msgText.match(malade)){
			msgText = msgText.replace(malade, "<img class=\"emoji malade\"/>");
		}
		tmp += "<p class=\""+classe+"\">"+tms.getHours()+":"+tms.getMinutes()+":"+tms.getSeconds()+" - "+msgFrom+" : "+msgText+"<br></p>";
		var main = document.getElementsByTagName('main')[0];
		main.innerHTML += tmp;
	});
	
	
	
	var btnRech = document.getElementById("btnRechercher");
	btnRech.addEventListener("click",recherche);
	
	var btnQuit = document.getElementById("btnQuitter");
	btnQuit.addEventListener("click",quitter);
	
	var btnImage = document.getElementById("btnImage");
	btnImage.addEventListener("click",image);
	
	var btnFermer = document.getElementById("btnFermer");
	btnFermer.addEventListener("click",fermer);
	
	var btnEnvoyer = document.getElementById("btnEnvoyer");
	btnEnvoyer.addEventListener("click", function() {
		var msg = document.getElementById("monMessage").value;
		if (msg === "") {
			alert("Tu communiques via message vide ?");
			return;
		}
		var timestamp = Date.now();
		var msgToArray = msg.split(' ');
		var msgTo = null;
		if (msgToArray[0].indexOf('@') === 0) {
			msgTo = msgToArray[0].substring(1);
			msg = msg.substring(msgTo.length+1);
			var dedans = false;
			for (var cco = 0, ccolgt = clientCo.length; cco < ccolgt; cco++) {
				if(clientCo[cco] === msgTo){
					dedans = true;
					break;
				}
			}
			if (!dedans) {
				alert("Vous parlez dans le vent (client non connecté)");
				return;
			}
		}
		if (msgTo === pseudo) {
			alert("Tu te parles à toi même ?");
			document.getElementById("monMessage").value = "";
			return;
		}
		var msgEn = { from: pseudo, to: msgTo, text: msg, date: timestamp }
		socket.emit("message", msgEn);
		document.getElementById("monMessage").value = "";
	});
	
	
	
}, false);


function quitter() {
	document.getElementById("radio2").checked = false;
	document.getElementById("radio1").checked = true;
	socket.emit("logout");
	document.getElementsByTagName('main')[0].innerHTML = "";
}


function image() {
	document.getElementById("bcImage").style.display = "inline";
}


var dataGif = [];

function recherche() {
	var searchTerm = document.getElementById("recherche").value;
	if (searchTerm === "") {
		return;
	}
	var request = new XMLHttpRequest;
	searchTerm = searchTerm.trim().replace(/ /g, "+"); // met des + à la place des espaces
	var xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); 
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);
			var data = result.data;
			dataGif = data;
			var tmp = "";
			for (var index in data) {
				var gifObject = data[index];
				var gifURL = gifObject.images.original.url;
				var id = index;
				tmp += "<img src=\""+gifURL+"\" onclick=\"envoyerGif("+id+")\"/>";
			}
			var res = document.getElementById("bcResults");
			res.innerHTML = tmp;
        }
    }
    xhttp.open("get", 'http://api.giphy.com/v1/gifs/search?q=' + searchTerm + '&api_key=0X5obvHJHTxBVi92jfblPqrFbwtf1xig', true);  
    xhttp.send();
}

function envoyerGif(id) {
	var msg = "[img:"+dataGif[id].images.original.url+"]";
	var msgEn = { from: pseudo, to: null, text: msg, date: 00 }
	socket.emit("message", msgEn);
	document.getElementById("bcImage").style.display = "none";
	document.getElementById("bcResults").innerHTML = "";
}




function fermer() {
	document.getElementById("bcImage").style.display = "none";
	var res = document.getElementById("bcResults");
	res.innerHTML = "";
}



























































