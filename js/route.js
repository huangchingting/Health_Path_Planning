var start;
var end;
var map;
var split1;
var split2;
var temp;
var directionsDisplay;
var count=0;
var fa, fb;
var wayp = [];
var counter=0;
var marker;

            
function initMap(){
    console.log("initMap");
    getlocation();

    var mapOptions = {
        center: new google.maps.LatLng(24.1235569, 120.6731373),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var mapElement = document.getElementById("map");

    // Google 地圖初始化
    map = new google.maps.Map(mapElement, mapOptions);

    navigator.geolocation.getCurrentPosition((position) => {
        if(counter)
            marker.setMap(null);
        counter=counter+1;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        marker = new google.maps.Marker({
          position: {lat,lng},
          map: map,
          animation: google.maps.Animation.BOUNCE,
          icon:"https://img.icons8.com/dusk/64/000000/user-location.png"
        });

        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(13);

    });

    set_pm25_layer();
    set_traffic_layer();
}

function set_pm25_layer(){
    // jQuery
    $.getScript('js/pm25.js', function(){
        get_pm25();
    });
}

function set_traffic_layer(){
    // jQuery
    $.getScript('js/traffic.js', function(){
        traffic();
    }); 
}

function getlocation(){
    console.log("getlocation");
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $("#start").val(lat.toString() + "," + lng.toString());
    });
}

function trans() {
    console.log("trans");
    if(count)
        directionsDisplay.setMap(null);
    count=count+1;
    
    var content1 = $("#start").val();
    split1 = content1.split("\n");
    addressToLatLng(function(){
        start=temp;
        console.log(start);
        var content2 = $("#end").val();
        split2 = content2.split("\n");
        addressToLatLng(function(){
            end=temp;
            console.log(end);
            var lat1 = start[0].geometry.location.lat();
            var lng1 = start[0].geometry.location.lng();
            var lat2 = end[0].geometry.location.lat();
            var lng2 = end[0].geometry.location.lng();
            get_intersection(lat1, lng1, lat2, lng2);
            sort_points(lat1, lng1, lat2, lng2);
            window.setTimeout(load, 1500);
        },split2[0]);
    },split1[0]);
    
    document.getElementById('mode').addEventListener('change', function() {
        directionsDisplay.setMap(null);
        load();
    });
}

var addressToLatLng = function (callback,addr) {
    console.log("addresstolantlng");
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        "address": addr
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            temp = results;
            if( typeof callback === 'function' ){
                callback();
            }
        }
        else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
            alert("您輸入的地址可能不存在!\nThis may occur if the geocoder was passed a non-existent address.");                   
        }
        else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            alert("經緯度查詢已超過免費配額，明日請早!\nSorry! We are over our quota.");                 
        }
        else if (status == google.maps.GeocoderStatus.REQUEST_DENIED) {
            alert("請求被拒絕!\nYour request was denied.");                  
        }
        else {
            alert(addr + "查無經緯度，或系統發生錯誤！" + "\n");
        }
    });
}

function load(){
    console.log("load");
    // 載入路線服務與路線顯示圖層
    var directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var selectedMode = document.getElementById('mode').value;

    // 放置路線圖層
    directionsDisplay.setMap(map);

    var waypts = [];
    wayp.forEach((loc) =>{
        waypts.push({
            location: loc,
            stopover: false
        });
    });


    var request = {
        origin: { lat: start[0].geometry.location.lat(), lng: start[0].geometry.location.lng() },
        destination: { lat: end[0].geometry.location.lat(), lng: end[0].geometry.location.lng() },
        waypoints: waypts,
        travelMode: google.maps.TravelMode[selectedMode]
    };

    // 繪製路線
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            // 回傳路線上每個步驟的細節
            console.log("success");
            console.log(result.routes[0].legs[0].steps);
            directionsDisplay.setDirections(result);
        } else {
            console.log(status);
        }
    });
}

function get_intersection(lat1, lng1, lat2, lng2) {
    console.log("get_intersection");
    count_f(lat1, lng1, lat2, lng2);

    var postData = {
        start_lat: lat1,
        end_lat: lat2,
        start_lng: lng1,
        end_lng: lng2
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: "php/route_airbox.php",
        data: {myData:JSON.stringify(postData)},
        success: function(data){
            count_distance(data['intersections']);
        },
        error: function(e){
            console.log("error");
            console.log(e.message);
        }
    });
}

function count_f(lat1, lng1, lat2, lng2){
    console.log("count_f");
    // y=ax+b
    var k = lat1/lat2;
    fb = (lng1-lng2*k)/(1-lat1/lat2);
    fa = (lng1-fb)/lng1;
}

function count_distance(points) {
    console.log("count_distance");
    var dist = [];
    var x, y, dis;
    for (var i=0; i<Object.keys(points).length; i++) {
        x = points[i]['coordinates'][0];
        y = points[i]['coordinates'][1];

        // ax+by+c=0
        // a=fa, b=-1, c=fb
        dis = Math.abs((fa*x)-y+fb)/Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        // dis = x;
        dist.push(dis);
    }
    route_planning(points,dist);
}

function route_planning(points,dist){
    console.log("route_planning");
	wayp = [];

    var value = [];
    for(var i=0; i<Object.keys(points).length; i++){
        value.push(points[i]['pm25']+dist[i]);
    }

    var plen = Object.keys(points).length, pnum=0;
    if(plen<15) pnum=2;
    else if(plen<23) pnum=3;
    else if(plen<30) pnum=4;
    else pnum=5;

    var min=0, ind=0;
    for(var i=0; i<pnum; i++){
        min = Math.min.apply(null, value);
        ind = value.indexOf(min);
        wayp.push({ lat:points[ind]['coordinates'][0], lng:points[ind]['coordinates'][1] });
        value[ind]=99;
    }
}

function sort_points(lat1, lng1, lat2, lng2){
    console.log("sort_points");
	if(lat1<lat2){
		wayp = wayp.sort(function(a,b){
	    	return a.lat > b.lat? 1:-1;
	    });
	}else{
		wayp = wayp.sort(function(a,b){
	    	return a.lat < b.lat? 1:-1;
	    });
	}
}

function show(){
    console.log("show");
    document.getElementById("input").style.display="block";
    document.getElementById("show").style.display="none";
}

function hide(){
    console.log("hide");
    document.getElementById("input").style.display="none";
    document.getElementById("show").style.display="block";
}

function switch_points(){
    console.log("switch_points");
    var content1 = $("#start").val();
    var content2 = $("#end").val();
    $("#start").val(content2);
    $("#end").val(content1);
}

function locate(){
    console.log("locate");
    navigator.geolocation.watchPosition((position) => {
        if(counter)
            marker.setMap(null);
        counter=counter+1;
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        marker = new google.maps.Marker({
          position: {lat,lng},
          map: map,
          animation: google.maps.Animation.BOUNCE,
          icon:"https://img.icons8.com/dusk/64/000000/user-location.png"
        });

        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(16);

    });
}

function current(){
    console.log("current");
    navigator.geolocation.getCurrentPosition((position) => {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $("#start").val(lat.toString() + "," + lng.toString());
    });
}

